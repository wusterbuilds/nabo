import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectMCP, extractMCPText } from "@/lib/mcp";

export const runtime = "nodejs";
export const maxDuration = 120; // longer timeout for full pipeline

// ─── Helpers ─────────────────────────────────────────────────

/** Extract an ID from an MCP tool result (campaign, ad set, ad, creative) */
function extractId(result: unknown): string | null {
  try {
    const str = JSON.stringify(result);

    // Method 1: MCP result format { content: [{ text: '{"id":"123"}' }] }
    const res = result as { content?: Array<{ type: string; text: string }> };
    if (res?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(res.content[0].text);
        if (parsed?.id) return String(parsed.id);
        if (parsed?.campaign_id) return String(parsed.campaign_id);
        if (parsed?.creative_id) return String(parsed.creative_id);
        // Check nested data field
        if (parsed?.data) {
          const inner =
            typeof parsed.data === "string"
              ? JSON.parse(parsed.data)
              : parsed.data;
          if (inner?.id) return String(inner.id);
        }
      } catch {
        const textMatch = res.content[0].text.match(/"id"\s*:\s*"?(\d+)"?/);
        if (textMatch) return textMatch[1];
      }
    }

    // Method 2: Direct object
    const direct = result as { id?: string };
    if (direct?.id) return String(direct.id);

    // Method 3: Regex fallback
    const match = str.match(/"id"\s*:\s*"?(\d+)"?/);
    if (match) return match[1];
  } catch {
    // Last resort
  }
  return null;
}

/** Extract image hash from upload result */
function extractImageHash(result: unknown): string | null {
  try {
    const text = extractMCPText(result);
    const parsed = JSON.parse(text);
    // Common patterns: { hash: "..." }, { images: { ...: { hash: "..." } } }
    if (parsed?.hash) return parsed.hash;
    if (parsed?.image_hash) return parsed.image_hash;
    if (parsed?.images) {
      const firstKey = Object.keys(parsed.images)[0];
      if (firstKey && parsed.images[firstKey]?.hash) return parsed.images[firstKey].hash;
    }
    // Regex fallback
    const match = text.match(/"hash"\s*:\s*"([a-f0-9]+)"/i);
    if (match) return match[1];
  } catch {
    // ignore
  }
  return null;
}

/** Discover MCP tool names matching known patterns */
async function discoverTools(client: Client): Promise<Record<string, string>> {
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);

  const find = (keyword: string): string => {
    // Try exact match first
    if (names.includes(keyword)) return keyword;
    // Try prefixed patterns
    for (const prefix of ["mcp_meta_ads_", "meta_ads_", ""]) {
      const candidate = `${prefix}${keyword}`;
      if (names.includes(candidate)) return candidate;
    }
    // Fuzzy: find any tool containing the keyword parts
    const found = names.find((n) => keyword.split("_").every((part) => n.includes(part)));
    if (found) return found;
    throw new Error(`Tool not found: ${keyword}. Available: ${names.join(", ")}`);
  };

  return {
    create_campaign: find("create_campaign"),
    create_adset: find("create_adset"),
    create_ad: find("create_ad"),
    create_ad_creative: find("create_ad_creative"),
    upload_ad_image: find("upload_ad_image"),
  };
}

// ─── Types (mirror frontend CampaignConfigData) ─────────────

interface AdSpec {
  id: string;
  name: string;
  headline: string;
  body: string;
  description: string;
  callToAction: string;
  linkUrl: string;
  imageUrl: string;
}

interface AdSetSpec {
  id: string;
  name: string;
  optimizationGoal: string;
  billingEvent: string;
  dailyBudget: number;
  targeting: {
    geoLocations: { countries?: string[]; cities?: { key: string; name: string }[] };
    ageMin: number;
    ageMax: number;
    genders: number[];
    interests: { id: string; name: string }[];
    excludedCustomAudiences: { id: string; name: string }[];
  };
  destinationType?: string;
  ads: AdSpec[];
}

interface CampaignSpec {
  id: string;
  name: string;
  objective: string;
  dailyBudget: number;
  status: string;
  specialAdCategories: string[];
  adSets: AdSetSpec[];
}

interface CampaignConfigData {
  accountId: string;
  pageId: string;
  campaigns: CampaignSpec[];
}

// ─── Build targeting object for Meta API ─────────────────────

function buildTargeting(t: AdSetSpec["targeting"]) {
  const targeting: Record<string, unknown> = {
    age_min: t.ageMin,
    age_max: t.ageMax,
    geo_locations: {} as Record<string, unknown>,
    targeting_automation: { advantage_audience: 0 },
  };

  // Gender (0 = all = don't send)
  if (t.genders[0] === 1 || t.genders[0] === 2) {
    targeting.genders = t.genders;
  }

  // Geo locations
  const geo = targeting.geo_locations as Record<string, unknown>;
  if (t.geoLocations.countries && t.geoLocations.countries.length > 0) {
    geo.countries = t.geoLocations.countries;
  }
  if (t.geoLocations.cities && t.geoLocations.cities.length > 0) {
    geo.cities = t.geoLocations.cities.map((c) => ({ key: c.key }));
  }

  // Interests
  if (t.interests.length > 0) {
    targeting.flexible_spec = [
      { interests: t.interests.map((i) => ({ id: i.id, name: i.name })) },
    ];
  }

  // Custom audience exclusions
  if (t.excludedCustomAudiences.length > 0) {
    targeting.exclusions = {
      custom_audiences: t.excludedCustomAudiences.map((a) => ({ id: a.id, name: a.name })),
    };
  }

  return targeting;
}

// ─── Main handler ────────────────────────────────────────────

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  let mcpClient: Client | null = null;

  // Parse config from request body
  let config: CampaignConfigData;
  try {
    const body = await req.json();
    config = body.config;
    if (!config || !config.campaigns) {
      throw new Error("Missing campaign config in request body");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Invalid request";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use server-side env var for account ID (override client value for security)
  const accountId = process.env.META_AD_ACCOUNT_ID || config.accountId;
  const pageId = config.pageId;

  // Count total steps for progress
  let totalSteps = 0;
  for (const camp of config.campaigns) {
    totalSteps++; // campaign creation
    for (const adSet of camp.adSets) {
      totalSteps++; // ad set creation
      for (const ad of adSet.ads) {
        totalSteps += ad.imageUrl ? 3 : 2; // image upload + creative + ad (or just creative + ad)
      }
    }
  }
  let completedSteps = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      function progress() {
        completedSteps++;
        return Math.round((completedSteps / totalSteps) * 100);
      }

      try {
        // Step 1: Connect to MCP
        send({ type: "status", message: "Connecting to Meta Ads platform..." });
        mcpClient = await connectMCP();
        send({ type: "status", message: `Connected to account ${accountId}` });

        // Step 2: Discover tool names
        send({ type: "status", message: "Discovering API capabilities..." });
        const tools = await discoverTools(mcpClient);
        send({ type: "status", message: "Ready to deploy" });

        await new Promise((r) => setTimeout(r, 500));

        // Step 3: Create each campaign and its children
        const createdCampaigns: Array<{
          name: string;
          id: string | null;
          objective: string;
          adSets: Array<{
            name: string;
            id: string | null;
            ads: Array<{ name: string; id: string | null }>;
          }>;
        }> = [];

        for (const camp of config.campaigns) {
          // ── Create Campaign ──────────────────────────────
          send({ type: "creating", message: `Creating campaign: ${camp.name}...` });

          const campResult = await mcpClient.callTool({
            name: tools.create_campaign,
            arguments: {
              account_id: accountId,
              name: camp.name,
              objective: camp.objective,
              status: camp.status || "PAUSED",
              daily_budget: camp.dailyBudget,
              special_ad_categories: camp.specialAdCategories || [],
              bid_strategy: "LOWEST_COST_WITHOUT_CAP",
            },
          });

          const campaignId = extractId(campResult);
          const campRecord = {
            name: camp.name,
            id: campaignId,
            objective: camp.objective,
            adSets: [] as Array<{
              name: string;
              id: string | null;
              ads: Array<{ name: string; id: string | null }>;
            }>,
          };

          send({
            type: "campaign_created",
            name: camp.name,
            id: campaignId,
            objective: camp.objective,
            progress: progress(),
          });

          if (!campaignId) {
            send({
              type: "error",
              message: `Failed to get campaign ID for "${camp.name}". Result: ${extractMCPText(campResult)}`,
            });
            createdCampaigns.push(campRecord);
            continue;
          }

          await new Promise((r) => setTimeout(r, 300));

          // ── Create Ad Sets ───────────────────────────────
          for (const adSet of camp.adSets) {
            send({ type: "creating", message: `Creating ad set: ${adSet.name}...` });

            const targeting = buildTargeting(adSet.targeting);

            // Note: budget is set at campaign level, so don't pass daily_budget here
            // (Meta rejects if both campaign and ad set have budgets)
            const adSetArgs: Record<string, unknown> = {
              account_id: accountId,
              campaign_id: campaignId,
              name: adSet.name,
              optimization_goal: adSet.optimizationGoal,
              billing_event: adSet.billingEvent || "IMPRESSIONS",
              targeting,
              status: "PAUSED",
            };

            if (adSet.destinationType) {
              adSetArgs.destination_type = adSet.destinationType;
            }

            // Lead gen campaigns require a promoted_object with page_id
            if (camp.objective === "OUTCOME_LEADS" && pageId) {
              adSetArgs.promoted_object = { page_id: pageId };
            }

            const adSetResult = await mcpClient.callTool({
              name: tools.create_adset,
              arguments: adSetArgs,
            });

            const adSetId = extractId(adSetResult);
            const adSetRecord = {
              name: adSet.name,
              id: adSetId,
              ads: [] as Array<{ name: string; id: string | null }>,
            };

            send({
              type: "adset_created",
              name: adSet.name,
              id: adSetId,
              campaignName: camp.name,
              progress: progress(),
            });

            if (!adSetId) {
              send({
                type: "error",
                message: `Failed to get ad set ID for "${adSet.name}". Result: ${extractMCPText(adSetResult)}`,
              });
              campRecord.adSets.push(adSetRecord);
              continue;
            }

            await new Promise((r) => setTimeout(r, 300));

            // ── Create Ads ───────────────────────────────
            for (const ad of adSet.ads) {
              let imageHash: string | null = null;

              // Upload image if provided
              if (ad.imageUrl) {
                send({ type: "creating", message: `Uploading image for "${ad.name}"...` });

                const uploadResult = await mcpClient.callTool({
                  name: tools.upload_ad_image,
                  arguments: {
                    account_id: accountId,
                    file: ad.imageUrl, // data URL
                    name: `${ad.name} - image`,
                  },
                });

                imageHash = extractImageHash(uploadResult);
                send({
                  type: "image_uploaded",
                  message: `Image uploaded${imageHash ? ` (hash: ${imageHash.slice(0, 8)}...)` : ""}`,
                  progress: progress(),
                });

                if (!imageHash) {
                  send({
                    type: "error",
                    message: `Failed to get image hash. Result: ${extractMCPText(uploadResult)}`,
                  });
                }

                await new Promise((r) => setTimeout(r, 200));
              }

              // Create creative
              send({ type: "creating", message: `Creating creative for "${ad.name}"...` });

              const creativeArgs: Record<string, unknown> = {
                account_id: accountId,
                page_id: pageId,
                name: `${ad.name} Creative`,
                headline: ad.headline,
                message: ad.body,
                description: ad.description,
                call_to_action_type: ad.callToAction,
                link_url: ad.linkUrl,
              };

              if (imageHash) {
                creativeArgs.image_hash = imageHash;
              } else {
                // Use a blank/default — Meta requires image_hash for link ads
                // If no image, we'll try without it (may fail for some ad types)
                creativeArgs.image_hash = "";
              }

              const creativeResult = await mcpClient.callTool({
                name: tools.create_ad_creative,
                arguments: creativeArgs,
              });

              const creativeId = extractId(creativeResult);
              send({
                type: "creative_created",
                message: `Creative created${creativeId ? ` (ID: ${creativeId})` : ""}`,
                progress: progress(),
              });

              if (!creativeId) {
                send({
                  type: "error",
                  message: `Failed to create creative for "${ad.name}". Result: ${extractMCPText(creativeResult)}`,
                });
                adSetRecord.ads.push({ name: ad.name, id: null });
                continue;
              }

              await new Promise((r) => setTimeout(r, 200));

              // Create ad
              send({ type: "creating", message: `Creating ad: ${ad.name}...` });

              const adResult = await mcpClient.callTool({
                name: tools.create_ad,
                arguments: {
                  account_id: accountId,
                  name: ad.name,
                  adset_id: adSetId,
                  creative_id: creativeId,
                  status: "PAUSED",
                },
              });

              const adId = extractId(adResult);
              adSetRecord.ads.push({ name: ad.name, id: adId });

              send({
                type: "ad_created",
                name: ad.name,
                id: adId,
                adSetName: adSet.name,
                progress: progress(),
              });

              await new Promise((r) => setTimeout(r, 200));
            }

            campRecord.adSets.push(adSetRecord);
          }

          createdCampaigns.push(campRecord);
        }

        // Step 4: Complete
        send({
          type: "complete",
          message: `Deployment complete — ${createdCampaigns.length} campaign(s) with ad sets and ads`,
          campaigns: createdCampaigns,
          adsManagerUrl: `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${accountId.replace("act_", "")}`,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        send({
          type: "error",
          message: `Deployment failed: ${message}`,
        });
      } finally {
        controller.close();
        if (mcpClient) {
          try {
            await mcpClient.close();
          } catch {
            // Ignore close errors
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

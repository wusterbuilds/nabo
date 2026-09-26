import { streamText, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectMCP, extractMCPText } from "@/lib/mcp";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Phase-specific system prompts ──────────────────────────

const PHASE_PROMPTS: Record<string, string> = {
  strategize: `You are a senior digital marketing strategist embedded in a notepad tool called Nabo.
You help agency strategists answer questions, pull historical performance data, and form hypotheses.
When the user asks about metrics, use the get_campaign_performance tool to fetch REAL data from their Meta Ads account.
Be concise — you're writing inline in a document, not a chat. Use bullet points and bold for key numbers.
If you use a tool, summarize the data in a clear, readable way — don't dump raw JSON.
This is a conversation — the user may ask follow-ups. Reference earlier context naturally.`,

  plan: `You are a project manager for a digital marketing agency, embedded in a notepad tool called Nabo.
You help break down strategies into actionable tasks, identify risks, estimate timelines, and draft messages.
When asked about risks or pre-mortems, be specific to paid media operations (audience uploads, pixel issues, budget pacing, etc.).
Be concise and structured — use numbered lists, bullet points, and bold headers.
This is a conversation — the user may ask follow-ups or refine ideas. Build on earlier context.`,

  live: `You are a campaign operations specialist embedded in a notepad tool called Nabo.
You help validate campaign configurations, estimate audience sizes, and audit settings before deployment.
When asked to estimate audiences, use the estimate_audience_size tool with real data.
When asked to audit, check for common issues: budget too low for objective, targeting too broad/narrow, missing exclusions.
Be concise and actionable. This is a conversation — build on what was discussed.`,

  monitor: `You are a performance analyst embedded in a notepad tool called Nabo.
You pull REAL campaign data from Meta Ads and create clear performance summaries.
When asked about performance, ALWAYS use the get_campaign_performance tool to fetch real data first — never make up numbers.
Present data in markdown tables when showing multiple campaigns or time periods.
After showing data, provide 2-3 actionable insights.
Use bold for key metrics and trends. Be concise. This is a conversation — the user may dig deeper.`,
};

const BASE_PROMPT = `You are an AI assistant in Nabo, a marketing notepad tool.
Answer the user's question concisely. You're writing inline in a document, so keep responses focused and well-formatted.
Use markdown formatting: **bold** for emphasis, bullet points for lists, and markdown tables for data.
This is a conversation — build on earlier messages naturally.`;

// ─── MCP tool wrappers for Claude ───────────────────────────

function createTools(mcpClient: Client, accountId: string) {
  return {
    get_campaign_performance: tool({
      description:
        "Get real performance metrics for campaigns in the Meta Ads account. Returns spend, impressions, clicks, CTR, conversions, cost per result, ROAS. Use this whenever the user asks about campaign performance, metrics, or data.",
      inputSchema: z.object({
        time_range: z
          .string()
          .optional()
          .describe(
            "Time range: last_7d, last_14d, last_30d, last_90d, this_month, last_month. Default: last_7d"
          ),
        level: z
          .enum(["campaign", "adset", "ad", "account"])
          .optional()
          .describe("Aggregation level. Default: campaign"),
      }),
      execute: async ({ time_range, level }) => {
        const result = await mcpClient.callTool({
          name: "get_insights",
          arguments: {
            object_id: accountId,
            time_range: time_range || "last_7d",
            level: level || "campaign",
          },
        });
        return extractMCPText(result);
      },
    }),

    get_campaigns_list: tool({
      description:
        "List all campaigns in the Meta Ads account with their status, objective, and budget.",
      inputSchema: z.object({
        status_filter: z
          .string()
          .optional()
          .describe("Filter by status: ACTIVE, PAUSED, or empty for all"),
      }),
      execute: async ({ status_filter }) => {
        const result = await mcpClient.callTool({
          name: "get_campaigns",
          arguments: {
            account_id: accountId,
            limit: 20,
            ...(status_filter ? { status_filter } : {}),
          },
        });
        return extractMCPText(result);
      },
    }),

    estimate_audience_size: tool({
      description:
        "Estimate the audience size for specific targeting parameters on Meta Ads. Useful for validating targeting before deployment.",
      inputSchema: z.object({
        age_min: z.number().optional().describe("Minimum age (default 18)"),
        age_max: z.number().optional().describe("Maximum age (default 65)"),
        countries: z
          .array(z.string())
          .optional()
          .describe('Country codes, e.g. ["US"]'),
        interests: z
          .array(z.string())
          .optional()
          .describe("Interest names to target"),
      }),
      execute: async ({ age_min, age_max, countries, interests }) => {
        const targeting: Record<string, unknown> = {};
        if (age_min) targeting.age_min = age_min;
        if (age_max) targeting.age_max = age_max;
        if (countries) targeting.geo_locations = { countries };

        const result = await mcpClient.callTool({
          name: "estimate_audience_size",
          arguments: {
            account_id: accountId,
            targeting,
            ...(interests ? { interest_list: interests } : {}),
          },
        });
        return extractMCPText(result);
      },
    }),

    get_account_info: tool({
      description:
        "Get details about the Meta Ads account: name, currency, amount spent, status.",
      inputSchema: z.object({}),
      execute: async () => {
        const result = await mcpClient.callTool({
          name: "get_account_info",
          arguments: { account_id: accountId },
        });
        return extractMCPText(result);
      },
    }),
  };
}

// ─── Types ──────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── API Route ──────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json();

  // Support both old single-query format and new messages format
  const messages: ChatMessage[] = body.messages || [];
  if (body.query && messages.length === 0) {
    messages.push({ role: "user", content: body.query });
  }

  const phase = body.phase || "";

  if (messages.length === 0 || !messages[messages.length - 1]?.content) {
    return Response.json({ error: "messages are required" }, { status: 400 });
  }

  const context = body.context || "";

  const accountId = process.env.META_AD_ACCOUNT_ID || "";
  const phaseKey = phase.toLowerCase();
  const systemPrompt = PHASE_PROMPTS[phaseKey] || BASE_PROMPT;

  // Build context suffix with notepad content
  let contextSuffix = "";
  contextSuffix += `\n\nMeta Ads Account ID: ${accountId}`;
  contextSuffix += `\nClient: Summit Home Services`;
  contextSuffix += `\nCurrent phase: ${phase || "unknown"}`;
  if (context) {
    contextSuffix += `\n\n--- NOTEPAD CONTENT (everything the team has written so far) ---\n${context}\n--- END NOTEPAD CONTENT ---`;
  }

  // Convert to AI SDK message format
  const aiMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const encoder = new TextEncoder();
  let mcpClient: Client | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      try {
        // Connect MCP for tool access
        mcpClient = await connectMCP();
        const tools = createTools(mcpClient, accountId);

        send({ type: "status", message: "Thinking..." });

        const result = streamText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: systemPrompt + contextSuffix,
          messages: aiMessages,
          tools,
          stopWhen: stepCountIs(5),
        });

        // Iterate over the full stream to get text + tool events
        for await (const event of result.fullStream) {
          if (event.type === "text-delta") {
            send({ type: "text", content: event.text });
          } else if (event.type === "tool-call") {
            send({
              type: "tool_call",
              name: event.toolName,
              message: `Fetching data from Meta Ads...`,
            });
          } else if (event.type === "tool-result") {
            send({
              type: "tool_result",
              name: event.toolName,
            });
          } else if (event.type === "error") {
            const err = event.error;
            const errMsg = err instanceof Error ? err.message : String(err);
            send({ type: "error", message: errMsg });
          }
        }

        send({ type: "done" });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        send({ type: "error", message });
      } finally {
        controller.close();
        if (mcpClient) {
          try {
            await mcpClient.close();
          } catch {
            // ignore
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

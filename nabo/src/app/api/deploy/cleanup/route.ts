import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { connectMCP } from "@/lib/mcp";

export const runtime = "nodejs";

// DELETE /api/deploy/cleanup
// Deletes all "Summit —" campaigns created during demo runs
export async function DELETE() {
  let mcpClient: Client | null = null;

  try {
    const accountId = process.env.META_AD_ACCOUNT_ID;
    if (!accountId) throw new Error("META_AD_ACCOUNT_ID not set");

    mcpClient = await connectMCP();

    // List campaigns
    const listResult = await mcpClient.callTool({
      name: "get_campaigns",
      arguments: { account_id: accountId, limit: 50 },
    });

    const listText =
      (listResult as { content?: Array<{ text: string }> })?.content?.[0]
        ?.text || "{}";
    const campaigns = JSON.parse(listText);
    const data = campaigns?.data || [];

    // Find Summit demo campaigns
    const summitCampaigns = data.filter(
      (c: { name: string }) =>
        c.name.startsWith("Summit") && c.name.includes("—")
    );

    const deleted: string[] = [];

    for (const campaign of summitCampaigns) {
      await mcpClient.callTool({
        name: "update_campaign",
        arguments: { campaign_id: campaign.id, status: "DELETED" },
      });
      deleted.push(`${campaign.name} (${campaign.id})`);
    }

    return Response.json({
      success: true,
      deleted,
      message: `Cleaned up ${deleted.length} Summit demo campaigns`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  } finally {
    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch {
        // Ignore
      }
    }
  }
}

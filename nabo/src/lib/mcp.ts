import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * Create an MCP client connected to the Pipeboard Meta Ads remote server.
 */
export async function connectMCP(): Promise<Client> {
  const token = process.env.PIPEBOARD_MCP_TOKEN;
  if (!token) throw new Error("PIPEBOARD_MCP_TOKEN not set");

  const url = new URL(
    `https://mcp.pipeboard.co/meta-ads-mcp?token=${token}`
  );
  const transport = new StreamableHTTPClientTransport(url);
  const client = new Client(
    { name: "nabo-backend", version: "0.1.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  return client;
}

/**
 * Extract text content from an MCP tool result.
 */
export function extractMCPText(result: unknown): string {
  try {
    const res = result as { content?: Array<{ type: string; text: string }> };
    if (res?.content?.[0]?.text) {
      return res.content[0].text;
    }
  } catch {
    // fallback
  }
  return JSON.stringify(result);
}

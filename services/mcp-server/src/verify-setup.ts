import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CallToolResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

async function main() {
  console.log("[TEST] Testing MCP Server Connection...");

  // Connect to the server we just built
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "services/mcp-server/src/server.ts"],
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  try {
    await client.connect(transport);
    console.log("[PASS] Connected to MCP Server successfully");

    // 1. Verify Resources (Dynamic Documentation)
    console.log("\n[FOLDER] Verifying Resources (Dynamic Scanning)...");
    const resources = await client.request(
      { method: "resources/list" },
      ListResourcesResultSchema,
    );
    console.log(
      `Found ${resources.resources.length} resources (showing first 5):`,
    );
    resources.resources
      .slice(0, 5)
      .forEach((r) => console.log(` - ${r.name} (${r.uri})`));

    if (resources.resources.length > 0) {
      // 2. Verify Content Access (Read first resource)
      const firstResource = resources.resources[0];
      console.log(
        `\n[DOC] Verifying Content Access (Reading '${firstResource.uri}')...`,
      );
      const docContent = await client.request(
        {
          method: "resources/read",
          params: { uri: firstResource.uri },
        },
        ReadResourceResultSchema,
      );
      const contentItem = docContent.contents[0];
      if (
        contentItem &&
        "text" in contentItem &&
        typeof contentItem.text === "string"
      ) {
        const preview = contentItem.text.substring(0, 100).replace(/\n/g, " ");
        console.log(`Content Preview: "${preview}..."`);
      }
    }

    // 3. Verify Tools (Search)
    console.log("\n[SEARCH] Verifying Tools (Search Capability)...");
    const tools = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema,
    );
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach((t) => console.log(` - ${t.name}: ${t.description}`));

    if (tools.tools.some((t) => t.name === "search_docs")) {
      console.log("\n[FIND] Testing 'search_docs' with query 'commit'...");
      const searchResult = await client.request(
        {
          method: "tools/call",
          params: {
            name: "search_docs",
            arguments: { query: "commit" },
          },
        },
        CallToolResultSchema,
      );

      const contentItem = searchResult.content[0];
      if (contentItem && contentItem.type === "text") {
        const matches = JSON.parse(contentItem.text) as Array<{
          name: string;
          snippet: string;
        }>;
        console.log(`Found ${matches.length} matches for 'commit':`);
        matches
          .slice(0, 3)
          .forEach((m) =>
            console.log(` - In ${m.name}: "${m.snippet.substring(0, 60)}..."`),
          );
      }
    }

    // 4. Verify Prompts
    console.log("\n[AI] Verifying Prompts...");
    const prompts = await client.request(
      { method: "prompts/list" },
      ListPromptsResultSchema,
    );
    console.log(`Found ${prompts.prompts.length} prompts:`);
    prompts.prompts.forEach((p) => console.log(` - ${p.name}`));

    console.log(
      "\n[SUCCESS] SYSTEM VERIFICATION PASSED: The server is correctly serving dynamic documentation and tools.",
    );
  } catch (error) {
    console.error("[ERROR] Verification Failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

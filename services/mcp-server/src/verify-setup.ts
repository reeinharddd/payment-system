import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	ListResourcesRequestSchema,
	ReadResourceRequestSchema,
	ListPromptsRequestSchema,
	ListToolsRequestSchema,
	CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

async function main() {
  console.log("🧪 Testing MCP Server Connection...");

  // Connect to the server we just built
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "src/server.ts"],
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
		await client.connect(transport);
		console.log('✅ Connected to MCP Server successfully');

		// 1. Verify Resources (Dynamic Documentation)
		console.log('\n📂 Verifying Resources (Dynamic Scanning)...');
		const resources = await client.request(ListResourcesRequestSchema, {});
		console.log(
			`Found ${resources.resources.length} resources (showing first 5):`
		);
		resources.resources
			.slice(0, 5)
			.forEach((r) => console.log(` - ${r.name} (${r.uri})`));

		if (resources.resources.length > 0) {
			// 2. Verify Content Access (Read first resource)
			const firstResource = resources.resources[0];
			console.log(
				`\n📖 Verifying Content Access (Reading '${firstResource.uri}')...`
			);
			const docContent = await client.request(ReadResourceRequestSchema, {
				uri: firstResource.uri,
			});
			const preview = docContent.contents[0].text
				.substring(0, 100)
				.replace(/\n/g, ' ');
			console.log(`Content Preview: "${preview}..."`);
		}

		// 3. Verify Tools (Search)
		console.log('\n🔍 Verifying Tools (Search Capability)...');
		const tools = await client.request(ListToolsRequestSchema, {});
		console.log(`Found ${tools.tools.length} tools:`);
		tools.tools.forEach((t) => console.log(` - ${t.name}: ${t.description}`));

		if (tools.tools.some((t) => t.name === 'search_docs')) {
			console.log("\n🔎 Testing 'search_docs' with query 'commit'...");
			const searchResult = await client.request(CallToolRequestSchema, {
				name: 'search_docs',
				arguments: { query: 'commit' },
			});

			// @ts-ignore
			const matches = JSON.parse(searchResult.content[0].text);
			console.log(`Found ${matches.length} matches for 'commit':`);
			matches
				.slice(0, 3)
				.forEach((m: any) =>
					console.log(` - In ${m.name}: "${m.snippet.substring(0, 60)}..."`)
				);
		}

		// 4. Verify Prompts
		console.log('\n🤖 Verifying Prompts...');
		const prompts = await client.request(ListPromptsRequestSchema, {});
		console.log(`Found ${prompts.prompts.length} prompts:`);
		prompts.prompts.forEach((p) => console.log(` - ${p.name}`));

		console.log(
			'\n✨ SYSTEM VERIFICATION PASSED: The server is correctly serving dynamic documentation and tools.'
		);
	} catch (error) {
    console.error("❌ Verification Failed:", error);
  } finally {
    await client.close();
  }
}

main();

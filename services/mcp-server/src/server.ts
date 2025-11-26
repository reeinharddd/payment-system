/** @format */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readdir, readFile, stat } from "fs/promises";
import { basename, dirname, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../../../"); // src -> mcp-server -> services -> root
const DOCS_DIR = join(PROJECT_ROOT, "docs");

// Helper to recursively find markdown files
async function getDocsFiles(
  dir: string,
  baseDir: string = dir,
): Promise<
  Array<{ uri: string; name: string; description: string; filePath: string }>
> {
  try {
    // Verify directory exists first
    try {
      await stat(dir);
    } catch {
      return [];
    }

    const entries = await readdir(dir, { withFileTypes: true });
    const results: Array<{
      uri: string;
      name: string;
      description: string;
      filePath: string;
    }> = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Avoid hidden directories and node_modules
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          results.push(...(await getDocsFiles(fullPath, baseDir)));
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const relPath = relative(baseDir, fullPath);
        const uriPath = relPath.replace(/\\/g, "/").replace(/\.md$/, "");
        const uri = `docs://${uriPath}`;

        results.push({
          uri,
          name: basename(entry.name, ".md").replace(/-/g, " "),
          description: `Documentation for ${relPath}`,
          filePath: fullPath,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

// Initialize Server
const server = new Server(
  {
    name: "payment-system-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
      tools: {},
    },
  },
);

/**
 * RESOURCES: Expose documentation as read-only resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const docs = await getDocsFiles(DOCS_DIR);
    return {
      resources: docs.map((doc) => ({
        uri: doc.uri,
        name: doc.name,
        description: doc.description,
        mimeType: "text/markdown",
      })),
    };
  } catch {
    return { resources: [] };
  }
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (!uri.startsWith("docs://")) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Unknown resource scheme: ${uri}`,
    );
  }

  // Convert URI back to file path
  // docs://folder/file -> docs/folder/file.md
  const relPath = uri.substring("docs://".length);
  const filePath = join(DOCS_DIR, `${relPath}.md`);

  // Security check: ensure we are still inside DOCS_DIR
  const resolvedPath = resolve(filePath);
  if (!resolvedPath.startsWith(resolve(DOCS_DIR))) {
    throw new McpError(ErrorCode.InvalidRequest, `Access denied: ${uri}`);
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return {
      contents: [
        {
          uri: uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to read file: ${String(error)}`,
    );
  }
});

/**
 * PROMPTS: Pre-defined workflows that enforce standards
 */
server.setRequestHandler(ListPromptsRequestSchema, () => {
  return {
    prompts: [
      {
        name: "generate-commit",
        description:
          "Generate a standard-compliant commit message for staged changes",
        arguments: [
          {
            name: "diff",
            description: "The git diff of staged changes",
            required: true,
          },
        ],
      },
      {
        name: "scaffold-feature",
        description:
          "Create a plan for a new feature following the standard template",
        arguments: [
          {
            name: "description",
            description: "Description of the feature to build",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const name = request.params.name;

  if (name === "generate-commit") {
    const diff = request.params.arguments?.diff as string;
    const rulesPath = join(DOCS_DIR, "process/workflow/DEVELOPMENT-RULES.md"); // Assuming commit rules are here
    const rules = await readFile(rulesPath, "utf-8");

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please generate a commit message for the following changes.
You MUST follow the commit standards defined below:

${rules}

---
CHANGES:
${diff}
`,
          },
        },
      ],
    };
  }

  if (name === "scaffold-feature") {
    const description = request.params.arguments?.description as string;
    const templatePath = join(
      DOCS_DIR,
      "templates/01-FEATURE-DESIGN-TEMPLATE.md",
    );
    const template = await readFile(templatePath, "utf-8");

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to design a new feature: "${description}".
Please create a design document following the strict template below.
Do not skip any sections.

TEMPLATE:
${template}
`,
          },
        },
      ],
    };
  }

  throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
});

/**
 * TOOLS: Executable actions
 */
server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: "search_docs",
        description: "Search documentation for a specific query",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments;

  if (name === "search_docs") {
    const query = (args?.query as string).toLowerCase();
    const docs = await getDocsFiles(DOCS_DIR);
    const matches = [];

    for (const doc of docs) {
      try {
        const content = await readFile(doc.filePath, "utf-8");
        if (content.toLowerCase().includes(query)) {
          // Extract a snippet
          const index = content.toLowerCase().indexOf(query);
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + 150);
          const snippet = content.substring(start, end).replace(/\n/g, " ");

          matches.push({
            uri: doc.uri,
            name: doc.name,
            snippet: `...${snippet}...`,
          });
        }
      } catch {
        // Ignore read errors
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(matches, null, 2),
        },
      ],
    };
  }

  throw new McpError(ErrorCode.InvalidRequest, `Unknown tool: ${name}`);
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP Server running on stdio");

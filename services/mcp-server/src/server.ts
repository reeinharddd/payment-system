console.log("MCP Server starting...");

const server = Bun.serve({
  port: 8080,
  fetch(req) {
    return new Response("MCP Server is running!");
  },
});

console.log(`MCP Server listening on port ${server.port}`);

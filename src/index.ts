import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create server instance
const server = new McpServer({
  name: "brainfaq-mcp",
  version: "1.0.0",
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("brainfaq-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

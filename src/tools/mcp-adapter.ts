import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { MCPServerConfig } from "../config/schema";

/**
 * Create MCP client from server configurations
 */
export async function createMCPClient(
  servers: MCPServerConfig[]
): Promise<MultiServerMCPClient | null> {
  if (servers.length === 0) {
    return null;
  }
  
  // Build server configuration object
  const serverConfig: Record<string, any> = {};
  
  for (const server of servers) {
    const config: any = {
      transport: server.transport,
    };
    
    // Add transport-specific options
    if (server.transport === "stdio") {
      if (!server.command) {
        console.warn(`MCP server ${server.name}: stdio transport requires 'command'`);
        continue;
      }
      config.command = server.command;
      config.args = server.args || [];
    } else if (server.transport === "sse" || server.transport === "streamable_http") {
      if (!server.url) {
        console.warn(`MCP server ${server.name}: HTTP transport requires 'url'`);
        continue;
      }
      config.url = server.url;
      if (server.headers) {
        config.headers = server.headers;
      }
    }
    
    serverConfig[server.name] = config;
  }
  
  if (Object.keys(serverConfig).length === 0) {
    return null;
  }
  
  try {
    const client = new MultiServerMCPClient(serverConfig);
    return client;
  } catch (error) {
    console.error("Failed to create MCP client:", error);
    return null;
  }
}

/**
 * Get tools from MCP servers
 */
export async function getMCPTools(
  servers: MCPServerConfig[]
): Promise<DynamicStructuredTool[]> {
  const client = await createMCPClient(servers);
  
  if (!client) {
    return [];
  }
  
  try {
    const tools = await client.getTools();
    console.log(`Loaded ${tools.length} tools from MCP servers`);
    return tools;
  } catch (error) {
    console.error("Failed to get MCP tools:", error);
    return [];
  }
}


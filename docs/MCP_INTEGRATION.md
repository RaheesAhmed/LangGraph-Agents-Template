# MCP Integration

Connect Model Context Protocol servers to your agent.

## What is MCP

[MCP](https://modelcontextprotocol.io/) lets your agent use tools from external servers. Servers can be local or remote, written in any language.

## Quick Start

### 1. Find or Create an MCP Server

You can use existing MCP servers from the ecosystem:
- [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [Brave Search MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)
- [More servers...](https://github.com/modelcontextprotocol/servers)

Or create your own using the [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

### 2. Configure MCP Server in Agent Config

```json
{
  "tools": {
    "enabled": true,
    "useMCPTools": true,
    "mcpServers": [
      {
        "name": "filesystem",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
      }
    ]
  }
}
```

### 3. Use in Your Agent

```typescript
import { createAgent, loadConfig } from "./src";
import { HumanMessage } from "@langchain/core/messages";

const config = await loadConfig("./config/agent.config.json");
const agent = await createAgent(config);

// Agent now has access to MCP server tools
const result = await agent.invoke({
  messages: [new HumanMessage("List files in the directory")],
});
```

## Transports

### stdio
Local subprocess.
```json
{ "transport": "stdio", "command": "node", "args": ["server.js"] }
```

### sse
HTTP Server-Sent Events.
```json
{ "transport": "sse", "url": "http://localhost:8000/mcp" }
```

### streamable_http
HTTP streaming.
```json
{ "transport": "streamable_http", "url": "https://api.example.com/mcp" }
```

## Examples

```json
{
  "mcpServers": [
    {
      "name": "filesystem",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    },
    {
      "name": "github",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  ]
}
```

Find more: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

## Mix Built-in + MCP Tools

```json
{
  "tools": {
    "enabledTools": ["calculator"],
    "useMCPTools": true,
    "mcpServers": [...]
  }
}
```

Agent gets both built-in and MCP tools.

## Authentication

Add headers for secure servers:

```json
{
  "name": "api",
  "transport": "sse",
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer TOKEN"
  }
}
```

## Troubleshooting

**stdio server not starting**
- Check command path
- Check server logs

**HTTP connection fails**
- Server running?
- Check URL and port

**Tools not appearing**
- `useMCPTools: true`?
- Check server logs

## Resources

- [MCP Docs](https://modelcontextprotocol.io/)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
- [@langchain/mcp-adapters](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters)


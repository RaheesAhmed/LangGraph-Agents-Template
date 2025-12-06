# LangGraph Agent Template

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.0-green)](https://github.com/langchain-ai/langgraphjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Build LangGraph agents with JSON configuration. No code changes needed.

## What You Get

- **4 Agent Patterns** - ReAct, Reflection, Planning, Multi-Agent
- **Streaming** - 5 modes including real-time tokens
- **REST API** - Ready-to-deploy with SSE streaming
- **MCP Support** - Connect to Model Context Protocol servers
- **Built-in Tools** - Calculator, web search, file ops
- **Memory** - Thread-based conversations
- **Type-Safe** - Full TypeScript support

## Install

```bash
git clone https://github.com/RaheesAhmed/LangGraph-Agents-Template.git
cd LangGraph-Agents-Template
npm install
cp .env.example .env  # Add your ANTHROPIC_API_KEY
npm run example:basic
```

## Use in Code

```typescript
import { createAgent, loadConfig } from "./src";

const agent = await createAgent(await loadConfig("./config/agent.config.json"));

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What is 25 * 4?" }] },
  { configurable: { thread_id: "conversation-1" } }
);
```

## Use via API

```bash
npm run api:start

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "threadId": "thread-1"}'
```

## Change Agent Type

Edit `config/agent.config.json`:

```json
{
  "pattern": "react",          // or "reflection", "planning", "multi-agent"
  "tools": {
    "enabledTools": ["calculator", "web-search"]
  },
  "thinking": { "enabled": true },
  "streaming": { "modes": ["messages", "custom"] }
}
```

No code changes. Just config.

## Examples

```bash
npm run example:basic       # Conversation with memory
npm run example:streaming   # Real-time streaming
npm run example:api-client  # API usage
```

## Streaming

```typescript
for await (const [mode, data] of await agent.stream(input, {
  streamMode: ["messages", "custom"],
  configurable: { thread_id: "thread-1" }
})) {
  if (mode === "messages") {
    console.log(data[0].content);  // LLM tokens
  }
}
```

## MCP Servers

Connect to external tools:

```json
{
  "tools": {
    "useMCPTools": true,
    "mcpServers": [
      {
        "name": "filesystem",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
      }
    ]
  }
}
```

Find servers: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

## Documentation

- [Getting Started](GETTING_STARTED.md) - Step-by-step setup
- [API Docs](docs/API_DOCUMENTATION.md) - REST endpoints
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Data structures
- [Quick Reference](docs/QUICK_REFERENCE.md) - Code snippets
- [MCP Integration](docs/MCP_INTEGRATION.md) - MCP setup

## Project Structure

```
src/
├── api/         # REST API
├── agent/       # Graph builders
├── tools/       # Built-in tools + MCP
├── nodes/       # Graph nodes
├── patterns/    # 4 patterns
└── config/      # Config system
```

## Configuration

All in `config/agent.config.json`:
- Agent pattern
- Model settings
- Tools
- Streaming modes
- Memory
- Persistence
- Human-in-the-loop

See `config/examples/` for templates.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - See [LICENSE](LICENSE)

## Author

**Rahees Ahmed** - [GitHub](https://github.com/RaheesAhmed)

Built with [LangGraph](https://langchain-ai.github.io/langgraphjs/) | [LangChain](https://js.langchain.com/) | [MCP](https://modelcontextprotocol.io/)


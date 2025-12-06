# LangGraph Agent Template

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.0-green)](https://github.com/langchain-ai/langgraphjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Build LangGraph agents by editing a JSON config file. No code changes needed.

## What This Is

A TypeScript/Node.js template for LangGraph agents with:
- 4 agent patterns (ReAct, Reflection, Planning, Multi-Agent)
- 5 streaming modes (values, updates, messages, custom, debug)
- Built-in tools (calculator, web-search, file operations)
- MCP server support
- REST API with streaming
- Thread-based conversation memory
- Everything controlled via JSON configuration

## Quick Start

```bash
git clone https://github.com/RaheesAhmed/LangGraph-Agents-Template.git
cd LangGraph-Agents-Template
npm install

# Setup environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

npm run example:basic
```

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed setup.

## Usage

### Option 1: Code

```typescript
import { createAgent, loadConfig } from "./src";

const agent = await createAgent(await loadConfig("./config/agent.config.json"));

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What is 25 * 4?" }] },
  { configurable: { thread_id: "thread-1" } }
);
```

### Option 2: REST API

```bash
npm run api:start

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2 + 2?", "threadId": "thread-1"}'
```

### Streaming

```typescript
for await (const [mode, data] of await agent.stream(input, {
  streamMode: ["messages", "custom"],
  configurable: { thread_id: "thread-1" }
})) {
  if (mode === "messages") {
    const [message, metadata] = data;
    console.log(message.content);
  }
}
```

## Configuration

Edit `config/agent.config.json`:

### Agent Patterns

**ReAct** - Calls tools to complete tasks
```json
{ "pattern": "react" }
```

**Reflection** - Generates response, critiques it, improves it
```json
{
  "pattern": "reflection",
  "reflectionConfig": { "maxIterations": 3, "qualityThreshold": 0.8 }
}
```

**Planning** - Creates plan, executes steps, verifies completion
```json
{
  "pattern": "planning",
  "planningConfig": { "maxSteps": 10, "verifySteps": true }
}
```

**Multi-Agent** - Supervisor delegates to worker agents
```json
{
  "pattern": "multi-agent",
  "multiAgentConfig": {
    "workers": [
      { "name": "researcher", "role": "Search", "tools": ["web-search"] },
      { "name": "calculator", "role": "Math", "tools": ["calculator"] }
    ]
  }
}
```

### Streaming

```json
{
  "streaming": {
    "modes": ["updates", "messages", "custom"]
  }
}
```

Available modes:
- `values` - Full state each step
- `updates` - State changes per node
- `messages` - LLM tokens
- `custom` - Tool calls, thinking events
- `debug` - Everything

### Tools

```json
{
  "tools": {
    "enabledTools": ["calculator", "web-search", "file-ops"],
    "visibility": true
  }
}
```

Built-in: `calculator`, `web-search`, `file-ops`

### MCP Servers

Connect to external MCP servers:

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

### Other Options

**Memory:** Keep last N messages
```json
{ "memory": { "shortTerm": { "maxMessages": 10 } } }
```

**Human-in-the-Loop:** Pause for approval
```json
{ "humanInLoop": { "enabled": true, "triggerConditions": ["critical_action"] } }
```

**Thinking:** Show reasoning
```json
{ "thinking": { "enabled": true, "visible": true } }
```

**Persistence:** Save state
```json
{ "persistence": { "backend": "memory" } }  // or "postgres", "sqlite"
```

## Examples

```bash
npm run example:basic       # Basic conversation with memory
npm run example:streaming   # See raw streaming data
npm run api:start          # Start REST API server
npm run example:api-client  # Test API endpoints
```

Example configs in `config/examples/`:
- `react-agent.json`
- `reflection-agent.json`
- `planning-agent.json`
- `multi-agent.json`
- `mcp-agent.json`

## Add Custom Tools

```typescript
import { registerTool } from "./src/tools";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const myTool = tool(
  async ({ input }) => "result",
  {
    name: "my_tool",
    description: "What it does",
    schema: z.object({ input: z.string() }),
  }
);

registerTool("my_tool", myTool);
```

## API

```typescript
// Load and create
const config = await loadConfig("./config/agent.config.json");
const agent = await createAgent(config);

// Invoke
const result = await agent.invoke(input, { 
  configurable: { thread_id: "thread-1" } 
});

// Stream
for await (const chunk of await agent.stream(input, {
  streamMode: ["messages"],
  configurable: { thread_id: "thread-1" }
})) {
  console.log(chunk);
}
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...  # Optional
PORT=3000                      # API server port
```

```
src/
├── api/         # REST API endpoints
├── agent/       # Graph builders
├── config/      # Config validation
├── tools/       # Built-in tools + MCP adapter
├── nodes/       # Graph nodes
├── patterns/    # 4 agent patterns
├── persistence/ # State storage
├── memory/      # Conversation memory
└── streaming/   # Stream handlers
```

## State Access

```typescript
const result = await agent.invoke(input, config);

result.messages      // Conversation history
result.toolCalls     // Tool execution log
result.thinking      // Reasoning traces
result.iteration     // Turn count
result.metadata      // Custom data
```

## Scripts

```bash
npm run build              # Compile TypeScript
npm run api:start          # Start REST API
npm run example:basic      # Run example
```

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - REST endpoints
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Data structures
- [Quick Reference](docs/QUICK_REFERENCE.md) - Code snippets
- [MCP Integration](docs/MCP_INTEGRATION.md) - MCP servers

## License

MIT - Rahees Ahmed

## Built With

[LangGraph](https://langchain-ai.github.io/langgraphjs/) | [LangChain](https://js.langchain.com/) | [MCP](https://modelcontextprotocol.io/)


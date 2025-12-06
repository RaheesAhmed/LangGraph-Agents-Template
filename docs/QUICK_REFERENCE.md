# Quick Reference

Code snippets for common tasks.

### Basic Invocation

```typescript
import { createAgent, loadConfig } from "./src";
import { HumanMessage } from "@langchain/core/messages";

const agent = await createAgent(await loadConfig("./config/agent.config.json"));

const result = await agent.invoke(
  { messages: [new HumanMessage("Your question")] },
  { configurable: { thread_id: "conversation-1" } }
);

console.log(result.messages[result.messages.length - 1].content);
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

### Configuration

```json
{
  "pattern": "react",  // "react" | "reflection" | "planning" | "multi-agent"
  "tools": {
    "enabledTools": ["calculator", "web-search", "file-ops"],
    "useMCPTools": true,
    "mcpServers": [...]
  },
  "streaming": {
    "modes": ["updates", "messages", "custom"]
  },
  "thinking": {
    "enabled": true,
    "visible": true
  },
  "humanInLoop": {
    "enabled": true,
    "triggerConditions": ["critical_action"]
  }
}
```

### MCP Server Connection

```json
{
  "tools": {
    "useMCPTools": true,
    "mcpServers": [
      {
        "name": "filesystem",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
      }
    ]
  }
}
```

### Custom Tool Registration

```typescript
import { registerTool } from "./src/tools";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const myTool = tool(
  async ({ input }) => "result",
  {
    name: "my_tool",
    description: "What it does",
    schema: z.object({
      input: z.string(),
    }),
  }
);

registerTool("my_tool", myTool);
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
AGENT_VERBOSE=false
```

## Stream Modes

| Mode | Returns | Use For |
|------|---------|---------|
| `updates` | State changes per node | Tracking progress |
| `messages` | LLM tokens + metadata | Real-time text display |
| `custom` | Tool/thinking events | Progress indicators |
| `values` | Full state each step | Complete snapshots |
| `debug` | Everything | Debugging |

## Agent Patterns

| Pattern | Best For | Config |
|---------|----------|--------|
| `react` | General tasks with tools | `pattern: "react"` |
| `reflection` | Quality-focused output | `reflectionConfig: {...}` |
| `planning` | Multi-step tasks | `planningConfig: {...}` |
| `multi-agent` | Complex delegation | `multiAgentConfig: {...}` |

## Tool Visibility Events

When `tools.visibility: true`:

```typescript
{ type: "tool_start", tool: "calculator", input: {...} }
{ type: "tool_complete", tool: "calculator", output: {...} }
{ type: "tool_error", tool: "calculator", error: "..." }
```

## Common Patterns

### Extract Text from Message
```typescript
const getText = (message) => {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");
  }
  return String(message.content);
};
```

### Get Last N Messages
```typescript
const recentMessages = result.messages.slice(-5);
```

### Filter Tool Calls
```typescript
const calculatorCalls = result.toolCalls.filter(tc => tc.name === "calculator");
const failedCalls = result.toolCalls.filter(tc => tc.error);
```

### Check Iterations
```typescript
if (result.iteration >= config.maxIterations) {
  console.log("Max iterations reached");
}
```

## NPM Scripts

```bash
npm run build              # Compile TypeScript
npm run dev                # Run src/index.ts
npm run example:basic      # Basic invocation
npm run example:streaming  # Streaming demo
npm run example:human-loop # Human-in-the-loop
npm run example:multi-agent # Multi-agent demo
```

## Config Locations

- `config/agent.config.json` - Main configuration
- `config/examples/react-agent.json` - ReAct pattern
- `config/examples/reflection-agent.json` - Reflection pattern
- `config/examples/planning-agent.json` - Planning pattern
- `config/examples/multi-agent.json` - Multi-agent pattern
- `config/examples/mcp-agent.json` - MCP-enabled agent


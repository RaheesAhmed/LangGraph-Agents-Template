# Developer Guide

Raw data structures and how to use them.

## Available State Fields

When you invoke or stream the agent, you get back a state object with these fields:

```typescript
const result = await agent.invoke(input, config);

// Available fields:
result.messages        // Array of all messages (conversation history)
result.iteration       // Number of agent iterations
result.toolCalls       // Array of tool execution history
result.thinking        // Array of reasoning traces (if enabled)
result.memoryContext   // Long-term memory context
result.humanReview     // Human review status (if triggered)
result.metadata        // Custom metadata object
```

## Message Structure

Messages follow the LangChain message format:

```typescript
{
  content: string | Array<{type: "text", text: string} | {type: "tool_use", ...}>,
  role: "user" | "assistant" | "tool",
  id: string,
  tool_calls: Array<{name: string, args: object, id: string}>,
  // ... additional metadata
}
```

**Extract text content:**
```typescript
const lastMessage = result.messages[result.messages.length - 1];

// Handle both string and array content
let text = "";
if (typeof lastMessage.content === "string") {
  text = lastMessage.content;
} else if (Array.isArray(lastMessage.content)) {
  text = lastMessage.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("\n");
}
```

## Tool Calls

Tool execution history with full details:

```typescript
result.toolCalls.forEach(toolCall => {
  console.log("Tool:", toolCall.name);
  console.log("Input:", toolCall.input);
  console.log("Output:", toolCall.output);
  console.log("Error:", toolCall.error);  // null if successful
  console.log("Timestamp:", new Date(toolCall.timestamp));
});
```

## Streaming Modes

### Mode: "updates"

State updates from each node:

```typescript
for await (const chunk of await agent.stream(input, { streamMode: "updates" })) {
  // chunk = { nodeName: { field1: value1, field2: value2 } }
  const nodeName = Object.keys(chunk)[0];
  const update = chunk[nodeName];
  
  console.log(`Node ${nodeName} updated:`, update);
}
```

### Mode: "messages"

LLM tokens as they're generated:

```typescript
for await (const [message, metadata] of await agent.stream(input, { streamMode: "messages" })) {
  // message = { content: "token", ... }
  // metadata = { langgraph_node: "agent", tags: [...], ... }
  
  if (message.content) {
    process.stdout.write(message.content);
  }
}
```

### Mode: "custom"

Custom events from tools, thinking, etc:

```typescript
for await (const event of await agent.stream(input, { streamMode: "custom" })) {
  // event = { type: "tool_start", tool: "calculator", input: {...} }
  
  switch (event.type) {
    case "tool_start":
      console.log(`Tool ${event.tool} started`);
      break;
    case "tool_complete":
      console.log(`Tool ${event.tool} completed:`, event.output);
      break;
    case "thinking":
      console.log(`Thinking:`, event.content);
      break;
  }
}
```

### Multiple Modes

Combine modes to get different types of data:

```typescript
for await (const [mode, data] of await agent.stream(input, {
  streamMode: ["updates", "messages", "custom"],
  configurable: { thread_id: "thread-1" }
})) {
  console.log(`[${mode}]`, data);
  
  // Filter by mode
  if (mode === "messages") {
    const [message, metadata] = data;
    // Handle message tokens
  } else if (mode === "custom") {
    // Handle custom events
  } else if (mode === "updates") {
    // Handle state updates
  }
}
```

## Thread-Based Memory

Use `thread_id` to maintain conversation context:

```typescript
const config = {
  configurable: {
    thread_id: "user-123-conversation",
  },
};

// Turn 1
await agent.invoke({ messages: [...] }, config);

// Turn 2 - remembers previous turns
await agent.invoke({ messages: [...] }, config);

// New conversation - fresh state
await agent.invoke({ messages: [...] }, {
  configurable: { thread_id: "user-123-new-conversation" }
});
```

## Custom Event Types

When tools emit custom events (via `config.writer`), you get:

```typescript
{
  type: "tool_start",
  tool: "calculator",
  input: { operation: "add", a: 1, b: 2 }
}

{
  type: "tool_complete",
  tool: "calculator",
  output: { content: "3", ... }
}

{
  type: "tool_error",
  tool: "calculator",
  error: "Division by zero"
}

{
  type: "thinking",
  content: "Reasoning about the problem...",
  iteration: 1
}

{
  type: "reflection",
  iteration: 2,
  score: 0.85,
  critique: "Good but could be improved..."
}

{
  type: "plan_created",
  goal: "Complete the task",
  steps: 5
}

{
  type: "step_start",
  stepId: "step1",
  description: "First step"
}

{
  type: "step_complete",
  stepId: "step1",
  result: "Completed successfully"
}
```

## Filtering Messages

Get only specific message types:

```typescript
// Get only user messages
const userMessages = result.messages.filter(m => m.getType() === "human");

// Get only AI responses
const aiMessages = result.messages.filter(m => m.getType() === "ai");

// Get only tool results
const toolMessages = result.messages.filter(m => m.getType() === "tool");

// Get last N messages
const recent = result.messages.slice(-5);
```

## Accessing Metadata

Stream metadata contains useful information:

```typescript
for await (const [message, metadata] of await agent.stream(input, { 
  streamMode: "messages" 
})) {
  console.log("Node:", metadata.langgraph_node);
  console.log("Tags:", metadata.tags);
  console.log("Run ID:", metadata.run_id);
  console.log("Parent Run ID:", metadata.parent_run_id);
  
  // Filter by specific node
  if (metadata.langgraph_node === "agent") {
    // Only agent tokens
  }
  
  // Filter by tags
  if (metadata.tags?.includes("important")) {
    // Only tagged messages
  }
}
```

## Error Handling

Handle errors from tools and agents:

```typescript
try {
  const result = await agent.invoke(input, config);
  
  // Check tool errors
  const failedTools = result.toolCalls.filter(tc => tc.error);
  if (failedTools.length > 0) {
    console.log("Some tools failed:", failedTools);
  }
  
} catch (error) {
  console.error("Agent error:", error);
}
```

## Configuration at Runtime

Override configuration programmatically:

```typescript
import { loadConfigFromObject, createAgent } from "./src";

const config = loadConfigFromObject({
  pattern: "react",
  model: {
    provider: "anthropic",
    modelName: "claude-sonnet-4-5-20250929",
  },
  tools: {
    enabled: true,
    enabledTools: ["calculator"],
    visibility: true,  // Enable tool visibility in streams
  },
  streaming: {
    modes: ["updates", "custom"],  // Only these modes
  },
});

const agent = await createAgent(config);
```

## Best Practices

1. **Always use thread_id** for conversation continuity
2. **Check result structure** before accessing fields
3. **Filter streaming data** based on your UI needs
4. **Handle both string and array content** in messages
5. **Monitor toolCalls** for debugging
6. **Use custom events** for progress indicators
7. **Access raw state** for complete control

## Production Considerations

```typescript
// Use persistent checkpointer
const config = loadConfigFromObject({
  persistence: {
    backend: "postgres",  // or "sqlite"
    connectionString: process.env.DATABASE_URL,
  },
  memory: {
    shortTerm: {
      enabled: true,
      maxMessages: 50,  // Adjust based on context window
    },
  },
  retryPolicy: {
    maxAttempts: 3,
    initialInterval: 1000,
  },
});
```

## Debugging

Enable verbose mode and debug streaming:

```typescript
const config = loadConfigFromObject({
  verbose: true,  // Enable console logging
  streaming: {
    modes: ["debug"],  // See everything
  },
});

for await (const chunk of await agent.stream(input, {
  streamMode: "debug",
  configurable: { thread_id: "debug-session" }
})) {
  console.log("Debug:", chunk);
}
```

## Example: Building a Chat UI

```typescript
import { createAgent, loadConfig } from "./src";

const agent = await createAgent(await loadConfig("./config/agent.config.json"));

async function handleUserMessage(userId: string, message: string) {
  const result = await agent.invoke(
    { messages: [{ role: "user", content: message }] },
    { configurable: { thread_id: `user-${userId}` } }
  );
  
  // Extract AI response
  const aiMessage = result.messages[result.messages.length - 1];
  let response = "";
  
  if (typeof aiMessage.content === "string") {
    response = aiMessage.content;
  } else if (Array.isArray(aiMessage.content)) {
    response = aiMessage.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");
  }
  
  return {
    response,
    toolsUsed: result.toolCalls.map(tc => tc.name),
    thinkingTrace: result.thinking,
  };
}
```

## Example: Real-time Streaming UI

```typescript
async function streamToUI(userId: string, message: string, onChunk: (data: any) => void) {
  const agent = await createAgent(config);
  
  for await (const [mode, data] of await agent.stream(
    { messages: [{ role: "user", content: message }] },
    {
      streamMode: ["messages", "custom"],
      configurable: { thread_id: `user-${userId}` }
    }
  )) {
    if (mode === "messages") {
      const [msg, metadata] = data;
      if (msg.content) {
        onChunk({ type: "token", content: msg.content });
      }
    } else if (mode === "custom") {
      if (data.type === "tool_start") {
        onChunk({ type: "tool_start", tool: data.tool });
      } else if (data.type === "tool_complete") {
        onChunk({ type: "tool_complete", tool: data.tool });
      }
    }
  }
}
```

All data structures are accessible for full customization!


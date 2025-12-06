# API Documentation

REST API for the agent. Supports streaming and non-streaming.

## Start Server

```bash
npm run api:start  # Runs on http://localhost:3000
```

Test it:
```bash
npm run example:api-client
```

## Endpoints

### GET /health

```json
{ "status": "ok", "timestamp": 1234567890 }
```

### GET /agents

```json
{
  "agents": [
    { "id": "default", "name": "ReAct Agent", "pattern": "react" }
  ]
}
```

### POST /agents/load

Load agent from config file.

```json
{
  "configPath": "./config/examples/reflection-agent.json",
  "agentId": "reflection"
}
```

### POST /chat

Non-streaming chat.

```json
{
  "message": "What is 25 * 4?",
  "threadId": "thread-1"
}
```

Response:
```json
{
  "response": "100",
  "threadId": "thread-1",
  "metadata": { "iteration": 2, "toolCalls": 1 }
}
```

### POST /chat/stream

Streaming chat via SSE.

```json
{
  "message": "Calculate something",
  "threadId": "thread-1",
  "streamModes": ["messages", "custom"]
}
```

Returns SSE stream:
```
data: {"type":"start","threadId":"thread-1"}
data: {"mode":"messages","data":[{...}]}
data: {"mode":"custom","data":{"type":"tool_start"}}
data: {"type":"complete"}
```

### GET /threads/:threadId/history

Get conversation history.

### DELETE /threads/:threadId

Clear thread.

## Client Examples

### JavaScript

```typescript
const res = await fetch("http://localhost:3000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "What is 2 + 2?", threadId: "t1" }),
});
const data = await res.json();
console.log(data.response);
```

### Python

```python
import requests
res = requests.post("http://localhost:3000/chat", 
    json={"message": "What is 2 + 2?", "threadId": "t1"})
print(res.json()["response"])
```

### cURL

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2 + 2?", "threadId": "t1"}'
```

## Response Formats

### Chat Response

```typescript
{
  response: string,           // Extracted text response
  threadId: string,          // Thread identifier
  metadata: {
    iteration: number,       // Number of agent iterations
    toolCalls: number,       // Number of tools called
    thinking: number         // Number of thinking steps
  },
  rawState?: object          // Full state (if includeRawState: true)
}
```

### Stream Events

**Start Event:**
```json
{
  "type": "start",
  "threadId": "thread-123"
}
```

**Message Token:**
```json
{
  "mode": "messages",
  "data": [
    { "content": "Hello" },
    { "langgraph_node": "agent", "tags": [] }
  ]
}
```

**Custom Event:**
```json
{
  "mode": "custom",
  "data": {
    "type": "tool_start",
    "tool": "calculator",
    "input": { "a": 5, "b": 3 }
  }
}
```

**Completion Event:**
```json
{
  "type": "complete"
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found (agent, thread)
- `500` - Server error

## Environment Variables

```bash
PORT=3000                    # API server port
CONFIG_PATH=./config/agent.config.json  # Default agent config
ANTHROPIC_API_KEY=...       # API keys
OPENAI_API_KEY=...
```

## Production Deployment

### 1. Build

```bash
npm run build
```

### 2. Start

```bash
PORT=8080 CONFIG_PATH=./config/production.json node dist/api-server.js
```

### 3. Production Considerations

- Use persistent checkpointer (PostgreSQL/SQLite)
- Add authentication middleware
- Rate limiting
- Request validation
- Error monitoring
- Load balancing for multiple agents
- Health check integration

### Example Production Setup

```typescript
import { AgentAPIServer } from "./src/api";

const server = new AgentAPIServer(8080);

// Add authentication
server.app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Load multiple agents
await server.loadDefaultAgent("./config/production.json");

// Start
await server.start();
```

## Integration Examples

### React Frontend

```typescript
import { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        threadId: 'user-session-123',
      }),
    });
    
    const data = await response.json();
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'assistant', content: data.response }
    ]);
  };
  
  return (/* UI components */);
}
```

### WebSocket Alternative

For WebSocket support, extend the server:

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { text, threadId } = JSON.parse(message);
    
    for await (const chunk of await agent.stream(input, config)) {
      ws.send(JSON.stringify(chunk));
    }
  });
});
```

## Rate Limiting

Add rate limiting for production:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

app.use('/chat', limiter);
```

## CORS Configuration

Customize CORS for your domain:

```typescript
app.use(cors({
  origin: 'https://your-domain.com',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```


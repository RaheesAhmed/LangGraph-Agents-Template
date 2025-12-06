/**
 * Example API client demonstrating how to use the API endpoints
 */

import "dotenv/config";

const API_BASE = "http://localhost:3000";

// Example 1: Non-streaming chat
async function chatNonStreaming() {
  console.log("=== Non-Streaming Chat ===\n");
  
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is 25 * 4?",
      threadId: "demo-thread-1",
    }),
  });
  
  const data = await response.json();
  console.log("Response:", data.response);
  console.log("Thread ID:", data.threadId);
  console.log("Metadata:", data.metadata);
}

// Example 2: Streaming chat with SSE
async function chatStreaming() {
  console.log("\n=== Streaming Chat (SSE) ===\n");
  
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Calculate 15 * 7 and then add 50",
      threadId: "demo-thread-2",
      streamModes: ["messages", "custom"],
    }),
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) {
    console.error("No reader available");
    return;
  }
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        
        if (data.type === "start") {
          console.log("Stream started, thread:", data.threadId);
        } else if (data.type === "complete") {
          console.log("\nStream complete");
        } else if (data.type === "error") {
          console.error("Error:", data.error);
        } else if (data.mode === "messages") {
          const [message] = data.data;
          if (message.content) {
            process.stdout.write(String(message.content));
          }
        } else if (data.mode === "custom") {
          const event = data.data;
          if (event.type === "tool_start") {
            console.log(`\n🔧 Tool: ${event.tool}`);
          }
        }
      }
    }
  }
}

// Example 3: Get thread history
async function getHistory(threadId: string) {
  console.log(`\n=== Thread History: ${threadId} ===\n`);
  
  const response = await fetch(`${API_BASE}/threads/${threadId}/history`);
  const data = await response.json();
  
  console.log("Messages:", data.messages.length);
  console.log("Iterations:", data.iteration);
  console.log("Tool Calls:", data.toolCalls?.length || 0);
  
  // Show message history
  data.messages.forEach((msg: any, i: number) => {
    const type = msg.kwargs?.type || msg.type || "unknown";
    const content = typeof msg.content === "string" 
      ? msg.content.substring(0, 50) 
      : msg.kwargs?.content?.substring(0, 50) || "";
    console.log(`${i + 1}. [${type}] ${content}...`);
  });
}

// Example 4: Load custom agent
async function loadAgent() {
  console.log("\n=== Loading Custom Agent ===\n");
  
  const response = await fetch(`${API_BASE}/agents/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      configPath: "./config/examples/reflection-agent.json",
      agentId: "reflection",
    }),
  });
  
  const data = await response.json();
  console.log("Loaded:", data);
}

// Run examples
async function main() {
  console.log("🚀 API Client Examples\n");
  console.log("Make sure API server is running: npm run api:start\n");
  
  try {
    // Wait a bit for server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test health
    const health = await fetch(`${API_BASE}/health`);
    if (!health.ok) {
      throw new Error("Server not responding");
    }
    
    // Run examples
    await chatNonStreaming();
    await chatStreaming();
    await getHistory("demo-thread-1");
    await loadAgent();
    
    console.log("\n✅ All examples completed");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log("\nMake sure the API server is running:");
    console.log("  npm run api:start");
  }
}

main();


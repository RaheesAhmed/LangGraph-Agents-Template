import "dotenv/config";
import { createAgent, loadConfig } from "../src";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  // Load configuration
  const config = await loadConfig("./config/examples/react-agent.json");
  
  console.log(`Creating ${config.name}...`);
  
  // Create agent
  const agent = await createAgent(config);
  
  // Configuration with thread_id for persistence
  const threadConfig = {
    configurable: {
      thread_id: "demo-conversation-1",
    },
  };
  
  console.log("\n=== Turn 1 ===");
  const result1 = await agent.invoke(
    {
      messages: [new HumanMessage("What is 25 * 4 + 100?")],
    },
    threadConfig
  );
  
  console.log("\nRaw Result Object:");
  console.log("- messages:", result1.messages.length, "messages");
  console.log("- iteration:", result1.iteration);
  console.log("- toolCalls:", result1.toolCalls.length, "tool calls");
  
  const lastMessage1 = result1.messages[result1.messages.length - 1];
  console.log("\nLast Message Content:");
  console.log(lastMessage1.content);
  
  console.log("\n=== Turn 2 (testing memory) ===");
  const result2 = await agent.invoke(
    {
      messages: [new HumanMessage("What was my previous question?")],
    },
    threadConfig
  );
  
  console.log("\nRaw Result Object:");
  console.log("- messages:", result2.messages.length, "total messages in thread");
  console.log("- iteration:", result2.iteration);
  
  const lastMessage2 = result2.messages[result2.messages.length - 1];
  console.log("\nLast Message Content:");
  console.log(lastMessage2.content);
  
  console.log("\n=== Full State Available ===");
  console.log("Developers have access to:");
  console.log("- result.messages (all conversation history)");
  console.log("- result.toolCalls (tool execution history)");
  console.log("- result.thinking (reasoning traces if enabled)");
  console.log("- result.iteration (turn count)");
  console.log("- result.metadata (custom data)");
}

main().catch(console.error);


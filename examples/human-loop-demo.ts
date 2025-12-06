import "dotenv/config";
import { createAgent, loadConfig } from "../src";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  // Load config and enable human-in-the-loop
  const config = await loadConfig("./config/examples/react-agent.json");
  config.humanInLoop = {
    enabled: true,
    triggerConditions: ["critical_action"],
    timeout: 60000,
  };
  
  const agent = await createAgent(config);
  
  console.log(`\n=== ${config.name} - Human-in-the-Loop Demo ===\n`);
  console.log("Note: interrupt() pauses execution and requires Command({ resume: ... }) to continue");
  console.log("This demo shows HITL is configured. In production, handle __interrupt__ field.\n");
  
  const threadId = "demo-thread-human-loop";
  
  const result = await agent.invoke(
    {
      messages: [new HumanMessage("Write a file called test.txt with 'Hello World'")],
    },
    { configurable: { thread_id: threadId } }
  );
  
  console.log("\n=== Raw Result Object ===");
  console.log("Fields available:");
  console.log("- messages:", result.messages?.length || 0);
  console.log("- toolCalls:", result.toolCalls?.length || 0);
  console.log("- humanReview:", result.humanReview);
  console.log("- __interrupt__:", result.__interrupt__ || "none");
  
  console.log("\n=== Last Message ===");
  const lastMessage = result.messages[result.messages.length - 1];
  console.log(JSON.stringify(lastMessage, null, 2));
  
  console.log("\n=== HITL Configuration Ready ===");
  console.log("To implement full HITL:");
  console.log("1. Check result.__interrupt__ for pause signals");
  console.log("2. Present to user for review");
  console.log("3. Resume with: agent.invoke(new Command({ resume: userInput }), config)");
}

main().catch(console.error);


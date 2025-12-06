import "dotenv/config";
import { createAgent, loadConfig } from "../src";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  const config = await loadConfig("./config/examples/multi-agent.json");
  const agent = await createAgent(config);
  
  console.log(`\n=== ${config.name} - Multi-Agent Demo ===\n`);
  
  const threadConfig = {
    configurable: {
      thread_id: "multi-agent-demo-1",
    },
  };
  
  // Complex task requiring multiple specialists
  const result = await agent.invoke(
    {
      messages: [
        new HumanMessage(
          "Research the population of Tokyo, calculate what 15% of that population would be, and write a summary."
        ),
      ],
    },
    threadConfig
  );
  
  console.log("\n=== Raw Result Object ===");
  console.log("Available fields:");
  console.log("- messages:", result.messages?.length || 0);
  console.log("- assignments:", result.assignments?.length || 0);
  console.log("- supervisorDecisions:", result.supervisorDecisions?.length || 0);
  console.log("- aggregatedResults:", typeof result.aggregatedResults);
  
  console.log("\n=== Worker Assignments ===");
  if (result.assignments) {
    console.log(JSON.stringify(result.assignments, null, 2));
  }
  
  console.log("\n=== Supervisor Decisions ===");
  if (result.supervisorDecisions) {
    console.log(JSON.stringify(result.supervisorDecisions, null, 2));
  }
  
  console.log("\n=== Final Messages ===");
  console.log(JSON.stringify(result.messages, null, 2));
}

main().catch(console.error);


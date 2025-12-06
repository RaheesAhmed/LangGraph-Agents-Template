import "dotenv/config";
import { createAgent, loadConfig } from "../src";
import { HumanMessage } from "@langchain/core/messages";
import { createStreamOptions } from "../src/streaming/handlers";

async function main() {
  const config = await loadConfig("./config/examples/react-agent.json");
  const agent = await createAgent(config);
  
  console.log(`\n=== ${config.name} - Streaming Demo ===`);
  console.log("Showing RAW streaming output for developer customization\n");
  
  const streamOptions = {
    ...createStreamOptions(config.streaming),
    configurable: {
      thread_id: "streaming-demo-1",
    },
  };
  
  console.log("Stream Modes:", config.streaming.modes);
  console.log("=".repeat(80));
  
  // Stream with multiple modes - show raw output
  for await (const chunk of await agent.stream(
    {
      messages: [new HumanMessage("What is 15 * 7?")],
    },
    streamOptions
  )) {
    // Show raw chunks so developers can see the structure
    if (Array.isArray(chunk) && chunk.length === 2) {
      const [mode, data] = chunk;
      console.log(`\n[Mode: ${mode}]`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("\n[Single Mode Chunk]");
      console.log(JSON.stringify(chunk, null, 2));
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("=== Streaming Complete ===");
  console.log("\nDevelopers can now filter/customize based on:");
  console.log("- mode: 'updates', 'messages', 'custom'");
  console.log("- data structure shown above");
  console.log("- metadata fields like langgraph_node, tags, etc.");
}

main().catch(console.error);

main().catch(console.error);


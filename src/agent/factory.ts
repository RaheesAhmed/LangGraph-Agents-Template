import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentConfig } from "../config/schema";
import { getTools } from "../tools";
import { createCheckpointer } from "../persistence";
import { buildAgentGraph } from "./core";
import { CompiledStateGraph } from "@langchain/langgraph";

/**
 * Create a configured agent from configuration
 */
export async function createAgent(
  config: AgentConfig
): Promise<CompiledStateGraph<any, any, any, any>> {
  // Create model
  const model = createModel(config);
  
  // Get tools if enabled
  let tools = [];
  if (config.tools.enabled) {
    tools = await getTools(
      config.tools.enabledTools,
      config.tools.mcpServers,
      config.tools.useMCPTools
    );
  }
  
  // Bind tools to model if ReAct pattern
  let modelWithTools = model;
  if (config.pattern === "react" && tools.length > 0) {
    modelWithTools = model.bindTools(tools);
  }
  
  // Create checkpointer for persistence
  const checkpointer = await createCheckpointer(config.persistence);
  
  // Build agent graph
  const agent = buildAgentGraph(modelWithTools, tools, config, checkpointer);
  
  return agent;
}

/**
 * Create model based on configuration
 */
function createModel(config: AgentConfig): BaseChatModel {
  const { provider, modelName, temperature, maxTokens, apiKey } = config.model;
  
  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        model: modelName,
        temperature,
        maxTokens,
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
    
    case "openai":
      return new ChatOpenAI({
        model: modelName,
        temperature,
        maxTokens,
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
    
    case "custom":
      throw new Error("Custom model provider not implemented. Extend this function to add custom models.");
    
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
}


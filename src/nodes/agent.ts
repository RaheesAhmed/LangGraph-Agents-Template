import { SystemMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentState } from "../agent/state";
import { AgentConfig } from "../config/schema";

/**
 * Core agent reasoning node
 * Invokes the LLM with tools to generate responses
 */
export function createAgentNode(
  model: BaseChatModel,
  config: AgentConfig
) {
  return async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, iteration } = state;
    
    // Check max iterations
    if (iteration >= config.maxIterations) {
      throw new Error(`Max iterations (${config.maxIterations}) reached`);
    }
    
    // Build messages with system prompt
    const messagesWithSystem = [
      new SystemMessage(config.systemPrompt),
      ...messages,
    ];
    
    // Invoke model
    const response = await model.invoke(messagesWithSystem);
    
    // Update state
    return {
      messages: [response],
      iteration: iteration + 1,
    };
  };
}


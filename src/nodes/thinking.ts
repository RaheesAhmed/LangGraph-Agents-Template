import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../agent/state";
import { ThinkingConfig } from "../config/schema";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

/**
 * Thinking/reasoning node
 * Optional step for the agent to think before acting
 */
export function createThinkingNode(
  model: BaseChatModel,
  config: ThinkingConfig
) {
  return async (
    state: AgentState,
    runConfig?: LangGraphRunnableConfig
  ): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Create thinking prompt
    const thinkingPrompt = `Before responding to the user's message, think step by step about:
1. What is the user asking for?
2. What information or tools do you need?
3. What approach should you take?
4. What are potential challenges or edge cases?

User's message: ${lastMessage.content}

Provide your reasoning:`;
    
    // Get thinking from model
    const response = await model.invoke([
      new SystemMessage("You are analyzing a request. Think carefully and systematically."),
      { role: "user", content: thinkingPrompt },
    ]);
    
    // Extract text content from response
    let reasoningText = "";
    if (typeof response.content === "string") {
      reasoningText = response.content;
    } else if (Array.isArray(response.content)) {
      reasoningText = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n");
    }
    
    const thinking = {
      step: `Iteration ${state.iteration + 1}`,
      reasoning: reasoningText,
      timestamp: Date.now(),
    };
    
    // Emit custom stream event if visible
    if (config.visible && runConfig?.writer) {
      runConfig.writer({
        type: "thinking",
        content: thinking.reasoning,
        iteration: state.iteration,
      });
    }
    
    return {
      thinking: [...state.thinking, thinking],
    };
  };
}


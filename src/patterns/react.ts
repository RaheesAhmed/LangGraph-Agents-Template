import { StateGraph, START, END } from "@langchain/langgraph";
import { isAIMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentStateAnnotation, AgentState } from "../agent/state";
import { AgentConfig } from "../config/schema";
import { createAgentNode } from "../nodes/agent";
import { createToolNode } from "../nodes/tools";
import { createThinkingNode } from "../nodes/thinking";
import { createHumanReviewNode, shouldTriggerHumanReview } from "../nodes/human-review";

/**
 * Build a ReAct (Reasoning and Acting) agent graph
 * Standard agent loop: Think → Act → Observe → Repeat
 */
export function buildReActGraph(
  model: BaseChatModel,
  tools: DynamicStructuredTool[],
  config: AgentConfig
) {
  const graph = new StateGraph(AgentStateAnnotation);
  
  // Add agent node
  graph.addNode("agent", createAgentNode(model, config));
  
  // Add tool node
  graph.addNode("tools", createToolNode(tools, config.tools.visibility));
  
  // Add thinking node if enabled
  if (config.thinking.enabled) {
    graph.addNode("thinkingStep", createThinkingNode(model, config.thinking));
    graph.addEdge(START, "thinkingStep");
    graph.addEdge("thinkingStep", "agent");
  } else {
    graph.addEdge(START, "agent");
  }
  
  // Add human review node if enabled
  if (config.humanInLoop.enabled) {
    graph.addNode("humanReviewStep", createHumanReviewNode(config.humanInLoop));
  }
  
  // Route from agent based on tool calls
  const routeOptions = ["tools", END];
  if (config.humanInLoop.enabled) {
    routeOptions.splice(1, 0, "humanReviewStep");
  }
  
  graph.addConditionalEdges(
    "agent",
    (state: AgentState) => {
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Check for tool calls
      if (isAIMessage(lastMessage) && lastMessage.tool_calls?.length) {
        return "tools";
      }
      
      // Check if human review needed
      if (config.humanInLoop.enabled && shouldTriggerHumanReview(state, config.humanInLoop)) {
        return "humanReviewStep";
      }
      
      // No tools, end
      return END;
    },
    routeOptions
  );
  
  // Tools go back to agent
  graph.addEdge("tools", "agent");
  
  // Human review goes to end or back to agent
  if (config.humanInLoop.enabled) {
    graph.addConditionalEdges(
      "humanReviewStep",
      (state: AgentState) => {
        if (state.humanReview?.approved) {
          return "agent";
        }
        return END;
      },
      ["agent", END]
    );
  }
  
  return graph;
}


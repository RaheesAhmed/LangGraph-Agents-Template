import { StateGraph, START, END } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { PlanningStateAnnotation, PlanningState } from "../agent/state";
import { AgentConfig } from "../config/schema";
import {
  createPlanningNode,
  createExecuteStepNode,
  createVerifyStepNode,
  shouldContinuePlanning,
} from "../nodes/planning";

/**
 * Build a Planning agent graph
 * Plan → Execute steps → Verify → Next step
 */
export function buildPlanningGraph(
  model: BaseChatModel,
  config: AgentConfig
) {
  if (!config.planningConfig) {
    throw new Error("Planning config is required for planning pattern");
  }
  
  const graph = new StateGraph(PlanningStateAnnotation);
  
  // Add planning node
  graph.addNode("plan", createPlanningNode(model));
  
  // Add execution node
  graph.addNode("executeStep", createExecuteStepNode(model));
  
  // Add verification node if enabled
  if (config.planningConfig.verifySteps) {
    graph.addNode("verifyStep", createVerifyStepNode(model, config.planningConfig));
  }
  
  // Start with planning
  graph.addEdge(START, "plan");
  
  // Plan goes to first step
  graph.addEdge("plan", "executeStep");
  
  // Execute step goes to verification or next decision
  if (config.planningConfig.verifySteps) {
    graph.addEdge("executeStep", "verifyStep");
    
    // Verify goes to next decision
    graph.addConditionalEdges(
      "verifyStep",
      shouldContinuePlanning,
      {
        next_step: "executeStep",
        end: END,
      }
    );
  } else {
    graph.addConditionalEdges(
      "executeStep",
      shouldContinuePlanning,
      {
        next_step: "executeStep",
        end: END,
      }
    );
  }
  
  return graph;
}


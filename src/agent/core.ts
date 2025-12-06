import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentConfig } from "../config/schema";
import { buildReActGraph } from "../patterns/react";
import { buildReflectionGraph } from "../patterns/reflection";
import { buildPlanningGraph } from "../patterns/planning";
import { buildMultiAgentGraph } from "../patterns/multi-agent";
import { BaseCheckpointSaver } from "@langchain/langgraph";

/**
 * Build agent graph based on configuration
 */
export function buildAgentGraph(
  model: BaseChatModel,
  tools: DynamicStructuredTool[],
  config: AgentConfig,
  checkpointer?: BaseCheckpointSaver
): CompiledStateGraph<any, any, any, any> {
  let graph;
  
  // Select pattern-specific graph builder
  switch (config.pattern) {
    case "react":
      graph = buildReActGraph(model, tools, config);
      break;
    
    case "reflection":
      graph = buildReflectionGraph(model, config);
      break;
    
    case "planning":
      graph = buildPlanningGraph(model, config);
      break;
    
    case "multi-agent":
      graph = buildMultiAgentGraph(model, config);
      break;
    
    default:
      throw new Error(`Unknown agent pattern: ${config.pattern}`);
  }
  
  // Compile graph with optional checkpointer
  const compileOptions: any = {};
  
  if (checkpointer) {
    compileOptions.checkpointer = checkpointer;
  }
  
  return graph.compile(compileOptions);
}


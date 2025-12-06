import { StateGraph, START, END } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ReflectionStateAnnotation, ReflectionState } from "../agent/state";
import { AgentConfig } from "../config/schema";
import { createReflectionNode, shouldContinueReflection } from "../nodes/reflection";

/**
 * Build a Reflection agent graph
 * Generate → Reflect → Improve cycle
 */
export function buildReflectionGraph(
  model: BaseChatModel,
  config: AgentConfig
) {
  if (!config.reflectionConfig) {
    throw new Error("Reflection config is required for reflection pattern");
  }
  
  const graph = new StateGraph(ReflectionStateAnnotation);
  
  // Add generate node
  graph.addNode("generate", async (state: ReflectionState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Generate initial or improved response
    let prompt = lastMessage.content.toString();
    
    // If we have reflection feedback, incorporate it
    if (state.reflectionFeedback.length > 0) {
      const lastFeedback = state.reflectionFeedback[state.reflectionFeedback.length - 1];
      prompt = `Improve this response based on the following feedback:

Original task: ${lastMessage.content}

Previous response: ${state.generatedResponse}

Feedback: ${lastFeedback.critique}

Suggested improvements:
${lastFeedback.improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n")}

Generate an improved response:`;
    }
    
    const response = await model.invoke([
      { role: "system", content: config.systemPrompt },
      { role: "user", content: prompt },
    ]);
    
    return {
      generatedResponse: response.content.toString(),
      iteration: state.iteration + 1,
    };
  });
  
  // Add reflection node
  graph.addNode("reflect", createReflectionNode(model, config.reflectionConfig));
  
  // Start with generate
  graph.addEdge(START, "generate");
  
  // Generate goes to reflect
  graph.addEdge("generate", "reflect");
  
  // Reflect decides whether to improve or end
  graph.addConditionalEdges(
    "reflect",
    (state: ReflectionState) => shouldContinueReflection(state, config.reflectionConfig!),
    {
      improve: "generate",
      end: END,
    }
  );
  
  return graph;
}


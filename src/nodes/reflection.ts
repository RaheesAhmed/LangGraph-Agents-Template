import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SystemMessage } from "@langchain/core/messages";
import { ReflectionState } from "../agent/state";
import { ReflectionConfig } from "../config/schema";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

/**
 * Reflection node for self-critique
 * Evaluates generated responses and provides improvement feedback
 */
export function createReflectionNode(
  model: BaseChatModel,
  config: ReflectionConfig
) {
  return async (
    state: ReflectionState,
    runConfig?: LangGraphRunnableConfig
  ): Promise<Partial<ReflectionState>> => {
    const { generatedResponse, reflectionFeedback } = state;
    
    if (!generatedResponse) {
      return {};
    }
    
    const iteration = reflectionFeedback.length;
    
    // Create reflection prompt
    const reflectionPrompt = `Please critique the following response and provide:
1. A quality score from 0 to 1 (where 1 is perfect)
2. Specific areas that need improvement
3. Concrete suggestions for enhancement

Response to critique:
${generatedResponse}

Provide your critique in JSON format:
{
  "score": <number>,
  "critique": "<detailed critique>",
  "improvements": ["<improvement 1>", "<improvement 2>", ...]
}`;
    
    // Get reflection from model
    const response = await model.invoke([
      new SystemMessage("You are a meticulous critic evaluating AI responses for quality."),
      { role: "user", content: reflectionPrompt },
    ]);
    
    // Parse reflection (in production, use structured output)
    let reflection;
    try {
      const content = response.content.toString();
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reflection = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in reflection");
      }
    } catch (error) {
      // Fallback if parsing fails
      reflection = {
        score: 0.5,
        critique: response.content.toString(),
        improvements: ["Unable to parse structured feedback"],
      };
    }
    
    const feedback = {
      iteration,
      critique: reflection.critique,
      score: reflection.score,
      improvements: reflection.improvements,
    };
    
    // Emit custom stream event
    if (runConfig?.writer) {
      runConfig.writer({
        type: "reflection",
        iteration,
        score: feedback.score,
        critique: feedback.critique,
      });
    }
    
    return {
      reflectionFeedback: [...reflectionFeedback, feedback],
      qualityScore: feedback.score,
    };
  };
}

/**
 * Check if reflection should continue
 */
export function shouldContinueReflection(
  state: ReflectionState,
  config: ReflectionConfig
): "improve" | "end" {
  const { qualityScore, reflectionFeedback } = state;
  
  // End if we've reached max iterations
  if (reflectionFeedback.length >= config.maxIterations) {
    return "end";
  }
  
  // End if quality threshold is met
  if (qualityScore >= config.qualityThreshold) {
    return "end";
  }
  
  // Continue improving
  return "improve";
}


import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SystemMessage } from "@langchain/core/messages";
import { PlanningState } from "../agent/state";
import { PlanningConfig } from "../config/schema";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

/**
 * Planning node - creates a task plan
 */
export function createPlanningNode(model: BaseChatModel) {
  return async (
    state: PlanningState,
    runConfig?: LangGraphRunnableConfig
  ): Promise<Partial<PlanningState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    const planningPrompt = `Create a detailed step-by-step plan to accomplish this task:
${lastMessage.content}

Provide your plan in JSON format:
{
  "goal": "<overall goal>",
  "steps": [
    {"id": "step1", "description": "<what to do>"},
    {"id": "step2", "description": "<what to do>"},
    ...
  ]
}`;
    
    const response = await model.invoke([
      new SystemMessage("You are a strategic planner breaking down complex tasks."),
      { role: "user", content: planningPrompt },
    ]);
    
    // Parse plan
    let plan;
    try {
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        plan = {
          goal: parsed.goal,
          steps: parsed.steps.map((step: any) => ({
            ...step,
            status: "pending" as const,
          })),
        };
      } else {
        throw new Error("No JSON found");
      }
    } catch (error) {
      // Fallback plan
      plan = {
        goal: lastMessage.content.toString(),
        steps: [
          {
            id: "step1",
            description: "Execute the task",
            status: "pending" as const,
          },
        ],
      };
    }
    
    // Emit custom stream event
    if (runConfig?.writer) {
      runConfig.writer({
        type: "plan_created",
        goal: plan.goal,
        steps: plan.steps.length,
      });
    }
    
    return { plan, currentStep: 0 };
  };
}

/**
 * Execute step node
 */
export function createExecuteStepNode(model: BaseChatModel) {
  return async (
    state: PlanningState,
    runConfig?: LangGraphRunnableConfig
  ): Promise<Partial<PlanningState>> => {
    const { plan, currentStep } = state;
    
    if (!plan || currentStep >= plan.steps.length) {
      return {};
    }
    
    const step = plan.steps[currentStep];
    
    // Emit step start event
    if (runConfig?.writer) {
      runConfig.writer({
        type: "step_start",
        stepId: step.id,
        description: step.description,
      });
    }
    
    // Execute step (simplified - in production, this would invoke tools/agent)
    const result = `Executed: ${step.description}`;
    
    // Update step status
    const updatedSteps = [...plan.steps];
    updatedSteps[currentStep] = {
      ...step,
      status: "completed",
      result,
    };
    
    // Emit step complete event
    if (runConfig?.writer) {
      runConfig.writer({
        type: "step_complete",
        stepId: step.id,
        result,
      });
    }
    
    return {
      plan: { ...plan, steps: updatedSteps },
      currentStep: currentStep + 1,
    };
  };
}

/**
 * Verify step node
 */
export function createVerifyStepNode(
  model: BaseChatModel,
  config: PlanningConfig
) {
  return async (
    state: PlanningState,
    runConfig?: LangGraphRunnableConfig
  ): Promise<Partial<PlanningState>> => {
    if (!config.verifySteps || !state.plan) {
      return {};
    }
    
    const lastStep = state.plan.steps[state.currentStep - 1];
    if (!lastStep || !lastStep.result) {
      return {};
    }
    
    const verificationPrompt = `Verify if this step was completed successfully:
Step: ${lastStep.description}
Result: ${lastStep.result}

Was this step completed correctly? Answer YES or NO and explain why.`;
    
    const response = await model.invoke([
      new SystemMessage("You are verifying task completion."),
      { role: "user", content: verificationPrompt },
    ]);
    
    const content = response.content.toString().toLowerCase();
    const passed = content.includes("yes");
    
    const verification = {
      stepId: lastStep.id,
      passed,
      notes: response.content.toString(),
    };
    
    if (runConfig?.writer) {
      runConfig.writer({
        type: "step_verified",
        stepId: lastStep.id,
        passed,
      });
    }
    
    return {
      verifications: [...state.verifications, verification],
    };
  };
}

/**
 * Check if planning should continue
 */
export function shouldContinuePlanning(state: PlanningState): "next_step" | "end" {
  const { plan, currentStep } = state;
  
  if (!plan || currentStep >= plan.steps.length) {
    return "end";
  }
  
  return "next_step";
}


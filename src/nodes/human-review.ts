import { interrupt } from "@langchain/langgraph";
import { AgentState } from "../agent/state";
import { HumanInLoopConfig } from "../config/schema";

/**
 * Human-in-the-loop review node
 * Pauses execution for human approval/feedback
 */
export function createHumanReviewNode(config: HumanInLoopConfig) {
  return async (state: AgentState): Promise<Partial<AgentState>> => {
    // Prepare context for human review
    const lastMessage = state.messages[state.messages.length - 1];
    const recentTools = state.toolCalls.slice(-3); // Last 3 tool calls
    
    // Request human input
    const humanInput = interrupt({
      message: "Human review requested",
      context: {
        lastMessage: lastMessage.content,
        recentTools,
        iteration: state.iteration,
        timestamp: Date.now(),
      },
      instructions: "Please review and approve, reject, or provide feedback.",
    });
    
    // Process human response
    const approved = humanInput.approved !== false; // Default to approved
    const feedback = humanInput.feedback || "";
    
    return {
      humanReview: {
        requested: true,
        approved,
        feedback,
      },
    };
  };
}

/**
 * Check if human review should be triggered
 */
export function shouldTriggerHumanReview(
  state: AgentState,
  config: HumanInLoopConfig
): boolean {
  if (!config.enabled) {
    return false;
  }
  
  const { triggerConditions } = config;
  
  // Check each trigger condition
  for (const condition of triggerConditions) {
    switch (condition) {
      case "always":
        return true;
      
      case "high_uncertainty":
        // Check if recent tool calls had errors
        const recentErrors = state.toolCalls
          .slice(-3)
          .filter((tc) => tc.error);
        if (recentErrors.length > 0) {
          return true;
        }
        break;
      
      case "critical_action":
        // Check if any critical tools were called
        const criticalTools = ["write_file", "execute_code", "delete"];
        const hasCritical = state.toolCalls.some((tc) =>
          criticalTools.some((ct) => tc.name.includes(ct))
        );
        if (hasCritical) {
          return true;
        }
        break;
      
      case "user_request":
        // Check if user explicitly requested review
        const lastMessage = state.messages[state.messages.length - 1];
        if (
          lastMessage.content
            .toString()
            .toLowerCase()
            .includes("review") ||
          lastMessage.content
            .toString()
            .toLowerCase()
            .includes("check")
        ) {
          return true;
        }
        break;
    }
  }
  
  return false;
}


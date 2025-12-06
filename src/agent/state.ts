import { Annotation } from "@langchain/langgraph";
import { type BaseMessage } from "@langchain/core/messages";

/**
 * Core agent state schema
 */
export const AgentStateAnnotation = Annotation.Root({
  // Message history
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Current iteration count
  iteration: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Tool call history with visibility
  toolCalls: Annotation<Array<{
    name: string;
    input: any;
    output?: any;
    error?: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Thinking/reasoning traces
  thinking: Annotation<Array<{
    step: string;
    reasoning: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Memory context
  memoryContext: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Human review status
  humanReview: Annotation<{
    requested: boolean;
    approved?: boolean;
    feedback?: string;
  } | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Custom metadata for extensibility
  metadata: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
});

/**
 * Reflection pattern state
 */
export const ReflectionStateAnnotation = Annotation.Root({
  // Message history
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Current iteration count
  iteration: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Generated responses for reflection
  generatedResponse: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Reflection feedback
  reflectionFeedback: Annotation<Array<{
    iteration: number;
    critique: string;
    score: number;
    improvements: string[];
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Quality score tracking
  qualityScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Tool call history
  toolCalls: Annotation<Array<{
    name: string;
    input: any;
    output?: any;
    error?: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Thinking traces
  thinking: Annotation<Array<{
    step: string;
    reasoning: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Memory context
  memoryContext: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Human review
  humanReview: Annotation<{
    requested: boolean;
    approved?: boolean;
    feedback?: string;
  } | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Metadata
  metadata: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
});

/**
 * Planning pattern state
 */
export const PlanningStateAnnotation = Annotation.Root({
  // Message history
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Current iteration count
  iteration: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Task plan
  plan: Annotation<{
    goal: string;
    steps: Array<{
      id: string;
      description: string;
      status: "pending" | "in_progress" | "completed" | "failed";
      result?: string;
    }>;
  } | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Current step index
  currentStep: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Step verification results
  verifications: Annotation<Array<{
    stepId: string;
    passed: boolean;
    notes?: string;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Tool call history
  toolCalls: Annotation<Array<{
    name: string;
    input: any;
    output?: any;
    error?: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Thinking traces
  thinking: Annotation<Array<{
    step: string;
    reasoning: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Memory context
  memoryContext: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Human review
  humanReview: Annotation<{
    requested: boolean;
    approved?: boolean;
    feedback?: string;
  } | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Metadata
  metadata: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
});

/**
 * Multi-agent pattern state
 */
export const MultiAgentStateAnnotation = Annotation.Root({
  // Message history
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Current iteration count
  iteration: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  
  // Task assignments to workers
  assignments: Annotation<Array<{
    workerId: string;
    task: string;
    status: "assigned" | "in_progress" | "completed" | "failed";
    result?: any;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Supervisor decisions
  supervisorDecisions: Annotation<Array<{
    decision: string;
    reasoning: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Aggregated results from workers
  aggregatedResults: Annotation<any>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Tool call history
  toolCalls: Annotation<Array<{
    name: string;
    input: any;
    output?: any;
    error?: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Thinking traces
  thinking: Annotation<Array<{
    step: string;
    reasoning: string;
    timestamp: number;
  }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Memory context
  memoryContext: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Human review
  humanReview: Annotation<{
    requested: boolean;
    approved?: boolean;
    feedback?: string;
  } | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  
  // Metadata
  metadata: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
});

/**
 * Worker state for multi-agent pattern
 */
export const WorkerStateAnnotation = Annotation.Root({
  workerId: Annotation<string>(),
  task: Annotation<string>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  result: Annotation<any>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  error: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
});

// Export type inference
export type AgentState = typeof AgentStateAnnotation.State;
export type ReflectionState = typeof ReflectionStateAnnotation.State;
export type PlanningState = typeof PlanningStateAnnotation.State;
export type MultiAgentState = typeof MultiAgentStateAnnotation.State;
export type WorkerState = typeof WorkerStateAnnotation.State;

/**
 * Get appropriate state annotation based on agent pattern
 */
export function getStateAnnotation(pattern: string) {
  switch (pattern) {
    case "reflection":
      return ReflectionStateAnnotation;
    case "planning":
      return PlanningStateAnnotation;
    case "multi-agent":
      return MultiAgentStateAnnotation;
    case "react":
    default:
      return AgentStateAnnotation;
  }
}


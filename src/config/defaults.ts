import { AgentConfig } from "./schema";

export const DEFAULT_REACT_CONFIG: Partial<AgentConfig> = {
  name: "ReAct Agent",
  description: "Standard reasoning and acting agent",
  pattern: "react",
  systemPrompt: `You are a helpful AI assistant that can use tools to accomplish tasks.
Think step by step and use the available tools when needed.`,
  maxIterations: 15,
  tools: {
    enabled: true,
    enabledTools: ["calculator", "web-search"],
    parallel: false,
    maxRetries: 3,
    visibility: true,
  },
};

export const DEFAULT_REFLECTION_CONFIG: Partial<AgentConfig> = {
  name: "Reflection Agent",
  description: "Self-improving agent with reflection capabilities",
  pattern: "reflection",
  systemPrompt: `You are a meticulous AI assistant that generates high-quality responses.
After generating a response, you will reflect on it and improve it if needed.`,
  reflectionConfig: {
    maxIterations: 3,
    qualityThreshold: 0.8,
  },
};

export const DEFAULT_PLANNING_CONFIG: Partial<AgentConfig> = {
  name: "Planning Agent",
  description: "Task planner with step-by-step execution",
  pattern: "planning",
  systemPrompt: `You are a strategic AI assistant that breaks down complex tasks into steps.
Create a clear plan before executing and verify each step.`,
  planningConfig: {
    maxSteps: 10,
    verifySteps: true,
  },
};

export const DEFAULT_MULTI_AGENT_CONFIG: Partial<AgentConfig> = {
  name: "Multi-Agent System",
  description: "Supervisor coordinating multiple specialized workers",
  pattern: "multi-agent",
  systemPrompt: `You are a supervisor coordinating multiple specialized agents.
Delegate tasks to the appropriate worker based on their expertise.`,
  multiAgentConfig: {
    workers: [
      {
        name: "researcher",
        role: "Research information and gather facts",
        tools: ["web-search"],
      },
      {
        name: "calculator",
        role: "Perform mathematical calculations",
        tools: ["calculator"],
      },
      {
        name: "writer",
        role: "Write and format content",
        tools: ["file-ops"],
      },
    ],
    maxParallelWorkers: 2,
  },
};


import * as z from "zod";

// Model configuration
export const ModelConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai", "custom"]).default("anthropic"),
  modelName: z.string().default("claude-sonnet-4-5-20250929"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  apiKey: z.string().optional(),
});

// Streaming configuration
export const StreamingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  modes: z
    .array(z.enum(["values", "updates", "messages", "custom", "debug"]))
    .default(["updates", "messages"]),
  includeSubgraphs: z.boolean().default(false),
});

// MCP Server configuration
export const MCPServerConfigSchema = z.object({
  name: z.string(),
  transport: z.enum(["stdio", "sse", "streamable_http"]),
  // stdio transport options
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  // http/sse transport options
  url: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

// Tool configuration
export const ToolConfigSchema = z.object({
  enabled: z.boolean().default(true),
  enabledTools: z.array(z.string()).default(["calculator", "web-search", "file-ops"]),
  parallel: z.boolean().default(true),
  maxRetries: z.number().default(3),
  visibility: z.boolean().default(true), // Show tool calls in output
  // MCP configuration
  mcpServers: z.array(MCPServerConfigSchema).default([]),
  useMCPTools: z.boolean().default(false),
});

// Memory configuration
export const MemoryConfigSchema = z.object({
  shortTerm: z.object({
    enabled: z.boolean().default(true),
    maxMessages: z.number().default(10),
    trimStrategy: z.enum(["sliding", "summary"]).default("sliding"),
  }),
  longTerm: z.object({
    enabled: z.boolean().default(false),
    storePath: z.string().optional(),
  }),
});

// Persistence configuration
export const PersistenceConfigSchema = z.object({
  backend: z.enum(["memory", "postgres", "sqlite"]).default("memory"),
  connectionString: z.string().optional(),
  filePath: z.string().optional(),
});

// Human-in-the-loop configuration
export const HumanInLoopConfigSchema = z.object({
  enabled: z.boolean().default(false),
  triggerConditions: z
    .array(z.enum(["high_uncertainty", "critical_action", "user_request", "always"]))
    .default(["critical_action"]),
  timeout: z.number().default(300000), // 5 minutes
});

// Thinking mode configuration
export const ThinkingConfigSchema = z.object({
  enabled: z.boolean().default(false),
  visible: z.boolean().default(true),
  structured: z.boolean().default(true),
});

// Retry policy configuration
export const RetryPolicySchema = z.object({
  maxAttempts: z.number().default(3),
  initialInterval: z.number().default(1000),
  backoffMultiplier: z.number().default(2),
  maxInterval: z.number().default(10000),
});

// Agent pattern configuration
export const AgentPatternSchema = z.enum([
  "react",
  "reflection",
  "planning",
  "multi-agent",
]);

// Reflection pattern specific config
export const ReflectionConfigSchema = z.object({
  maxIterations: z.number().default(3),
  qualityThreshold: z.number().min(0).max(1).default(0.8),
});

// Planning pattern specific config
export const PlanningConfigSchema = z.object({
  maxSteps: z.number().default(10),
  verifySteps: z.boolean().default(true),
});

// Multi-agent pattern specific config
export const MultiAgentConfigSchema = z.object({
  supervisorModel: z.string().optional(),
  workers: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      tools: z.array(z.string()),
    })
  ).default([]),
  maxParallelWorkers: z.number().default(3),
});

// Main configuration schema
export const AgentConfigSchema = z.object({
  name: z.string().default("Configurable Agent"),
  description: z.string().optional(),
  pattern: AgentPatternSchema.default("react"),
  systemPrompt: z.string().default("You are a helpful AI assistant."),
  model: ModelConfigSchema,
  streaming: StreamingConfigSchema,
  tools: ToolConfigSchema,
  memory: MemoryConfigSchema,
  persistence: PersistenceConfigSchema,
  humanInLoop: HumanInLoopConfigSchema,
  thinking: ThinkingConfigSchema,
  retryPolicy: RetryPolicySchema,
  
  // Pattern-specific configurations
  reflectionConfig: ReflectionConfigSchema.optional(),
  planningConfig: PlanningConfigSchema.optional(),
  multiAgentConfig: MultiAgentConfigSchema.optional(),
  
  // Additional settings
  maxIterations: z.number().default(15),
  verbose: z.boolean().default(false),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type StreamingConfig = z.infer<typeof StreamingConfigSchema>;
export type ToolConfig = z.infer<typeof ToolConfigSchema>;
export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
export type PersistenceConfig = z.infer<typeof PersistenceConfigSchema>;
export type HumanInLoopConfig = z.infer<typeof HumanInLoopConfigSchema>;
export type ThinkingConfig = z.infer<typeof ThinkingConfigSchema>;
export type RetryPolicy = z.infer<typeof RetryPolicySchema>;
export type AgentPattern = z.infer<typeof AgentPatternSchema>;
export type ReflectionConfig = z.infer<typeof ReflectionConfigSchema>;
export type PlanningConfig = z.infer<typeof PlanningConfigSchema>;
export type MultiAgentConfig = z.infer<typeof MultiAgentConfigSchema>;


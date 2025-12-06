import * as fs from "fs/promises";
import * as path from "path";
import { AgentConfig, AgentConfigSchema } from "./schema";

export class ConfigValidationError extends Error {
  constructor(message: string, public errors: any) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * Load and validate agent configuration from a JSON file
 */
export async function loadConfig(filePath: string): Promise<AgentConfig> {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const rawConfig = JSON.parse(fileContent);
    
    // Apply environment variable overrides
    const configWithEnv = applyEnvironmentOverrides(rawConfig);
    
    // Validate and parse with Zod
    const result = AgentConfigSchema.safeParse(configWithEnv);
    
    if (!result.success) {
      throw new ConfigValidationError(
        "Configuration validation failed",
        result.error.format()
      );
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${error.message}`);
    }
    throw new Error(`Failed to load config from ${filePath}: ${error}`);
  }
}

/**
 * Load configuration from an object (useful for programmatic usage)
 */
export function loadConfigFromObject(config: unknown): AgentConfig {
  const result = AgentConfigSchema.safeParse(config);
  
  if (!result.success) {
    throw new ConfigValidationError(
      "Configuration validation failed",
      result.error.format()
    );
  }
  
  return result.data;
}

/**
 * Save configuration to a JSON file
 */
export async function saveConfig(
  config: AgentConfig,
  filePath: string
): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    const dirPath = path.dirname(absolutePath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write config file
    await fs.writeFile(
      absolutePath,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (error) {
    throw new Error(`Failed to save config to ${filePath}: ${error}`);
  }
}

/**
 * Apply environment variable overrides to config
 * Environment variables take precedence over file configuration
 */
function applyEnvironmentOverrides(config: any): any {
  const overrides: any = { ...config };
  
  // Model API key override
  if (process.env.ANTHROPIC_API_KEY) {
    overrides.model = overrides.model || {};
    overrides.model.apiKey = process.env.ANTHROPIC_API_KEY;
  }
  
  if (process.env.OPENAI_API_KEY) {
    overrides.model = overrides.model || {};
    if (overrides.model.provider === "openai") {
      overrides.model.apiKey = process.env.OPENAI_API_KEY;
    }
  }
  
  // Database connection string override
  if (process.env.DATABASE_URL) {
    overrides.persistence = overrides.persistence || {};
    overrides.persistence.connectionString = process.env.DATABASE_URL;
  }
  
  // Verbose mode override
  if (process.env.AGENT_VERBOSE) {
    overrides.verbose = process.env.AGENT_VERBOSE === "true";
  }
  
  return overrides;
}

/**
 * Validate configuration without loading from file
 */
export function validateConfig(config: unknown): {
  valid: boolean;
  errors?: any;
  config?: AgentConfig;
} {
  const result = AgentConfigSchema.safeParse(config);
  
  if (result.success) {
    return { valid: true, config: result.data };
  }
  
  return { valid: false, errors: result.error.format() };
}


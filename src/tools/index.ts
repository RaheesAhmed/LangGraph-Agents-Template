import { DynamicStructuredTool } from "@langchain/core/tools";
import { calculatorTool, evaluateExpressionTool } from "./calculator";
import { webSearchTool, getWebpageTool } from "./web-search";
import {
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  fileExistsTool,
} from "./file-ops";
import { getMCPTools } from "./mcp-adapter";
import { MCPServerConfig } from "../config/schema";

/**
 * Tool registry mapping tool names to implementations
 */
export const TOOL_REGISTRY: Record<string, DynamicStructuredTool> = {
  calculator: calculatorTool,
  evaluate_expression: evaluateExpressionTool,
  "web-search": webSearchTool,
  web_search: webSearchTool, // Alias
  get_webpage: getWebpageTool,
  read_file: readFileTool,
  write_file: writeFileTool,
  list_directory: listDirectoryTool,
  file_exists: fileExistsTool,
  "file-ops": readFileTool, // Default file operation
};

/**
 * Get tools based on configuration
 */
export async function getTools(
  enabledTools: string[],
  mcpServers: MCPServerConfig[] = [],
  useMCPTools: boolean = false
): Promise<DynamicStructuredTool[]> {
  const tools: DynamicStructuredTool[] = [];
  
  // Add regular tools
  for (const toolName of enabledTools) {
    // Handle grouped tools
    if (toolName === "calculator") {
      tools.push(calculatorTool, evaluateExpressionTool);
    } else if (toolName === "web-search") {
      tools.push(webSearchTool, getWebpageTool);
    } else if (toolName === "file-ops") {
      tools.push(readFileTool, writeFileTool, listDirectoryTool, fileExistsTool);
    } else if (TOOL_REGISTRY[toolName]) {
      tools.push(TOOL_REGISTRY[toolName]);
    } else {
      console.warn(`Tool not found in registry: ${toolName}`);
    }
  }
  
  // Add MCP tools if enabled
  if (useMCPTools && mcpServers.length > 0) {
    const mcpTools = await getMCPTools(mcpServers);
    tools.push(...mcpTools);
  }
  
  return tools;
}

/**
 * Register a custom tool
 */
export function registerTool(name: string, tool: DynamicStructuredTool): void {
  TOOL_REGISTRY[name] = tool;
}

/**
 * Get all available tool names
 */
export function getAvailableTools(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

// Export individual tools
export {
  calculatorTool,
  evaluateExpressionTool,
  webSearchTool,
  getWebpageTool,
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  fileExistsTool,
};


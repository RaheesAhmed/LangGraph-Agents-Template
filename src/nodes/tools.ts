import { ToolMessage, isAIMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentState } from "../agent/state";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

/**
 * Tool execution node
 * Executes tool calls from the agent's response
 */
export function createToolNode(
  tools: DynamicStructuredTool[],
  visibility: boolean = true
) {
  // Create tool map for quick lookup
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));
  
  return async (
    state: AgentState,
    config?: LangGraphRunnableConfig
  ): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    if (!isAIMessage(lastMessage) || !lastMessage.tool_calls?.length) {
      return { messages: [] };
    }
    
    const toolCalls = lastMessage.tool_calls;
    const toolResults: ToolMessage[] = [];
    const toolCallHistory: AgentState["toolCalls"] = [];
    
    // Execute tools (in parallel if configured)
    const executions = toolCalls.map(async (toolCall) => {
      const tool = toolMap.get(toolCall.name);
      
      if (!tool) {
        const error = `Tool not found: ${toolCall.name}`;
        return {
          message: new ToolMessage({
            content: error,
            tool_call_id: toolCall.id!,
            name: toolCall.name,
          }),
          history: {
            name: toolCall.name,
            input: toolCall.args,
            error,
            timestamp: Date.now(),
          },
        };
      }
      
      try {
        // Emit custom stream event for tool execution start
        if (visibility && config?.writer) {
          config.writer({
            type: "tool_start",
            tool: toolCall.name,
            input: toolCall.args,
          });
        }
        
        // Execute tool
        const result = await tool.invoke(toolCall, config);
        
        // Emit custom stream event for tool completion
        if (visibility && config?.writer) {
          config.writer({
            type: "tool_complete",
            tool: toolCall.name,
            output: result,
          });
        }
        
        return {
          message: result as ToolMessage,
          history: {
            name: toolCall.name,
            input: toolCall.args,
            output: result.content,
            timestamp: Date.now(),
          },
        };
      } catch (error: any) {
        // Emit custom stream event for tool error
        if (visibility && config?.writer) {
          config.writer({
            type: "tool_error",
            tool: toolCall.name,
            error: error.message,
          });
        }
        
        return {
          message: new ToolMessage({
            content: `Error executing ${toolCall.name}: ${error.message}`,
            tool_call_id: toolCall.id!,
            name: toolCall.name,
          }),
          history: {
            name: toolCall.name,
            input: toolCall.args,
            error: error.message,
            timestamp: Date.now(),
          },
        };
      }
    });
    
    // Wait for all tools to complete
    const results = await Promise.all(executions);
    
    results.forEach((result) => {
      toolResults.push(result.message);
      toolCallHistory.push(result.history);
    });
    
    return {
      messages: toolResults,
      toolCalls: [...state.toolCalls, ...toolCallHistory],
    };
  };
}


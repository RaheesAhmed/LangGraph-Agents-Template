import { StreamingConfig } from "../config/schema";

/**
 * Stream mode type
 */
export type StreamMode = "values" | "updates" | "messages" | "custom" | "debug";

/**
 * Stream chunk with metadata
 */
export interface StreamChunk {
  mode: StreamMode;
  data: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Stream handler for processing different stream modes
 */
export class StreamHandler {
  constructor(private config: StreamingConfig) {}
  
  /**
   * Process a stream chunk based on mode
   */
  processChunk(mode: StreamMode, data: any, metadata?: Record<string, any>): StreamChunk {
    return {
      mode,
      data,
      timestamp: Date.now(),
      metadata,
    };
  }
  
  /**
   * Format chunk for output
   */
  formatChunk(chunk: StreamChunk): string {
    switch (chunk.mode) {
      case "values":
        return this.formatValues(chunk);
      case "updates":
        return this.formatUpdates(chunk);
      case "messages":
        return this.formatMessages(chunk);
      case "custom":
        return this.formatCustom(chunk);
      case "debug":
        return this.formatDebug(chunk);
      default:
        return JSON.stringify(chunk.data);
    }
  }
  
  private formatValues(chunk: StreamChunk): string {
    return `\n[STATE UPDATE]\n${JSON.stringify(chunk.data, null, 2)}\n`;
  }
  
  private formatUpdates(chunk: StreamChunk): string {
    const [nodeName, update] = Object.entries(chunk.data)[0] || ["", {}];
    return `\n[${nodeName.toUpperCase()}]\n${JSON.stringify(update, null, 2)}\n`;
  }
  
  private formatMessages(chunk: StreamChunk): string {
    const [message, metadata] = chunk.data;
    const node = metadata?.langgraph_node || "unknown";
    const content = message.content || "";
    
    if (content) {
      return content;
    }
    
    return "";
  }
  
  private formatCustom(chunk: StreamChunk): string {
    const data = chunk.data;
    
    // Format based on custom event type
    if (data.type) {
      switch (data.type) {
        case "tool_start":
          return `\n🔧 Calling tool: ${data.tool}\n`;
        
        case "tool_complete":
          return `✅ Tool completed: ${data.tool}\n`;
        
        case "tool_error":
          return `❌ Tool error: ${data.tool} - ${data.error}\n`;
        
        case "thinking":
          return `\n💭 Thinking...\n${data.content}\n`;
        
        case "reflection":
          return `\n🔍 Reflection (Score: ${data.score})\n${data.critique}\n`;
        
        case "plan_created":
          return `\n📋 Plan created: ${data.goal} (${data.steps} steps)\n`;
        
        case "step_start":
          return `\n▶️  Step: ${data.description}\n`;
        
        case "step_complete":
          return `✅ Completed: ${data.result}\n`;
        
        case "step_verified":
          return data.passed ? "✓ Verified\n" : "⚠️  Verification failed\n";
        
        default:
          return `\n[${data.type}]\n${JSON.stringify(data, null, 2)}\n`;
      }
    }
    
    return JSON.stringify(data, null, 2);
  }
  
  private formatDebug(chunk: StreamChunk): string {
    return `\n[DEBUG ${new Date(chunk.timestamp).toISOString()}]\n${JSON.stringify(chunk.data, null, 2)}\n`;
  }
}

/**
 * Create stream options from configuration
 */
export function createStreamOptions(config: StreamingConfig) {
  return {
    streamMode: config.modes.length === 1 ? config.modes[0] : config.modes,
    subgraphs: config.includeSubgraphs,
  };
}


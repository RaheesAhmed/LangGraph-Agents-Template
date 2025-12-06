import { BaseMessage } from "@langchain/core/messages";
import { MemoryConfig } from "../config/schema";

/**
 * Manage short-term message history
 */
export class ShortTermMemory {
  constructor(private config: MemoryConfig["shortTerm"]) {}
  
  /**
   * Trim messages to fit within context window
   */
  trimMessages(messages: BaseMessage[]): BaseMessage[] {
    if (!this.config.enabled || messages.length <= this.config.maxMessages) {
      return messages;
    }
    
    if (this.config.trimStrategy === "sliding") {
      // Keep most recent messages
      return messages.slice(-this.config.maxMessages);
    }
    
    // Summary strategy would summarize older messages (not implemented)
    return messages.slice(-this.config.maxMessages);
  }
}


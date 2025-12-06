import { MemorySaver } from "@langchain/langgraph";

/**
 * Create an in-memory checkpointer
 * Best for development and testing
 */
export function createMemoryCheckpointer(): MemorySaver {
  return new MemorySaver();
}


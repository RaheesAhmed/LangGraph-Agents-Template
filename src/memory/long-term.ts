import { MemoryConfig } from "../config/schema";

/**
 * Manage long-term persistent memory
 */
export class LongTermMemory {
  private facts: Map<string, string> = new Map();
  
  constructor(private config: MemoryConfig["longTerm"]) {}
  
  /**
   * Store a fact in long-term memory
   */
  async storeFact(key: string, value: string): Promise<void> {
    this.facts.set(key, value);
  }
  
  /**
   * Retrieve a fact from long-term memory
   */
  async retrieveFact(key: string): Promise<string | undefined> {
    return this.facts.get(key);
  }
  
  /**
   * Search facts by keyword
   */
  async searchFacts(query: string): Promise<string[]> {
    const results: string[] = [];
    for (const [key, value] of this.facts.entries()) {
      if (key.includes(query) || value.includes(query)) {
        results.push(`${key}: ${value}`);
      }
    }
    return results;
  }
}


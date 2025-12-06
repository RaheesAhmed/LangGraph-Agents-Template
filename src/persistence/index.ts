import { BaseCheckpointSaver } from "@langchain/langgraph";
import { PersistenceConfig } from "../config/schema";
import { createMemoryCheckpointer } from "./memory";
import { createPostgresCheckpointer } from "./postgres";
import { createSqliteCheckpointer } from "./sqlite";

/**
 * Factory function to create appropriate checkpointer based on configuration
 */
export async function createCheckpointer(
  config: PersistenceConfig
): Promise<BaseCheckpointSaver> {
  switch (config.backend) {
    case "memory":
      return createMemoryCheckpointer();
    
    case "postgres":
      if (!config.connectionString) {
        throw new Error("PostgreSQL connection string is required");
      }
      return await createPostgresCheckpointer(config.connectionString);
    
    case "sqlite":
      const filePath = config.filePath || "./checkpoints.sqlite";
      return await createSqliteCheckpointer(filePath);
    
    default:
      throw new Error(`Unsupported persistence backend: ${config.backend}`);
  }
}

export { createMemoryCheckpointer } from "./memory";
export { createPostgresCheckpointer } from "./postgres";
export { createSqliteCheckpointer } from "./sqlite";


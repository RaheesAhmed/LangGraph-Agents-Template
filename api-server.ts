#!/usr/bin/env node
/**
 * Standalone API Server
 * Run with: npm run api:start
 */

import "dotenv/config";
import { startServer } from "./src/api";

const PORT = parseInt(process.env.PORT || "3000");
const CONFIG_PATH = process.env.CONFIG_PATH || "./config/agent.config.json";

async function main() {
  console.log("🚀 Starting Agent API Server...");
  console.log(`📝 Config: ${CONFIG_PATH}`);
  console.log(`🔌 Port: ${PORT}\n`);
  
  try {
    await startServer(CONFIG_PATH, PORT);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

main();


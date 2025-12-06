import { AgentAPIServer } from "./server";
import { loadConfig, createAgent } from "../index";

/**
 * Start the API server with a default agent
 */
export async function startServer(
  configPath: string = "./config/agent.config.json",
  port: number = 3000
) {
  const server = new AgentAPIServer(port);
  await server.loadDefaultAgent(configPath);
  await server.start();
  return server;
}

export { AgentAPIServer };


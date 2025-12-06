import express, { Request, Response } from "express";
import cors from "cors";
import { createAgent, loadConfig, AgentConfig } from "../index";
import { HumanMessage } from "@langchain/core/messages";
import { CompiledStateGraph } from "@langchain/langgraph";

interface AgentInstance {
  agent: CompiledStateGraph<any, any, any, any>;
  config: AgentConfig;
}

/**
 * API Server for LangGraph Agent
 * Provides REST endpoints with streaming and non-streaming support
 */
export class AgentAPIServer {
  private app: express.Application;
  private agents: Map<string, AgentInstance> = new Map();
  private port: number;
  
  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: "10mb" }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }
  
  private setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: Date.now() });
    });
    
    // List loaded agents
    this.app.get("/agents", (req, res) => {
      const agentList = Array.from(this.agents.entries()).map(([id, instance]) => ({
        id,
        name: instance.config.name,
        pattern: instance.config.pattern,
      }));
      res.json({ agents: agentList });
    });
    
    // Load agent from config file
    this.app.post("/agents/load", async (req, res) => {
      try {
        const { configPath, agentId } = req.body;
        
        if (!configPath || !agentId) {
          return res.status(400).json({
            error: "Missing required fields: configPath, agentId",
          });
        }
        
        const config = await loadConfig(configPath);
        const agent = await createAgent(config);
        
        this.agents.set(agentId, { agent, config });
        
        res.json({
          success: true,
          agentId,
          config: {
            name: config.name,
            pattern: config.pattern,
          },
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Chat endpoint (non-streaming)
    this.app.post("/chat", async (req, res) => {
      try {
        const { agentId, message, threadId, config } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: "Missing message" });
        }
        
        const agentInstance = this.agents.get(agentId || "default");
        if (!agentInstance) {
          return res.status(404).json({ error: "Agent not found" });
        }
        
        const invokeConfig = {
          configurable: {
            thread_id: threadId || `thread-${Date.now()}`,
          },
        };
        
        const result = await agentInstance.agent.invoke(
          { messages: [new HumanMessage(message)] },
          invokeConfig
        );
        
        // Extract response
        const lastMessage = result.messages[result.messages.length - 1];
        let response = this.extractMessageContent(lastMessage);
        
        res.json({
          response,
          threadId: invokeConfig.configurable.thread_id,
          metadata: {
            iteration: result.iteration,
            toolCalls: result.toolCalls?.length || 0,
            thinking: result.thinking?.length || 0,
          },
          rawState: config?.includeRawState ? result : undefined,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Chat endpoint (Server-Sent Events streaming)
    this.app.post("/chat/stream", async (req, res) => {
      try {
        const { agentId, message, threadId, streamModes } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: "Missing message" });
        }
        
        const agentInstance = this.agents.get(agentId || "default");
        if (!agentInstance) {
          return res.status(404).json({ error: "Agent not found" });
        }
        
        // Setup SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const modes = streamModes || ["messages", "custom"];
        const invokeConfig = {
          streamMode: modes,
          configurable: {
            thread_id: threadId || `thread-${Date.now()}`,
          },
        };
        
        // Send initial event
        res.write(`data: ${JSON.stringify({ type: "start", threadId: invokeConfig.configurable.thread_id })}\n\n`);
        
        // Stream results
        for await (const chunk of await agentInstance.agent.stream(
          { messages: [new HumanMessage(message)] },
          invokeConfig
        )) {
          const eventData = Array.isArray(chunk) && chunk.length === 2
            ? { mode: chunk[0], data: chunk[1] }
            : { mode: "single", data: chunk };
          
          res.write(`data: ${JSON.stringify(eventData)}\n\n`);
        }
        
        // Send completion event
        res.write(`data: ${JSON.stringify({ type: "complete" })}\n\n`);
        res.end();
      } catch (error: any) {
        res.write(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`);
        res.end();
      }
    });
    
    // Get thread history
    this.app.get("/threads/:threadId/history", async (req, res) => {
      try {
        const { threadId } = req.params;
        const { agentId } = req.query;
        
        const agentInstance = this.agents.get((agentId as string) || "default");
        if (!agentInstance) {
          return res.status(404).json({ error: "Agent not found" });
        }
        
        const state = await agentInstance.agent.getState({
          configurable: { thread_id: threadId },
        });
        
        res.json({
          threadId,
          messages: state.values.messages,
          iteration: state.values.iteration,
          toolCalls: state.values.toolCalls,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Clear thread
    this.app.delete("/threads/:threadId", async (req, res) => {
      try {
        const { threadId } = req.params;
        const { agentId } = req.query;
        
        const agentInstance = this.agents.get((agentId as string) || "default");
        if (!agentInstance) {
          return res.status(404).json({ error: "Agent not found" });
        }
        
        // Note: Implement thread deletion based on your checkpointer
        // For now, just acknowledge
        res.json({ success: true, threadId });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  private extractMessageContent(message: any): string {
    if (typeof message.content === "string") {
      return message.content;
    } else if (Array.isArray(message.content)) {
      return message.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n");
    }
    return String(message.content);
  }
  
  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Agent API Server running on http://localhost:${this.port}`);
        console.log(`📚 Endpoints:`);
        console.log(`   GET  /health - Health check`);
        console.log(`   GET  /agents - List loaded agents`);
        console.log(`   POST /agents/load - Load agent from config`);
        console.log(`   POST /chat - Non-streaming chat`);
        console.log(`   POST /chat/stream - Streaming chat (SSE)`);
        console.log(`   GET  /threads/:threadId/history - Get thread history`);
        console.log(`   DELETE /threads/:threadId - Clear thread`);
        resolve();
      });
    });
  }
  
  async loadDefaultAgent(configPath: string = "./config/agent.config.json") {
    const config = await loadConfig(configPath);
    const agent = await createAgent(config);
    this.agents.set("default", { agent, config });
    console.log(`✅ Loaded default agent: ${config.name}`);
  }
}


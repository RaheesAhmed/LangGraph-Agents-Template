import { StateGraph, START, END, Send } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { MultiAgentStateAnnotation, MultiAgentState, WorkerStateAnnotation, WorkerState } from "../agent/state";
import { AgentConfig } from "../config/schema";
import { SystemMessage } from "@langchain/core/messages";

/**
 * Build a Multi-Agent system with supervisor and workers
 * Supervisor delegates to workers, workers execute and return results
 */
export function buildMultiAgentGraph(
  model: BaseChatModel,
  config: AgentConfig
) {
  if (!config.multiAgentConfig) {
    throw new Error("Multi-agent config is required for multi-agent pattern");
  }
  
  const graph = new StateGraph(MultiAgentStateAnnotation);
  
  // Add supervisor node
  graph.addNode("supervisor", async (state: MultiAgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Supervisor decides which workers to assign
    const delegationPrompt = `As a supervisor, analyze this task and decide which workers should handle it:

Task: ${lastMessage.content}

Available workers:
${config.multiAgentConfig!.workers.map((w) => `- ${w.name}: ${w.role} (tools: ${w.tools.join(", ")})`).join("\n")}

Respond with JSON:
{
  "assignments": [
    {"worker": "<worker_name>", "task": "<specific task>"},
    ...
  ],
  "reasoning": "<your reasoning>"
}`;
    
    const response = await model.invoke([
      new SystemMessage(config.systemPrompt),
      { role: "user", content: delegationPrompt },
    ]);
    
    // Parse assignments
    let assignments: MultiAgentState["assignments"] = [];
    let reasoning = "";
    
    try {
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        assignments = parsed.assignments.map((a: any) => ({
          workerId: a.worker,
          task: a.task,
          status: "assigned" as const,
        }));
        reasoning = parsed.reasoning;
      }
    } catch (error) {
      // Fallback: assign to first worker
      assignments = [{
        workerId: config.multiAgentConfig!.workers[0].name,
        task: lastMessage.content.toString(),
        status: "assigned" as const,
      }];
    }
    
    return {
      assignments,
      supervisorDecisions: [
        ...state.supervisorDecisions,
        {
          decision: "Assigned tasks to workers",
          reasoning,
          timestamp: Date.now(),
        },
      ],
    };
  });
  
  // Create worker node (shared by all workers)
  graph.addNode("worker", async (state: WorkerState) => {
    // Worker executes its assigned task
    const workerConfig = config.multiAgentConfig!.workers.find(
      (w) => w.name === state.workerId
    );
    
    if (!workerConfig) {
      return {
        error: `Worker ${state.workerId} not found`,
      };
    }
    
    // Execute task (simplified - in production, this would use tools)
    const response = await model.invoke([
      new SystemMessage(`You are ${state.workerId}. ${workerConfig.role}`),
      { role: "user", content: state.task },
    ]);
    
    return {
      result: response.content.toString(),
    };
  });
  
  // Add aggregator node
  graph.addNode("aggregator", async (state: MultiAgentState) => {
    // Aggregate results from all workers
    const results = state.assignments
      .filter((a) => a.status === "completed" && a.result)
      .map((a) => `${a.workerId}: ${a.result}`)
      .join("\n\n");
    
    const aggregationPrompt = `Synthesize these worker results into a final response:

${results}

Original task: ${state.messages[state.messages.length - 1].content}

Provide a cohesive final answer:`;
    
    const response = await model.invoke([
      new SystemMessage("You are synthesizing multiple sources into a coherent response."),
      { role: "user", content: aggregationPrompt },
    ]);
    
    return {
      aggregatedResults: response.content.toString(),
      messages: [response],
    };
  });
  
  // Start with supervisor
  graph.addEdge(START, "supervisor");
  
  // Supervisor assigns to workers using Send API
  graph.addConditionalEdges(
    "supervisor",
    (state: MultiAgentState) => {
      // Send each assignment to a worker
      return state.assignments.map((assignment) =>
        new Send("worker", {
          workerId: assignment.workerId,
          task: assignment.task,
          messages: [],
        })
      );
    }
  );
  
  // Workers go to aggregator
  graph.addEdge("worker", "aggregator");
  
  // Aggregator ends
  graph.addEdge("aggregator", END);
  
  return graph;
}


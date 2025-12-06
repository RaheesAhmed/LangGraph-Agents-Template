/**
 * Output formatters for different stream modes
 */

/**
 * Format tool call for visibility
 */
export function formatToolCall(toolName: string, input: any, output?: any, error?: string): string {
  let formatted = `\n🔧 Tool: ${toolName}\n`;
  formatted += `   Input: ${JSON.stringify(input)}\n`;
  
  if (error) {
    formatted += `   ❌ Error: ${error}\n`;
  } else if (output !== undefined) {
    const outputStr = typeof output === "string" ? output : JSON.stringify(output);
    const truncated = outputStr.length > 200 ? outputStr.substring(0, 200) + "..." : outputStr;
    formatted += `   ✅ Output: ${truncated}\n`;
  }
  
  return formatted;
}

/**
 * Format thinking output
 */
export function formatThinking(reasoning: string): string {
  return `\n💭 Thinking:\n${reasoning}\n`;
}

/**
 * Format reflection feedback
 */
export function formatReflection(score: number, critique: string, improvements: string[]): string {
  let formatted = `\n🔍 Reflection (Quality: ${(score * 100).toFixed(0)}%)\n`;
  formatted += `Critique: ${critique}\n\n`;
  
  if (improvements.length > 0) {
    formatted += "Improvements:\n";
    improvements.forEach((imp, i) => {
      formatted += `${i + 1}. ${imp}\n`;
    });
  }
  
  return formatted;
}

/**
 * Format plan
 */
export function formatPlan(goal: string, steps: Array<{ id: string; description: string; status: string }>): string {
  let formatted = `\n📋 Plan: ${goal}\n`;
  formatted += "Steps:\n";
  
  steps.forEach((step, i) => {
    const statusIcon = step.status === "completed" ? "✅" :
                       step.status === "in_progress" ? "▶️" :
                       step.status === "failed" ? "❌" : "⏸️";
    formatted += `${i + 1}. ${statusIcon} ${step.description}\n`;
  });
  
  return formatted;
}

/**
 * Format message chunk (LLM token)
 */
export function formatMessageChunk(content: string): string {
  return content;
}

/**
 * Format state update
 */
export function formatStateUpdate(nodeName: string, update: any): string {
  const updateKeys = Object.keys(update);
  
  if (updateKeys.length === 0) {
    return `\n[${nodeName}] No updates\n`;
  }
  
  let formatted = `\n[${nodeName.toUpperCase()}]\n`;
  
  updateKeys.forEach((key) => {
    const value = update[key];
    if (Array.isArray(value) && value.length > 0) {
      formatted += `  ${key}: [${value.length} items]\n`;
    } else if (typeof value === "object" && value !== null) {
      formatted += `  ${key}: ${JSON.stringify(value).substring(0, 100)}...\n`;
    } else {
      formatted += `  ${key}: ${value}\n`;
    }
  });
  
  return formatted;
}

/**
 * Progress bar formatter
 */
export function formatProgress(current: number, total: number, label: string = "Progress"): string {
  const percentage = Math.floor((current / total) * 100);
  const filled = Math.floor(percentage / 5);
  const empty = 20 - filled;
  
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `${label}: [${bar}] ${percentage}% (${current}/${total})`;
}


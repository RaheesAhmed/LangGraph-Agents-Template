import { tool } from "@langchain/core/tools";
import * as z from "zod";

/**
 * Calculator tool for basic mathematical operations
 */
export const calculatorTool = tool(
  async ({ operation, a, b }) => {
    switch (operation) {
      case "add":
        return a + b;
      case "subtract":
        return a - b;
      case "multiply":
        return a * b;
      case "divide":
        if (b === 0) {
          throw new Error("Cannot divide by zero");
        }
        return a / b;
      case "power":
        return Math.pow(a, b);
      case "modulo":
        return a % b;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
  {
    name: "calculator",
    description: "Perform mathematical calculations. Supports add, subtract, multiply, divide, power, and modulo operations.",
    schema: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide", "power", "modulo"]).describe("The mathematical operation to perform"),
      a: z.number().describe("The first number"),
      b: z.number().describe("The second number"),
    }),
  }
);

/**
 * Advanced calculator for expression evaluation
 */
export const evaluateExpressionTool = tool(
  async ({ expression }) => {
    try {
      // Basic safety check - only allow numbers and operators
      if (!/^[\d+\-*/(). ]+$/.test(expression)) {
        throw new Error("Invalid characters in expression");
      }
      
      // Evaluate using Function constructor (be careful with this in production!)
      const result = new Function(`return ${expression}`)();
      
      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Expression did not evaluate to a valid number");
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${error}`);
    }
  },
  {
    name: "evaluate_expression",
    description: "Evaluate a mathematical expression. Supports +, -, *, /, parentheses, and numbers.",
    schema: z.object({
      expression: z.string().describe("The mathematical expression to evaluate (e.g., '2 + 3 * 4')"),
    }),
  }
);


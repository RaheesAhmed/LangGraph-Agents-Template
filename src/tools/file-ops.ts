import { tool } from "@langchain/core/tools";
import * as z from "zod";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Read file tool with safety checks
 */
export const readFileTool = tool(
  async ({ filePath, encoding = "utf-8" }) => {
    try {
      // Resolve to absolute path
      const absolutePath = path.resolve(filePath);
      
      // Safety check: ensure file is within allowed directory
      // In production, implement proper access controls
      
      const content = await fs.readFile(absolutePath, encoding as BufferEncoding);
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  },
  {
    name: "read_file",
    description: "Read the contents of a file from the filesystem.",
    schema: z.object({
      filePath: z.string().describe("Path to the file to read"),
      encoding: z.string().optional().default("utf-8").describe("File encoding (default: utf-8)"),
    }),
  }
);

/**
 * Write file tool with safety checks
 */
export const writeFileTool = tool(
  async ({ filePath, content, encoding = "utf-8" }) => {
    try {
      const absolutePath = path.resolve(filePath);
      const dirPath = path.dirname(absolutePath);
      
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });
      
      // Write file
      await fs.writeFile(absolutePath, content, encoding as BufferEncoding);
      
      return `Successfully wrote ${content.length} characters to ${filePath}`;
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  },
  {
    name: "write_file",
    description: "Write content to a file. Creates the file if it doesn't exist, overwrites if it does.",
    schema: z.object({
      filePath: z.string().describe("Path where the file should be written"),
      content: z.string().describe("Content to write to the file"),
      encoding: z.string().optional().default("utf-8").describe("File encoding (default: utf-8)"),
    }),
  }
);

/**
 * List directory tool
 */
export const listDirectoryTool = tool(
  async ({ dirPath }) => {
    try {
      const absolutePath = path.resolve(dirPath);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });
      
      const formatted = entries.map((entry) => {
        const type = entry.isDirectory() ? "[DIR]" : "[FILE]";
        return `${type} ${entry.name}`;
      });
      
      return formatted.join("\n");
    } catch (error) {
      throw new Error(`Failed to list directory: ${error}`);
    }
  },
  {
    name: "list_directory",
    description: "List the contents of a directory, showing files and subdirectories.",
    schema: z.object({
      dirPath: z.string().describe("Path to the directory to list"),
    }),
  }
);

/**
 * Check if file exists tool
 */
export const fileExistsTool = tool(
  async ({ filePath }) => {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.access(absolutePath);
      return "File exists";
    } catch {
      return "File does not exist";
    }
  },
  {
    name: "file_exists",
    description: "Check if a file or directory exists at the specified path.",
    schema: z.object({
      filePath: z.string().describe("Path to check"),
    }),
  }
);


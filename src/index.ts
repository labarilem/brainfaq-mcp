#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BrainfuckEngine } from "./engine.js";

const mcpServer = new McpServer({
  name: "brainfaq-mcp",
  version: "1.0.0",
  description: "A Brainfuck debugger accessible via MCP.",
  title: "Brainfaq MCP",
  websiteUrl: "https://github.com/labarilem/brainfaq-mcp",
});
let engine = new BrainfuckEngine();

// Register load_code tool
mcpServer.registerTool(
  "load_code",
  {
    description: "Reset the debugger and load new Brainfuck source code.",
    inputSchema: z.object({
      code: z.string(),
      initial_input: z.string().optional(),
      tapeSize: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Size of the memory tape (default: 30000)"),
      minValue: z
        .number()
        .optional()
        .describe(
          `Minimum allowed value for tape cells (default: ${Number.MIN_SAFE_INTEGER})`
        ),
      maxValue: z
        .number()
        .optional()
        .describe(
          `Maximum allowed value for tape cells (default: ${Number.MAX_SAFE_INTEGER})`
        ),
    }),
  },
  ({ code, initial_input, tapeSize, minValue, maxValue }) => {
    try {
      engine = new BrainfuckEngine(
        tapeSize ?? 30000,
        minValue ?? Number.MIN_SAFE_INTEGER,
        maxValue ?? Number.MAX_SAFE_INTEGER
      );
      engine.loadCode(code, initial_input);
      return {
        content: [{ type: "text", text: "Code loaded. Engine reset." }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Parser Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register step tool
mcpServer.registerTool(
  "step",
  {
    description:
      "Execute a specific number of instructions (default 1). Then outputs the summary of the current state.",
    inputSchema: z.object({ count: z.number().min(1).default(1) }),
  },
  ({ count }) => {
    const status = engine.step(count);
    const state = engine.getState();

    let msg = "";
    if (status === "FINISHED") {
      msg = `Program Finished in ${state.totalSteps} steps.\nOutput: "${state.output}"`;
    } else if (status === "WAITING_FOR_INPUT") {
      msg = `PAUSED: Waiting for Input at step ${state.totalSteps}.\nOutput so far: "${state.output}"`;
    } else {
      msg = `Status: ${status}`;
    }

    msg += `\nPointer at [${state.dataPointer}]: ${
      state.tapeWindow[state.dataPointer - state.tapeWindowStartIndex]
    }`;

    return { content: [{ type: "text", text: msg }] };
  }
);

// Register run tool
mcpServer.registerTool(
  "run",
  {
    description:
      "Run the program until it finishes or waits for input. Infinite loops WILL hang the server. Then outputs the summary of the current state.",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Optional limit if you still want one. Omit to run forever."),
    }),
  },
  ({ limit }) => {
    const count = limit ?? Infinity;
    const status = engine.step(count);
    const state = engine.getState();

    let msg = "";
    if (status === "FINISHED") {
      msg = `Program Finished in ${state.totalSteps} steps.\nOutput: "${state.output}"`;
    } else if (status === "WAITING_FOR_INPUT") {
      msg = `PAUSED: Waiting for Input at step ${state.totalSteps}.\nOutput so far: "${state.output}"`;
    } else {
      msg = `Status: ${status}`;
    }

    msg += `\nPointer at [${state.dataPointer}]: ${
      state.tapeWindow[state.dataPointer - state.tapeWindowStartIndex]
    }`;

    return { content: [{ type: "text", text: msg }] };
  }
);

// Register add_input tool
mcpServer.registerTool(
  "add_input",
  {
    description:
      "Append characters to input buffer. Use when status is WAITING_FOR_INPUT. Outputs the engine status.",
    inputSchema: z.object({ input: z.string() }),
  },
  ({ input }) => {
    engine.addInput(input);
    return {
      content: [
        { type: "text", text: `Input added. Status: ${engine.status}` },
      ],
    };
  }
);

// Register get_state tool
mcpServer.registerTool(
  "get_state",
  {
    description:
      "Get the current full state (memory, pointers, output). When windowRadius is not specified, returns the entire tape which may be a large amount of data.",
    inputSchema: z.object({
      windowRadius: z
        .number()
        .optional()
        .describe(
          "Optional radius around data pointer. When omitted, returns entire tape."
        ),
    }),
  },
  ({ windowRadius }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(engine.getState(windowRadius), null, 2),
      },
    ],
  })
);

// Register read_output tool
mcpServer.registerTool(
  "read_output",
  {
    description: "Get the full output string generated so far.",
    inputSchema: z.object({}),
  },
  () => ({ content: [{ type: "text", text: engine.getOutput() }] })
);

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("brainfaq-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

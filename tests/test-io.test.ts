import { test } from "node:test";
import { strictEqual } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("IO Test - should handle input/output correctly", () => {
  const engine = new BrainfuckEngine();
  const code =
    ">,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.";
  const input = "\n\n"; // newline followed by another newline to provide EOF simulation

  engine.loadCode(code, input);
  const status = engine.step(Infinity);
  strictEqual(status, "FINISHED", "Engine should finish");

  const state = engine.getState();
  strictEqual(state.status, "FINISHED", "Engine should finish");

  // The output should contain two identical lines
  const output = engine.getOutput();
  strictEqual(output.length, 6, "Should have 6 characters of output");
  strictEqual(output, "LL\nLL\n", "Two identical lines should be outputted");
});

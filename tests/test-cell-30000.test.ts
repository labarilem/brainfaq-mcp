import { test } from "node:test";
import { strictEqual } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("Cell 30000 Test - should reach cell 30000 and output hash", () => {
  const engine = new BrainfuckEngine();
  const code =
    "++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.";

  engine.loadCode(code);
  const status = engine.step(Infinity);
  strictEqual(status, "FINISHED", "Engine should finish");

  const state = engine.getState();
  strictEqual(state.status, "FINISHED", "Engine should finish");

  // Should output a '#' character (ASCII 35)
  const output = engine.getOutput();
  strictEqual(output.length, 2, "Should have 2 characters of output");
  strictEqual(output[0], "#", "First character should be hash (#)");
  strictEqual(output[1], "\n", "Second character should be a newline (\n)");
});

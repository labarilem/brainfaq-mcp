import { test } from "node:test";
import { strictEqual } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("Obscure Problems Test - should output H", () => {
  const engine = new BrainfuckEngine();
  const code =
    "[]++++++++++[>>+>+>++++++[<<+<+++>>>-]<<<<-]\"A*$\";?@![#>>+<<]>[>>]<<<<[>++<[-]]>.>.";

  engine.loadCode(code);
  const status = engine.step(Infinity);

  const state = engine.getState();
  strictEqual(status, "FINISHED", "Engine should finish");

  const output = state.output;
  strictEqual(output.length, 2, "Should have 2 characters of output");
  strictEqual(output, "H\n", "First character should be H");
});

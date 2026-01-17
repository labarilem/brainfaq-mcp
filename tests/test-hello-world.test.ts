import { test } from "node:test";
import { strictEqual } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("Hello World - should output Hello World", () => {
  const engine = new BrainfuckEngine();
  // Classic Hello World in Brainfuck
  const code =
    "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

  engine.loadCode(code);
  const status = engine.step(Infinity);

  const state = engine.getState();
  strictEqual(status, "FINISHED", "Engine should finish");
  strictEqual(
    state.output,
    "Hello World!\n",
    "Output should be 'Hello World!'"
  );
});

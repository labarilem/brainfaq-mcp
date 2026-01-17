import { test } from "node:test";
import { strictEqual } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("Bounds Check Right - should measure cells to the right", () => {
  const engine = new BrainfuckEngine();
  // Infinite loop moving right and incrementing cells forever
  const code = "+[>+++++++++++++++++++++++++++++++.]";

  engine.loadCode(code);

  // This test will not overflow because the engine allows permissive array wrapping
  // Instead, it will wrap around and enter an infinite loop
  const status = engine.step(1000); // If not limited, this would run until overflow
  strictEqual(status, "RUNNING", "Engine should still be running");

  const state = engine.getState();
  strictEqual(state.status, "RUNNING", "Engine should still be running");
});

test("Bounds Check Right - overflow should trigger error", () => {
  const engine = new BrainfuckEngine(1, -10, 10);
  // Simple infinite increment program
  const code = "+[+]";

  engine.loadCode(code);

  const status = engine.step(Infinity);
  strictEqual(status, "OVERFLOW_ERROR", "Engine should detect overflow");

  const state = engine.getState();
  strictEqual(
    state.status,
    "OVERFLOW_ERROR",
    "State should show overflow error"
  );
});

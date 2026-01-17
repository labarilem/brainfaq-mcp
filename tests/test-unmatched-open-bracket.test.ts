import { test } from "node:test";
import { strictEqual, throws } from "node:assert";
import { BrainfuckEngine } from "../src/engine.js";

test("Unmatched Opening Bracket - should throw error", () => {
  const engine = new BrainfuckEngine();
  const code = "+++++[>+++++++>++<<-]>.>[";

  throws(
    () => {
      engine.loadCode(code);
    },
    (err: any) => {
      return err.message.includes("Unmatched");
    },
    "Should throw error for unmatched ["
  );

  strictEqual(
    engine.getState().status,
    "PARSER_ERROR",
    "Engine status should be PARSER_ERROR"
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { createSession } from "./arcade.mjs";

test("a hidden mode waits four seconds before the ball starts", () => {
  for (const kind of ["breakout", "bbtan", "pinball"]) {
    const session = createSession(kind, [], 1, () => 0.4);
    assert.equal(session.prep, 4000);
    assert.equal(session.launched, false);
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { brickWall, createSession } from "./arcade.mjs";
import { COLS } from "./logic.mjs";

test("a standalone brick wall leaves room for the paddle", () => {
  const grid = brickWall(() => 0.5);
  let bricks = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < COLS; x += 1) if (grid[y][x]) bricks += 1;
    if (y > 8) assert.equal(grid[y].every((cell) => !cell), true);
  }
  assert.ok(bricks >= 20);
});

test("a hidden mode waits four seconds before the ball starts", () => {
  for (const kind of ["breakout", "bbtan", "pinball"]) {
    const session = createSession(kind, [], 1, () => 0.4);
    assert.equal(session.prep, 4000);
    assert.equal(session.launched, false);
  }
});

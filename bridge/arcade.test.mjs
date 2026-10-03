import assert from "node:assert/strict";
import test from "node:test";
import { brickWall, createSession, updateSession } from "./arcade.mjs";
import { COLS, ROWS } from "./logic.mjs";

test("a standalone brick wall leaves room for the paddle", () => {
  const grid = brickWall(() => 0.5);
  let bricks = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < COLS; x += 1) if (grid[y][x]) bricks += 1;
    if (y > 8) assert.equal(grid[y].every((cell) => !cell), true);
  }
  assert.ok(bricks >= 20);
});

test("the pinball ball rests on the flippers until one is flipped", () => {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill({ type: "O" }));
  const session = createSession("pinball", grid, 1, () => 0.5);
  assert.equal(grid[ROWS - 1][0], null);
  session.prep = 0;
  for (let i = 0; i < 90; i += 1) updateSession(session, 16);
  assert.equal(session.over, false);
  assert.equal(session.launched, false);
  assert.equal(session.balls.length, 1);
  assert.ok(session.balls[0].y < ROWS * 28 - 30);
  session.left = true;
  updateSession(session, 16);
  assert.equal(session.launched, true);
  assert.ok(session.balls[0].vy < 0);
});

test("a hidden mode waits four seconds before the ball starts", () => {
  for (const kind of ["breakout", "bbtan", "pinball"]) {
    const session = createSession(kind, [], 1, () => 0.4);
    assert.equal(session.prep, 4000);
    assert.equal(session.launched, false);
  }
});

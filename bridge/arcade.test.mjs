import assert from "node:assert/strict";
import test from "node:test";
import { H, W, brickWall, createSession, flipper, updateSession } from "./arcade.mjs";
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

test("pinball flippers rest on a shallow slope and the side rails stay sealed", () => {
  for (const side of ["left", "right"]) {
    const rest = flipper(side, false);
    const raised = flipper(side, true);
    const slope = (rest.y2 - rest.y1) / Math.abs(rest.x2 - rest.x1);
    assert.ok(slope > 0.2 && slope < 0.5);
    assert.ok(raised.y2 < rest.y1);
    assert.ok(Math.min(rest.x1, rest.x2) < 40 || Math.max(rest.x1, rest.x2) > W - 40);
  }
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  grid[2][4] = { type: "O", g: 1 };
  const session = createSession("pinball", grid, 1, () => 0.5);
  session.prep = 0;
  session.launched = true;
  session.balls = [{ x: 12, y: H - 24, vx: -400, vy: 480, r: 7, gravity: true }];
  let minX = W;
  for (let i = 0; i < 150; i += 1) {
    updateSession(session, 16);
    if (session.balls[0]) minX = Math.min(minX, session.balls[0].x);
  }
  assert.ok(minX >= 14);
  assert.ok(session.balls.length === 0 || session.balls[0].y < H);
  const right = createSession("pinball", grid, 1, () => 0.5);
  right.prep = 0;
  right.launched = true;
  right.balls = [{ x: W - 12, y: H - 24, vx: 400, vy: 480, r: 7, gravity: true }];
  let maxX = 0;
  for (let i = 0; i < 150; i += 1) {
    updateSession(right, 16);
    if (right.balls[0]) maxX = Math.max(maxX, right.balls[0].x);
  }
  assert.ok(maxX <= W - 14);
  const onFlipper = createSession("pinball", grid, 1, () => 0.5);
  onFlipper.prep = 0;
  onFlipper.launched = true;
  const left = flipper("left", false);
  onFlipper.balls = [{ x: (left.x1 + left.x2) / 2, y: left.y1 - 40, vx: 0, vy: 40, r: 7, gravity: true }];
  let drained = false;
  for (let i = 0; i < 240; i += 1) {
    updateSession(onFlipper, 16);
    const ball = onFlipper.balls[0];
    if (ball) assert.ok(ball.x > 12 && ball.x < W - 12);
    if (onFlipper.over && !onFlipper.full) {
      drained = true;
      break;
    }
  }
  assert.equal(drained, true);
  assert.equal(onFlipper.balls.length, 0);
  const mouth = createSession("pinball", grid, 1, () => 0.5);
  mouth.prep = 0;
  mouth.launched = true;
  const gap = (flipper("left", false).x2 + flipper("right", false).x2) / 2;
  mouth.balls = [{ x: gap, y: H - 16, vx: 0, vy: 500, r: 7, gravity: true }];
  for (let i = 0; i < 40; i += 1) updateSession(mouth, 16);
  assert.equal(mouth.balls.length, 0);
});

test("a hidden mode waits four seconds before the ball starts", () => {
  for (const kind of ["breakout", "bbtan", "pinball"]) {
    const session = createSession(kind, [], 1, () => 0.4);
    assert.equal(session.prep, 4000);
    assert.equal(session.launched, false);
  }
});

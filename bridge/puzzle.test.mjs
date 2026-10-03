import assert from "node:assert/strict";
import test from "node:test";
import { VERSION } from "./version.mjs";
import { createTen, createTwenty, tenFits, tenPlace, twentyMove } from "./puzzle.mjs";

test("the hub version is 1.0", () => {
  assert.equal(VERSION, "1.0");
});

test("1010 places a piece and clears a full row", () => {
  const state = createTen(() => 0);
  state.grid = Array.from({ length: 10 }, () => Array(10).fill(0));
  for (let x = 1; x < 10; x += 1) state.grid[9][x] = 1;
  state.offer = [[[0, 0]], null, null];
  state.selected = 0;
  state.cursor = { x: 0, y: 9 };
  assert.equal(tenFits(state, state.offer[0], 0, 9), true);
  assert.equal(tenPlace(state), 1);
  assert.equal(state.grid[9].every((cell) => cell === 0), true);
  assert.ok(state.score >= 101);
});

test("2048 merges two tiles to the left and adds their value", () => {
  const state = createTwenty(() => 0);
  state.grid = [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 4],
  ];
  state.over = false;
  assert.equal(twentyMove(state, "left"), true);
  assert.equal(state.grid[0][0], 4);
  assert.equal(state.score, 4);
  const stuck = createTwenty(() => 0.95);
  stuck.grid = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];
  assert.equal(twentyMove(stuck, "left"), false);
});

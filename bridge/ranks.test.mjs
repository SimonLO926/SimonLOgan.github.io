import assert from "node:assert/strict";
import test from "node:test";
import { BOARD_SIZE, loadBoard, rememberScore } from "./ranks.mjs";

test("a saved number becomes the first of five rank slots", () => {
  assert.equal(BOARD_SIZE, 5);
  assert.deepEqual(loadBoard(["4200"]), [4200]);
  assert.deepEqual(loadBoard(["[900,1200,800]"]), [1200, 900, 800]);
});

test("scores keep the five highest and sprint keeps the five fastest", () => {
  const scores = rememberScore(["[100,90,80,70,60]"], 75);
  assert.deepEqual(scores, [100, 90, 80, 75, 70]);
  const times = rememberScore(["[90000,80000,70000,60000,50000]"], 65000, { lower: true });
  assert.deepEqual(times, [50000, 60000, 65000, 70000, 80000]);
  const legacy = loadBoard(["[300]", "500"]);
  assert.deepEqual(legacy, [500, 300]);
  assert.deepEqual(loadBoard(["[15000,12000]", "15000"]), [15000, 12000]);
});

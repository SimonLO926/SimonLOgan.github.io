import assert from "node:assert/strict";
import test from "node:test";
import {
  COLS,
  createGame,
  dropComponents,
  emptyGrid,
  flipGrid,
  fullRows,
  hardDrop,
  hold,
  pump,
  startGame,
  unsupportedComponents,
} from "./logic.mjs";

function fillRow(grid, y, type = "O", gid = 1) {
  for (let x = 0; x < COLS; x += 1) grid[y][x] = { type, g: gid + x };
}

function put(grid, cells, type, gid) {
  for (const [x, y] of cells) grid[y][x] = { type, g: gid };
}

test("a bridged piece stays while any cell still has support", () => {
  const grid = emptyGrid();
  grid[19][2] = { type: "O", g: 1 };
  grid[19][5] = { type: "O", g: 3 };
  put(grid, [[2, 18], [3, 18], [4, 18], [5, 18]], "I", 2);

  assert.equal(unsupportedComponents(grid).length, 0);
  assert.equal(fullRows(grid).length, 0);
  assert.equal(grid[18][4].type, "I");
  assert.equal(grid[19][3], null);
});

test("hanging cells fall into the hole after the support drops", () => {
  const grid = emptyGrid();
  fillRow(grid, 19, "O", 10);
  grid[18][2] = { type: "J", g: 2 };
  put(grid, [[2, 17], [3, 17], [4, 17], [5, 17]], "I", 3);
  let gid = 100;
  const events = [];
  for (let i = 0; i < 8; i += 1) {
    const rows = fullRows(grid);
    if (rows.length) {
      for (const y of rows) for (let x = 0; x < COLS; x += 1) grid[y][x] = null;
      events.push("clear");
      continue;
    }
    const comps = unsupportedComponents(grid);
    if (!comps.length) break;
    dropComponents(grid, comps, () => gid++);
    events.push("drop");
  }

  assert.deepEqual(events, ["clear", "drop", "drop"]);
  assert.equal(grid[18][2].type, "I");
  assert.equal(grid[19][3].type, "I");
  assert.equal(grid[19][4].type, "I");
  assert.equal(grid[19][5].type, "I");
  assert.equal(grid[19][2].type, "J");
  assert.equal(grid[17][3], null);
});

test("a normal line clear drops the piece that was sitting on it", () => {
  const grid = emptyGrid();
  fillRow(grid, 19, "O", 10);
  put(grid, [[0, 18], [1, 18], [2, 18], [3, 18]], "I", 4);
  let gid = 50;
  for (let i = 0; i < 4; i += 1) {
    const rows = fullRows(grid);
    if (rows.length) {
      for (const y of rows) for (let x = 0; x < COLS; x += 1) grid[y][x] = null;
      continue;
    }
    const comps = unsupportedComponents(grid);
    if (!comps.length) break;
    dropComponents(grid, comps, () => gid++);
  }
  assert.equal(grid[19][0].type, "I");
  assert.equal(grid[19][3].type, "I");
  assert.equal(grid[18][0], null);
});

test("hold stores one piece and cannot be used again until lock", () => {
  const game = createGame({ sequence: ["T", "I", "O", "L", "J", "S", "Z", "T", "I", "O", "L", "J"] });
  startGame(game);
  assert.equal(game.active.type, "T");
  assert.equal(hold(game), true);
  assert.equal(game.hold, "T");
  assert.equal(game.active.type, "I");
  assert.equal(hold(game), false);
  assert.equal(game.hold, "T");
  assert.equal(game.active.type, "I");
});

test("hold swaps the stored piece back out", () => {
  const game = createGame({ sequence: ["T", "I", "O", "L", "J", "S", "Z", "T", "I", "O", "L", "J", "S"] });
  startGame(game);
  hold(game);
  hardDrop(game);
  assert.equal(game.phase, "resolving");
  let guard = 0;
  while (game.phase === "resolving" && guard < 10) {
    pump(game);
    guard += 1;
  }
  assert.equal(game.phase, "playing");
  assert.equal(hold(game), true);
  assert.equal(game.active.type, "T");
  assert.equal(game.hold, "O");
});

test("a bomb removes itself and the cells around it", () => {
  const game = createGame({ sequence: ["B", "I", "O", "T", "L", "J", "S", "Z", "I", "O", "T", "L"] });
  startGame(game);
  game.grid[19][3] = { type: "O", g: 9 };
  game.grid[19][0] = { type: "S", g: 8 };
  hardDrop(game);
  const step = pump(game);
  assert.equal(step.type, "boom");
  assert.equal(game.grid[19][3], null);
  assert.equal(game.grid[19][4], null);
  assert.equal(game.grid[19][0].type, "S");
});

test("the board flips once after every 10 cleared lines", () => {
  const game = createGame({ sequence: ["I", "O", "T", "L", "J", "S", "Z", "I", "O", "T", "L", "J", "S", "Z"] });
  startGame(game);
  game.active = null;
  game.phase = "resolving";
  game.lines = 9;
  game.comboArmed = true;
  fillRow(game.grid, 19);
  const kinds = [];
  for (let i = 0; i < 6 && game.phase === "resolving"; i += 1) {
    kinds.push(pump(game).type);
    if (kinds.at(-1) === "flip") break;
  }
  assert.deepEqual(kinds, ["clear", "flip"]);
  assert.equal(game.lines, 10);
  assert.equal(game.stage, 1);
  assert.equal(game.active, null);
});

test("flipping the board turns it upside down", () => {
  const game = createGame();
  game.grid[19][0] = { type: "I", g: 4 };
  flipGrid(game);
  assert.equal(game.grid[0][9].type, "I");
  assert.equal(game.grid[19][0], null);
  const falling = unsupportedComponents(game.grid);
  assert.equal(falling.length, 1);
});

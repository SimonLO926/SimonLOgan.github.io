import assert from "node:assert/strict";
import test from "node:test";
import {
  COLS,
  REWARD_CHANCE,
  createGame,
  dropComponents,
  cellsOf,
  chainBlast,
  emptyGrid,
  flipGrid,
  fullRows,
  hardDrop,
  hold,
  lockActive,
  pickReward,
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
  assert.equal(game.hold.type, "T");
  assert.equal(game.active.type, "I");
  assert.equal(hold(game), false);
  assert.equal(game.hold.type, "T");
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
  assert.equal(game.hold.type, "O");
});

test("a bomb is one hidden cell inside a five-cell piece and waits for a line clear", () => {
  const game = createGame({
    sequence: ["B", "I", "O", "T", "L", "J", "S", "Z", "I", "O", "T", "L"],
    random: () => 0,
  });
  startGame(game);
  assert.equal(game.active.type, "B");
  assert.equal(cellsOf("B", 0, 0, 0).length, 5);
  game.active.bombIndex = 3;
  game.active.x = 0;
  game.active.y = 18;
  for (let x = 2; x < COLS; x += 1) game.grid[19][x] = { type: "O", g: 20 + x };
  game.grid[18][3] = { type: "S", g: 7 };
  lockActive(game);
  assert.equal(game.grid[19][0].bomb, true);
  assert.equal(game.grid[18][3].type, "S");
  const step = pump(game);
  assert.equal(step.type, "clear");
  assert.equal(game.grid[19][0], null);
  assert.equal(game.grid[18][0], null);
  assert.equal(game.grid[18][3].type, "S");
});

test("the board flips once after every 10 cleared lines", () => {
  const game = createGame({ sequence: ["I", "O", "T", "L", "J", "S", "Z", "I", "O", "T", "L", "J", "S", "Z"] });
  startGame(game);
  game.active = null;
  game.phase = "resolving";
  game.lines = 9;
  game.stage = 1;
  game.stageLines = 9;
  game.stageGoal = 10;
  game.comboArmed = true;
  fillRow(game.grid, 19);
  const kinds = [];
  for (let i = 0; i < 6 && game.phase === "resolving"; i += 1) {
    kinds.push(pump(game).type);
    if (kinds.at(-1) === "flip") break;
  }
  assert.deepEqual(kinds, ["clear", "flip"]);
  assert.equal(game.lines, 10);
  assert.equal(game.stage, 2);
  assert.equal(game.stageGoal, 20);
  assert.equal(game.stageLines, 0);
  assert.equal(game.active, null);
});

test("reward modes prefer breakout, then bbtan, then pinball", () => {
  assert.equal(pickReward(["pinball", "bbtan"]), "bbtan");
  assert.equal(pickReward(["pinball", "breakout"]), "breakout");
  const grid = emptyGrid();
  grid[5][5] = { type: "B", g: 1, bomb: true };
  grid[5][6] = { type: "B", g: 2, bomb: true };
  grid[5][8] = { type: "O", g: 3, bomb: false };
  chainBlast(grid, 5, 5, () => 0);
  assert.equal(grid[5][5], null);
  assert.equal(grid[5][6], null);
  assert.equal(grid[5][8].type, "O");
});

test("mystery pieces show up five times as often", () => {
  assert.equal(REWARD_CHANCE.breakout, 0.005);
  assert.equal(REWARD_CHANCE.bbtan, 0.005);
  assert.equal(REWARD_CHANCE.pinball, 0.01);
  const rolls = [0.5, 0.0049, 0.5, 0.005, 0, 0.5, 0.0199, 0.5, 0.02];
  let index = 0;
  const game = createGame({
    mode: "marathon",
    random: () => {
      const value = rolls[index];
      index += 1;
      return value === undefined ? 0.99 : value;
    },
  });
  assert.equal(game.pull().type, "R");
  assert.equal(game.pull().type, "X");
  assert.equal(game.pull().type, "D");
  assert.equal(["I", "O", "T", "S", "Z", "J", "L", "B"].includes(game.pull().type), true);
});

test("one marathon pull in thirty is a penalty cell", () => {
  const game = createGame({ mode: "marathon", random: () => 0 });
  const piece = game.pull();
  assert.equal(piece.type, "C");
  assert.equal(piece.curse, "seal");
  const sprint = createGame({ mode: "sprint", random: () => 0.5 });
  assert.notEqual(sprint.pull().type, "C");
});

test("a sealed row stays until a bomb is cleared with it", () => {
  const game = createGame({ mode: "marathon", random: () => 0.9 });
  startGame(game);
  game.active = null;
  game.phase = "resolving";
  for (let y = 0; y < 19; y += 1) game.grid[y].fill(null);
  for (let x = 0; x < COLS; x += 1) {
    game.grid[19][x] = { type: "O", g: 80 + x, bomb: false, reward: null, curse: x === 3 ? "seal" : null };
  }
  assert.notEqual(pump(game)?.type, "clear");
  assert.equal(game.grid[19][3].curse, "seal");
  game.active = null;
  game.phase = "resolving";
  game.grid[19][4].bomb = true;
  game.grid[19][4].type = "B";
  assert.equal(pump(game).type, "clear");
  assert.equal(game.grid[19][3], null);
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

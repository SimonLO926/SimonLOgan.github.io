import assert from "node:assert/strict";
import test from "node:test";
import {
  COLS,
  REWARD_CHANCE,
  SAND_COLORS,
  SAND_DROPS,
  SAND_MATCH,
  TSPIN_SCORE,
  beginSand,
  createGame,
  gravityMs,
  paceOf,
  sandClearColors,
  sandPaint,
  SAND_MIX_CHANCE,
  SAND_REPEAT_CHANCE,
  SAND_SCALE,
  sandColorsOf,
  sandMark,
  sandAtRotation,
  SHAPES,
  paceScale,
  sandColorOf,
  sandFallStep,
  tSpinKind,
  tSpinName,
  tSpinReady,
  dropComponents,
  cellsOf,
  chainBlast,
  emptyGrid,
  emptySandGrid,
  flipGrid,
  fullRows,
  hardDrop,
  hold,
  lockActive,
  pickReward,
  pump,
  startGame,
  tryRotate,
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
  assert.equal(REWARD_CHANCE.sand, 0.005);
  const rolls = [0.5, 0.0049, 0.5, 0.005, 0, 0.5, 0.0199, 0.5, 0.02, 0.5, 0.025];
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
  assert.equal(game.pull().type, "A");
  assert.equal(["I", "O", "T", "S", "Z", "J", "L", "B"].includes(game.pull().type), true);
});

test("sand mode lasts twenty drops and uses four colors", () => {
  let n = 0;
  const game = createGame({ mode: "marathon", random: () => (n++ % 3) / 3 });
  game.grid[18][0] = { type: "I", g: 1, bomb: true, reward: "breakout", curse: "seal", sand: null };
  game.grid[18][1] = { type: "O", g: 1, bomb: false, reward: null, curse: null, sand: null };
  game.queue = [{ type: "T" }, { type: "L" }, { type: "J" }];
  beginSand(game);
  assert.equal(game.sandLeft, SAND_DROPS);
  assert.equal(game.grid[18][0], null);
  assert.ok(game.sandGrid[18 * SAND_SCALE][0] > 0);
  assert.ok(game.sandGrid[18 * SAND_SCALE][SAND_SCALE] > 0);
  for (const piece of game.queue) {
    if (Array.isArray(piece.sand)) assert.ok(piece.sand.every((color) => color >= 0 && color < 4));
    else assert.ok(piece.sand >= 0 && piece.sand < 4);
  }
  const pulled = game.pull();
  if (Array.isArray(pulled.sand)) assert.ok(pulled.sand.every((color) => color >= 0 && color < 4));
  else assert.ok(pulled.sand >= 0 && pulled.sand < 4);
  assert.equal(["I", "O", "T", "S", "Z", "J", "L"].includes(game.pull().type), true);
  const grain = emptySandGrid();
  const grainHeight = grain.length;
  grain[grainHeight - 3][4] = 1;
  assert.equal(sandFallStep(grain), true);
  assert.equal(grain[grainHeight - 2][4], 1);
  assert.equal(grain[grainHeight - 3][4], 0);
  const blocked = emptySandGrid();
  const blockedHeight = blocked.length;
  blocked[blockedHeight - 1][2] = 2;
  blocked[blockedHeight - 2][2] = 1;
  assert.equal(sandFallStep(blocked), true);
  assert.equal(blocked[blockedHeight - 2][2], 0);
  assert.ok(blocked[blockedHeight - 1][1] === 1 || blocked[blockedHeight - 1][3] === 1);
  const painted = sandPaint("I", [[0, 0], [1, 0], [2, 0], [3, 0]]);
  assert.equal(SAND_MIX_CHANCE, 1 / 8);
  assert.equal(SAND_REPEAT_CHANCE, 1 / 2.2);
  assert.equal(new Set(painted).size, 2);
  const solid = sandPaint("I", [[0, 0], [1, 0], [2, 0], [3, 0]], false);
  assert.deepEqual(solid, [sandColorOf("I"), sandColorOf("I"), sandColorOf("I"), sandColorOf("I")]);
  const mixed = sandMark("I", (() => {
    const rolls = [0, 0, 0];
    let cursor = 0;
    return () => rolls[cursor++];
  })(), null);
  assert.equal(mixed.hue, 0);
  assert.equal(new Set(mixed.sand).size, 2);
  const repeated = sandMark("T", (() => {
    const rolls = [0, 0.5];
    let cursor = 0;
    return () => rolls[cursor++];
  })(), 2);
  assert.equal(repeated.hue, 2);
  assert.equal(repeated.sand, 2);
  assert.equal(painted[0], sandColorsOf("I")[0]);
  assert.equal(painted[3], sandColorsOf("I")[1]);
  const span = Array.from({ length: 3 }, () => Array(6).fill(0));
  span[2].fill(1);
  span[0][0] = 1;
  span[0][5] = 2;
  span[1][1] = 2;
  const cleared = sandClearColors(span);
  assert.deepEqual(cleared.colors, [0]);
  assert.equal(span[2].every((cell) => cell === 0), true);
  assert.equal(span[0][0], 0);
  assert.equal(span[1][1], 2);
  assert.equal(span[0][5], 2);
  game.sandLeft = 1;
  game.sandExit = false;
  game.phase = "playing";
  game.active = { type: "O", rot: 0, x: 3, y: 18, bombIndex: null, curse: null, sand: 0 };
  lockActive(game);
  assert.equal(game.sandLeft, 0);
  assert.equal(game.sandExit, true);
  let guard = 0;
  while (game.sanding && game.phase === "resolving" && guard < 400) {
    pump(game);
    guard += 1;
  }
  assert.equal(game.sanding, false);
  for (const row of game.grid) for (const cell of row) if (cell) assert.equal(cell.sand, null);
});

function tSpinCavity(game, base, column) {
  game.grid = emptyGrid();
  for (let x = 0; x < COLS; x += 1) {
    if (x !== column) game.grid[base][x] = { type: "O", g: 1 };
    if (x < column - 1 || x > column + 1) game.grid[base + 1][x] = { type: "O", g: 1 };
    if (x !== column) game.grid[base + 2][x] = { type: "O", g: 1 };
  }
}

test("a two-color sand piece keeps its colors when it rotates", () => {
  for (const type of ["I", "T", "S", "Z", "J", "L"]) {
    const count = SHAPES[type][0].length;
    const colors = Array.from({ length: count }, (_, index) => index);
    for (let rot = 0; rot < SHAPES[type].length; rot += 1) {
      const painted = sandAtRotation(type, colors, rot);
      assert.deepEqual([...painted].sort((a, b) => a - b), colors);
    }
  }
  assert.deepEqual(sandAtRotation("I", [0, 1, 0, 1], 0), [0, 1, 0, 1]);
  assert.deepEqual(sandAtRotation("I", [0, 1, 0, 1], 1), [0, 1, 0, 1]);
  assert.deepEqual(sandAtRotation("I", [0, 0, 1, 1], 1), [0, 0, 1, 1]);
});

test("a rotated T that clears one line is a T-spin single", () => {
  const game = createGame({ mode: "marathon", sequence: ["T", "T", "T", "T"] });
  game.phase = "playing";
  game.stage = 1;
  game.pace = 1;
  tSpinCavity(game, 16, 4);
  game.active = { type: "T", rot: 1, x: 2, y: 17, bombIndex: null, curse: null, sand: null };
  assert.equal(tryRotate(game, -1), true);
  assert.equal(tSpinKind(game), "tspin");
  lockActive(game);
  const step = pump(game);
  assert.equal(step.spinName, "single");
  assert.equal(step.rows.length, 1);
  assert.equal(game.score, 800);
});

test("a rotated T that clears two lines is a T-spin double", () => {
  const game = createGame({ mode: "marathon", sequence: ["T", "T", "T", "T"] });
  game.phase = "playing";
  game.stage = 1;
  game.pace = 1;
  tSpinCavity(game, 16, 4);
  game.active = { type: "T", rot: 0, x: 3, y: 16, bombIndex: null, curse: null, sand: null };
  assert.equal(tryRotate(game, 1), true);
  assert.equal(tSpinKind(game), "tspin");
  lockActive(game);
  const step = pump(game);
  assert.equal(step.spinName, "double");
  assert.equal(step.rows.length, 2);
  assert.equal(game.score, 1200);
  assert.equal(tSpinName("tspin", 2), "double");
});

test("a t-spin scores more than a plain single", () => {
  const game = createGame({ mode: "marathon", sequence: ["I", "I", "I", "I", "I", "I"] });
  game.stage = 1;
  game.pace = 1;
  game.phase = "playing";
  game.grid = emptyGrid();
  game.active = { type: "T", rot: 0, x: 3, y: 16, bombIndex: null, curse: null, sand: null };
  game.grid[16][3] = { type: "I", g: 1 };
  game.grid[16][5] = { type: "I", g: 2 };
  game.grid[18][5] = { type: "I", g: 3 };
  game.spinEligible = true;
  assert.equal(tSpinReady(game), true);
  game.spinEligible = false;
  assert.equal(tSpinReady(game), false);
  game.spinEligible = true;
  const before = game.score;
  lockActive(game);
  const step = pump(game);
  assert.equal(step.type, "spin");
  assert.equal(step.kind, "tspin");
  assert.equal(game.score - before, TSPIN_SCORE[0]);
});

test("back to back clears raise the combo bonus", () => {
  const game = createGame({ mode: "marathon", sequence: ["I", "I", "I", "I", "I", "I", "I", "I"] });
  startGame(game);
  game.grid = emptyGrid();
  game.phase = "resolving";
  game.combo = 0;
  game.comboArmed = true;
  game.spin = null;
  game.sanding = false;
  for (let x = 0; x < COLS; x += 1) game.grid[19][x] = { type: "O", g: 1, bomb: false, reward: null, curse: null, sand: null };
  const first = pump(game);
  assert.equal(first.combo, 1);
  assert.equal(first.bonus, 0);
  game.phase = "resolving";
  game.comboArmed = true;
  for (let x = 0; x < COLS; x += 1) game.grid[19][x] = { type: "O", g: 2, bomb: false, reward: null, curse: null, sand: null };
  const second = pump(game);
  assert.equal(second.combo, 2);
  assert.equal(second.bonus, 50);
});

test("hard starts twice as fast and weights the score", () => {
  const normal = createGame({ mode: "marathon" });
  normal.pace = paceOf({ pace: 1 });
  normal.stage = 1;
  const hard = createGame({ mode: "marathon" });
  hard.pace = 2;
  hard.stage = 1;
  assert.equal(gravityMs(hard), Math.round(gravityMs(normal) / 2));
  hard.paceName = "hard";
  normal.stage = 2;
  hard.stage = 2;
  assert.equal(paceScale(hard), 3);
  assert.equal(gravityMs(hard), Math.round(gravityMs(normal) / 3));
  normal.stage = 3;
  hard.stage = 3;
  const custom = createGame({ mode: "marathon" });
  custom.pace = 4;
  custom.stage = 3;
  assert.equal(paceScale(hard), 4);
  assert.equal(paceScale(custom), 8);
  assert.equal(gravityMs(hard), Math.round(gravityMs(normal) / 4));
  assert.equal(gravityMs(custom), Math.round(gravityMs(normal) / 8));
  const mild = createGame({ mode: "marathon" });
  mild.pace = 1.5;
  mild.paceName = "custom";
  mild.stage = 3;
  assert.equal(paceScale(mild), 1.5);
  assert.equal(gravityMs(mild), Math.round(gravityMs(normal) / 1.5));
  normal.stage = 1;
  const fast = createGame({ mode: "marathon" });
  fast.pace = 10;
  assert.equal(gravityMs(fast), Math.max(40, Math.round(gravityMs(normal) / 10)));
  assert.equal(paceOf({ pace: 0.2 }), 0.5);
  assert.equal(paceOf({ pace: 12 }), 10);
  hard.stage = 1;
  hard.phase = "resolving";
  hard.comboArmed = true;
  hard.sanding = false;
  hard.spin = null;
  for (let x = 0; x < COLS; x += 1) hard.grid[19][x] = { type: "O", g: 4, bomb: false, reward: null, curse: null, sand: null };
  const scored = hard.score;
  pump(hard);
  assert.equal(hard.score - scored, 100 * 2);
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

test("plain tetris is a bag of seven pieces and a full row drops without filling holes", () => {
  const game = createGame({ mode: "tetris", random: () => 0 });
  const seen = new Set();
  for (let i = 0; i < 21; i += 1) seen.add(game.pull().type);
  assert.deepEqual([...seen].sort(), ["I", "J", "L", "O", "S", "T", "Z"]);
  const sprint = createGame({ mode: "sprint" });
  sprint.lines = 0;
  const classic = createGame({ mode: "tetris" });
  classic.lines = 0;
  assert.equal(gravityMs(classic), gravityMs(sprint));
  startGame(game, "tetris");
  game.active = null;
  game.phase = "resolving";
  game.grid[17][0] = { type: "O", g: 1, bomb: false, reward: null, curse: null, sand: null };
  for (let x = 1; x < COLS; x += 1) {
    game.grid[18][x] = { type: "I", g: 2, bomb: false, reward: null, curse: null, sand: null };
  }
  for (let x = 0; x < COLS; x += 1) {
    game.grid[19][x] = { type: "O", g: 3, bomb: false, reward: null, curse: null, sand: null };
  }
  assert.equal(pump(game).type, "clear");
  assert.equal(game.grid[18][0].type, "O");
  assert.equal(game.grid[19][0], null);
  assert.equal(game.grid[19][1].type, "I");
  assert.equal(pump(game).type, "spawn");
  assert.equal(game.grid[18][0].type, "O");
  assert.equal(game.grid[19][0], null);
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

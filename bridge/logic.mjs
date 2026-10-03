export const COLS = 10;
export const ROWS = 20;
export const TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

export const SHAPES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [[[1, 0], [2, 0], [1, 1], [2, 1]]],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
  B: bombShapes(),
  X: [
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  ],
  D: bombShapesFrom([[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]]),
  R: [[[0, 0]]],
  C: [[[0, 0]]],
};

export const CURSES = ["seal", "reverse", "blind", "rush", "norotate"];
export const CURSE_CHANCE = 1 / 30;
export const REWARD_CHANCE = { breakout: 0.005, bbtan: 0.005, pinball: 0.01 };

function bombShapesFrom(base) {
  const shapes = [base.map((cell) => [...cell])];
  for (let rot = 0; rot < 3; rot += 1) {
    const turned = shapes[rot].map(([x, y]) => [y, -x]);
    const minX = Math.min(...turned.map(([x]) => x));
    const minY = Math.min(...turned.map(([, y]) => y));
    shapes.push(turned.map(([x, y]) => [x - minX, y - minY]));
  }
  return shapes;
}

function bombShapes() {
  return bombShapesFrom([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]]);
}

export function stageGoal(stage) {
  if (stage <= 1) return 10;
  if (stage === 2) return 20;
  if (stage === 3) return 40;
  return 80;
}

export function pickReward(kinds) {
  return ["breakout", "bbtan", "pinball"].find((kind) => kinds.includes(kind)) ?? null;
}

const KICKS = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-2, 0],
  [2, 0],
  [-1, -1],
  [1, -1],
];

const LINE_SCORE = [0, 100, 300, 500, 800];

export function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function cellsOf(type, rot, x, y) {
  const shape = SHAPES[type][rot % SHAPES[type].length];
  return shape.map(([dx, dy]) => [x + dx, y + dy]);
}

export function fits(grid, type, rot, x, y) {
  return cellsOf(type, rot, x, y).every(([cx, cy]) => {
    if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return false;
    return !grid[cy][cx];
  });
}

function shuffle(list, random) {
  const bag = [...list];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function createGame(options = {}) {
  const random = options.random ?? Math.random;
  const sequence = options.sequence ? [...options.sequence] : null;
  const bag = [];
  let sinceBomb = 0;
  let mode = options.mode ?? "marathon";

  function describe(type, curse = null) {
    const marked = type === "B" || type === "X";
    return {
      type,
      bombIndex: marked ? Math.floor(random() * SHAPES[type][0].length) : null,
      curse,
    };
  }

  function pull() {
    if (sequence) {
      if (!sequence.length) throw new Error("piece sequence exhausted");
      return describe(sequence.shift());
    }
    if (mode === "marathon") {
      if (random() < CURSE_CHANCE) {
        return describe("C", CURSES[Math.floor(random() * CURSES.length)]);
      }
      const roll = random();
      const breakoutAt = REWARD_CHANCE.breakout;
      const bbtanAt = breakoutAt + REWARD_CHANCE.bbtan;
      const pinballAt = bbtanAt + REWARD_CHANCE.pinball;
      if (roll < breakoutAt) return describe("R");
      if (roll < bbtanAt) return describe("X");
      if (roll < pinballAt) return describe("D");
    }
    sinceBomb += 1;
    if (sinceBomb >= 8) {
      sinceBomb = 0;
      return describe("B");
    }
    if (!bag.length) bag.push(...shuffle(TYPES, random));
    return describe(bag.pop());
  }

  const game = {
    grid: emptyGrid(),
    active: null,
    hold: null,
    holdLocked: false,
    queue: [],
    mode,
    score: 0,
    lines: 0,
    stage: 1,
    stageLines: 0,
    stageGoal: 10,
    pendingFlips: 0,
    pendingReward: null,
    combo: 0,
    comboArmed: false,
    pendingBoom: null,
    phase: "ready",
    gid: 1,
    random,
    pull,
  };
  game.setMode = (next) => {
    mode = next;
    game.mode = next;
  };
  return game;
}

function takeGid(game) {
  game.gid += 1;
  return game.gid;
}

export function startGame(game, nextMode) {
  if (nextMode) game.setMode(nextMode);
  game.grid = emptyGrid();
  game.hold = null;
  game.holdLocked = false;
  game.score = 0;
  game.lines = 0;
  game.stage = 1;
  game.stageLines = 0;
  game.stageGoal = stageGoal(1);
  game.pendingFlips = 0;
  game.pendingReward = null;
  game.combo = 0;
  game.comboArmed = false;
  game.pendingBoom = null;
  game.phase = "playing";
  game.queue = [game.pull(), game.pull(), game.pull()];
  spawn(game);
  return game;
}

function spawn(game, preset) {
  const next = preset ?? game.queue.shift();
  if (!preset) game.queue.push(game.pull());
  const piece = {
    type: next.type,
    rot: 0,
    x: 3,
    y: 0,
    bombIndex: next.bombIndex ?? null,
    curse: next.curse ?? null,
  };
  if (!fits(game.grid, piece.type, piece.rot, piece.x, piece.y)) {
    game.active = null;
    game.phase = "over";
    return false;
  }
  game.active = piece;
  return true;
}

export function tryMove(game, dx, dy) {
  if (game.phase !== "playing" || !game.active) return false;
  const { type, rot, x, y } = game.active;
  if (!fits(game.grid, type, rot, x + dx, y + dy)) return false;
  game.active.x += dx;
  game.active.y += dy;
  return true;
}

export function tryRotate(game, dir) {
  if (game.phase !== "playing" || !game.active) return false;
  const { type, rot, x, y } = game.active;
  const count = SHAPES[type].length;
  const next = (rot + dir + count) % count;
  for (const [kx, ky] of KICKS) {
    if (fits(game.grid, type, next, x + kx, y + ky)) {
      game.active.rot = next;
      game.active.x += kx;
      game.active.y += ky;
      return true;
    }
  }
  return false;
}

export function hold(game) {
  if (game.phase !== "playing" || !game.active || game.holdLocked) return false;
  const current = { type: game.active.type, bombIndex: game.active.bombIndex ?? null, curse: game.active.curse ?? null };
  if (game.hold == null) {
    game.hold = current;
    game.holdLocked = true;
    return spawn(game);
  }
  const swapped = game.hold;
  game.hold = current;
  game.holdLocked = true;
  return spawn(game, swapped);
}

export function ghostY(game) {
  if (!game.active) return null;
  const { type, rot, x } = game.active;
  let y = game.active.y;
  while (fits(game.grid, type, rot, x, y + 1)) y += 1;
  return y;
}

export function hardDrop(game) {
  if (game.phase !== "playing" || !game.active) return 0;
  const start = game.active.y;
  const y = ghostY(game);
  const dist = y - start;
  game.active.y = y;
  game.score += dist * 2;
  lockActive(game);
  return dist;
}

export function blastOffsets(random) {
  const roll = random();
  if (roll < 0.4) {
    const offsets = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx || dy) offsets.push([dx, dy]);
      }
    }
    return offsets;
  }
  if (roll < 0.75) {
    return [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, 1]];
  }
  const offsets = [];
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      if (!dx && !dy) continue;
      if (random() < 0.55) offsets.push([dx, dy]);
    }
  }
  return offsets;
}

function rewardOn(piece, index) {
  if (piece.type === "X" && index === piece.bombIndex) return "bbtan";
  if (piece.type === "D") return "pinball";
  if (piece.type === "R") return "breakout";
  return null;
}

function scoreMult(game) {
  if (game.mode === "sprint") return 1 + Math.floor(game.lines / 10);
  return game.stage;
}

function explodeFrom(grid, bombs, random) {
  const blasted = [];
  const seen = new Set();
  for (const bomb of bombs) {
    for (const [dx, dy] of blastOffsets(random)) {
      const cx = bomb.x + dx;
      const cy = bomb.y + dy;
      const key = `${cx},${cy}`;
      if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS || seen.has(key)) continue;
      seen.add(key);
      const target = grid[cy][cx];
      if (!target) continue;
      blasted.push({ x: cx, y: cy, type: target.type, curse: target.curse ?? null });
      grid[cy][cx] = null;
    }
  }
  return blasted;
}

export function lockActive(game) {
  if (!game.active) return;
  const gid = takeGid(game);
  const cells = cellsOf(game.active.type, game.active.rot, game.active.x, game.active.y);
  cells.forEach(([x, y], index) => {
    game.grid[y][x] = {
      type: game.active.type,
      g: gid,
      bomb: game.active.type === "B" && index === game.active.bombIndex,
      reward: rewardOn(game.active, index),
      curse: game.active.type === "C" ? game.active.curse : null,
    };
  });
  game.active = null;
  game.holdLocked = false;
  game.comboArmed = true;
  game.phase = "resolving";
}

export function flipGrid(game) {
  const next = emptyGrid();
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = game.grid[y][x];
      if (cell) {
        next[ROWS - 1 - y][COLS - 1 - x] = {
          type: cell.type,
          g: cell.g,
          bomb: !!cell.bomb,
          reward: cell.reward ?? null,
          curse: cell.curse ?? null,
        };
      }
    }
  }
  game.grid = next;
}

export function fullRows(grid) {
  const rows = [];
  for (let y = 0; y < ROWS; y += 1) {
    if (grid[y].every((cell) => cell)) rows.push(y);
  }
  return rows;
}

function componentSupported(grid, comp) {
  const mine = new Set(comp.map((cell) => `${cell.x},${cell.y}`));
  return comp.some((cell) => {
    if (cell.y === ROWS - 1) return true;
    const below = grid[cell.y + 1][cell.x];
    return below && !mine.has(`${cell.x},${cell.y + 1}`);
  });
}

export function unsupportedComponents(grid) {
  const seen = new Set();
  const comps = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const origin = grid[y][x];
      const key = x + y * COLS;
      if (!origin || seen.has(key)) continue;
      const comp = [];
      const stack = [[x, y]];
      seen.add(key);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        comp.push({
          x: cx,
          y: cy,
          type: grid[cy][cx].type,
          g: origin.g,
          bomb: !!grid[cy][cx].bomb,
          reward: grid[cy][cx].reward ?? null,
          curse: grid[cy][cx].curse ?? null,
        });
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const nkey = nx + ny * COLS;
          if (seen.has(nkey)) continue;
          const next = grid[ny][nx];
          if (!next || next.g !== origin.g) continue;
          seen.add(nkey);
          stack.push([nx, ny]);
        }
      }
      if (!componentSupported(grid, comp)) comps.push(comp);
    }
  }
  return comps;
}

export function dropComponents(grid, comps, nextGid) {
  const falling = comps.flat();
  for (const cell of falling) grid[cell.y][cell.x] = null;
  const byCol = new Map();
  for (const cell of falling) {
    if (!byCol.has(cell.x)) byCol.set(cell.x, []);
    byCol.get(cell.x).push(cell);
  }
  const moves = [];
  for (const [x, cells] of byCol) {
    cells.sort((a, b) => b.y - a.y);
    for (const cell of cells) {
      let y = cell.y;
      while (y + 1 < ROWS && !grid[y + 1][x]) y += 1;
      const g = nextGid();
      grid[y][x] = { type: cell.type, g, bomb: !!cell.bomb, reward: cell.reward ?? null, curse: cell.curse ?? null };
      moves.push({ x, y0: cell.y, y1: y, type: cell.type, g });
    }
  }
  return moves;
}

export function clearingRows(grid) {
  const rows = fullRows(grid);
  if (!rows.length) return [];
  const armed = rows.some((y) => grid[y].some((cell) => cell?.bomb));
  if (armed) return rows;
  return rows.filter((y) => !grid[y].some((cell) => cell?.curse === "seal"));
}

export function pump(game) {
  if (game.phase !== "resolving") return null;
  const rows = clearingRows(game.grid);
  if (rows.length) {
    const cells = [];
    const bombs = [];
    const rewards = [];
    for (const y of rows) {
      for (let x = 0; x < COLS; x += 1) {
        const cell = game.grid[y][x];
        if (cell?.bomb) bombs.push({ x, y });
        if (cell?.reward) rewards.push(cell.reward);
        if (cell) cells.push({ x, y, type: cell.type, reward: cell.reward ?? null, curse: cell.curse ?? null });
        game.grid[y][x] = null;
      }
    }
    const blasts = explodeFrom(game.grid, bombs, game.random);
    game.score += blasts.length * 15;
    if (game.comboArmed) {
      game.combo = 1;
      game.comboArmed = false;
    } else {
      game.combo += 1;
    }
    const mult = scoreMult(game);
    const bonus = game.combo > 1 ? (game.combo - 1) * 50 * mult : 0;
    game.score += LINE_SCORE[rows.length] * mult + bonus;
    game.lines += rows.length;
    if (game.mode === "marathon") {
      game.stageLines += rows.length;
      while (game.stageLines >= game.stageGoal) {
        game.stageLines -= game.stageGoal;
        game.pendingFlips += 1;
        game.stage += 1;
        game.stageGoal = stageGoal(game.stage);
      }
      const reward = pickReward(rewards);
      if (reward) game.pendingReward = reward;
    }
    return { type: "clear", rows, cells, blasts, combo: game.combo };
  }

  if (game.pendingReward) {
    const reward = game.pendingReward;
    game.pendingReward = null;
    if (brickCount(game.grid) === 0) {
      game.score += 2000 * scoreMult(game);
    } else if (!hasLaunchRoom(game.grid)) {
      game.score += 500 * scoreMult(game);
    } else {
      return { type: "reward", reward };
    }
  }

  const comps = unsupportedComponents(game.grid);
  if (comps.length) {
    const moves = dropComponents(game.grid, comps, () => takeGid(game));
    return { type: "drop", moves };
  }

  if (game.mode === "marathon" && game.pendingFlips > 0) {
    game.pendingFlips -= 1;
    return { type: "flip", stage: game.stage };
  }

  if (game.mode === "sprint" && game.lines >= 40) {
    game.phase = "done";
    return { type: "done" };
  }

  if (game.comboArmed) game.combo = 0;
  game.comboArmed = false;
  game.phase = "playing";
  spawn(game);
  return game.phase === "over" ? { type: "over" } : { type: "spawn" };
}

export function brickCount(grid) {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) if (cell) count += 1;
  }
  return count;
}

export function hasLaunchRoom(grid) {
  let highest = ROWS;
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (grid[y][x]) highest = Math.min(highest, y);
    }
  }
  if (highest === ROWS) return false;
  return ROWS - 1 - highest < ROWS - 5;
}

export function hitBrick(grid, x, y, random) {
  const cell = grid[y]?.[x];
  if (!cell) return [];
  if (cell.bomb) return chainBlast(grid, x, y, random);
  grid[y][x] = null;
  return [{ x, y, type: cell.type, bomb: false, curse: cell.curse ?? null }];
}

export function chainBlast(grid, x, y, random) {
  const removed = [];
  const queue = [[x, y]];
  const exploded = new Set();
  while (queue.length) {
    const [bx, by] = queue.shift();
    const key = `${bx},${by}`;
    if (exploded.has(key)) continue;
    exploded.add(key);
    const origin = grid[by]?.[bx];
    if (origin) {
      removed.push({ x: bx, y: by, type: origin.type, bomb: !!origin.bomb, curse: origin.curse ?? null });
      grid[by][bx] = null;
    }
    for (const [dx, dy] of blastOffsets(random)) {
      const cx = bx + dx;
      const cy = by + dy;
      if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) continue;
      const target = grid[cy][cx];
      if (!target) continue;
      const wasBomb = !!target.bomb;
      removed.push({ x: cx, y: cy, type: target.type, bomb: wasBomb, curse: target.curse ?? null });
      grid[cy][cx] = null;
      if (wasBomb) queue.push([cx, cy]);
    }
  }
  return removed;
}

export function gravityMs(game) {
  if (game.mode === "sprint") return Math.max(80, 820 - Math.floor(game.lines / 10) * 140);
  return Math.max(80, 980 - (game.stage - 1) * 110);
}

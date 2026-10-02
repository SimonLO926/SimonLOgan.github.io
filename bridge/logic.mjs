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
  B: [[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]],
};

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

  function pull() {
    if (sequence) {
      if (!sequence.length) throw new Error("piece sequence exhausted");
      return sequence.shift();
    }
    sinceBomb += 1;
    if (sinceBomb >= 8) {
      sinceBomb = 0;
      return "B";
    }
    if (!bag.length) bag.push(...shuffle(TYPES, random));
    return bag.pop();
  }

  const game = {
    grid: emptyGrid(),
    active: null,
    hold: null,
    holdLocked: false,
    queue: [],
    score: 0,
    lines: 0,
    level: 1,
    stage: 0,
    combo: 0,
    comboArmed: false,
    pendingBoom: null,
    phase: "ready",
    gid: 1,
    pull,
  };
  return game;
}

function takeGid(game) {
  game.gid += 1;
  return game.gid;
}

export function startGame(game) {
  game.grid = emptyGrid();
  game.hold = null;
  game.holdLocked = false;
  game.score = 0;
  game.lines = 0;
  game.level = 1;
  game.stage = 0;
  game.combo = 0;
  game.comboArmed = false;
  game.pendingBoom = null;
  game.phase = "playing";
  game.queue = [game.pull(), game.pull(), game.pull()];
  spawn(game);
  return game;
}

function spawn(game, type) {
  const nextType = type ?? game.queue.shift();
  if (!type) game.queue.push(game.pull());
  const piece = { type: nextType, rot: 0, x: 3, y: 0 };
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
  const current = game.active.type;
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

function blastCells(grid, origin) {
  const wiped = [];
  const seen = new Set();
  for (const [x, y] of origin) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const cx = x + dx;
        const cy = y + dy;
        if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) continue;
        const key = `${cx},${cy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const prev = grid[cy][cx];
        if (!prev) continue;
        wiped.push({ x: cx, y: cy, type: prev.type });
        grid[cy][cx] = null;
      }
    }
  }
  for (const [x, y] of origin) {
    if (!wiped.some((cell) => cell.x === x && cell.y === y)) {
      wiped.push({ x, y, type: "B" });
    }
  }
  return wiped;
}

export function lockActive(game) {
  if (!game.active) return;
  if (game.active.type === "B") {
    const origin = cellsOf(game.active.type, game.active.rot, game.active.x, game.active.y);
    const wiped = blastCells(game.grid, origin);
    const destroyed = wiped.filter((cell) => cell.type !== "B").length;
    game.score += destroyed * 10;
    game.pendingBoom = wiped;
  } else {
    const gid = takeGid(game);
    for (const [x, y] of cellsOf(game.active.type, game.active.rot, game.active.x, game.active.y)) {
      game.grid[y][x] = { type: game.active.type, g: gid };
    }
  }
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
      if (cell) next[ROWS - 1 - y][COLS - 1 - x] = { type: cell.type, g: cell.g };
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
        comp.push({ x: cx, y: cy, type: grid[cy][cx].type, g: origin.g });
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
      grid[y][x] = { type: cell.type, g };
      moves.push({ x, y0: cell.y, y1: y, type: cell.type, g });
    }
  }
  return moves;
}

export function pump(game) {
  if (game.phase !== "resolving") return null;
  if (game.pendingBoom) {
    const cells = game.pendingBoom;
    game.pendingBoom = null;
    return { type: "boom", cells };
  }
  const rows = fullRows(game.grid);
  if (rows.length) {
    const cells = [];
    for (const y of rows) {
      for (let x = 0; x < COLS; x += 1) {
        if (game.grid[y][x]) cells.push({ x, y, type: game.grid[y][x].type });
        game.grid[y][x] = null;
      }
    }
    if (game.comboArmed) {
      game.combo = 1;
      game.comboArmed = false;
    } else {
      game.combo += 1;
    }
    const bonus = game.combo > 1 ? (game.combo - 1) * 50 * game.level : 0;
    game.score += LINE_SCORE[rows.length] * game.level + bonus;
    game.lines += rows.length;
    game.level = 1 + Math.floor(game.lines / 10);
    return { type: "clear", rows, cells, combo: game.combo };
  }

  const comps = unsupportedComponents(game.grid);
  if (comps.length) {
    const moves = dropComponents(game.grid, comps, () => takeGid(game));
    return { type: "drop", moves };
  }

  if (Math.floor(game.lines / 10) > game.stage) {
    game.stage += 1;
    return { type: "flip", stage: game.stage };
  }

  if (game.comboArmed) game.combo = 0;
  game.comboArmed = false;
  game.phase = "playing";
  spawn(game);
  return game.phase === "over" ? { type: "over" } : { type: "spawn" };
}

export function gravityMs(level) {
  return Math.max(80, 900 - (level - 1) * 70);
}

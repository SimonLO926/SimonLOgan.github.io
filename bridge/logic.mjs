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
  A: [[[0, 0]]],
  C: [[[0, 0]]],
};

export const CURSES = ["seal", "reverse", "blind", "rush", "norotate"];
export const CURSE_CHANCE = 1 / 30;
export const REWARD_CHANCE = { breakout: 0.005, bbtan: 0.005, pinball: 0.01, sand: 0.005 };
export const SAND_DROPS = 20;
export const SAND_MATCH = 8;
export const SAND_COLORS = 4;
export const SAND_SCALE = 8;
export const SAND_OF_TYPE = {
  I: [0, 1], O: [1, 2], T: [2, 3], S: [3, 0],
  Z: [0, 2], J: [1, 3], L: [0, 3],
  B: [2, 0], X: [3, 1], D: [2, 1], R: [3, 2], A: [0, 1], C: [1, 0],
};

export function sandColorsOf(type) {
  return SAND_OF_TYPE[type] ?? [0, 1];
}

export function sandColorOf(type) {
  return sandColorsOf(type)[0];
}

export const SAND_MIX_CHANCE = 1 / 8;
export const SAND_REPEAT_CHANCE = 1 / 2.2;

export function splitBySide(cells, first, second) {
  if (cells.length < 2) return cells.map(() => first);
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const splitX = Math.max(...xs) !== Math.min(...xs);
  const mid = splitX ? (Math.min(...xs) + Math.max(...xs)) / 2 : (Math.min(...ys) + Math.max(...ys)) / 2;
  return cells.map(([x, y]) => ((splitX ? x : y) <= mid ? first : second));
}

export function sandPaint(type, cells, mix = true) {
  const [first, second] = sandColorsOf(type);
  if (!mix || cells.length < 2) return cells.map(() => first);
  return splitBySide(cells, first, second);
}

const SAND_TURN = {};

function sandTurn(type) {
  if (Object.prototype.hasOwnProperty.call(SAND_TURN, type)) return SAND_TURN[type];
  const shapes = SHAPES[type] || [];
  let turn = null;
  if (shapes.length > 1) {
    const from = shapes[0];
    const onto = new Set(shapes[1].map(([x, y]) => `${x},${y}`));
    for (const size of [3, 4, 5]) {
      for (const fn of [(x, y) => [size - 1 - y, x], (x, y) => [y, size - 1 - x]]) {
        if (from.every(([x, y]) => onto.has(fn(x, y).join(",")))) {
          turn = fn;
          break;
        }
      }
      if (turn) break;
    }
  }
  SAND_TURN[type] = turn;
  return turn;
}

export function sandAtRotation(type, sand, rot = 0) {
  const shapes = SHAPES[type] || [[]];
  const count = shapes.length;
  const turns = ((rot % count) + count) % count;
  const base = Array.isArray(sand) ? sand : shapes[0].map(() => sand);
  if (!Array.isArray(sand)) return shapes[turns].map(() => sand);
  if (!turns) return base.slice();
  const step = sandTurn(type);
  const target = shapes[turns];
  if (!step) return target.map((_, index) => base[index] ?? base[0]);
  const colors = Array(target.length).fill(base[0]);
  shapes[0].forEach(([x, y], index) => {
    let cx = x;
    let cy = y;
    for (let i = 0; i < turns; i += 1) [cx, cy] = step(cx, cy);
    const dest = target.findIndex(([tx, ty]) => tx === cx && ty === cy);
    if (dest >= 0) colors[dest] = base[index] ?? base[0];
  });
  return colors;
}

export function chooseSandColor(previous, random = Math.random) {
  if (previous != null && random() < SAND_REPEAT_CHANCE) return previous;
  const pool = [0, 1, 2, 3].filter((color) => color !== previous);
  return pool[Math.floor(random() * pool.length)] ?? 0;
}

export function sandMark(type, random = Math.random, previous = null) {
  const color = chooseSandColor(previous, random);
  const cells = SHAPES[type]?.[0] ?? [[0, 0]];
  if (cells.length < 2 || random() >= SAND_MIX_CHANCE) return { sand: color, hue: color };
  const others = [0, 1, 2, 3].filter((item) => item !== color);
  const second = others[Math.floor(random() * others.length)] ?? color;
  return { sand: splitBySide(cells, color, second), hue: color };
}

export function sandPaintsFor(type, cells, sand, rot = 0) {
  if (typeof sand === "number") return cells.map(() => sand);
  if (Array.isArray(sand) && sand.length === 2 && (SHAPES[type]?.[0].length ?? 0) !== 2) {
    return sandAtRotation(type, splitBySide(SHAPES[type][0], sand[0], sand[1]), rot);
  }
  if (Array.isArray(sand)) return sandAtRotation(type, sand, rot);
  return sandPaint(type, cells, true);
}
export const TSPIN_SCORE = [400, 800, 1200, 1600];

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
  return ["breakout", "bbtan", "pinball", "sand"].find((kind) => kinds.includes(kind)) ?? null;
}

export function paceOf(game) {
  const pace = Number(game?.pace);
  if (!Number.isFinite(pace)) return 1;
  return Math.min(10, Math.max(0.5, Math.round(pace * 2) / 2));
}

export function paceScale(game) {
  const pace = paceOf(game);
  const stage = Math.max(1, game?.stage || 1);
  const steep = game?.paceName === "hard" || pace > 2;
  const stageRate = steep ? 1 + (stage - 1) * 0.5 : 1;
  return pace * stageRate;
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

// Guideline wall kicks for J, L, S, T and Z. Y grows downward, so the
// published up/down offsets are flipped.
const SRS_KICKS = {
  "0>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "1>0": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "1>2": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "2>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "2>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "3>2": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "3>0": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "0>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

const LINE_SCORE = [0, 100, 300, 500, 800];

export function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function cellsOf(type, rot, x, y) {
  const shape = SHAPES[type][rot % SHAPES[type].length];
  return shape.map(([dx, dy]) => [x + dx, y + dy]);
}

function cellHitsSand(game, cx, cy) {
  const grid = game?.sandGrid;
  if (!grid) return false;
  const scale = SAND_SCALE;
  const y0 = cy * scale;
  const x0 = cx * scale;
  for (let dy = 0; dy < scale; dy += 1) {
    const row = grid[y0 + dy];
    if (!row) return true;
    for (let dx = 0; dx < scale; dx += 1) if (row[x0 + dx]) return true;
  }
  return false;
}

export function fits(grid, type, rot, x, y, sandGame = null) {
  return cellsOf(type, rot, x, y).every(([cx, cy]) => {
    if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return false;
    if (grid[cy][cx]) return false;
    return !cellHitsSand(sandGame, cx, cy);
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
    const piece = {
      type,
      bombIndex: marked ? Math.floor(random() * SHAPES[type][0].length) : null,
      curse,
    };
    if (game.sanding) {
      const mark = sandMark(type, random, game.sandHue);
      game.sandHue = mark.hue;
      piece.sand = mark.sand;
    }
    return piece;
  }

  function pull() {
    if (sequence) {
      if (!sequence.length) throw new Error("piece sequence exhausted");
      return describe(sequence.shift());
    }
    if (mode === "tetris" || mode === "sand" || (mode === "marathon" && game.sanding)) {
      if (!bag.length) bag.push(...shuffle(TYPES, random));
      return describe(bag.pop());
    }
    if (mode === "marathon") {
      if (random() < CURSE_CHANCE) {
        return describe("C", CURSES[Math.floor(random() * CURSES.length)]);
      }
      const roll = random();
      const breakoutAt = REWARD_CHANCE.breakout;
      const bbtanAt = breakoutAt + REWARD_CHANCE.bbtan;
      const pinballAt = bbtanAt + REWARD_CHANCE.pinball;
      const sandAt = pinballAt + REWARD_CHANCE.sand;
      if (roll < breakoutAt) return describe("R");
      if (roll < bbtanAt) return describe("X");
      if (roll < pinballAt) return describe("D");
      if (roll < sandAt) return describe("A");
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
    sanding: false,
    sandGrid: null,
    sandLeft: 0,
    sandExit: false,
    spin: null,
    spinEligible: false,
    sandHue: null,
    pace: 1,
    paceName: "normal",
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
  game.sanding = false;
  game.sandGrid = null;
  game.sandLeft = 0;
  game.sandExit = false;
  game.sandHue = null;
  game.spin = null;
  game.spinEligible = false;
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
    sand: next.sand ?? null,
  };
  game.spinEligible = false;
  if (!fits(game.grid, piece.type, piece.rot, piece.x, piece.y, game)) {
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
  if (!fits(game.grid, type, rot, x + dx, y + dy, game)) return false;
  game.active.x += dx;
  game.active.y += dy;
  if (dx) game.spinEligible = false;
  return true;
}

export function tryRotate(game, dir) {
  if (game.phase !== "playing" || !game.active) return false;
  const { type, rot, x, y } = game.active;
  const count = SHAPES[type].length;
  const next = (rot + dir + count) % count;
  const kicks = SRS_KICKS[`${rot}>${next}`] && "JLSTZ".includes(type) ? SRS_KICKS[`${rot}>${next}`] : KICKS;
  for (let index = 0; index < kicks.length; index += 1) {
    const [kx, ky] = kicks[index];
    if (fits(game.grid, type, next, x + kx, y + ky, game)) {
      game.active.rot = next;
      game.active.x += kx;
      game.active.y += ky;
      game.spinEligible = true;
      game.lastKick = index;
      return true;
    }
  }
  return false;
}

export function hold(game) {
  if (game.phase !== "playing" || !game.active || game.holdLocked) return false;
  const current = { type: game.active.type, bombIndex: game.active.bombIndex ?? null, curse: game.active.curse ?? null, sand: game.active.sand ?? null };
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
  while (fits(game.grid, type, rot, x, y + 1, game)) y += 1;
  return y;
}

export function hardDrop(game) {
  if (game.phase !== "playing" || !game.active) return 0;
  const start = game.active.y;
  const y = ghostY(game);
  const dist = y - start;
  game.active.y = y;
  game.score += dist * 2 * paceOf(game);
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
  if (piece.type === "A") return "sand";
  return null;
}

function scoreMult(game) {
  if (game.mode === "sprint" || game.mode === "tetris") return 1 + Math.floor(game.lines / 10);
  return game.stage * paceOf(game);
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

const T_FRONT = {
  0: [[-1, -1], [1, -1]],
  1: [[1, -1], [1, 1]],
  2: [[-1, 1], [1, 1]],
  3: [[-1, -1], [-1, 1]],
};

export function tSpinKind(game) {
  const piece = game.active;
  if (!piece || piece.type !== "T" || !game.spinEligible) return null;
  const cx = piece.x + 1;
  const cy = piece.y + 1;
  const blocked = (dx, dy) => {
    const x = cx + dx;
    const y = cy + dy;
    return x < 0 || x >= COLS || y < 0 || y >= ROWS || !!game.grid[y][x];
  };
  const filled = [[-1, -1], [1, -1], [-1, 1], [1, 1]].filter(([dx, dy]) => blocked(dx, dy)).length;
  if (filled < 3) return null;
  const front = T_FRONT[piece.rot].filter(([dx, dy]) => blocked(dx, dy)).length;
  if (front === 2 || game.lastKick === 4) return "tspin";
  return "mini";
}

export function tSpinReady(game) {
  return tSpinKind(game) != null;
}

export function tSpinScore(kind, lines) {
  const count = Math.max(0, Math.min(3, lines));
  if (kind === "mini") return [100, 200, 400, 400][count];
  return [400, 800, 1200, 1600][count];
}

export function tSpinName(kind, lines) {
  if (kind === "mini") return lines === 1 ? "mini-single" : "mini";
  return ["tspin", "single", "double", "triple"][Math.max(0, Math.min(3, lines))];
}

function paintCell(cell, sand) {
  return {
    type: cell.type,
    g: cell.g,
    bomb: !!cell.bomb,
    reward: cell.reward ?? null,
    curse: cell.curse ?? null,
    sand: sand === undefined ? (cell.sand ?? null) : sand,
  };
}

export function emptySandGrid() {
  return Array.from({ length: ROWS * SAND_SCALE }, () => Array(COLS * SAND_SCALE).fill(0));
}

function stampSand(grid, cx, cy, value) {
  const scale = SAND_SCALE;
  const y0 = cy * scale;
  const x0 = cx * scale;
  for (let dy = 0; dy < scale; dy += 1) {
    const row = grid[y0 + dy];
    if (!row) continue;
    for (let dx = 0; dx < scale; dx += 1) {
      const x = x0 + dx;
      if (x >= 0 && x < row.length) row[x] = value;
    }
  }
}

export function beginSand(game, drops = SAND_DROPS) {
  game.sanding = true;
  game.sandLeft = drops;
  game.sandExit = false;
  game.sandHue = null;
  const tint = (piece) => {
    if (!piece) return;
    const mark = sandMark(piece.type, game.random, game.sandHue);
    game.sandHue = mark.hue;
    piece.sand = mark.sand;
  };
  const grid = emptySandGrid();
  const groups = new Map();
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = game.grid[y][x];
      if (!cell) continue;
      const key = cell.g ?? `${x},${y}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ x, y, type: cell.type });
      game.grid[y][x] = null;
    }
  }
  for (const group of groups.values()) {
    const coords = group.map((cell) => [cell.x, cell.y]);
    const mark = sandMark(group[0].type, game.random, game.sandHue);
    game.sandHue = mark.hue;
    const marks = Array.isArray(mark.sand) ? [...new Set(mark.sand)] : [mark.sand];
    const paints = marks.length > 1 ? splitBySide(coords, marks[0], marks[1]) : coords.map(() => marks[0]);
    group.forEach((cell, index) => stampSand(grid, cell.x, cell.y, paints[index] + 1));
  }
  for (const piece of game.queue) tint(piece);
  tint(game.hold);
  tint(game.active);
  game.sandGrid = grid;
}

export function finishSand(game) {
  const grid = game.sandGrid;
  const scale = SAND_SCALE;
  if (grid) {
    for (let cy = 0; cy < ROWS; cy += 1) {
      for (let cx = 0; cx < COLS; cx += 1) {
        const tally = [0, 0, 0];
        let filled = 0;
        for (let dy = 0; dy < scale; dy += 1) {
          for (let dx = 0; dx < scale; dx += 1) {
            const value = grid[cy * scale + dy][cx * scale + dx];
            if (!value) continue;
            filled += 1;
            tally[value - 1] += 1;
          }
        }
        if (filled * 2 >= scale * scale) {
          const color = tally.indexOf(Math.max(...tally));
          game.grid[cy][cx] = { type: ["I", "O", "T"][color], g: takeGid(game), bomb: false, reward: null, curse: null, sand: null };
        } else game.grid[cy][cx] = null;
      }
    }
  }
  game.sandGrid = null;
  game.sanding = false;
  game.sandLeft = 0;
  game.sandExit = false;
  for (const piece of game.queue) if (piece) piece.sand = null;
  if (game.hold) game.hold.sand = null;
  if (game.active) game.active.sand = null;
}

export function sandFallStep(grid) {
  const height = grid.length;
  const width = grid[0].length;
  let moved = false;
  for (let y = height - 2; y >= 0; y -= 1) {
    const xs = [];
    for (let x = 0; x < width; x += 1) xs.push(x);
    if (y % 2) xs.reverse();
    for (const x of xs) {
      const color = grid[y][x];
      if (!color) continue;
      if (!grid[y + 1][x]) {
        grid[y + 1][x] = color;
        grid[y][x] = 0;
        moved = true;
        continue;
      }
      const dirs = y % 2 ? [1, -1] : [-1, 1];
      for (const dx of dirs) {
        const tx = x + dx;
        if (tx < 0 || tx >= width || grid[y + 1][tx]) continue;
        grid[y + 1][tx] = color;
        grid[y][x] = 0;
        moved = true;
        break;
      }
    }
  }
  return moved;
}

export function sandClearColors(grid) {
  const width = grid[0].length;
  const doomed = new Set();
  for (const row of grid) {
    const color = row[0];
    if (!color) continue;
    let across = true;
    for (let x = 1; x < width; x += 1) {
      if (row[x] !== color) {
        across = false;
        break;
      }
    }
    if (across) doomed.add(color);
  }
  if (!doomed.size) return { colors: [], count: 0 };
  let count = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!doomed.has(grid[y][x])) continue;
      grid[y][x] = 0;
      count += 1;
    }
  }
  return { colors: [...doomed].map((value) => value - 1), count };
}

export function lockActive(game) {
  if (!game.active) return;
  game.spin = tSpinKind(game);
  const gid = takeGid(game);
  const sanding = !!game.sanding && game.sandGrid;
  const cells = cellsOf(game.active.type, game.active.rot, game.active.x, game.active.y);
  if (sanding) {
    const paints = sandPaintsFor(game.active.type, cells, game.active.sand, game.active.rot);
    cells.forEach(([x, y], index) => stampSand(game.sandGrid, x, y, paints[index] + 1));
    game.sandLeft -= 1;
    if (game.sandLeft <= 0) game.sandExit = true;
    game.active = null;
    game.holdLocked = false;
    game.comboArmed = true;
    game.spinEligible = false;
    game.phase = "resolving";
    return;
  }
  cells.forEach(([x, y], index) => {
    game.grid[y][x] = {
      type: game.active.type,
      g: gid,
      bomb: game.active.type === "B" && index === game.active.bombIndex,
      reward: rewardOn(game.active, index),
      curse: game.active.type === "C" ? game.active.curse : null,
      sand: null,
    };
  });
  game.active = null;
  game.holdLocked = false;
  game.comboArmed = true;
  game.spinEligible = false;
  game.phase = "resolving";
}

export function flipGrid(game) {
  const next = emptyGrid();
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = game.grid[y][x];
      if (cell) {
        next[ROWS - 1 - y][COLS - 1 - x] = paintCell(cell);
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
          sand: grid[cy][cx].sand ?? null,
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
      grid[y][x] = { type: cell.type, g, bomb: !!cell.bomb, reward: cell.reward ?? null, curse: cell.curse ?? null, sand: cell.sand ?? null };
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

function awardCombo(game) {
  game.combo += 1;
  game.comboArmed = false;
  return game.combo > 1 ? (game.combo - 1) * 50 * scoreMult(game) : 0;
}

function noteLines(game, count) {
  game.lines += count;
  if (game.mode !== "marathon") return;
  game.stageLines += count;
  while (game.stageLines >= game.stageGoal) {
    game.stageLines -= game.stageGoal;
    game.pendingFlips += 1;
    game.stage += 1;
    game.stageGoal = stageGoal(game.stage);
  }
}

export function pump(game) {
  if (game.phase !== "resolving") return null;
  if (game.sanding) {
    if (game.spin) {
      const kind = game.spin;
      game.spin = null;
      game.score += tSpinScore(kind, 0) * scoreMult(game);
      return { type: "spin", kind, spinName: tSpinName(kind, 0), combo: game.combo };
    }
    const moved = game.sandGrid && sandFallStep(game.sandGrid);
    if (moved) return { type: "sand", moves: [] };
    const cleared = game.sandGrid ? sandClearColors(game.sandGrid) : { colors: [], count: 0 };
    if (cleared.count) {
      const bonus = awardCombo(game);
      const minos = Math.max(1, Math.round(cleared.count / (SAND_SCALE * SAND_SCALE)));
      game.score += minos * 25 * scoreMult(game) + bonus;
      noteLines(game, Math.max(1, Math.floor(minos / 4)));
      return { type: "clear", rows: [], cells: [], blasts: [], combo: game.combo, sand: true, bonus, colors: cleared.colors };
    }
    if (game.sandExit) finishSand(game);
    else {
      if (game.comboArmed) game.combo = 0;
      game.comboArmed = false;
      game.phase = "playing";
      spawn(game);
      return game.phase === "over" ? { type: "over" } : { type: "spawn" };
    }
  }

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
        if (cell) cells.push({ x, y, type: cell.type, reward: cell.reward ?? null, curse: cell.curse ?? null, sand: cell.sand ?? null });
        game.grid[y][x] = null;
      }
    }
    const blasts = explodeFrom(game.grid, bombs, game.random);
    game.score += blasts.length * 15 * paceOf(game);
    const kind = game.spin;
    game.spin = null;
    const mult = scoreMult(game);
    const bonus = awardCombo(game);
    const lineScore = kind ? tSpinScore(kind, rows.length) : LINE_SCORE[rows.length];
    game.score += lineScore * mult + bonus;
    noteLines(game, rows.length);
    if (game.mode === "tetris") collapseRows(game.grid, rows);
    if (game.mode === "marathon") {
      const reward = pickReward(rewards);
      if (reward) game.pendingReward = reward;
    }
    return { type: "clear", rows, cells, blasts, combo: game.combo, tspin: kind === "tspin", spinName: kind ? tSpinName(kind, rows.length) : null, bonus };
  }

  if (game.spin) {
    const kind = game.spin;
    game.spin = null;
    game.score += tSpinScore(kind, 0) * scoreMult(game);
    return { type: "spin", kind, spinName: tSpinName(kind, 0), combo: game.combo };
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

  if (game.mode !== "tetris") {
    const comps = unsupportedComponents(game.grid);
    if (comps.length) {
      const moves = dropComponents(game.grid, comps, () => takeGid(game));
      return { type: "drop", moves };
    }
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

function collapseRows(grid, rows) {
  const gone = new Set(rows);
  const kept = [];
  for (let y = 0; y < ROWS; y += 1) {
    if (!gone.has(y)) kept.push(grid[y]);
  }
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null));
  for (let y = 0; y < ROWS; y += 1) grid[y] = kept[y];
}

export function gravityMs(game) {
  const classic = game.mode === "sprint" || game.mode === "tetris";
  const base = classic
    ? Math.max(80, 820 - Math.floor(game.lines / 10) * 140)
    : Math.max(80, 980 - (game.stage - 1) * 110);
  if (classic) return base;
  return Math.max(40, Math.round(base / paceScale(game)));
}

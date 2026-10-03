export const TEN = 10;
export const TWENTY = 4;

const TEN_SHAPES = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [0, 1], [1, 1]],
];

function pullTen(random) {
  return TEN_SHAPES[Math.floor(random() * TEN_SHAPES.length)].map(([x, y]) => [x, y]);
}

function emptyTen() {
  return Array.from({ length: TEN }, () => Array(TEN).fill(0));
}

export function createTen(random = Math.random) {
  const state = {
    kind: "ten",
    grid: emptyTen(),
    offer: [],
    selected: 0,
    cursor: { x: 0, y: 0 },
    score: 0,
    lines: 0,
    over: false,
    random,
  };
  refillTen(state);
  return state;
}

function refillTen(state) {
  state.offer = [pullTen(state.random), pullTen(state.random), pullTen(state.random)];
  state.selected = 0;
}

export function tenFits(state, shape, x, y) {
  return shape.every(([dx, dy]) => {
    const cx = x + dx;
    const cy = y + dy;
    return cx >= 0 && cy >= 0 && cx < TEN && cy < TEN && !state.grid[cy][cx];
  });
}

function anyTenFit(state) {
  return state.offer.some((shape) => {
    if (!shape) return false;
    for (let y = 0; y < TEN; y += 1) {
      for (let x = 0; x < TEN; x += 1) if (tenFits(state, shape, x, y)) return true;
    }
    return false;
  });
}

export function tenMove(state, dx, dy) {
  if (state.over) return false;
  state.cursor.x = Math.max(0, Math.min(TEN - 1, state.cursor.x + dx));
  state.cursor.y = Math.max(0, Math.min(TEN - 1, state.cursor.y + dy));
  return true;
}

export function tenCycle(state, dir = 1) {
  if (state.over) return false;
  for (let step = 1; step <= 3; step += 1) {
    const index = (state.selected + dir * step + 3) % 3;
    if (state.offer[index]) {
      state.selected = index;
      return true;
    }
  }
  return false;
}

export function tenPlace(state, x = state.cursor.x, y = state.cursor.y) {
  const shape = state.offer[state.selected];
  if (state.over || !shape || !tenFits(state, shape, x, y)) return 0;
  for (const [dx, dy] of shape) state.grid[y + dy][x + dx] = 1;
  state.score += shape.length;
  state.offer[state.selected] = null;
  const rows = [];
  const cols = [];
  for (let i = 0; i < TEN; i += 1) {
    if (state.grid[i].every(Boolean)) rows.push(i);
    if (state.grid.every((row) => row[i])) cols.push(i);
  }
  for (const row of rows) state.grid[row].fill(0);
  for (const col of cols) for (let row = 0; row < TEN; row += 1) state.grid[row][col] = 0;
  const cleared = rows.length + cols.length;
  if (cleared) {
    state.lines += cleared;
    state.score += cleared * 100 + Math.max(0, cleared - 1) * 50;
  }
  if (state.offer.every((piece) => !piece)) refillTen(state);
  else if (!state.offer[state.selected]) tenCycle(state, 1);
  if (!anyTenFit(state)) state.over = true;
  return cleared;
}

function spawnTwenty(state) {
  const open = [];
  for (let y = 0; y < TWENTY; y += 1) {
    for (let x = 0; x < TWENTY; x += 1) if (!state.grid[y][x]) open.push([x, y]);
  }
  if (!open.length) return false;
  const [x, y] = open[Math.floor(state.random() * open.length)];
  state.grid[y][x] = state.random() < 0.9 ? 2 : 4;
  return true;
}

export function createTwenty(random = Math.random) {
  const state = {
    kind: "twenty",
    grid: Array.from({ length: TWENTY }, () => Array(TWENTY).fill(0)),
    score: 0,
    over: false,
    random,
  };
  spawnTwenty(state);
  spawnTwenty(state);
  return state;
}

function slideLine(line) {
  const tiles = line.filter(Boolean);
  const next = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i += 1) {
    if (tiles[i] === tiles[i + 1]) {
      const value = tiles[i] * 2;
      next.push(value);
      gained += value;
      i += 1;
    } else next.push(tiles[i]);
  }
  while (next.length < TWENTY) next.push(0);
  return { line: next, gained };
}

function columns(grid) {
  return grid[0].map((_, x) => grid.map((row) => row[x]));
}

function writeColumns(grid, cols) {
  for (let x = 0; x < TWENTY; x += 1) {
    for (let y = 0; y < TWENTY; y += 1) grid[y][x] = cols[x][y];
  }
}

function twentyCanMove(state) {
  for (let y = 0; y < TWENTY; y += 1) {
    for (let x = 0; x < TWENTY; x += 1) {
      const value = state.grid[y][x];
      if (!value) return true;
      if (x + 1 < TWENTY && state.grid[y][x + 1] === value) return true;
      if (y + 1 < TWENTY && state.grid[y + 1][x] === value) return true;
    }
  }
  return false;
}

export function twentyMove(state, dir) {
  if (state.over) return false;
  const before = state.grid.map((row) => row.join(",")).join("|");
  let gained = 0;
  if (dir === "left" || dir === "right") {
    for (let y = 0; y < TWENTY; y += 1) {
      const source = dir === "right" ? [...state.grid[y]].reverse() : state.grid[y];
      const slid = slideLine(source);
      const line = dir === "right" ? slid.line.reverse() : slid.line;
      state.grid[y] = line;
      gained += slid.gained;
    }
  } else {
    const cols = columns(state.grid).map((col) => (dir === "down" ? [...col].reverse() : col));
    const next = cols.map((col) => {
      const slid = slideLine(col);
      gained += slid.gained;
      return dir === "down" ? slid.line.reverse() : slid.line;
    });
    writeColumns(state.grid, next);
  }
  const after = state.grid.map((row) => row.join(",")).join("|");
  if (before === after) return false;
  state.score += gained;
  spawnTwenty(state);
  if (!twentyCanMove(state)) state.over = true;
  return true;
}

export function twentyBest(state) {
  return Math.max(...state.grid.flat());
}

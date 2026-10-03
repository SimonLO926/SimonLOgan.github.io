export const BOARD_SIZE = 5;

export function parseBoard(raw) {
  if (raw == null || raw === "") return [];
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = Number(raw);
    }
  }
  const values = Array.isArray(parsed) ? parsed : [parsed];
  return values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
}

export function rankValues(values, { lower = false, limit = BOARD_SIZE } = {}) {
  return values
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => (lower ? a - b : b - a))
    .slice(0, limit);
}

export function loadBoard(raws, options) {
  const lists = raws.map((raw) => parseBoard(raw));
  const primary = lists[0] || [];
  const merged = [...primary];
  for (const value of lists.slice(1).flat()) {
    if (!primary.includes(value)) merged.push(value);
  }
  return rankValues(merged, options);
}

export function rememberScore(raws, value, options) {
  return rankValues([...loadBoard(raws, options), value], options);
}

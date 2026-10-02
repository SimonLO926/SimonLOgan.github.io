export function randomIndex(length: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % length
}

export function drawMany<T>(list: T[], count: number): T[] {
  const pool = [...list]
  const out: T[] = []
  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i += 1) {
    const index = randomIndex(pool.length)
    out.push(pool.splice(index, 1)[0])
  }
  return out
}

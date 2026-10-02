export type Civil = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function isRealDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false
  const dt = new Date(Date.UTC(year, month - 1, day))
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day
}

export function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return isRealDate(year, month, day) ? { year, month, day } : null
}

export function parseDateTime(value: string): Civil | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  if (!isRealDate(year, month, day) || hour > 23 || minute > 59) return null
  return { year, month, day, hour, minute }
}

/** Interpret civil clock time at `offsetMinutes` east of UTC. */
export function civilToUtc(civil: Civil, offsetMinutes: number): Date {
  const ms = Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, civil.minute) - offsetMinutes * 60_000
  return new Date(ms)
}

export function addDays(year: number, month: number, day: number, days: number): { year: number; month: number; day: number } {
  const dt = new Date(Date.UTC(year, month - 1, day + days))
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() }
}

function nthSunday(year: number, month: number, n: number): number {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const firstSunday = 1 + ((7 - firstDow) % 7)
  if (n > 0) return firstSunday + (n - 1) * 7
  const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const lastDow = new Date(Date.UTC(year, month - 1, lastDate)).getUTCDay()
  return lastDate - lastDow
}

function atLeast(civil: Civil, month: number, day: number, hour: number): boolean {
  if (civil.month !== month) return civil.month > month
  if (civil.day !== day) return civil.day > day
  return civil.hour >= hour
}

function before(civil: Civil, month: number, day: number, hour: number): boolean {
  return !atLeast(civil, month, day, hour)
}

/** European summer time, last Sunday of March 01:00 to last Sunday of October 01:00. */
export function isEuDst(civil: Civil): boolean {
  if (civil.month < 3 || civil.month > 10) return false
  if (civil.month > 3 && civil.month < 10) return true
  if (civil.month === 3) return atLeast(civil, 3, nthSunday(civil.year, 3, -1), 1)
  return before(civil, 10, nthSunday(civil.year, 10, -1), 1)
}

/** United States summer time. 2007 onward: second Sunday in March to first Sunday in November. */
export function isUsDst(civil: Civil): boolean {
  if (civil.year >= 2007) {
    if (civil.month < 3 || civil.month > 11) return false
    if (civil.month > 3 && civil.month < 11) return true
    if (civil.month === 3) return atLeast(civil, 3, nthSunday(civil.year, 3, 2), 2)
    return before(civil, 11, nthSunday(civil.year, 11, 1), 2)
  }
  if (civil.month < 4 || civil.month > 10) return false
  if (civil.month > 4 && civil.month < 10) return true
  if (civil.month === 4) return atLeast(civil, 4, nthSunday(civil.year, 4, 1), 2)
  return before(civil, 10, nthSunday(civil.year, 10, -1), 2)
}

/** New South Wales approximate modern daylight saving. */
export function isSydneyDst(civil: Civil): boolean {
  if (civil.month > 4 && civil.month < 10) return false
  if (civil.month > 10 || civil.month < 4) return true
  if (civil.month === 10) return atLeast(civil, 10, nthSunday(civil.year, 10, 1), 2)
  return before(civil, 4, nthSunday(civil.year, 4, 1), 3)
}

export function taipeiNow(now = new Date()): Civil {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(fmt.formatToParts(now).map((part) => [part.type, part.value]))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

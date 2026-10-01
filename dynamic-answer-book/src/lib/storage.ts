import type { Lang, ThemeMode } from '@/lib/copy'

const LANG = 'boa-lang'
const THEME = 'boa-theme'
const SOUND = 'boa-sound'
const HISTORY = 'boa-history'

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode */
  }
}

export function readLang(): Lang {
  const value = read(LANG)
  return value === 'en' ? 'en' : 'zh'
}

export function writeLang(lang: Lang) {
  write(LANG, lang)
}

export function readTheme(): ThemeMode {
  const value = read(THEME)
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return 'system'
}

export function writeTheme(mode: ThemeMode) {
  write(THEME, mode)
}

export function readSound() {
  return read(SOUND) === 'on'
}

export function writeSound(on: boolean) {
  write(SOUND, on ? 'on' : 'off')
}

export function readHistory(): number[] {
  const raw = read(HISTORY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => Number.isInteger(item) && item >= 0).slice(0, 8)
  } catch {
    return []
  }
}

export function writeHistory(pages: number[]) {
  write(HISTORY, JSON.stringify(pages.slice(0, 8)))
}

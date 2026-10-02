import type { DoorId } from '../data/doors'
import { isLang, type Lang, type ThemeChoice } from '../i18n/types'

export type Tier = 'guest' | 'patron' | 'master'

export type HistoryItem = {
  at: number
  door: DoorId
  title: string
  note: string
}

type Save = {
  tier: Tier
  sound: boolean
  history: HistoryItem[]
  lang: Lang
  theme: ThemeChoice
}

const KEY = 'chengwen.v2'

const EMPTY: Save = { tier: 'guest', sound: true, history: [], lang: 'zh-Hant', theme: 'system' }

function normalize(parsed: Partial<Save>): Save {
  const theme = parsed.theme === 'dark' || parsed.theme === 'light' || parsed.theme === 'system' ? parsed.theme : 'system'
  return {
    tier: parsed.tier === 'patron' || parsed.tier === 'master' ? parsed.tier : 'guest',
    sound: parsed.sound !== false,
    history: Array.isArray(parsed.history) ? parsed.history.slice(0, 12) : [],
    lang: parsed.lang && isLang(parsed.lang) ? parsed.lang : 'zh-Hant',
    theme,
  }
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem('chengwen.v1')
    if (!raw) return { ...EMPTY, history: [] }
    return normalize(JSON.parse(raw) as Partial<Save>)
  } catch {
    return { ...EMPTY, history: [] }
  }
}

export function writeSave(save: Save) {
  localStorage.setItem(KEY, JSON.stringify(save))
}

export function patchSave(partial: Partial<Save>) {
  writeSave({ ...loadSave(), ...partial })
}

export function historyLimit(tier: Tier): number {
  if (tier === 'master') return 12
  if (tier === 'patron') return 6
  return 3
}

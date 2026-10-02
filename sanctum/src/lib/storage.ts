import type { DoorId } from '../data/doors'

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
}

const KEY = 'chengwen.v1'

const EMPTY: Save = { tier: 'guest', sound: true, history: [] }

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY, history: [] }
    const parsed = JSON.parse(raw) as Partial<Save>
    const tier = parsed.tier === 'patron' || parsed.tier === 'master' ? parsed.tier : 'guest'
    const history = Array.isArray(parsed.history) ? parsed.history.slice(0, 12) : []
    return { tier, sound: parsed.sound !== false, history }
  } catch {
    return { ...EMPTY, history: [] }
  }
}

export function writeSave(save: Save) {
  localStorage.setItem(KEY, JSON.stringify(save))
}

export function historyLimit(tier: Tier): number {
  if (tier === 'master') return 12
  if (tier === 'patron') return 6
  return 3
}

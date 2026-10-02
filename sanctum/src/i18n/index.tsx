import { DICT, type Dict } from './dict'
import { usePrefs } from './prefs'

export function useI18n() {
  const prefs = usePrefs()
  const dict = DICT[prefs.lang]
  const t = (key: keyof Dict) => dict[key]
  return { ...prefs, dict, t }
}

export { DICT, DOOR_COPY } from './dict'
export { toHans } from './hans'
export { word } from './words'
export { PrefsProvider, usePrefs } from './prefs'
export type { Lang, ThemeChoice } from './types'

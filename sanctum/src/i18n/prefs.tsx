import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMedia } from '../lib/useMedia'
import { loadSave, patchSave } from '../lib/storage'
import type { Lang, ThemeChoice } from './types'

export type { Lang, ThemeChoice }
export type ResolvedTheme = 'dark' | 'light'

type Prefs = {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: ThemeChoice
  setTheme: (theme: ThemeChoice) => void
  resolved: ResolvedTheme
}

const Ctx = createContext<Prefs | null>(null)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(() => loadSave(), [])
  const [lang, setLang] = useState<Lang>(stored.lang)
  const [theme, setTheme] = useState<ThemeChoice>(stored.theme)
  const systemDark = useMedia('(prefers-color-scheme: dark)')
  const resolved: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    patchSave({ lang, theme })
    const html = document.documentElement
    html.lang = lang === 'zh-Hans' ? 'zh-Hans' : lang === 'zh-Hant' ? 'zh-Hant' : lang
    html.dataset.theme = resolved
    html.style.colorScheme = resolved
  }, [lang, theme, resolved])

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, resolved }), [lang, theme, resolved])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('prefs')
  return ctx
}

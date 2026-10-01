import { useEffect, useState } from 'react'
import type { ThemeMode } from '@/lib/copy'

function resolveDark(mode: ThemeMode) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme(mode: ThemeMode) {
  const [dark, setDark] = useState(() => resolveDark(mode))

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = resolveDark(mode)
      setDark(next)
      document.documentElement.classList.toggle('dark', next)
      document.documentElement.style.colorScheme = next ? 'dark' : 'light'
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next ? '#0c0c0b' : '#efece6')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])

  return dark
}

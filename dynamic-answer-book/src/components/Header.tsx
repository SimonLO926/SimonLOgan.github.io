import { motion } from 'framer-motion'
import { Monitor, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Copy, Lang, Mode, ThemeMode } from '@/lib/copy'

export function Header({
  lang,
  setLang,
  themeMode,
  setThemeMode,
  sound,
  setSound,
  mode,
  setMode,
  copy,
  onAbout,
}: {
  lang: Lang
  setLang: (lang: Lang) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  sound: boolean
  setSound: (on: boolean) => void
  mode: Mode
  setMode: (mode: Mode) => void
  copy: Copy
  onAbout: () => void
}) {
  const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'system', label: copy.themeSystem, icon: Monitor },
    { id: 'light', label: copy.themeLight, icon: Sun },
    { id: 'dark', label: copy.themeDark, icon: Moon },
  ]

  return (
    <header className="relative z-20 grid items-center gap-3 px-4 pt-4 md:grid-cols-[1fr_auto_1fr] md:px-8 md:pt-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 md:contents">
        <div className="flex shrink-0 items-center gap-2.5 md:justify-self-start">
          <span className="seal mini-seal" aria-hidden>
            答
          </span>
          <p
            className={`m-0 whitespace-nowrap ${lang === 'zh' ? 'font-serif text-lg' : 'font-display text-[1.7rem] italic leading-none'}`}
          >
            {copy.mark}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 md:col-start-3 md:justify-self-end">
          <div className="seg" role="group" aria-label={copy.toEn}>
            {(
              [
                ['zh', '中'],
                ['en', 'EN'],
              ] as const
            ).map(([id, label]) => {
              const selected = lang === id
              return (
                <button key={id} type="button" aria-pressed={selected} onClick={() => setLang(id)}>
                  {selected && <motion.span layoutId="lang-pill" className="pill" />}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>
          <div className="seg" role="group" aria-label={copy.themeSystem}>
            {themes.map((item) => {
              const selected = themeMode === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={item.label}
                  title={item.label}
                  className="!px-2"
                  onClick={() => setThemeMode(item.id)}
                >
                  {selected && <motion.span layoutId="theme-pill" className="pill" />}
                  <Icon />
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={sound}
            aria-label={sound ? copy.soundOn : copy.soundOff}
            title={sound ? copy.soundOn : copy.soundOff}
            onClick={() => setSound(!sound)}
          >
            {sound ? <Volume2 /> : <VolumeX />}
          </button>
          <Button type="button" variant="ghost" className="pill-btn" onClick={onAbout}>
            {copy.about}
          </Button>
        </div>
      </div>
      <div className="seg justify-self-center md:col-start-2 md:row-start-1" role="tablist" aria-label={copy.mark}>
        {copy.modes.map((item) => {
          const selected = mode === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMode(item.id)}
            >
              {selected && <motion.span layoutId="mode-pill" className="pill" />}
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}

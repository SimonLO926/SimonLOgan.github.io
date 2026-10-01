import { useCallback, useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { ANSWER_COUNT } from '@/data/answers'
import { AboutDialog } from '@/components/AboutDialog'
import { BookStage } from '@/components/BookStage'
import { Header } from '@/components/Header'
import { OracleStage } from '@/components/OracleStage'
import { SlipStage } from '@/components/SlipStage'
import { copy, type Lang, type Mode, type ThemeMode } from '@/lib/copy'
import { padPage, randomIndex } from '@/lib/format'
import { primeAudio, setSoundEnabled } from '@/lib/sound'
import { readHistory, readLang, readSound, readTheme, writeHistory, writeLang, writeSound, writeTheme } from '@/lib/storage'
import { useTheme } from '@/lib/useTheme'

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => readLang())
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readTheme())
  const [sound, setSound] = useState(() => readSound())
  const [mode, setMode] = useState<Mode>('book')
  const [page, setPage] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<number[]>(() => readHistory())
  const [about, setAbout] = useState(false)
  const dict = copy[lang]

  useTheme(themeMode)

  useEffect(() => {
    writeLang(lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'
    document.title = lang === 'zh' ? '答案之書' : 'The Book of Answers'
  }, [lang])

  useEffect(() => {
    writeTheme(themeMode)
  }, [themeMode])

  useEffect(() => {
    writeSound(sound)
    setSoundEnabled(sound)
  }, [sound])

  const remember = useCallback((index: number) => {
    setHistory((prev) => {
      const next = [index, ...prev.filter((item) => item !== index)].slice(0, 8)
      writeHistory(next)
      return next
    })
  }, [])

  const seek = useCallback(() => {
    const next = randomIndex(page)
    setPage(next)
    setOpen(true)
    remember(next)
    if (sound) primeAudio()
  }, [page, remember, sound])

  const step = useCallback(
    (dir: 1 | -1) => {
      setPage((current) => {
        const base = current ?? 0
        return (base + dir + ANSWER_COUNT) % ANSWER_COUNT
      })
      setOpen(true)
      if (sound) primeAudio()
    },
    [sound],
  )

  const recall = useCallback(
    (index: number) => {
      if (index < 0 || index >= ANSWER_COUNT) return
      setPage(index)
      if (mode === 'book') setOpen(true)
      if (sound) primeAudio()
    },
    [mode, sound],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '1') setMode('book')
      if (event.key === '2') setMode('oracle')
      if (event.key === '3') setMode('slip')
      if (event.key === ' ' && mode !== 'book') {
        event.preventDefault()
        seek()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, seek])

  function onLamp(event: MouseEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--lx', `${event.clientX}px`)
    event.currentTarget.style.setProperty('--ly', `${event.clientY}px`)
  }

  return (
    <div className="desk" onMouseMove={onLamp}>
      <div className="lamp" />
      <div className="grain" aria-hidden />
      <div className="app-layer">
        <Header
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          sound={sound}
          setSound={setSound}
          mode={mode}
          setMode={setMode}
          copy={dict}
          onAbout={() => setAbout(true)}
        />
        <main className="stage">
          {mode === 'book' && (
            <BookStage
              open={open}
              page={page}
              lang={lang}
              question={question}
              setQuestion={setQuestion}
              sound={sound}
              copy={dict}
              onOpen={seek}
              onClose={() => setOpen(false)}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
              onSeek={seek}
            />
          )}
          {mode === 'oracle' && (
            <OracleStage
              page={page}
              lang={lang}
              question={question}
              setQuestion={setQuestion}
              copy={dict}
              onAsk={seek}
            />
          )}
          {mode === 'slip' && <SlipStage page={page} lang={lang} copy={dict} onDraw={seek} />}
        </main>
        {history.length > 0 && (
          <div className="history-row">
            <span>{dict.history}</span>
            {history.map((index) => (
              <button
                key={index}
                type="button"
                className="chip"
                aria-current={index === page ? 'page' : undefined}
                onClick={() => recall(index)}
              >
                {padPage(index)}
              </button>
            ))}
          </div>
        )}
        <footer className="mt-auto text-center">
          <button type="button" className="footer-link" onClick={() => setAbout(true)}>
            {dict.footer(ANSWER_COUNT)}
          </button>
        </footer>
        <AboutDialog open={about} onOpenChange={setAbout} copy={dict} />
      </div>
    </div>
  )
}

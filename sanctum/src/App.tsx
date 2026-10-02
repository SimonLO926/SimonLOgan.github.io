import { useCallback, useEffect, useMemo, useState } from 'react'
import { Atlas } from './components/Atlas'
import { BaziRitual } from './components/BaziRitual'
import { PatronSheet, TopBar } from './components/Chrome'
import { FengshuiRitual } from './components/FengshuiRitual'
import { OmikujiRitual } from './components/OmikujiRitual'
import { OracleRitual } from './components/OracleRitual'
import { StickRitual } from './components/StickRitual'
import { ZodiacRitual } from './components/ZodiacRitual'
import { ZiweiRitual } from './components/ZiweiRitual'
import { DOORS, type DoorId, type Preview } from './data/doors'
import { primeSound, setSoundEnabled } from './lib/sound'
import { historyLimit, loadSave, writeSave, type Tier } from './lib/storage'
import { readToday } from './lib/today'
import { SanctumScene } from './scene/SanctumScene'

type View = 'atlas' | DoorId

export default function App() {
  const stored = useMemo(() => loadSave(), [])
  const today = useMemo(() => readToday(), [])
  const [view, setView] = useState<View>('atlas')
  const [preview, setPreview] = useState<Preview>('hall')
  const [tier, setTier] = useState<Tier>(stored.tier)
  const [sound, setSound] = useState(stored.sound)
  const [history, setHistory] = useState(stored.history)
  const [patron, setPatron] = useState(false)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const mobile = useMedia('(max-width: 860px)')

  useEffect(() => {
    setSoundEnabled(sound)
    writeSave({ tier, sound, history })
  }, [tier, sound, history])

  useEffect(() => {
    const prime = () => primeSound()
    window.addEventListener('pointerdown', prime, { once: true })
    return () => window.removeEventListener('pointerdown', prime)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const door = view === 'atlas' ? null : DOORS.find((item) => item.id === view)
    document.title = door ? `${door.name} — 承問` : '承問'
  }, [view])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'Escape') {
        if (patron) setPatron(false)
        else if (view !== 'atlas') setView('atlas')
      }
      if (view === 'atlas' && event.key >= '1' && event.key <= '7') {
        setView(DOORS[Number(event.key) - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [patron, view])

  const onPreview = useCallback((next: Preview) => setPreview(next), [])
  const record = (title: string, note: string) => {
    if (view === 'atlas') return
    const door = view
    setHistory((prev) => [{ at: Date.now(), door, title, note }, ...prev.filter((item) => item.title !== title)].slice(0, historyLimit(tier)))
  }
  const ritual = {
    tier,
    sound,
    onBack: () => setView('atlas'),
    onPatron: () => setPatron(true),
    onRecord: record,
    onPrint: () => window.print(),
  }
  const artifact: Preview = view === 'atlas' ? preview : view

  return (
    <div className="app">
      <div className="stage" aria-hidden="true">
        <SanctumScene artifact={artifact} still={reduced} mobile={mobile} />
        <div className="glow" />
        <div className="vignette" />
        <div className="grain" />
      </div>
      <p className="spine">承問 · CHENGWEN</p>
      <TopBar
        view={view}
        tier={tier}
        sound={sound}
        onHome={() => setView('atlas')}
        onSound={() => setSound((value) => !value)}
        onPatron={() => setPatron(true)}
      />
      <main>
        {view === 'atlas' && (
          <Atlas today={today} history={history} onOpen={setView} onPreview={onPreview} onPatron={() => setPatron(true)} />
        )}
        {view === 'sticks' && <StickRitual {...ritual} />}
        {view === 'omikuji' && <OmikujiRitual {...ritual} />}
        {view === 'oracle' && <OracleRitual {...ritual} />}
        {view === 'zodiac' && <ZodiacRitual {...ritual} />}
        {view === 'fengshui' && <FengshuiRitual {...ritual} />}
        {view === 'bazi' && <BaziRitual {...ritual} />}
        {view === 'ziwei' && <ZiweiRitual {...ritual} />}
      </main>
      {patron && (
        <PatronSheet
          tier={tier}
          onClose={() => setPatron(false)}
          onChoose={(next) => {
            setTier(next)
            setPatron(false)
          }}
        />
      )}
    </div>
  )
}

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatch(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return match
}

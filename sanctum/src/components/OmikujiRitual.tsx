import { useEffect, useRef, useState } from 'react'
import { OMIKUJI, type Omikuji } from '../data/omikuji'
import { useI18n } from '../i18n'
import { randomIndex } from '../lib/draw'
import { bell } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { pulseScene, resetRitualMotion, sceneBus } from '../scene/store'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

export function OmikujiRitual({
  tier,
  sound,
  onBack,
  onPatron,
  onRecord,
}: {
  tier: Tier
  sound: boolean
  onBack: () => void
  onPatron: () => void
  onRecord: (title: string, note: string) => void
}) {
  const [question, setQuestion] = useState('')
  const [slip, setSlip] = useState<Omikuji | null>(null)
  const [busy, setBusy] = useState(false)
  const recent = useRef<string[]>([])
  const { t } = useI18n()

  useEffect(() => () => resetRitualMotion(), [])

  const draw = () => {
    if (busy) return
    setBusy(true)
    setSlip(null)
    sceneBus.lidOpen = false
    pulseScene()
    if (sound) bell()
    window.setTimeout(() => {
      const pool = OMIKUJI.filter((item) => !recent.current.includes(item.id))
      const next = (pool.length ? pool : OMIKUJI)[randomIndex((pool.length ? pool : OMIKUJI).length)]
      recent.current = [next.id, ...recent.current].slice(0, 12)
      sceneBus.lidOpen = true
      setSlip(next)
      setBusy(false)
      onRecord(next.grade, next.jp)
    }, 700)
  }

  return (
    <RitualFrame id="omikuji" onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); draw() }}>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit" disabled={busy}>{busy ? t('omikujiWait') : slip ? t('omikujiAgain') : t('castOmikuji')}</button>
      </form>
      <div aria-live="polite">
        {slip && (
          <article className="paper omikuji" key={slip.id}>
            <p className="kana">{slip.kana} · {OMIKUJI.findIndex((item) => item.id === slip.id) + 1}/{OMIKUJI.length}</p>
            <h3 className="jp-grade">{slip.grade}</h3>
            <p className="jp">{slip.jp}</p>
            {question.trim() && <p className="asked">所問「{question.trim()}」</p>}
            <p>{slip.reading}</p>
            <dl className="split">
              <div><dt>{t('wish')}</dt><dd>{slip.wish}</dd></div>
              <div><dt>{t('love')}</dt><dd>{slip.love}</dd></div>
              <div><dt>{t('travel')}</dt><dd>{slip.travel}</dd></div>
              <div><dt>{t('lost')}</dt><dd>{slip.lost}</dd></div>
            </dl>
            <Veil locked={!opened(tier)} onOpen={onPatron}>
              <p className="master-copy">{slip.master}</p>
            </Veil>
          </article>
        )}
      </div>
    </RitualFrame>
  )
}

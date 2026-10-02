import { useEffect, useState } from 'react'
import { OMIKUJI, type Omikuji } from '../data/omikuji'
import { randomIndex } from '../lib/draw'
import { bell } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { resetRitualMotion, sceneBus } from '../scene/store'
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

  useEffect(() => () => resetRitualMotion(), [])

  const draw = () => {
    if (busy) return
    setBusy(true)
    setSlip(null)
    sceneBus.lidOpen = false
    if (sound) bell()
    window.setTimeout(() => {
      const next = OMIKUJI[randomIndex(OMIKUJI.length)]
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
        <button className="btn solid" type="submit" disabled={busy}>{busy ? '鈴還在' : slip ? '再求一張' : '搖鈴求籤'}</button>
      </form>
      <div aria-live="polite">
        {slip && (
          <article className="paper omikuji" key={slip.id}>
            <p className="kana">{slip.kana}</p>
            <h3 className="jp-grade">{slip.grade}</h3>
            <p className="jp">{slip.jp}</p>
            {question.trim() && <p className="asked">所問「{question.trim()}」</p>}
            <p>{slip.reading}</p>
            <dl className="split">
              <div><dt>願事</dt><dd>{slip.wish}</dd></div>
              <div><dt>戀愛</dt><dd>{slip.love}</dd></div>
              <div><dt>旅行</dt><dd>{slip.travel}</dd></div>
              <div><dt>失物</dt><dd>{slip.lost}</dd></div>
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

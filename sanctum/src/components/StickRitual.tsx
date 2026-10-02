import { useEffect, useState } from 'react'
import { STICKS, type Stick } from '../data/sticks'
import { randomIndex } from '../lib/draw'
import { shakeSound } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { resetRitualMotion, sceneBus } from '../scene/store'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

export function StickRitual({
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
  const [stick, setStick] = useState<Stick | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => () => resetRitualMotion(), [])

  const draw = () => {
    if (busy) return
    setBusy(true)
    setStick(null)
    sceneBus.shaking = true
    sceneBus.raised = -1
    if (sound) shakeSound()
    window.setTimeout(() => {
      const next = STICKS[randomIndex(STICKS.length)]
      sceneBus.shaking = false
      sceneBus.raised = next.no % 34
      setStick(next)
      setBusy(false)
      onRecord(`第${next.no}籤 ${next.grade}`, next.title)
    }, 1100)
  }

  return (
    <RitualFrame id="sticks" onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); draw() }}>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit" disabled={busy}>{busy ? '筒在響' : stick ? '再搖一次' : '搖籤'}</button>
      </form>
      <div aria-live="polite">
        {stick && (
          <article className="paper" key={stick.no}>
            <header className="paper-top">
              <p>第{stick.no}籤</p>
              <strong className={`grade g-${stick.grade}`}>{stick.grade}</strong>
            </header>
            <h3>{stick.title}</h3>
            {question.trim() && <p className="asked">所問「{question.trim()}」</p>}
            <p className="verses">{stick.verses.join('\n')}</p>
            <p className="omen">{stick.omen}</p>
            <dl className="split">
              <div><dt>事</dt><dd>{stick.affair}</dd></div>
              <div><dt>情</dt><dd>{stick.heart}</dd></div>
              <div><dt>身</dt><dd>{stick.body}</dd></div>
            </dl>
            <Veil locked={!opened(tier)} onOpen={onPatron}>
              <p className="master-copy">{stick.master}</p>
            </Veil>
            <i className="seal" aria-hidden="true">{stick.grade}</i>
          </article>
        )}
      </div>
    </RitualFrame>
  )
}

import { useState } from 'react'
import { useI18n } from '../i18n'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { drawTarot, tarotAnswer, type DrawnCard } from '../lib/tarot'
import { pulseScene } from '../scene/store'
import { QuestionField, RitualFrame } from './Chrome'
import { TarotMark } from './TarotMark'

export function TarotRitual({
  sound,
  onBack,
  onRecord,
}: {
  tier: Tier
  sound: boolean
  onBack: () => void
  onPatron: () => void
  onRecord: (title: string, note: string) => void
  onPrint: () => void
}) {
  const { lang, t } = useI18n()
  const [question, setQuestion] = useState('')
  const [cards, setCards] = useState<DrawnCard[]>([])
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)

  const draw = (count: 1 | 3) => {
    if (busy) return
    setBusy(true)
    setCards([])
    setAnswer('')
    pulseScene()
    if (sound) tick()
    const asked = question
    window.setTimeout(() => {
      const next = drawTarot(count)
      setCards(next)
      setAnswer(tarotAnswer(asked, next, lang))
      setBusy(false)
      onRecord(next.map((item) => item.card.title[lang]).join(' · '), asked.trim() || t('tarotThree'))
    }, 720)
  }

  return (
    <RitualFrame id="tarot" wide onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); draw(3) }}>
        <QuestionField value={question} onChange={setQuestion} />
        <div className="hero-actions">
          <button className="btn solid" type="button" disabled={busy} onClick={() => draw(3)}>{busy ? t('shaking') : t('tarotThree')}</button>
          <button className="btn" type="button" disabled={busy} onClick={() => draw(1)}>{t('tarotOne')}</button>
        </div>
      </form>
      <p className="fine">{t('tarotLocal')}</p>
      <div className={cards.length === 3 ? 'tarot-grid three' : 'tarot-grid'}>
        {cards.map((item, index) => (
          <article key={`${item.card.id}-${index}`} className={item.reversed ? 'tarot-card reversed' : 'tarot-card'} style={{ animationDelay: `${index * 160}ms` }}>
            {cards.length === 3 && <p className="place">{t(index === 0 ? 'past' : index === 1 ? 'present' : 'future')}</p>}
            <div className={item.reversed ? 'tarot-art reversed' : 'tarot-art'}>
              <TarotMark id={item.card.id} />
            </div>
            <h3>{item.card.title[lang]}</h3>
            <p className="side">{item.reversed ? t('reversed') : t('upright')}</p>
          </article>
        ))}
      </div>
      {answer && <article className="paper tarot-answer" aria-live="polite"><p className="omen">{answer}</p></article>}
    </RitualFrame>
  )
}

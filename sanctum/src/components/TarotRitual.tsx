import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n/types'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { detectDomain, DOMAIN_LINE, drawTarot, type DrawnCard } from '../lib/tarot'
import { QuestionField, RitualFrame } from './Chrome'

const PLACES = ['past', 'present', 'future'] as const

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

  const draw = (count: number) => {
    const next = drawTarot(count)
    setCards(next)
    if (sound) tick()
    onRecord(next.map((item) => item.card.title[lang]).join(' · '), question.trim() || t('tarotOne'))
  }

  const domain = detectDomain(question)

  return (
    <RitualFrame id="tarot" onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); draw(1) }}>
        <QuestionField value={question} onChange={setQuestion} />
        <div className="hero-actions">
          <button className="btn solid" type="submit">{t('tarotOne')}</button>
          <button className="btn" type="button" onClick={() => draw(3)}>{t('tarotThree')}</button>
        </div>
      </form>
      <p className="fine">{t('tarotLocal')}</p>
      <div className="spread" aria-live="polite">
        {cards.map((item, index) => (
          <article key={`${item.card.id}-${index}`} className={item.reversed ? 'oracle-card reversed' : 'oracle-card'}>
            {cards.length === 3 && <p className="place">{t(PLACES[index])}</p>}
            <h3>{item.card.title[lang]}</h3>
            <p className="side">{item.reversed ? t('reversed') : t('upright')}</p>
            {index === 0 && question.trim() && <p className="asked">{t('asked')}「{question.trim()}」</p>}
            <p>{item.reversed ? item.card.reversed[lang] : item.card.upright[lang]}</p>
          </article>
        ))}
      </div>
      {cards.length > 0 && <p>{DOMAIN_LINE[domain][lang as Lang]}</p>}
    </RitualFrame>
  )
}

import { useState } from 'react'
import { ORACLE, type OracleCard } from '../data/oracle'
import { drawMany, randomIndex } from '../lib/draw'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

type Drawn = { card: OracleCard; reversed: boolean }

const PLACES = ['過去', '現在', '未來']

export function OracleRitual({
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
  const [cards, setCards] = useState<Drawn[]>([])

  const draw = (count: number) => {
    const drawn = drawMany(ORACLE, count).map((card) => ({ card, reversed: randomIndex(2) === 1 }))
    setCards(drawn)
    if (sound) tick()
    onRecord(drawn.map((item) => item.card.name).join(' · '), drawn[0]?.card.latin ?? '')
  }

  return (
    <RitualFrame id="oracle" onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); draw(1) }}>
        <QuestionField value={question} onChange={setQuestion} />
        <div className="hero-actions">
          <button className="btn solid" type="submit">抽一張</button>
          <button className="btn" type="button" onClick={() => draw(3)}>三牌之陣</button>
        </div>
      </form>
      <div className="spread" aria-live="polite">
        {cards.map((item, index) => (
          <article key={`${item.card.id}-${index}`} className={item.reversed ? 'oracle-card reversed' : 'oracle-card'}>
            <p className="latin">{item.card.latin}</p>
            <h3>{item.card.name}</h3>
            {cards.length === 3 && <p className="place">{PLACES[index]}</p>}
            <p className="side">{item.reversed ? '影' : '正'}</p>
            {question.trim() && index === 0 && <p className="asked">所問「{question.trim()}」</p>}
            <p>{item.reversed ? item.card.shadow : item.card.upright}</p>
            <Veil locked={!opened(tier)} onOpen={onPatron}>
              <p className="master-copy">{item.card.master}</p>
            </Veil>
          </article>
        ))}
      </div>
    </RitualFrame>
  )
}

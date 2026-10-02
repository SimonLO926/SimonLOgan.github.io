import { useState } from 'react'
import { CITIES, cityById, offsetOf } from '../data/cities'
import { castBazi, type BaziChart } from '../lib/bazi'
import { parseDateTime } from '../lib/civil'
import type { Element } from '../lib/ganzhi'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

const COLORS: Record<Element, string> = {
  木: '#6e8b62',
  火: '#a33b32',
  土: '#c4a574',
  金: '#d9d3c5',
  水: '#6d8494',
}

export function BaziRitual({
  tier,
  sound,
  onBack,
  onPatron,
  onRecord,
  onPrint,
}: {
  tier: Tier
  sound: boolean
  onBack: () => void
  onPatron: () => void
  onRecord: (title: string, note: string) => void
  onPrint: () => void
}) {
  const [when, setWhen] = useState('1990-08-16T14:30')
  const [gender, setGender] = useState<'' | 'male' | 'female'>('')
  const [city, setCity] = useState('taipei')
  const [question, setQuestion] = useState('')
  const [chart, setChart] = useState<BaziChart | null>(null)
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState('')

  const cast = () => {
    const civil = parseDateTime(when)
    if (!civil) {
      setError('需要完整的日期與時間。')
      return
    }
    const place = cityById(city)
    const next = castBazi(civil, {
      offsetMinutes: offsetOf(place, civil),
      gender: gender || null,
    })
    setChart(next)
    setEditing(false)
    setError('')
    if (sound) tick()
    onRecord(next.pillars.map((item) => item.pillar.stem + item.pillar.branch).join(' '), `${next.dayMaster}${next.dayElement} · ${next.strength}`)
  }

  return (
    <RitualFrame id="bazi" wide onBack={onBack}>
      {editing ? <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>出生年月日時</span><input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required /></label>
        <label className="field">
          <span>性別 · 只用於大運順逆</span>
          <select value={gender} onChange={(event) => setGender(event.target.value as '' | 'male' | 'female')}>
            <option value="">不記</option>
            <option value="female">女</option>
            <option value="male">男</option>
          </select>
        </label>
        <label className="field">
          <span>出生地</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">排四柱</button>
        {error && <p className="error">{error}</p>}
        <p className="fine">年柱以立春換，月柱以十二節換。二十三時起算次日。</p>
      </form> : <button type="button" className="text-btn" onClick={() => setEditing(true)}>改出生時間</button>}
      {chart && <Pillars chart={chart} question={question} tier={tier} onPatron={onPatron} onPrint={onPrint} />}
    </RitualFrame>
  )
}

function Pillars({
  chart,
  question,
  tier,
  onPatron,
  onPrint,
}: {
  chart: BaziChart
  question: string
  tier: Tier
  onPatron: () => void
  onPrint: () => void
}) {
  const max = Math.max(...Object.values(chart.scores))
  return (
    <div className="chart-block" aria-live="polite">
      <div className="pillars">
        {chart.pillars.map((item) => (
          <article key={item.label}>
            <p>{item.label}</p>
            <strong>{item.pillar.stem}</strong>
            <strong>{item.pillar.branch}</strong>
            <small>{item.pillar.tenGod}</small>
            <small>{item.pillar.branchGod}</small>
            <em>{item.pillar.nayin}</em>
            <em className="hidden">{item.hidden}</em>
          </article>
        ))}
      </div>
      <div className="meters" aria-hidden="true">
        {(Object.keys(COLORS) as Element[]).map((element) => (
          <div key={element} className="meter">
            <div className="meter-track">
              <div className="meter-fill" style={{ height: `${(chart.scores[element] / max) * 100}%`, background: COLORS[element] }} />
            </div>
            <span>{element}</span>
          </div>
        ))}
      </div>
      {question.trim() && <p className="asked">所問「{question.trim()}」</p>}
      <p>{chart.reading}</p>
      <p className="fine">{chart.strength} · 用{chart.useful.join('、')}</p>
      <Veil locked={!opened(tier)} onOpen={onPatron}>
        <p className="master-copy">{chart.master}</p>
      </Veil>
      {tier === 'master' && <button type="button" className="btn" onClick={onPrint}>印成一紙</button>}
    </div>
  )
}

import { useState } from 'react'
import { CITIES, cityById } from '../data/cities'
import { parseDate, taipeiNow } from '../lib/civil'
import { castFengshui, type FengshuiChart } from '../lib/fengshui'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { sceneBus } from '../scene/store'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

const FACINGS = ['', '北', '東北', '東', '東南', '南', '西南', '西', '西北']
const ROWS = [
  ['se', 's', 'sw'],
  ['e', 'center', 'w'],
  ['ne', 'n', 'nw'],
] as const
const ANGLE: Record<string, number> = {
  南: 0, 西南: 45, 西: 90, 西北: 135, 北: 180, 東北: 225, 東: 270, 東南: 315,
}

export function FengshuiRitual({
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
  const [date, setDate] = useState('1990-08-16')
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [city, setCity] = useState('taipei')
  const [facing, setFacing] = useState('')
  const [question, setQuestion] = useState('')
  const [chart, setChart] = useState<FengshuiChart | null>(null)
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState('')

  const cast = () => {
    const civil = parseDate(date)
    if (!civil) {
      setError('這個日期無法起盤。')
      return
    }
    const next = castFengshui(
      { ...civil, hour: 12, minute: 0 },
      gender,
      cityById(city),
      facing || null,
      taipeiNow(),
    )
    const vital = next.directions.find((item) => item.star === '生氣')
    if (vital) sceneBus.needle = ((ANGLE[vital.dir] ?? 0) * Math.PI) / 180
    setChart(next)
    setEditing(false)
    setError('')
    if (sound) tick()
    onRecord(`${next.gua} · ${next.group}`, next.pillar)
  }

  return (
    <RitualFrame id="fengshui" wide onBack={onBack}>
      {editing ? <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>出生日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label className="field">
          <span>性別</span>
          <select value={gender} onChange={(event) => setGender(event.target.value as 'male' | 'female')}>
            <option value="female">女</option>
            <option value="male">男</option>
          </select>
        </label>
        <label className="field">
          <span>出生地 · 用於立春分界</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>大門朝向 · 可略</span>
          <select value={facing} onChange={(event) => setFacing(event.target.value)}>
            {FACINGS.map((item) => <option key={item || 'none'} value={item}>{item || '不記'}</option>)}
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">看宅與流年</button>
        {error && <p className="error">{error}</p>}
      </form> : <button type="button" className="text-btn" onClick={() => setEditing(true)}>改出生資料</button>}
      {chart && (
        <div className="chart-block" aria-live="polite">
          <Luopan chart={chart} />
          <p className="fine">羅盤南在上。吉方描金。</p>
          {question.trim() && <p className="asked">所問「{question.trim()}」</p>}
          <p>{chart.reading}</p>
          {chart.facingNote && <p>{chart.facingNote}</p>}
          <div className="star-grid" aria-label={`${chart.annualYear}年飛星`}>
            {ROWS.map((row) => row.map((key) => {
              const cell = chart.annualCells.find((item) => item.key === key)!
              return (
                <div key={key} className={`star-cell s-${cell.star}`}>
                  <strong>{cell.star}</strong>
                  <span>{cell.label}</span>
                  <small>{cell.name}</small>
                </div>
              )
            }))}
          </div>
          <p className="fine">{chart.annualPillar}年 · 中宮順飛 · 南在上</p>
          <Veil locked={!opened(tier)} onOpen={onPatron}>
            <p className="master-copy">{chart.master}</p>
          </Veil>
        </div>
      )}
    </RitualFrame>
  )
}

function Luopan({ chart }: { chart: FengshuiChart }) {
  const cx = 150
  const cy = 150
  return (
    <svg className="luopan" viewBox="0 0 300 300" role="img" aria-label={`${chart.gua}命羅盤`}>
      <circle cx={cx} cy={cy} r="132" className="wheel-ring" />
      {chart.directions.map((item) => {
        const angle = ANGLE[item.dir] ?? 0
        const [x, y] = fromTop(angle, 108, cx, cy)
        const [nx, ny] = fromTop(angle, 78, cx, cy)
        return (
          <g key={item.dir}>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={item.good ? 'good-dir' : 'bad-dir'}>{item.dir}</text>
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" className="star-name">{item.star}</text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="42" className="wheel-core" />
      <text x={cx} y={cy - 8} textAnchor="middle" className="gua">{chart.gua}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="star-name">{chart.group}</text>
    </svg>
  )
}

function fromTop(deg: number, radius: number, cx: number, cy: number): [number, number] {
  const t = (deg * Math.PI) / 180
  return [cx + radius * Math.sin(t), cy - radius * Math.cos(t)]
}

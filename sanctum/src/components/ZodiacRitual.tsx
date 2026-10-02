import { useMemo, useState } from 'react'
import { CITIES, cityById } from '../data/cities'
import type { Tier } from '../lib/storage'
import { castZodiac, type ZodiacChart } from '../lib/zodiac'
import { parseDate } from '../lib/civil'
import { tick } from '../lib/sound'
import { QuestionField, RitualFrame, Veil } from './Chrome'

export function ZodiacRitual({
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
  const [time, setTime] = useState('14:30')
  const [city, setCity] = useState('taipei')
  const [question, setQuestion] = useState('')
  const [chart, setChart] = useState<ZodiacChart | null>(null)
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState('')

  const cast = () => {
    const civil = parseDate(date)
    if (!civil) {
      setError('這個日期無法起盤。')
      return
    }
    const match = /^(\d{2}):(\d{2})$/.exec(time)
    const withTime = match ? { ...civil, hour: Number(match[1]), minute: Number(match[2]) } : civil
    if (match && (Number(match[1]) > 23 || Number(match[2]) > 59)) {
      setError('時間不對。')
      return
    }
    const next = castZodiac(withTime, cityById(city), question)
    setChart(next)
    setEditing(false)
    setError('')
    if (sound) tick()
    onRecord(`${next.sun.sign.name}日 ${next.moon.sign.name}月`, next.asc ? `${next.asc.sign.name}升` : '未起上升')
  }

  return (
    <RitualFrame id="zodiac" wide onBack={onBack}>
      {editing ? <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>出生日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label className="field"><span>出生時間 · 可留空</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
        <label className="field">
          <span>出生地</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">起盤</button>
        {error && <p className="error">{error}</p>}
        <p className="fine">夏令時間依現行規則估算。美國 2007 年以前的夏令可能差一小時。</p>
      </form> : <button type="button" className="text-btn" onClick={() => setEditing(true)}>改出生時間</button>}
      {chart && <Wheel chart={chart} tier={tier} onPatron={onPatron} />}
    </RitualFrame>
  )
}

function Wheel({ chart, tier, onPatron }: { chart: ZodiacChart; tier: Tier; onPatron: () => void }) {
  const marks = useMemo(() => {
    const anchor = chart.asc?.lon ?? 90
    const ticks = Array.from({ length: 12 }, (_, index) => {
      const lon = index * 30
      const [x, y] = polar(lon, anchor, 118, 160, 160)
      const [lx, ly] = polar(lon + 15, anchor, 96, 160, 160)
      return { x, y, lx, ly, name: chart.sun.sign && index === Math.floor(chart.sun.lon / 30) ? '' : '', label: ['白羊', '金牛', '雙子', '巨蟹', '獅子', '處女', '天秤', '天蠍', '射手', '摩羯', '水瓶', '雙魚'][index] }
    })
    return { anchor, ticks }
  }, [chart])

  return (
    <div className="chart-block" aria-live="polite">
      <svg className="wheel" viewBox="0 0 320 320" role="img" aria-label="黃道輪">
        <circle cx="160" cy="160" r="128" className="wheel-ring" />
        <circle cx="160" cy="160" r="78" className="wheel-ring inner" />
        {marks.ticks.map((tick) => (
          <g key={tick.label}>
            <line x1="160" y1="160" x2={tick.x} y2={tick.y} className="wheel-tick" />
            <text x={tick.lx} y={tick.ly} textAnchor="middle" dominantBaseline="middle">{tick.label}</text>
          </g>
        ))}
        <Body lon={chart.sun.lon} anchor={marks.anchor} r={86} label="日" />
        <Body lon={chart.moon.lon} anchor={marks.anchor} r={68} label="月" />
        {chart.asc && <Body lon={chart.asc.lon} anchor={marks.anchor} r={104} label="升" />}
      </svg>
      <ul className="placements">
        <li><span>太陽</span>{chart.sun.sign.name} {chart.sun.deg}° · {chart.sun.sign.element} · {chart.sun.sign.mode}</li>
        <li><span>月亮</span>{chart.moon.sign.name} {chart.moon.deg}°</li>
        <li><span>上升</span>{chart.asc ? `${chart.asc.sign.name} ${chart.asc.deg}°` : '未起'}</li>
        <li><span>中天</span>{chart.mc ? `${chart.mc.sign.name} ${chart.mc.deg}°` : '未起'}</li>
        {chart.aspect && <li><span>日月</span>{chart.aspect}</li>}
      </ul>
      {chart.moonNote && <p className="fine">{chart.moonNote}</p>}
      <p>{chart.reading}</p>
      <Veil locked={tier === 'guest'} onOpen={onPatron}>
        <p className="master-copy">{chart.master}</p>
      </Veil>
    </div>
  )
}

function Body({ lon, anchor, r, label }: { lon: number; anchor: number; r: number; label: string }) {
  const [x, y] = polar(lon, anchor, r, 160, 160)
  return (
    <g>
      <circle cx={x} cy={y} r="11" className={`body body-${label}`} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text>
    </g>
  )
}

function polar(lon: number, anchor: number, radius: number, cx: number, cy: number): [number, number] {
  const math = ((180 + (lon - anchor)) * Math.PI) / 180
  return [cx + radius * Math.cos(math), cy - radius * Math.sin(math)]
}

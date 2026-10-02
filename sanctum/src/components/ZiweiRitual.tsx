import { useState } from 'react'
import { parseDateTime } from '../lib/civil'
import { BRANCHES } from '../lib/ganzhi'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { castZiwei, type ZiweiChart } from '../lib/ziwei'
import { sceneBus } from '../scene/store'
import { QuestionField, RitualFrame, Veil, opened } from './Chrome'

const AREA: Record<string, string> = {
  巳: 'si', 午: 'wu', 未: 'wei', 申: 'shen',
  辰: 'chen', 酉: 'you',
  卯: 'mao', 戌: 'xu',
  寅: 'yin', 丑: 'chou', 子: 'zi', 亥: 'hai',
}

export function ZiweiRitual({
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
  const [gender, setGender] = useState<'女' | '男'>('女')
  const [question, setQuestion] = useState('')
  const [chart, setChart] = useState<ZiweiChart | null>(null)
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState('')

  const cast = () => {
    const civil = parseDateTime(when)
    if (!civil) {
      setError('需要完整的日期與時間。')
      return
    }
    try {
      const next = castZiwei(civil, gender, question)
      const life = next.palaces.find((palace) => palace.name === '命宮')
      sceneBus.life = life ? BRANCHES.indexOf(life.branch as (typeof BRANCHES)[number]) : 0
      setChart(next)
      setEditing(false)
      setError('')
      if (sound) tick()
      onRecord(next.fiveElementsClass, next.lifeStars)
    } catch {
      setError('這個時刻無法排盤。')
    }
  }

  return (
    <RitualFrame id="ziwei" wide onBack={onBack}>
      {editing ? <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>出生年月日時</span><input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required /></label>
        <label className="field">
          <span>性別</span>
          <select value={gender} onChange={(event) => setGender(event.target.value as '女' | '男')}>
            <option value="女">女</option>
            <option value="男">男</option>
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">排十二宮</button>
        {error && <p className="error">{error}</p>}
        <p className="fine">時辰：二十三時為晚子。閏月依十五日前後劃分。</p>
      </form> : <button type="button" className="text-btn" onClick={() => setEditing(true)}>改出生時間</button>}
      {chart && (
        <div className="chart-block" aria-live="polite">
          <div className="ziwei">
            {chart.palaces.map((palace) => (
              <article key={palace.branch} className={`palace p-${AREA[palace.branch] ?? ''} ${palace.name === '命宮' ? 'life' : ''}`}>
                <header>
                  <strong>{palace.name}</strong>
                  <span>{palace.stem}{palace.branch}</span>
                </header>
                <p className="majors">
                  {palace.major.length
                    ? palace.major.map((star) => (
                      <em key={star.name}>{star.name}{star.brightness ? <small>{star.brightness}</small> : null}{star.mutagen ? <b className={`mut m-${star.mutagen}`}>{star.mutagen}</b> : null}</em>
                    ))
                    : <em className="empty">借對宮</em>}
                </p>
                <p className="minors">{palace.minor.map((star) => star.name).join(' ')}</p>
                <footer>
                  {palace.isBody && <i>身</i>}
                  {opened(tier) && <small>{palace.decadal}</small>}
                </footer>
              </article>
            ))}
            <div className="core">
              <p className="eyebrow">{chart.fiveElementsClass}</p>
              <strong>{chart.zodiac}</strong>
              <span>命主 {chart.soul}</span>
              <span>身主 {chart.body}</span>
              <small>{chart.chineseDate}</small>
              <small>{chart.time} · {chart.timeRange}</small>
            </div>
          </div>
          <p>{chart.reading}</p>
          <Veil locked={!opened(tier)} onOpen={onPatron}>
            <p className="master-copy">{chart.master}</p>
          </Veil>
          {tier === 'master' && <button type="button" className="btn" onClick={onPrint}>印成一紙</button>}
        </div>
      )}
    </RitualFrame>
  )
}

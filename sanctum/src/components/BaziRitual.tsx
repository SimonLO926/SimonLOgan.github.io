import { useState } from 'react'
import { CITIES, cityById, offsetOf } from '../data/cities'
import { toHans, useI18n, word } from '../i18n'
import { castBazi, type BaziChart } from '../lib/bazi'
import { parseDateTime } from '../lib/civil'
import { BRANCHES, type Element } from '../lib/ganzhi'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { BRANCH_ANGLE, Compass, ELEMENT_ANGLE } from './Compass'
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
  const { t } = useI18n()

  const cast = () => {
    const civil = parseDateTime(when)
    if (!civil) {
      setError(t('needDateTime'))
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
        <label className="field"><span>{t('birthClock')}</span><input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required /></label>
        <label className="field">
          <span>{t('genderNote')}</span>
          <select value={gender} onChange={(event) => setGender(event.target.value as '' | 'male' | 'female')}>
            <option value="">{t('genderSkip')}</option>
            <option value="female">{t('genderF')}</option>
            <option value="male">{t('genderM')}</option>
          </select>
        </label>
        <label className="field">
          <span>{t('birthPlace')}</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">{t('castPillars')}</button>
        {error && <p className="error">{error}</p>}
        <p className="fine">{t('baziFine')}</p>
      </form> : <button type="button" className="text-btn" onClick={() => setEditing(true)}>{t('editTime')}</button>}
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
  const { lang, t } = useI18n()
  const max = Math.max(...Object.values(chart.scores))
  const active = new Set(chart.pillars.map((item) => item.pillar.branch))
  const labels = [t('pillarYear'), t('pillarMonth'), t('pillarDay'), t('pillarHour')]
  return (
    <div className="chart-block" aria-live="polite">
      <Compass
        caption={`${t('northUp')} · ${t('useful')} ${word(`el.${chart.useful[0]}`, lang)}`}
        needle={ELEMENT_ANGLE[chart.useful[0]] ?? 0}
        center={<><strong>{chart.dayMaster}</strong><span>{word(`el.${chart.dayElement}`, lang)}</span></>}
        ticks={BRANCHES.map((branch) => ({ angle: BRANCH_ANGLE[branch], label: branch, active: active.has(branch) }))}
      />
      <div className="pillars">
        {chart.pillars.map((item, index) => (
          <article key={item.label}>
            <p>{labels[index]}</p>
            <strong>{item.pillar.stem}</strong>
            <strong>{item.pillar.branch}</strong>
            <small>{word(`god.${item.pillar.tenGod}`, lang)}</small>
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
      <p>{lang === 'zh-Hant' ? chart.reading : lang === 'zh-Hans' ? toHans(chart.reading) : `${chart.dayMaster} ${word(`el.${chart.dayElement}`, lang)}, ${word(`str.${chart.strength}`, lang)}. ${t('favors')} ${chart.useful.map((element) => word(`el.${element}`, lang)).join(', ')}. ${t('notVerdict')}`}</p>
      <p className="fine">{word(`str.${chart.strength}`, lang)} · {t('useful')}{chart.useful.map((element) => word(`el.${element}`, lang)).join('、')}</p>
      <Veil locked={!opened(tier)} onOpen={onPatron}>
        <p className="master-copy">{lang === 'zh-Hans' ? toHans(chart.master) : lang === 'zh-Hant' ? chart.master : `${t('avoid')} ${chart.avoid.map((element) => word(`el.${element}`, lang)).join(', ')}. ${chart.luck === '大運順行' ? t('luckForward') : chart.luck === '大運逆行' ? t('luckBack') : t('noGender')}`}</p>
      </Veil>
      {tier === 'master' && <button type="button" className="btn" onClick={onPrint}>{t('print')}</button>}
    </div>
  )
}

import { useState } from 'react'
import { CITIES, cityById, offsetOf } from '../data/cities'
import { useI18n, word } from '../i18n'
import { parseDateTime } from '../lib/civil'
import { castQizheng, type SkyBody } from '../lib/qizheng'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { Compass } from './Compass'
import { QuestionField, RitualFrame } from './Chrome'

export function QizhengRitual({
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
  const [when, setWhen] = useState('1990-08-16T14:30')
  const [city, setCity] = useState('taipei')
  const [question, setQuestion] = useState('')
  const [bodies, setBodies] = useState<SkyBody[] | null>(null)
  const [mansion, setMansion] = useState('')
  const [error, setError] = useState('')

  const cast = () => {
    const civil = parseDateTime(when)
    if (!civil) {
      setError(t('needDateTime'))
      return
    }
    const place = cityById(city)
    const date = new Date(Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, civil.minute) - offsetOf(place, civil) * 60_000)
    const chart = castQizheng(date)
    setBodies(chart.bodies)
    setMansion(chart.mansion.name)
    setError('')
    if (sound) tick()
    onRecord(word(`planet.${chart.bodies[0].id}`, lang), chart.mansion.name)
  }

  const sun = bodies?.find((body) => body.id === 'sun')

  return (
    <RitualFrame id="qizheng" wide onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>{t('birthClock')}</span><input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required /></label>
        <label className="field">
          <span>{t('birthPlace')}</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">{t('castQizheng')}</button>
        {error && <p className="error">{error}</p>}
        <p className="fine">{t('qizhengFine')}</p>
      </form>
      {bodies && sun && (
        <div className="chart-block" aria-live="polite">
          <Compass
            needle={sun.lon}
            center={<><strong>{word(`planet.sun`, lang)}</strong><span>{word(`sign.${sun.signId}`, lang)} {sun.deg}°</span></>}
            ticks={bodies.map((body) => ({
              angle: body.lon,
              label: word(`planet.${body.id}`, lang).slice(0, 2),
              active: body.id === 'sun' || body.id === 'moon',
              r: body.id === 'rahu' || body.id === 'ketu' || body.id === 'lilith' || body.id === 'ziqi' ? 78 : 116,
            }))}
          />
          <ul className="placements">
            {bodies.map((body) => (
              <li key={body.id}><span>{word(`planet.${body.id}`, lang)}</span>{word(`sign.${body.signId}`, lang)} {body.deg}°</li>
            ))}
          </ul>
          <p>{t('mansion')} {mansion}</p>
          {question.trim() && <p className="asked">{t('asked')}「{question.trim()}」</p>}
        </div>
      )}
    </RitualFrame>
  )
}

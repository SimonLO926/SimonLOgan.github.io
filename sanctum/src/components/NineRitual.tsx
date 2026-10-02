import { useState } from 'react'
import { useI18n } from '../i18n'
import { NINE_DIR, nineMonthStar, nineYearStar } from '../lib/almanac'
import { parseDate } from '../lib/civil'
import { MONTH_BRANCHES, monthBranchFromSun, sunLongitude } from '../lib/sky'
import { civilToUtc } from '../lib/civil'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { Compass } from './Compass'
import { RitualFrame } from './Chrome'

const STAR = ['', '一白', '二黑', '三碧', '四綠', '五黃', '六白', '七赤', '八白', '九紫']
const ANGLE = [0, 0, 225, 90, 135, 0, 315, 270, 45, 180]

export function NineRitual({
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
  const [date, setDate] = useState('1990-08-16')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ year: number; month: number } | null>(null)

  const cast = () => {
    const civil = parseDate(date)
    if (!civil) {
      setError(t('needDate'))
      return
    }
    const clock = { ...civil, hour: 12, minute: 0 }
    const year = civil.month < 2 || (civil.month === 2 && sunLongitude(civilToUtc(clock, 480)) < 315) ? civil.year - 1 : civil.year
    const yearStar = nineYearStar(year)
    const monthName = MONTH_BRANCHES[monthBranchFromSun(sunLongitude(civilToUtc(clock, 480)))]
    const monthFromYin = MONTH_BRANCHES.indexOf(monthName)
    const month = nineMonthStar(yearStar, monthFromYin)
    setResult({ year: yearStar, month })
    setError('')
    if (sound) tick()
    onRecord(STAR[yearStar], STAR[month])
  }

  const label = (n: number) => (lang === 'zh-Hans' ? STAR[n].replace('綠', '绿').replace('黃', '黄') : STAR[n])

  return (
    <RitualFrame id="nine" wide onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); cast() }}>
        <label className="field"><span>{t('birthDate')}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <button className="btn solid" type="submit">{t('castNine')}</button>
        {error && <p className="error">{error}</p>}
      </form>
      {result && (
        <div className="chart-block" aria-live="polite">
          <Compass
            caption={t('northUp')}
            needle={ANGLE[result.year]}
            center={<><strong>{label(result.year)}</strong><span>{t('honmei')}</span></>}
            ticks={[1, 2, 3, 4, 6, 7, 8, 9].map((n) => ({ angle: ANGLE[n], label: label(n), active: n === result.year || n === result.month }))}
          />
          <ul className="placements">
            <li><span>{t('honmei')}</span>{label(result.year)} · {NINE_DIR[result.year]}</li>
            <li><span>{t('monthStar')}</span>{label(result.month)} · {NINE_DIR[result.month]}</li>
          </ul>
        </div>
      )}
    </RitualFrame>
  )
}

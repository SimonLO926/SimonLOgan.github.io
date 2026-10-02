import { useState } from 'react'
import { useI18n, word } from '../i18n'
import { toHans } from '../i18n/hans'
import { clashAnimal, dayBranches, jianchuIndex, JIANCHU, lunarParts, mansionOf, rokuyoIndex, ROKUYO } from '../lib/almanac'
import { parseDate, taipeiNow } from '../lib/civil'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { moonLongitude } from '../lib/sky'
import { pulseScene, sceneBus } from '../scene/store'
import { BRANCH_ANGLE, Compass } from './Compass'
import { RitualFrame } from './Chrome'

const FIT: Record<number, [string, string]> = {
  0: ['開創、立約', '安葬、遠行'],
  1: ['清潔、求醫', '嫁娶、開業'],
  2: ['祭祀、入宅', '訴訟、遠行'],
  3: ['修造、會友', '訴訟'],
  4: ['簽約、開市', '出行、動土'],
  5: ['捕捉、求財', '開業、嫁娶'],
  6: ['破土、求醫', '嫁娶、開業'],
  7: ['祭祀、安床', '登山、遠行'],
  8: ['開業、嫁娶', '訴訟'],
  9: ['收納、入庫', '開業、遠行'],
  10: ['開業、出行', '安葬'],
  11: ['修補、靜養', '開業、嫁娶'],
}

export function AlmanacRitual({
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
  const [date, setDate] = useState('')
  const [view, setView] = useState<null | {
    duty: number
    roku: number
    clash: string
    branch: string
    mansion: string
    group: string
  }>(null)

  const show = (value: string) => (lang === 'zh-Hans' ? toHans(value) : value)

  const cast = (today: boolean) => {
    const parsed = today || !date ? null : parseDate(date)
    const civil = parsed ? { ...parsed, hour: 12, minute: 0 } : { ...taipeiNow(), hour: 12, minute: 0 }
    const branches = dayBranches(civil, 480)
    const lunar = lunarParts(civil)
    const roku = rokuyoIndex(lunar.month, lunar.day)
    const duty = jianchuIndex(branches.monthBranch, branches.dayBranch)
    const dateUtc = new Date(Date.UTC(civil.year, civil.month - 1, civil.day, 4, 0))
    const mansion = mansionOf(moonLongitude(dateUtc))
    const branch = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][branches.dayBranch]
    sceneBus.needle = (BRANCH_ANGLE[branch] * Math.PI) / 180
    pulseScene()
    setView({ duty, roku, clash: clashAnimal(branches.dayBranch), branch, mansion: mansion.name, group: mansion.group })
    if (sound) tick()
    onRecord(ROKUYO[roku], JIANCHU[duty])
  }

  return (
    <RitualFrame id="almanac" wide onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); cast(false) }}>
        <label className="field"><span>{t('birthDate')}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <div className="hero-actions">
          <button className="btn solid" type="submit">{t('castAlmanac')}</button>
          <button className="btn" type="button" onClick={() => cast(true)}>{t('almanacToday')}</button>
        </div>
      </form>
      {view && (
        <div className="chart-block" aria-live="polite">
          <Compass
            caption={t('northUp')}
            needle={BRANCH_ANGLE[view.branch]}
            center={<><strong>{show(ROKUYO[view.roku])}</strong><span>{t('rokuyo')}</span></>}
            ticks={Object.entries(BRANCH_ANGLE).map(([label, angle]) => ({ angle, label, active: label === view.branch }))}
          />
          <ul className="placements">
            <li><span>{t('rokuyo')}</span>{show(ROKUYO[view.roku])}</li>
            <li><span>{t('duty')}</span>{show(JIANCHU[view.duty])}</li>
            <li><span>{t('clash')}</span>{word(`animal.${view.clash}`, lang)}</li>
            <li><span>{t('mansion')}</span>{show(view.mansion)} · {show(view.group)}</li>
            <li><span>{t('yi')}</span>{show(FIT[view.duty][0])}</li>
            <li><span>{t('ji')}</span>{show(FIT[view.duty][1])}</li>
          </ul>
        </div>
      )}
    </RitualFrame>
  )
}

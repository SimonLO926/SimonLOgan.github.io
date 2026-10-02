import { useState } from 'react'
import { useI18n } from '../i18n'
import { toHans } from '../i18n/hans'
import { mansionOf } from '../lib/almanac'
import { taipeiNow } from '../lib/civil'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { moonLongitude } from '../lib/sky'
import { pulseScene, sceneBus } from '../scene/store'
import { Compass } from './Compass'
import { RitualFrame } from './Chrome'

const GROUP: Record<string, Record<string, string>> = {
  蒼龍: { 'zh-Hant': '東方蒼龍', 'zh-Hans': '东方苍龙', en: 'Azure Dragon, east', ja: '東方の蒼龍' },
  玄武: { 'zh-Hant': '北方玄武', 'zh-Hans': '北方玄武', en: 'Black Tortoise, north', ja: '北方の玄武' },
  白虎: { 'zh-Hant': '西方白虎', 'zh-Hans': '西方白虎', en: 'White Tiger, west', ja: '西方の白虎' },
  朱雀: { 'zh-Hant': '南方朱雀', 'zh-Hans': '南方朱雀', en: 'Vermilion Bird, south', ja: '南方の朱雀' },
}

export function MansionRitual({
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
  const [when, setWhen] = useState('')
  const [hit, setHit] = useState<ReturnType<typeof mansionOf> | null>(null)

  const cast = (useNow: boolean) => {
    const civil = useNow || !when ? taipeiNow() : fromLocal(when)
    const date = new Date(Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, civil.minute) - 480 * 60_000)
    const next = mansionOf(moonLongitude(date))
    sceneBus.sun = (next.index / 28) * 360
    pulseScene()
    setHit(next)
    if (sound) tick()
    onRecord(next.name, next.group)
  }

  const name = hit ? (lang === 'zh-Hans' ? toHans(hit.name) : hit.name) : ''

  return (
    <RitualFrame id="mansion" wide onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); cast(false) }}>
        <label className="field"><span>{t('birthClock')}</span><input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} /></label>
        <div className="hero-actions">
          <button className="btn solid" type="submit">{t('castMansion')}</button>
          <button className="btn" type="button" onClick={() => cast(true)}>{t('mansionNow')}</button>
        </div>
      </form>
      {hit && (
        <div className="chart-block" aria-live="polite">
          <Compass
            needle={(hit.index / 28) * 360}
            center={<><strong>{name}</strong><span>{GROUP[hit.group][lang]}</span></>}
            ticks={['角', '斗', '奎', '井'].map((label, index) => ({ angle: index * 90, label: lang === 'zh-Hans' ? toHans(label) : label, active: label === hit.name }))}
          />
          <p>{t('mansion')} {name} · {GROUP[hit.group][lang]}</p>
        </div>
      )}
    </RitualFrame>
  )
}

function fromLocal(value: string) {
  const [date, time] = value.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = (time ?? '12:00').split(':').map(Number)
  return { year, month, day, hour, minute }
}

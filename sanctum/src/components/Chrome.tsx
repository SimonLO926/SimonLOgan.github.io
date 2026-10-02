import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { DoorId } from '../data/doors'
import { doorById } from '../data/doors'
import { DOOR_COPY, useI18n } from '../i18n'
import type { Lang, ThemeChoice } from '../i18n/types'
import type { Tier } from '../lib/storage'

export function TopBar({
  view,
  tier,
  sound,
  onHome,
  onSound,
  onPatron,
}: {
  view: 'atlas' | DoorId
  tier: Tier
  sound: boolean
  onHome: () => void
  onSound: () => void
  onPatron: () => void
}) {
  const { lang, setLang, theme, setTheme, t } = useI18n()
  const door = view === 'atlas' ? null : doorById(view)
  const copy = door ? DOOR_COPY[door.id][lang] : null
  const tierLabel = tier === 'master' ? t('tierMaster') : tier === 'patron' ? t('tierPatron') : t('tierGuest')
  const cycleTheme = () => {
    const order: ThemeChoice[] = ['system', 'dark', 'light']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }
  const themeLabel = theme === 'dark' ? t('themeDark') : theme === 'light' ? t('themeLight') : t('themeSystem')
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={onHome}>{t('brand')}</button>
      <p className="top-meta">{copy ? `${door?.index} ${copy.name}` : t('doorsMeta')}</p>
      <div className="top-actions">
        <select className="icon-select" aria-label="language" value={lang} onChange={(event) => setLang(event.target.value as Lang)}>
          <option value="zh-Hant">繁</option>
          <option value="zh-Hans">简</option>
          <option value="en">EN</option>
          <option value="ja">日</option>
        </select>
        <button type="button" className="icon-btn" onClick={cycleTheme}>{themeLabel}</button>
        <button type="button" className="icon-btn" onClick={onSound} aria-pressed={sound}>
          {sound ? t('soundOn') : t('soundOff')}
        </button>
        <button type="button" className="icon-btn gold" onClick={onPatron}>{tierLabel}</button>
      </div>
    </header>
  )
}

export function RitualFrame({
  id,
  wide,
  onBack,
  children,
}: {
  id: DoorId
  wide?: boolean
  onBack: () => void
  children: ReactNode
}) {
  const { lang, t } = useI18n()
  const door = doorById(id)
  const copy = DOOR_COPY[door.id][lang]
  return (
    <section className={wide ? 'ritual wide' : 'ritual'}>
      <div className="ritual-copy">
        <button type="button" className="text-btn" onClick={onBack}>{t('back')}</button>
        <p className="eyebrow">{door.index} {copy.place}</p>
        <h2>{copy.name}</h2>
        <p className="lede">{copy.line}</p>
      </div>
      <div className="panel" style={{ '--accent': door.accent } as React.CSSProperties}>
        {children}
      </div>
    </section>
  )
}

export function QuestionField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n()
  return (
    <label className="field">
      <span>{t('ask')}</span>
      <textarea value={value} maxLength={80} rows={2} placeholder={t('askPh')} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function Veil({ locked, onOpen, children }: { locked: boolean; onOpen: () => void; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className={locked ? 'veil locked' : 'veil'}>
      <div className="veil-body" aria-hidden={locked}>{children}</div>
      {locked && (
        <button type="button" className="veil-lock" onClick={onOpen}>
          <span>{t('veil')}</span>
          <small>{t('veilHint')}</small>
        </button>
      )}
    </div>
  )
}

export function PatronSheet({
  tier,
  onClose,
  onChoose,
}: {
  tier: Tier
  onClose: () => void
  onChoose: (tier: Tier) => void
}) {
  const { t } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  const tiers = [
    { id: 'guest' as const, name: t('nameGuest'), price: t('priceFree'), note: t('tierNoteGuest'), points: [t('pointG1'), t('pointG2'), t('pointG3')] },
    { id: 'patron' as const, name: t('namePatron'), price: '360', note: t('tierNotePatron'), points: [t('pointP1'), t('pointP2'), t('pointP3')] },
    { id: 'master' as const, name: t('nameMaster'), price: '3,600', note: t('tierNoteMaster'), points: [t('pointM1'), t('pointM2'), t('pointM3')] },
  ]
  return (
    <div className="sheet-back" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <p className="eyebrow">{t('tierEyebrow')}</p>
          <h3 id="sheet-title">{t('tierTitle')}</h3>
          <button ref={closeRef} type="button" className="text-btn" onClick={onClose}>{t('close')}</button>
        </div>
        <div className="tier-grid">
          {tiers.map((item) => (
            <article key={item.id} className={item.id === 'patron' ? 'tier featured' : 'tier'}>
              <p className="eyebrow">{item.note}</p>
              <h4>{item.name}</h4>
              <p className={item.id === 'guest' ? 'price word' : 'price'}>{item.id === 'guest' ? item.price : <><span>NT$</span> {item.price}</>}</p>
              <ul>
                {item.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <button type="button" className={tier === item.id ? 'btn solid' : 'btn'} onClick={() => onChoose(item.id)}>
                {tier === item.id ? t('tierNow') : item.id === 'guest' ? t('tierStay') : t('tierOpen')}
              </button>
            </article>
          ))}
        </div>
        <p className="fine">{t('tierFine')}</p>
      </div>
    </div>
  )
}

export function opened(tier: Tier) {
  return tier !== 'guest'
}

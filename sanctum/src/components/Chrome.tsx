import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { DoorId } from '../data/doors'
import { doorById } from '../data/doors'
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
  const door = view === 'atlas' ? null : doorById(view)
  const tierLabel = tier === 'master' ? '宗師' : tier === 'patron' ? '檀越' : '典藏'
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={onHome}>承問</button>
      <p className="top-meta">{door ? `${door.index} ${door.name}` : '七門'}</p>
      <div className="top-actions">
        <button type="button" className="icon-btn" onClick={onSound} aria-pressed={sound}>
          {sound ? '聲' : '靜'}
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
  const door = doorById(id)
  return (
    <section className={wide ? 'ritual wide' : 'ritual'}>
      <div className="ritual-copy">
        <button type="button" className="text-btn" onClick={onBack}>回殿</button>
        <p className="eyebrow">{door.index} {door.place} · {door.en}</p>
        <h2>{door.name}</h2>
        <p className="lede">{door.line}</p>
      </div>
      <div className="panel" style={{ '--accent': door.accent } as React.CSSProperties}>
        {children}
      </div>
    </section>
  )
}

export function QuestionField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>所問</span>
      <textarea value={value} maxLength={80} rows={2} placeholder="一件具體的事。可以留白。" onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function Veil({ locked, onOpen, children }: { locked: boolean; onOpen: () => void; children: ReactNode }) {
  return (
    <div className={locked ? 'veil locked' : 'veil'}>
      <div className="veil-body" aria-hidden={locked}>{children}</div>
      {locked && (
        <button type="button" className="veil-lock" onClick={onOpen}>
          <span>典藏批註</span>
          <small>開匣後展開</small>
        </button>
      )}
    </div>
  )
}

const TIERS: { id: Tier; name: string; price: string; note: string; points: string[] }[] = [
  { id: 'guest', name: '清供', price: '免費', note: '每一次', points: ['籤詩與御神籤全文', '一張神諭', '星盤、四柱、十二宮'] },
  { id: 'patron', name: '檀越', price: '360', note: '此裝置', points: ['典藏批註', '三牌之陣', '用神、流年、生氣方'] },
  { id: 'master', name: '宗師', price: '3,600', note: '此裝置 · 可付印', points: ['檀越全部', '命盤可印成一紙', '更長的問史'] },
]

export function PatronSheet({
  tier,
  onClose,
  onChoose,
}: {
  tier: Tier
  onClose: () => void
  onChoose: (tier: Tier) => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  return (
    <div className="sheet-back" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <p className="eyebrow">禮金刻度</p>
          <h3 id="sheet-title">願意留下的人，看更裡一層。</h3>
          <button ref={closeRef} type="button" className="text-btn" onClick={onClose}>關閉</button>
        </div>
        <div className="tier-grid">
          {TIERS.map((item) => (
            <article key={item.id} className={item.id === 'patron' ? 'tier featured' : 'tier'}>
              <p className="eyebrow">{item.note}</p>
              <h4>{item.name}</h4>
              <p className={item.price === '免費' ? 'price word' : 'price'}>{item.price === '免費' ? item.price : <><span>NT$</span> {item.price}</>}</p>
              <ul>
                {item.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <button type="button" className={tier === item.id ? 'btn solid' : 'btn'} onClick={() => onChoose(item.id)}>
                {tier === item.id ? '現在這層' : item.id === 'guest' ? '留在清供' : '以禮開匣'}
              </button>
            </article>
          ))}
        </div>
        <p className="fine">價格是這座殿的禮金刻度。現在開匣只記在這臺裝置上，不會向你收款。</p>
      </div>
    </div>
  )
}

export function opened(tier: Tier) {
  return tier !== 'guest'
}

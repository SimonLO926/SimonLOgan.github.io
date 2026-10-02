import { useEffect } from 'react'
import { DOORS, type Preview } from '../data/doors'
import type { HistoryItem } from '../lib/storage'
import type { TodayMark } from '../lib/today'

export function Atlas({
  today,
  history,
  onOpen,
  onPreview,
  onPatron,
}: {
  today: TodayMark
  history: HistoryItem[]
  onOpen: (id: (typeof DOORS)[number]['id']) => void
  onPreview: (preview: Preview) => void
  onPatron: () => void
}) {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-preview]')
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const preview = best?.target.getAttribute('data-preview')
        if (preview) onPreview(preview as Preview)
      },
      { rootMargin: '-35% 0px -40% 0px', threshold: [0.25, 0.6] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [onPreview])

  return (
    <div className="atlas">
      <section className="hero" data-preview="hall">
        <p className="eyebrow">{today.pillar}{today.animal} · {today.lunar ? `農曆${today.lunar}` : '臺北此刻'}</p>
        <h1>把問題<br />放到燈下。</h1>
        <p className="lede">中國靈籤、神社御神籤、西洋神諭。星座用星曆，八字用節氣，紫微排十二宮，風水看命卦與今年的飛星。</p>
        <p className="now">此刻太陽在{today.sun}</p>
        <div className="hero-actions">
          <button type="button" className="btn solid" onClick={() => onOpen('sticks')}>搖一支籤</button>
          <button type="button" className="btn" onClick={() => document.getElementById('doors')?.scrollIntoView({ behavior: 'smooth' })}>先看七門</button>
        </div>
        <div className="scrollcue" aria-hidden="true"><span>下</span></div>
      </section>

      <section className="doors" id="doors" aria-label="七門">
        {DOORS.map((door) => (
          <button
            key={door.id}
            type="button"
            className="door"
            id={door.id}
            data-preview={door.id}
            onMouseEnter={() => onPreview(door.id)}
            onFocus={() => onPreview(door.id)}
            onClick={() => onOpen(door.id)}
          >
            <span className="idx">{door.index}</span>
            <span className="door-copy">
              <small>{door.place} · {door.en}</small>
              <strong>{door.name}</strong>
              <em>{door.line}</em>
            </span>
            </button>
        ))}
      </section>

      <section className="member" data-preview="hall">
        <p className="eyebrow">典藏</p>
        <h2>看完籤詩的人，<br />還想看批註。</h2>
        <p className="lede">清供已經能搖、能翻、能起盤。檀越打開每道門裡那層不對外人喧譁的話。</p>
        <button type="button" className="btn solid" onClick={onPatron}>看禮金刻度</button>
        {history.length > 0 && (
          <div className="history">
            <p className="eyebrow">近日所問</p>
            <ul>
              {history.map((item) => (
                <li key={item.at}>
                  <button type="button" onClick={() => onOpen(item.door)}>
                    <span>{item.title}</span>
                    <small>{item.note}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <footer className="colophon">
        <p>文化儀式與自我觀照。不是醫療、法律或投資建議。</p>
        <p>星曆 Astronomy Engine · 紫微排盤 iztro · 八字以節氣換柱，子正換日。</p>
      </footer>
    </div>
  )
}

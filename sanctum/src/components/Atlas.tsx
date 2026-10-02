import { useEffect } from 'react'
import { DOORS, type Preview } from '../data/doors'
import { DOOR_COPY, useI18n, word } from '../i18n'
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
  const { lang, t } = useI18n()
  const title = t('heroTitle').split('\n')
  const member = t('memberTitle').split('\n')
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
        <p className="eyebrow">{today.pillar} · {word(`animal.${today.animal}`, lang)}{lang === 'en' || lang === 'ja' ? '' : today.lunar ? ` · ${t('heroLunar')} ${today.lunar}` : ''}</p>
        <h1>{title[0]}<br />{title[1]}</h1>
        <p className="lede">{t('heroLede')}</p>
        <p className="now">{t('heroSun')} {word(`sign.${today.signId}`, lang)} {today.sunDeg}°</p>
        <div className="hero-actions">
          <button type="button" className="btn solid" onClick={() => onOpen('sticks')}>{t('heroDraw')}</button>
          <button type="button" className="btn" onClick={() => document.getElementById('doors')?.scrollIntoView({ behavior: 'smooth' })}>{t('heroDoors')}</button>
        </div>
        <div className="scrollcue" aria-hidden="true"><span>↓</span></div>
      </section>

      <section className="doors" id="doors" aria-label={t('doorsMeta')}>
        {DOORS.map((door) => {
          const copy = DOOR_COPY[door.id][lang]
          return (
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
              <small>{copy.place}</small>
              <strong>{copy.name}</strong>
              <em>{copy.line}</em>
            </span>
            </button>
          )
        })}
      </section>

      <section className="member" data-preview="hall">
        <p className="eyebrow">{t('memberEyebrow')}</p>
        <h2>{member[0]}<br />{member[1]}</h2>
        <p className="lede">{t('memberLede')}</p>
        <button type="button" className="btn solid" onClick={onPatron}>{t('memberBtn')}</button>
        {history.length > 0 && (
          <div className="history">
            <p className="eyebrow">{t('history')}</p>
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
        <p>{t('colophon1')}</p>
        <p>{t('colophon2')}</p>
      </footer>
    </div>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { ANSWER_COUNT, answers } from '@/data/answers'
import { AnswerText } from '@/components/AnswerText'
import { Button } from '@/components/ui/button'
import type { Copy, Lang } from '@/lib/copy'
import { padPage } from '@/lib/format'

export function SlipStage({
  page,
  lang,
  copy,
  onDraw,
}: {
  page: number | null
  lang: Lang
  copy: Copy
  onDraw: () => void
}) {
  const text = page === null ? '' : answers[page]?.[lang] ?? ''

  return (
    <div className="slip-stage">
      <p className="kicker">{copy.slipHint}</p>
      <button type="button" className="stack" onClick={onDraw} aria-label={copy.draw}>
        <i />
        <i />
        <i />
      </button>
      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {page === null || !text ? (
            <motion.p
              key="idle"
              className={`idle ${lang === 'en' ? 'en' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {copy.slipIdle}
            </motion.p>
          ) : (
            <motion.article
              key={page}
              className="slip"
              initial={{ y: 40, rotate: -2.5, opacity: 0 }}
              animate={{ y: 0, rotate: -0.35, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <div className="running">{copy.running}</div>
              <AnswerText text={text} lang={lang} />
              <div className="face-foot">
                <span>{padPage(page)}</span>
                <i className="seal stamp" aria-hidden>
                  答
                </i>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
      {page !== null && (
        <p className="meta">
          {copy.pageLabel(page + 1)} · {copy.ofCount(ANSWER_COUNT)}
        </p>
      )}
      <Button type="button" className="pill-btn" onClick={onDraw}>
        {page === null ? copy.draw : copy.redraw}
      </Button>
    </div>
  )
}

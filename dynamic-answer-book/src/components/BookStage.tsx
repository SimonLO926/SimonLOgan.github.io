import { useEffect, useRef, useState } from 'react'
import type { AnimationEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ANSWER_COUNT, answers } from '@/data/answers'
import { AnswerText } from '@/components/AnswerText'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Copy, Lang } from '@/lib/copy'
import { padPage, prefersReducedMotion } from '@/lib/format'
import { playRustle } from '@/lib/sound'

type Dir = 'forward' | 'back'
type Flip = {
  phase: 'riffle' | 'turn'
  id: number
  dir: Dir
  from: number
  to: number
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
}

function rightIndex(shown: number, flip: Flip | null, page: number) {
  if (!flip) return shown >= 0 ? shown : page
  if (flip.phase === 'riffle') return flip.from >= 0 ? flip.from : flip.to
  if (flip.dir === 'forward') return flip.to
  return flip.from >= 0 ? flip.from : flip.to
}

function PaperAnswer({ index, lang, copy }: { index: number; lang: Lang; copy: Copy }) {
  const text = answers[index]?.[lang] ?? ''
  return (
    <div className="face-inner">
      <div className="running">{copy.running}</div>
      <AnswerText text={text} lang={lang} />
      <div className="face-foot">
        <span>{padPage(index)}</span>
      </div>
    </div>
  )
}

function BlankSheet() {
  return (
    <div className="face-inner">
      <div className="running"> </div>
    </div>
  )
}

function Ghost() {
  return <div className="ghost-num" />
}

function Verso({
  index,
  lang,
  question,
  copy,
}: {
  index: number
  lang: Lang
  question: string
  copy: Copy
}) {
  const line = question.trim()
  const quiet = copy.quiet[Math.abs(index) % copy.quiet.length] ?? copy.quiet[0]
  return (
    <div className="verso">
      <div className="running">{copy.runningQ}</div>
      <div className={`whisper ${lang === 'en' ? 'en' : ''}`}>
        {line ? (
          <>
            <span className="q-kicker">{copy.heard}</span>
            {lang === 'zh' ? `「${line}」` : `“${line}”`}
          </>
        ) : (
          quiet
        )}
      </div>
      <div className="face-foot">
        <span>{padPage(Math.max(index, 0))}</span>
      </div>
    </div>
  )
}

function Spread({
  page,
  lang,
  question,
  sound,
  copy,
  onBusy,
  onPrev,
  onNext,
}: {
  page: number
  lang: Lang
  question: string
  sound: boolean
  copy: Copy
  onBusy: (busy: boolean) => void
  onPrev: () => void
  onNext: () => void
}) {
  const reduceAtStart = prefersReducedMotion()
  const [shown, setShown] = useState(page)
  const [flip, setFlip] = useState<Flip | null>(() =>
    reduceAtStart ? null : { phase: 'turn', id: 1, dir: 'forward', from: -1, to: page },
  )
  const shownRef = useRef(reduceAtStart ? page : -1)
  const pending = useRef(page)
  const soundRef = useRef(sound)
  const resolver = useRef<(() => void) | null>(null)
  const phaseRef = useRef<'riffle' | 'turn' | null>(reduceAtStart ? null : 'turn')
  const idRef = useRef(1)
  const waiters = useRef<Array<() => void>>([])
  const signalRef = useRef<(kind: 'riffle' | 'turn') => void>(() => {})
  const tiltRef = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  useEffect(() => {
    onBusy(flip !== null)
  }, [flip, onBusy])

  useEffect(() => () => onBusy(false), [onBusy])

  useEffect(() => {
    pending.current = page
    waiters.current.splice(0).forEach((wake) => wake())
  }, [page])

  useEffect(() => {
    let dead = false
    let finishNow: (() => void) | null = null
    const queue = waiters.current
    if (shownRef.current < 0 && soundRef.current) playRustle(false)

    const signal = (kind: 'riffle' | 'turn') => {
      if (phaseRef.current !== kind) return
      resolver.current?.()
    }
    signalRef.current = signal

    const waitChange = () =>
      new Promise<void>((resolve) => {
        if (dead || pending.current !== shownRef.current) {
          resolve()
          return
        }
        waiters.current.push(resolve)
      })

    const arm = (ms: number) =>
      new Promise<void>((resolve) => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          window.clearTimeout(timer)
          if (resolver.current === finish) resolver.current = null
          resolve()
        }
        finishNow = finish
        resolver.current = finish
        const timer = window.setTimeout(finish, ms)
      })

    const animate = async (from: number, to: number) => {
      if (from === to || prefersReducedMotion()) {
        setFlip(null)
        phaseRef.current = null
        return
      }
      const far = from >= 0 && Math.abs(to - from) > 1
      const dir: Dir = !far && to < from ? 'back' : 'forward'
      if (far) {
        phaseRef.current = 'riffle'
        setFlip({ phase: 'riffle', id: ++idRef.current, dir: 'forward', from, to })
        if (soundRef.current) playRustle(true)
        await arm(1100)
        if (dead) return
      }
      phaseRef.current = 'turn'
      setFlip((current) => {
        if (
          current &&
          current.phase === 'turn' &&
          current.from === from &&
          current.to === to &&
          current.dir === dir
        ) {
          return current
        }
        return { phase: 'turn', id: ++idRef.current, dir, from, to }
      })
      if (soundRef.current) playRustle(false)
      await arm(1300)
    }

    void (async () => {
      while (!dead) {
        if (pending.current === shownRef.current) {
          await waitChange()
          continue
        }
        const target = pending.current
        const from = shownRef.current
        await animate(from, target)
        if (dead) return
        shownRef.current = target
        setShown(target)
        setFlip(null)
        phaseRef.current = null
      }
    })()

    return () => {
      dead = true
      finishNow?.()
      queue.splice(0).forEach((wake) => wake())
    }
  }, [])

  function onLeafEnd(event: AnimationEvent<HTMLDivElement>, kind: 'riffle' | 'turn') {
    if (event.target !== event.currentTarget) return
    const name = event.animationName
    if (kind === 'turn' && !name.startsWith('turn')) return
    if (kind === 'riffle' && name !== 'riffle-forward') return
    signalRef.current(kind)
  }

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = tiltRef.current
    if (!el) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--ry', `${-7 + px * 12}deg`)
    el.style.setProperty('--rx', `${5 - py * 8}deg`)
  }

  const visible = rightIndex(shown, flip, page)
  const settled = flip === null

  return (
    <div className="scene" onMouseMove={onMove}>
      <div className="tilt" ref={tiltRef}>
        <div
          className="spread"
          onTouchStart={(event) => {
            touchX.current = event.changedTouches[0]?.clientX ?? null
          }}
          onTouchEnd={(event) => {
            if (touchX.current === null || flip) return
            const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current
            touchX.current = null
            if (dx > 48) onPrev()
            if (dx < -48) onNext()
          }}
        >
          <div
            className="page left"
            onClick={() => {
              if (!flip) onPrev()
            }}
          >
            <Verso index={settled ? shown : visible} lang={lang} question={question} copy={copy} />
          </div>
          <div
            className="page right"
            onClick={() => {
              if (!flip) onNext()
            }}
          >
            {settled ? (
              <div className="face-inner">
                <div className="running">{copy.running}</div>
                <AnswerText text={answers[visible]?.[lang] ?? ''} lang={lang} />
                <div className="face-foot">
                  <span>{padPage(visible)}</span>
                  <i className="seal stamp" key={visible} aria-hidden>
                    答
                  </i>
                </div>
              </div>
            ) : (
              <PaperAnswer index={visible} lang={lang} copy={copy} />
            )}
            <p className="sr-only" aria-live="polite">
              {settled ? `${copy.pageLabel(visible + 1)}. ${answers[visible]?.[lang] ?? ''}` : ''}
            </p>
          </div>
          <div className="spine" />
          <div className="edge left" />
          <div className="edge right" />
          {flip?.phase === 'riffle' &&
            [0, 1, 2, 3].map((i) => (
              <div
                key={`${flip.id}-g-${i}`}
                className="leaf forward ghost"
                style={{ animationDelay: `${i * 80}ms`, zIndex: 10 - i }}
                onAnimationEnd={i === 3 ? (event) => onLeafEnd(event, 'riffle') : undefined}
              >
                <div className="face front">
                  <Ghost />
                </div>
                <div className="face back">
                  <Ghost />
                </div>
              </div>
            ))}
          {flip?.phase === 'turn' && (
            <div
              key={flip.id}
              className={`leaf turn ${flip.dir === 'forward' ? 'forward' : 'backdir'}`}
              onAnimationEnd={(event) => onLeafEnd(event, 'turn')}
            >
              <div className="face front">
                {flip.dir === 'forward' && flip.from >= 0 ? (
                  <PaperAnswer index={flip.from} lang={lang} copy={copy} />
                ) : (
                  <BlankSheet />
                )}
              </div>
              <div className="face back">
                {flip.dir === 'back' ? (
                  <PaperAnswer index={flip.to} lang={lang} copy={copy} />
                ) : (
                  <BlankSheet />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BookStage({
  open,
  page,
  lang,
  question,
  setQuestion,
  sound,
  copy,
  onOpen,
  onClose,
  onPrev,
  onNext,
  onSeek,
}: {
  open: boolean
  page: number | null
  lang: Lang
  question: string
  setQuestion: (value: string) => void
  sound: boolean
  copy: Copy
  onOpen: () => void
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: () => void
}) {
  const [busy, setBusy] = useState(false)
  const tiltRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (!open || page === null) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
      } else if (event.key === ' ') {
        event.preventDefault()
        onSeek()
      } else if (event.key === 'Escape') {
        if (document.querySelector('[data-slot="dialog-content"]')) return
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, page, onOpen, onClose, onPrev, onNext, onSeek])

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = tiltRef.current
    if (!el) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--ry', `${-8 + px * 10}deg`)
    el.style.setProperty('--rx', `${6 - py * 6}deg`)
  }

  return (
    <div className="spread-wrap">
      <AnimatePresence mode="wait">
        {open && page !== null ? (
          <Spread
            key="open"
            page={page}
            lang={lang}
            question={question}
            sound={sound}
            copy={copy}
            onBusy={setBusy}
            onPrev={onPrev}
            onNext={onNext}
          />
        ) : (
          <motion.div
            key="closed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="scene" onMouseMove={onMove}>
              <div className="tilt" ref={tiltRef}>
                <button
                  type="button"
                  className="cover"
                  onClick={onOpen}
                  aria-label={`${copy.mark}. ${copy.open}`}
                >
                  <span className="cover-frame" />
                  <span className="ribbon" />
                  <span className="cover-inner">
                    <span className="cover-kicker">{copy.coverKicker}</span>
                    <span className="vtitle foil" aria-hidden>
                      <span>答</span>
                      <span>案</span>
                      <span>之</span>
                      <span>書</span>
                    </span>
                    <span className="seal cover-seal">答</span>
                    <span className="cover-sub">{copy.coverSub}</span>
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="ground" />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (open) onSeek()
          else onOpen()
        }}
      >
        <div className="ask-row">
          <label className="sr-only" htmlFor="book-q">
            {copy.questionPh}
          </label>
          <Input
            id="book-q"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.questionPh}
            className="q-input"
            autoComplete="off"
            onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => event.stopPropagation()}
          />
        </div>
        <div className="controls">
          {open ? (
            <>
              <Button type="button" variant="outline" className="pill-btn" onClick={onPrev} disabled={busy}>
                {copy.prev}
              </Button>
              <Button type="submit" className="pill-btn" disabled={busy}>
                {copy.seek}
              </Button>
              <Button type="button" variant="outline" className="pill-btn" onClick={onNext} disabled={busy}>
                {copy.next}
              </Button>
              <Button type="button" variant="ghost" className="pill-btn" onClick={onClose}>
                {copy.close}
              </Button>
            </>
          ) : (
            <Button type="submit" className="pill-btn">
              {copy.open}
            </Button>
          )}
        </div>
      </form>
      {open && page !== null && (
        <p className="meta">
          {copy.pageLabel(page + 1)} · {copy.ofCount(ANSWER_COUNT)}
        </p>
      )}
    </div>
  )
}

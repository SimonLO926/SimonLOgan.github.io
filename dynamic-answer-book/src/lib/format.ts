import { ANSWER_COUNT } from '@/data/answers'
import type { Lang } from '@/lib/copy'

export function randomIndex(except: number | null) {
  if (ANSWER_COUNT <= 1) return 0
  let next = Math.floor(Math.random() * ANSWER_COUNT)
  if (except === null) return next
  while (next === except) next = Math.floor(Math.random() * ANSWER_COUNT)
  return next
}

export function padPage(index: number) {
  return String(index + 1).padStart(4, '0')
}

export function fitSize(text: string, lang: Lang) {
  const length = [...text].length
  if (lang === 'zh') {
    if (length <= 4) return 'clamp(2.5rem, 5.2vw, 4.2rem)'
    if (length <= 8) return 'clamp(1.9rem, 4.2vw, 3.2rem)'
    if (length <= 14) return 'clamp(1.45rem, 3vw, 2.25rem)'
    return 'clamp(1.15rem, 2.4vw, 1.7rem)'
  }
  if (length <= 16) return 'clamp(2.2rem, 4.6vw, 3.6rem)'
  if (length <= 38) return 'clamp(1.55rem, 3vw, 2.35rem)'
  return 'clamp(1.15rem, 2.3vw, 1.7rem)'
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

import { motion } from 'framer-motion'
import type { Lang } from '@/lib/copy'
import { fitSize } from '@/lib/format'

export function AnswerText({
  text,
  lang,
  animated = false,
  ink = 'paper',
}: {
  text: string
  lang: Lang
  animated?: boolean
  ink?: 'paper' | 'desk'
}) {
  const english = lang === 'en'
  const className = `answer ${english ? 'font-display en-answer' : 'font-serif'}`
  const style = { fontSize: fitSize(text, lang), color: ink === 'desk' ? 'var(--foreground)' : undefined }

  if (!animated) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    )
  }

  const chars = [...text]
  return (
    <p className={className} style={style} aria-label={text}>
      {chars.map((char, index) => (
        <motion.span
          key={`${text}-${index}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: Math.min(index, 26) * 0.026,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
    </p>
  )
}

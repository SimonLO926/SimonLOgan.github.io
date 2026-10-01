import { ANSWER_COUNT, answers } from '@/data/answers'
import { AnswerText } from '@/components/AnswerText'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Copy, Lang } from '@/lib/copy'

export function OracleStage({
  page,
  lang,
  question,
  setQuestion,
  copy,
  onAsk,
}: {
  page: number | null
  lang: Lang
  question: string
  setQuestion: (value: string) => void
  copy: Copy
  onAsk: () => void
}) {
  const text = page === null ? '' : answers[page]?.[lang] ?? ''

  return (
    <div className="oracle">
      <p className="kicker">{copy.oracleKicker}</p>
      <form
        className="oracle-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAsk()
        }}
      >
        <label className="sr-only" htmlFor="oracle-q">
          {copy.questionPh}
        </label>
        <Input
          id="oracle-q"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={copy.questionPh}
          className={`oracle-input${page === null ? '' : ' answered'}`}
          autoComplete="off"
          enterKeyHint="done"
        />
        <div className="oracle-stage" aria-live="polite">
          {page === null || !text ? (
            <p className={`idle ${lang === 'en' ? 'en' : ''}`}>{copy.oracleIdle}</p>
          ) : (
            <AnswerText key={`${page}-${lang}`} text={text} lang={lang} animated ink="desk" />
          )}
        </div>
        {page !== null && (
          <p className="meta">
            {copy.pageLabel(page + 1)} · {copy.ofCount(ANSWER_COUNT)}
          </p>
        )}
        <Button type="submit" className="pill-btn">
          {page === null ? copy.ask : copy.again}
        </Button>
      </form>
    </div>
  )
}

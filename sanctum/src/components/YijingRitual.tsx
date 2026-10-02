import { useState } from 'react'
import { useI18n } from '../i18n'
import { toHans } from '../i18n/hans'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { castYijing, type Line } from '../lib/yijing'
import { QuestionField, RitualFrame } from './Chrome'

const TRI_LINE: Record<string, Record<string, string>> = {
  qian: { 'zh-Hant': '天行，宜決。', 'zh-Hans': '天行，宜决。', en: 'Heaven moves: decide.', ja: '天は行く。決める。' },
  dui: { 'zh-Hant': '口舌，宜說清楚。', 'zh-Hans': '口舌，宜说清楚。', en: 'The lake speaks: say it clearly.', ja: '口は開く。はっきり言う。' },
  li: { 'zh-Hant': '附麗，宜看見。', 'zh-Hans': '附丽，宜看见。', en: 'Fire clings: make it visible.', ja: '火は付く。見えるように。' },
  zhen: { 'zh-Hant': '起動，宜先動一步。', 'zh-Hans': '起动，宜先动一步。', en: 'Thunder: take the first step.', ja: '雷は動く。一歩先に。' },
  xun: { 'zh-Hant': '漸入，宜細。', 'zh-Hans': '渐入，宜细。', en: 'Wind enters: be fine.', ja: '風は入る。細かく。' },
  kan: { 'zh-Hant': '險陷，宜熟路。', 'zh-Hans': '险陷，宜熟路。', en: 'Water is a risk: take the known road.', ja: '水は険。知った道を。' },
  gen: { 'zh-Hant': '止，宜邊界。', 'zh-Hans': '止，宜边界。', en: 'Mountain stops: keep a boundary.', ja: '山は止まる。境界を。' },
  kun: { 'zh-Hant': '承載，宜收。', 'zh-Hans': '承载，宜收。', en: 'Earth holds: gather in.', ja: '地は載せる。収める。' },
}

export function YijingRitual({
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
  const [question, setQuestion] = useState('')
  const [cast, setCast] = useState<ReturnType<typeof castYijing> | null>(null)

  const go = () => {
    const next = castYijing()
    setCast(next)
    if (sound) tick()
    onRecord(next.primary.hant, String(next.primary.no))
  }

  const name = (hant: string, en: string) => (lang === 'en' ? en : lang === 'zh-Hans' ? toHans(hant) : hant)

  return (
    <RitualFrame id="yijing" onBack={onBack}>
      <form onSubmit={(event) => { event.preventDefault(); go() }}>
        <QuestionField value={question} onChange={setQuestion} />
        <button className="btn solid" type="submit">{cast ? t('yiAgain') : t('castYi')}</button>
      </form>
      {cast && (
        <div className="chart-block" aria-live="polite">
          {question.trim() && <p className="asked">{t('asked')}「{question.trim()}」</p>}
          <div className="hex">
            {[...cast.lines].reverse().map((line, index) => <HexLine key={index} line={line} />)}
          </div>
          <p>{t('primary')} {cast.primary.no} · {name(cast.primary.hant, cast.primary.en)}</p>
          <p>{TRI_LINE[cast.primary.upper][lang]} {TRI_LINE[cast.primary.lower][lang]}</p>
          <p>{cast.moving.length ? `${t('changing')} ${cast.moving.join('、')}` : t('noChange')}</p>
          {cast.relating && <p>{t('relating')} {cast.relating.no} · {name(cast.relating.hant, cast.relating.en)}</p>}
        </div>
      )}
    </RitualFrame>
  )
}

function HexLine({ line }: { line: Line }) {
  return <i className={line.yang ? 'yao yang' : 'yao yin'} data-change={line.changing || undefined} />
}

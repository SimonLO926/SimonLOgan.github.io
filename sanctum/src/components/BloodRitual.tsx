import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n/types'
import { tick } from '../lib/sound'
import type { Tier } from '../lib/storage'
import { pulseScene } from '../scene/store'
import { RitualFrame } from './Chrome'

const TYPES = ['A', 'B', 'O', 'AB'] as const

const TEXT: Record<(typeof TYPES)[number], Record<Lang, string>> = {
  A: {
    'zh-Hant': '在意次序與別人的感受。適合把標準說出來，不適合用沉默表示不同意。',
    'zh-Hans': '在意次序与别人的感受。适合把标准说出来，不适合用沉默表示不同意。',
    en: 'You care about order and other people’s feelings. Say the standard. Silence is a poor way to disagree.',
    ja: '順序と人の気持ちを気にする。基準は言葉に。沈黙で反対を示さない。',
  },
  B: {
    'zh-Hant': '自己的節奏很清楚。成敗在你肯不肯把興趣收成一件能交給別人的事。',
    'zh-Hans': '自己的节奏很清楚。成败在你肯不肯把兴趣收成一件能交给别人的事。',
    en: 'Your own rhythm is clear. The work is turning an interest into something another person can use.',
    ja: '自分の節奏ははっきりしている。興味を、人に渡せるものに束ねられるか。',
  },
  O: {
    'zh-Hant': '目標感強。記得留一條退路，也留一個能反對你的人。',
    'zh-Hans': '目标感强。记得留一条退路，也留一个能反对你的人。',
    en: 'The aim is strong. Keep an exit, and one person who is allowed to disagree.',
    ja: '目標が強い。退路と、反対できる人を一人残す。',
  },
  AB: {
    'zh-Hant': '兩邊都看得見。決定本身比完美的決定更重要。',
    'zh-Hans': '两边都看得见。决定本身比完美的决定更重要。',
    en: 'You see both sides. Making the decision matters more than making the perfect one.',
    ja: '両方見える。完璧な決定より、決めること。',
  },
}

export function BloodRitual({
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
  const [type, setType] = useState<(typeof TYPES)[number] | null>(null)

  return (
    <RitualFrame id="blood" onBack={onBack}>
      <p>{t('bloodTitle')}</p>
      <div className="hero-actions">
        {TYPES.map((item) => (
          <button
            key={item}
            type="button"
            className={type === item ? 'btn solid' : 'btn'}
            onClick={() => {
              setType(item)
              pulseScene()
              if (sound) tick()
              onRecord(item, 'blood')
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {type && <p aria-live="polite">{TEXT[type][lang]}</p>}
      <p className="fine">{t('bloodFine')}</p>
    </RitualFrame>
  )
}

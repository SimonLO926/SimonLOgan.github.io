import { astro } from 'iztro'
import type { Civil } from './civil'
import { ziweiTimeIndex } from './ganzhi'

export type StarView = { name: string; brightness?: string; mutagen?: string }
export type PalaceView = {
  name: string
  stem: string
  branch: string
  isBody: boolean
  isOrigin: boolean
  major: StarView[]
  minor: StarView[]
  decadal: string
}
export type ZiweiChart = {
  lunarDate: string
  chineseDate: string
  time: string
  timeRange: string
  zodiac: string
  sign: string
  fiveElementsClass: string
  soul: string
  body: string
  palaces: PalaceView[]
  lifeStars: string
  yearly: string
  reading: string
  master: string
}

const STAR_LINE: Record<string, string> = {
  紫微: '紫微要的是位置與擔當，不是熱鬧。',
  天機: '天機思慮快，變化也快。先寫下來再決定。',
  太陽: '太陽照見別人容易，記得留一點光給自己。',
  武曲: '武曲主執行與財務。話宜短，數字宜清。',
  天同: '天同的福在鬆、在人。太趕會把福氣趕跑。',
  廉貞: '廉貞情與原則都濃。界線一模糊就內耗。',
  天府: '天府是庫。適合守成、調度、把資源放對地方。',
  太陰: '太陰夜裡的判斷往往比白天準。財走細水。',
  貪狼: '貪狼的慾望是才能，也是漏。要有一條主線。',
  巨門: '巨門口舌是門，也是鑰匙。話要說準，不要說滿。',
  天相: '天相多在兩人之間。輔佐是位置，不是消失。',
  天梁: '天梁能解難，不適合無謂的爭。原則比勝敗重要。',
  七殺: '七殺開疆。要有退路再衝，否則是耗。',
  破軍: '破軍先破後立。舊的不去，新的不進來。',
}

const OPPOSITE: Record<string, string> = {
  子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
  卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
}

export function castZiwei(civil: Civil, gender: '男' | '女', question = ''): ZiweiChart {
  const chart = astro.bySolar(
    `${civil.year}-${civil.month}-${civil.day}`,
    ziweiTimeIndex(civil.hour),
    gender,
    true,
    'zh-TW',
  )
  const palaces: PalaceView[] = chart.palaces.map((palace) => ({
    name: palace.name,
    stem: palace.heavenlyStem,
    branch: palace.earthlyBranch,
    isBody: palace.isBodyPalace,
    isOrigin: palace.isOriginalPalace,
    major: palace.majorStars.map(starView),
    minor: palace.minorStars.map(starView).slice(0, 4),
    decadal: `${palace.decadal.range[0]}–${palace.decadal.range[1]}`,
  }))
  const life = palaces.find((palace) => palace.name === '命宮') ?? palaces[0]
  const borrowed = life.major.length
    ? ''
    : palaces.find((palace) => palace.branch === OPPOSITE[life.branch])?.major.map((star) => star.name).join('、') ?? ''
  const lifeStars = life.major.length
    ? life.major.map(labelStar).join('、')
    : borrowed
      ? `無主星，借對宮${borrowed}`
      : '無主星'
  let yearly = ''
  try {
    const scope = chart.horoscope()
    const natal = chart.palaces[scope.yearly.index]
    yearly = `今年流年命宮落在本命${natal?.name ?? ''}（${scope.yearly.heavenlyStem}${scope.yearly.earthlyBranch}）。`
  } catch {
    yearly = ''
  }
  const blurbs = life.major
    .map((star) => STAR_LINE[star.name])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
  const asked = question.trim() ? `所問「${question.trim().slice(0, 48)}」。盤不回答字面，它讓你看見自己用什麼結構在問。` : ''
  const reading = `${asked}農曆${chart.lunarDate}，${chart.time}（${chart.timeRange}）。${chart.fiveElementsClass}，命主${chart.soul}，身主${chart.body}。命宮在${life.branch}，${lifeStars}。`
  const mutagen = [...life.major, ...life.minor].filter((star) => star.mutagen).map((star) => `${star.name}化${star.mutagen}`)
  const master = `${blurbs || '命宮的重點在宮位本身，以及三方會照來的星。'}${mutagen.length ? `命宮相關四化：${mutagen.join('、')}。` : ''}${yearly}`
  return {
    lunarDate: chart.lunarDate,
    chineseDate: chart.chineseDate,
    time: chart.time,
    timeRange: chart.timeRange,
    zodiac: chart.zodiac,
    sign: chart.sign,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    palaces,
    lifeStars,
    yearly,
    reading,
    master,
  }
}

function starView(star: { name: string; brightness?: string; mutagen?: string }): StarView {
  return {
    name: star.name,
    brightness: star.brightness || undefined,
    mutagen: star.mutagen || undefined,
  }
}

function labelStar(star: StarView): string {
  const bright = star.brightness ? `（${star.brightness}）` : ''
  const mutagen = star.mutagen ? `化${star.mutagen}` : ''
  return `${star.name}${bright}${mutagen}`
}

import { mod } from './civil'

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const
export const ELEMENTS = ['木', '火', '土', '金', '水'] as const

export type Stem = (typeof STEMS)[number]
export type Branch = (typeof BRANCHES)[number]
export type Element = (typeof ELEMENTS)[number]

const ELEMENT_BY_STEM: Element[] = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']
const YANG_STEM = [true, false, true, false, true, false, true, false, true, false]

export const NAYIN = [
  '海中金', '爐中火', '大林木', '路旁土', '劍鋒金', '山頭火', '澗下水', '城頭土', '白蠟金', '楊柳木',
  '泉中水', '屋上土', '霹靂火', '松柏木', '長流水', '砂中金', '山下火', '平地木', '壁上土', '金箔金',
  '佛燈火', '天河水', '大驛土', '釵釧金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const

/** Hidden stems: main qi, then middle, then residual. Weights are for a simple strength count. */
export const HIDDEN: Record<Branch, { stem: number; weight: number }[]> = {
  子: [{ stem: 9, weight: 1 }],
  丑: [{ stem: 5, weight: 1 }, { stem: 7, weight: 0.5 }, { stem: 9, weight: 0.3 }],
  寅: [{ stem: 0, weight: 1 }, { stem: 2, weight: 0.5 }, { stem: 4, weight: 0.3 }],
  卯: [{ stem: 1, weight: 1 }],
  辰: [{ stem: 4, weight: 1 }, { stem: 1, weight: 0.5 }, { stem: 9, weight: 0.3 }],
  巳: [{ stem: 2, weight: 1 }, { stem: 6, weight: 0.5 }, { stem: 4, weight: 0.3 }],
  午: [{ stem: 3, weight: 1 }, { stem: 5, weight: 0.5 }],
  未: [{ stem: 5, weight: 1 }, { stem: 3, weight: 0.5 }, { stem: 1, weight: 0.3 }],
  申: [{ stem: 6, weight: 1 }, { stem: 8, weight: 0.5 }, { stem: 4, weight: 0.3 }],
  酉: [{ stem: 7, weight: 1 }],
  戌: [{ stem: 4, weight: 1 }, { stem: 7, weight: 0.5 }, { stem: 3, weight: 0.3 }],
  亥: [{ stem: 8, weight: 1 }, { stem: 0, weight: 0.5 }],
}

export function elementOfStem(index: number): Element {
  return ELEMENT_BY_STEM[mod(index, 10)]
}

export function sexagenaryIndex(stem: number, branch: number): number {
  for (let i = 0; i < 60; i += 1) {
    if (i % 10 === mod(stem, 10) && i % 12 === mod(branch, 12)) return i
  }
  return 0
}

export function nayinOf(stem: number, branch: number): string {
  return NAYIN[Math.floor(sexagenaryIndex(stem, branch) / 2)]
}

export type Pillar = {
  stem: Stem
  branch: Branch
  stemIndex: number
  branchIndex: number
  nayin: string
  tenGod: string
  branchGod: string
}

export function makePillar(stemIndex: number, branchIndex: number, dayStem: number | null): Pillar {
  const stem = mod(stemIndex, 10)
  const branch = mod(branchIndex, 12)
  const main = HIDDEN[BRANCHES[branch]][0].stem
  return {
    stem: STEMS[stem],
    branch: BRANCHES[branch],
    stemIndex: stem,
    branchIndex: branch,
    nayin: nayinOf(stem, branch),
    tenGod: dayStem === null ? '日主' : tenGod(dayStem, stem),
    branchGod: dayStem === null ? '' : tenGod(dayStem, main),
  }
}

/** 十神 relative to the day stem. Same polarity is the "偏" side, except 比肩. */
export function tenGod(dayStem: number, otherStem: number): string {
  const day = mod(dayStem, 10)
  const other = mod(otherStem, 10)
  const samePolarity = YANG_STEM[day] === YANG_STEM[other]
  const dayElement = ELEMENT_BY_STEM[day]
  const otherElement = ELEMENT_BY_STEM[other]
  if (dayElement === otherElement) return samePolarity ? '比肩' : '劫財'
  if (produces(dayElement) === otherElement) return samePolarity ? '食神' : '傷官'
  if (controls(dayElement) === otherElement) return samePolarity ? '偏財' : '正財'
  if (controls(otherElement) === dayElement) return samePolarity ? '七殺' : '正官'
  return samePolarity ? '偏印' : '正印'
}

export function produces(element: Element): Element {
  const next: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  return next[element]
}

export function controls(element: Element): Element {
  const next: Record<Element, Element> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }
  return next[element]
}

export function producerOf(element: Element): Element {
  const next: Record<Element, Element> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }
  return next[element]
}

export function controllerOf(element: Element): Element {
  const next: Record<Element, Element> = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' }
  return next[element]
}

/**
 * Day pillar. Gregorian 2000-01-01 is 戊午.
 * The JDN is the civil date label, not a timezone instant.
 */
export function dayPillarIndex(year: number, month: number, day: number): { stem: number; branch: number } {
  const offset = julianDay(year, month, day) - julianDay(2000, 1, 1)
  return { stem: mod(4 + offset, 10), branch: mod(6 + offset, 12) }
}

export function julianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

export function yearPillarIndex(baziYear: number): { stem: number; branch: number } {
  const index = mod(baziYear - 1984, 60)
  return { stem: index % 10, branch: index % 12 }
}

/** 五虎遁：寅月天干起於年干。 */
export function monthStemIndex(yearStem: number, monthBranch: number): number {
  const yinStem = mod((mod(yearStem, 5) * 2) + 2, 10)
  const offset = mod(monthBranch - 2, 12)
  return mod(yinStem + offset, 10)
}

/** 五鼠遁：子時天干起於日干。 Hour branch 0 is 子. */
export function hourStemIndex(dayStem: number, hourBranch: number): number {
  const ziStem = mod(mod(dayStem, 5) * 2, 10)
  return mod(ziStem + hourBranch, 10)
}

export function hourBranchIndex(hour: number): number {
  return Math.floor(mod(hour + 1, 24) / 2)
}

/** iztro 時辰：0 早子、1 丑 … 11 亥、12 晚子。 */
export function ziweiTimeIndex(hour: number): number {
  if (hour >= 23) return 12
  if (hour <= 0) return 0
  return Math.floor((hour + 1) / 2)
}

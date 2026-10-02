import { offsetOf, type City } from '../data/cities'
import type { Civil } from './civil'
import { ANIMALS, yearPillarIndex, STEMS, BRANCHES } from './ganzhi'
import { baziYearNumber } from './sky'

export type Gender = 'male' | 'female'
export type StarId = '伏位' | '生氣' | '天醫' | '延年' | '絕命' | '五鬼' | '六煞' | '禍害'
export type Gua = '坎' | '坤' | '震' | '巽' | '乾' | '兌' | '艮' | '離'

const GOOD = new Set<StarId>(['伏位', '生氣', '天醫', '延年'])

const YOU_NIAN: Record<Gua, { dir: string; star: StarId }[]> = {
  坎: [
    { dir: '北', star: '伏位' }, { dir: '東南', star: '生氣' }, { dir: '東', star: '天醫' }, { dir: '南', star: '延年' },
    { dir: '西南', star: '絕命' }, { dir: '東北', star: '五鬼' }, { dir: '西北', star: '六煞' }, { dir: '西', star: '禍害' },
  ],
  離: [
    { dir: '南', star: '伏位' }, { dir: '東', star: '生氣' }, { dir: '東南', star: '天醫' }, { dir: '北', star: '延年' },
    { dir: '西北', star: '絕命' }, { dir: '西南', star: '五鬼' }, { dir: '東北', star: '六煞' }, { dir: '西', star: '禍害' },
  ],
  震: [
    { dir: '東', star: '伏位' }, { dir: '南', star: '生氣' }, { dir: '北', star: '天醫' }, { dir: '東南', star: '延年' },
    { dir: '西', star: '絕命' }, { dir: '西北', star: '五鬼' }, { dir: '西南', star: '六煞' }, { dir: '東北', star: '禍害' },
  ],
  巽: [
    { dir: '東南', star: '伏位' }, { dir: '北', star: '生氣' }, { dir: '南', star: '天醫' }, { dir: '東', star: '延年' },
    { dir: '東北', star: '絕命' }, { dir: '西', star: '五鬼' }, { dir: '西北', star: '六煞' }, { dir: '西南', star: '禍害' },
  ],
  乾: [
    { dir: '西北', star: '伏位' }, { dir: '西', star: '生氣' }, { dir: '東北', star: '天醫' }, { dir: '西南', star: '延年' },
    { dir: '南', star: '絕命' }, { dir: '東', star: '五鬼' }, { dir: '北', star: '六煞' }, { dir: '東南', star: '禍害' },
  ],
  坤: [
    { dir: '西南', star: '伏位' }, { dir: '東北', star: '生氣' }, { dir: '西', star: '天醫' }, { dir: '西北', star: '延年' },
    { dir: '北', star: '絕命' }, { dir: '東南', star: '五鬼' }, { dir: '南', star: '六煞' }, { dir: '東', star: '禍害' },
  ],
  兌: [
    { dir: '西', star: '伏位' }, { dir: '西北', star: '生氣' }, { dir: '西南', star: '天醫' }, { dir: '東北', star: '延年' },
    { dir: '東', star: '絕命' }, { dir: '南', star: '五鬼' }, { dir: '東南', star: '六煞' }, { dir: '北', star: '禍害' },
  ],
  艮: [
    { dir: '東北', star: '伏位' }, { dir: '西南', star: '生氣' }, { dir: '西北', star: '天醫' }, { dir: '西', star: '延年' },
    { dir: '東南', star: '絕命' }, { dir: '北', star: '五鬼' }, { dir: '東', star: '六煞' }, { dir: '南', star: '禍害' },
  ],
}

export const FLYING: Record<number, { name: string; note: string }> = {
  1: { name: '一白貪狼', note: '桃花與貴人。宜往來、學習、把關係修好。' },
  2: { name: '二黑巨門', note: '病符。這一宮宜靜、宜清，少動土。' },
  3: { name: '三碧祿存', note: '是非。口舌多，合約與承諾要留字。' },
  4: { name: '四綠文曲', note: '文昌。讀書、寫作、考試、策劃都加分。' },
  5: { name: '五黃廉貞', note: '災煞。不宜大興土木，宜穩、宜收。' },
  6: { name: '六白武曲', note: '權貴。主位置、決定、金屬與領導。' },
  7: { name: '七赤破軍', note: '口舌與破耗。財務留紀錄，避免投機。' },
  8: { name: '八白左輔', note: '退氣之財，仍主穩健的累積與置產。' },
  9: { name: '九紫右弼', note: '九運當令。喜慶、曝光、明處的機會。' },
}

const PATH = ['center', 'nw', 'w', 'ne', 's', 'n', 'sw', 'e', 'se'] as const
export const PALACE_LABEL: Record<(typeof PATH)[number], string> = {
  center: '中宮', nw: '西北', w: '西', ne: '東北', s: '南', n: '北', sw: '西南', e: '東', se: '東南',
}

/** Annual center. 2024 = 3, then the star counts down; 1 wraps to 9. */
export function annualCenter(year: number): number {
  const delta = year - 2024
  return ((3 - delta - 1) % 9 + 9) % 9 + 1
}

export function flyStars(center: number): Record<(typeof PATH)[number], number> {
  const out = {} as Record<(typeof PATH)[number], number>
  PATH.forEach((key, index) => {
    out[key] = ((center - 1 + index) % 9) + 1
  })
  return out
}

export function guaRemainder(year: number, gender: Gender): number {
  const last = year % 100
  const base = gender === 'male' ? (year >= 2000 ? 99 - last : 100 - last) : year >= 2000 ? last + 6 : last - 4
  let rem = base % 9
  if (rem <= 0) rem += 9
  return rem
}

const GUA_BY_REM: Record<number, { gua: Gua; element: string }> = {
  1: { gua: '坎', element: '水' },
  2: { gua: '坤', element: '土' },
  3: { gua: '震', element: '木' },
  4: { gua: '巽', element: '木' },
  6: { gua: '乾', element: '金' },
  7: { gua: '兌', element: '金' },
  8: { gua: '艮', element: '土' },
  9: { gua: '離', element: '火' },
}

export type DirectionReading = { dir: string; star: StarId; good: boolean }
export type AnnualCell = { key: string; label: string; star: number; name: string; note: string }

export type FengshuiChart = {
  year: number
  pillar: string
  animal: string
  gua: Gua
  note: string
  element: string
  group: '東四命' | '西四命'
  directions: DirectionReading[]
  facingNote: string | null
  annualYear: number
  annualPillar: string
  annualCells: AnnualCell[]
  reading: string
  master: string
}

export function castFengshui(
  birth: Civil,
  gender: Gender,
  city: City,
  facing: string | null,
  now: Civil,
): FengshuiChart {
  const year = baziYearNumber(birth, offsetOf(city, { ...birth, hour: 12, minute: 0 }))
  const idx = yearPillarIndex(year)
  const rem = guaRemainder(year, gender)
  const hosted = rem === 5 ? (gender === 'male' ? '坤' : '艮') : GUA_BY_REM[rem].gua
  const element = rem === 5 ? '土' : GUA_BY_REM[rem].element
  const note = rem === 5 ? (gender === 'male' ? '五寄坤' : '五寄艮') : ''
  const group = ['坎', '震', '巽', '離'].includes(hosted) ? '東四命' : '西四命'
  const directions = YOU_NIAN[hosted].map((item) => ({ ...item, good: GOOD.has(item.star) }))
  const facingHit = facing ? directions.find((item) => item.dir === facing) ?? null : null
  const facingNote = facingHit
    ? facingHit.good
      ? `大門朝${facing}，落在${facingHit.star}，與命卦相合。`
      : `大門朝${facing}，落在${facingHit.star}。不必硬改大門，讓床、桌、灶去就吉方。`
    : null

  const annualYear = baziYearNumber(now, offsetOf(city, now))
  const annualIdx = yearPillarIndex(annualYear)
  const flown = flyStars(annualCenter(annualYear))
  const annualCells: AnnualCell[] = PATH.map((key) => {
    const star = flown[key]
    return { key, label: PALACE_LABEL[key], star, name: FLYING[star].name, note: FLYING[star].note }
  })
  const center = annualCells.find((cell) => cell.key === 'center')!
  const vital = directions.find((item) => item.star === '生氣')!
  const vitalCell = annualCells.find((cell) => cell.label === vital.dir)!
  const genderLabel = gender === 'male' ? '男命' : '女命'
  const goodDirs = directions.filter((item) => item.good).map((item) => `${item.dir}${item.star}`).join('、')
  const reading = `${STEMS[idx.stem]}${BRANCHES[idx.branch]}年${ANIMALS[idx.branch]}，${genderLabel}。命卦${hosted}${note ? `（${note}）` : ''}，${element}，${group}。吉方：${goodDirs}。${annualYear} 年中宮是${center.name}。`
  const master = `生氣在${vital.dir}。今年那一宮飛入${vitalCell.name}。${vitalCell.note}${facingNote ?? ''}`
  return {
    year,
    pillar: STEMS[idx.stem] + BRANCHES[idx.branch],
    animal: ANIMALS[idx.branch],
    gua: hosted,
    note,
    element,
    group,
    directions,
    facingNote,
    annualYear,
    annualPillar: STEMS[annualIdx.stem] + BRANCHES[annualIdx.branch],
    annualCells,
    reading,
    master,
  }
}

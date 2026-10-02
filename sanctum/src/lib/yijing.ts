import { randomIndex } from './draw'

export type TriId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun'

export type Line = { value: 6 | 7 | 8 | 9; yang: boolean; changing: boolean }

const TRI_BY_BITS = ['kun', 'zhen', 'kan', 'dui', 'gen', 'li', 'xun', 'qian'] as const

export const TRIGRAM: Record<TriId, { hant: string; lines: string }> = {
  qian: { hant: '乾', lines: '天行，宜決。' },
  dui: { hant: '兌', lines: '口舌，宜說清楚。' },
  li: { hant: '離', lines: '附麗，宜看見。' },
  zhen: { hant: '震', lines: '起動，宜先動一步。' },
  xun: { hant: '巽', lines: '漸入，宜細。' },
  kan: { hant: '坎', lines: '險陷，宜熟路。' },
  gen: { hant: '艮', lines: '止，宜邊界。' },
  kun: { hant: '坤', lines: '承載，宜收。' },
}

type Hex = { no: number; hant: string; en: string }

const HEX: Record<string, Hex> = {
  'qian-qian': { no: 1, hant: '乾為天', en: 'The Creative' },
  'kun-kun': { no: 2, hant: '坤為地', en: 'The Receptive' },
  'zhen-kan': { no: 3, hant: '水雷屯', en: 'Difficulty' },
  'kan-gen': { no: 4, hant: '山水蒙', en: 'Youth' },
  'qian-kan': { no: 5, hant: '水天需', en: 'Waiting' },
  'kan-qian': { no: 6, hant: '天水訟', en: 'Conflict' },
  'kan-kun': { no: 7, hant: '地水師', en: 'The Army' },
  'kun-kan': { no: 8, hant: '水地比', en: 'Holding Together' },
  'qian-xun': { no: 9, hant: '風天小畜', en: 'Small Taming' },
  'dui-qian': { no: 10, hant: '天澤履', en: 'Treading' },
  'qian-kun': { no: 11, hant: '地天泰', en: 'Peace' },
  'kun-qian': { no: 12, hant: '天地否', en: 'Standstill' },
  'li-qian': { no: 13, hant: '天火同人', en: 'Fellowship' },
  'qian-li': { no: 14, hant: '火天大有', en: 'Great Possession' },
  'gen-kun': { no: 15, hant: '地山謙', en: 'Modesty' },
  'kun-zhen': { no: 16, hant: '雷地豫', en: 'Enthusiasm' },
  'zhen-dui': { no: 17, hant: '澤雷隨', en: 'Following' },
  'xun-gen': { no: 18, hant: '山風蠱', en: 'Decay' },
  'dui-kun': { no: 19, hant: '地澤臨', en: 'Approach' },
  'kun-xun': { no: 20, hant: '風地觀', en: 'Contemplation' },
  'zhen-li': { no: 21, hant: '火雷噬嗑', en: 'Biting Through' },
  'li-gen': { no: 22, hant: '山火賁', en: 'Grace' },
  'kun-gen': { no: 23, hant: '山地剝', en: 'Splitting' },
  'zhen-kun': { no: 24, hant: '地雷復', en: 'Return' },
  'zhen-qian': { no: 25, hant: '天雷無妄', en: 'Innocence' },
  'qian-gen': { no: 26, hant: '山天大畜', en: 'Great Taming' },
  'zhen-gen': { no: 27, hant: '山雷頤', en: 'Nourishment' },
  'xun-dui': { no: 28, hant: '澤風大過', en: 'Great Exceeding' },
  'kan-kan': { no: 29, hant: '坎為水', en: 'The Abyss' },
  'li-li': { no: 30, hant: '離為火', en: 'The Clinging' },
  'gen-dui': { no: 31, hant: '澤山咸', en: 'Influence' },
  'xun-zhen': { no: 32, hant: '雷風恆', en: 'Duration' },
  'gen-qian': { no: 33, hant: '天山遯', en: 'Retreat' },
  'qian-zhen': { no: 34, hant: '雷天大壯', en: 'Great Power' },
  'kun-li': { no: 35, hant: '火地晉', en: 'Progress' },
  'li-kun': { no: 36, hant: '地火明夷', en: 'Darkening' },
  'li-xun': { no: 37, hant: '風火家人', en: 'The Family' },
  'dui-li': { no: 38, hant: '火澤睽', en: 'Opposition' },
  'gen-kan': { no: 39, hant: '水山蹇', en: 'Obstruction' },
  'kan-zhen': { no: 40, hant: '雷水解', en: 'Deliverance' },
  'dui-gen': { no: 41, hant: '山澤損', en: 'Decrease' },
  'zhen-xun': { no: 42, hant: '風雷益', en: 'Increase' },
  'qian-dui': { no: 43, hant: '澤天夬', en: 'Breakthrough' },
  'xun-qian': { no: 44, hant: '天風姤', en: 'Coming to Meet' },
  'kun-dui': { no: 45, hant: '澤地萃', en: 'Gathering' },
  'xun-kun': { no: 46, hant: '地風升', en: 'Pushing Upward' },
  'kan-dui': { no: 47, hant: '澤水困', en: 'Oppression' },
  'xun-kan': { no: 48, hant: '水風井', en: 'The Well' },
  'li-dui': { no: 49, hant: '澤火革', en: 'Revolution' },
  'xun-li': { no: 50, hant: '火風鼎', en: 'The Cauldron' },
  'zhen-zhen': { no: 51, hant: '震為雷', en: 'The Arousing' },
  'gen-gen': { no: 52, hant: '艮為山', en: 'Keeping Still' },
  'gen-xun': { no: 53, hant: '風山漸', en: 'Development' },
  'dui-zhen': { no: 54, hant: '雷澤歸妹', en: 'The Marrying Maiden' },
  'li-zhen': { no: 55, hant: '雷火豐', en: 'Abundance' },
  'gen-li': { no: 56, hant: '火山旅', en: 'The Wanderer' },
  'xun-xun': { no: 57, hant: '巽為風', en: 'The Gentle' },
  'dui-dui': { no: 58, hant: '兌為澤', en: 'The Joyous' },
  'kan-xun': { no: 59, hant: '風水渙', en: 'Dispersion' },
  'dui-kan': { no: 60, hant: '水澤節', en: 'Limitation' },
  'dui-xun': { no: 61, hant: '風澤中孚', en: 'Inner Truth' },
  'gen-zhen': { no: 62, hant: '雷山小過', en: 'Small Exceeding' },
  'li-kan': { no: 63, hant: '水火既濟', en: 'After Completion' },
  'kan-li': { no: 64, hant: '火水未濟', en: 'Before Completion' },
}

export function triId(bits: number[]): TriId {
  const n = bits[0] + bits[1] * 2 + bits[2] * 4
  return TRI_BY_BITS[n]
}

export function hexagramFromLines(lines: Line[]) {
  const lower = triId(lines.slice(0, 3).map((line) => (line.yang ? 1 : 0)))
  const upper = triId(lines.slice(3, 6).map((line) => (line.yang ? 1 : 0)))
  const hex = HEX[`${lower}-${upper}`]
  if (!hex) throw new Error(`missing ${lower}-${upper}`)
  return { lower, upper, ...hex }
}

export function relatingLines(lines: Line[]): Line[] {
  return lines.map((line) => {
    if (!line.changing) return line
    const yang = !line.yang
    return { value: yang ? 7 : 8, yang, changing: false }
  })
}

function throwLine(): Line {
  let sum = 0
  for (let i = 0; i < 3; i += 1) sum += randomIndex(2) === 0 ? 2 : 3
  const value = sum as 6 | 7 | 8 | 9
  return { value, yang: value === 7 || value === 9, changing: value === 6 || value === 9 }
}

export function castYijing() {
  const lines = [throwLine(), throwLine(), throwLine(), throwLine(), throwLine(), throwLine()]
  const primary = hexagramFromLines(lines)
  const moving = lines.map((line, index) => (line.changing ? index + 1 : 0)).filter((n) => n > 0)
  const relating = moving.length ? hexagramFromLines(relatingLines(lines)) : null
  return { lines, primary, relating, moving }
}

export function hexCount() {
  return Object.keys(HEX).length
}

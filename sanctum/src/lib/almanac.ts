import { astro } from 'iztro'
import { civilToUtc, mod, type Civil } from './civil'
import { BRANCHES, dayPillarIndex } from './ganzhi'
import { MONTH_BRANCHES, monthBranchFromSun, sunLongitude } from './sky'

export const MANSIONS = [
  { name: '角', group: '蒼龍', width: 12 },
  { name: '亢', group: '蒼龍', width: 9 },
  { name: '氐', group: '蒼龍', width: 15 },
  { name: '房', group: '蒼龍', width: 5 },
  { name: '心', group: '蒼龍', width: 5 },
  { name: '尾', group: '蒼龍', width: 18 },
  { name: '箕', group: '蒼龍', width: 11 },
  { name: '斗', group: '玄武', width: 26 },
  { name: '牛', group: '玄武', width: 8 },
  { name: '女', group: '玄武', width: 12 },
  { name: '虛', group: '玄武', width: 10 },
  { name: '危', group: '玄武', width: 17 },
  { name: '室', group: '玄武', width: 16 },
  { name: '壁', group: '玄武', width: 9 },
  { name: '奎', group: '白虎', width: 16 },
  { name: '婁', group: '白虎', width: 12 },
  { name: '胃', group: '白虎', width: 14 },
  { name: '昴', group: '白虎', width: 11 },
  { name: '畢', group: '白虎', width: 16 },
  { name: '觜', group: '白虎', width: 2 },
  { name: '參', group: '白虎', width: 9 },
  { name: '井', group: '朱雀', width: 33 },
  { name: '鬼', group: '朱雀', width: 4 },
  { name: '柳', group: '朱雀', width: 15 },
  { name: '星', group: '朱雀', width: 7 },
  { name: '張', group: '朱雀', width: 18 },
  { name: '翼', group: '朱雀', width: 18 },
  { name: '軫', group: '朱雀', width: 17 },
] as const

const MANSION_CIRCLE = MANSIONS.reduce((sum, item) => sum + item.width, 0)
const JIAO_OFFSET = 203

export function mansionOf(longitude: number) {
  const chinese = mod((longitude - JIAO_OFFSET) * MANSION_CIRCLE / 360, MANSION_CIRCLE)
  let cursor = 0
  for (let index = 0; index < MANSIONS.length; index += 1) {
    cursor += MANSIONS[index].width
    if (chinese < cursor) return { ...MANSIONS[index], index }
  }
  return { ...MANSIONS[0], index: 0 }
}

export const ROKUYO = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'] as const

export function rokuyoIndex(lunarMonth: number, lunarDay: number) {
  return (lunarMonth + lunarDay) % 6
}

export function lunarParts(civil: Pick<Civil, 'year' | 'month' | 'day'>) {
  const chart = astro.bySolar(`${civil.year}-${civil.month}-${civil.day}`, 0, '男', true, 'zh-TW')
  const lunar = chart.rawDates.lunarDate
  return { month: lunar.lunarMonth, day: lunar.lunarDay, leap: lunar.isLeap }
}

export const JIANCHU = ['建', '除', '滿', '平', '定', '執', '破', '危', '成', '收', '開', '閉'] as const

export function jianchuIndex(monthBranch: number, dayBranch: number) {
  return mod(dayBranch - monthBranch, 12)
}

export function dayBranches(civil: Civil, offsetMinutes: number) {
  const instant = civilToUtc(civil, offsetMinutes)
  const monthName = MONTH_BRANCHES[monthBranchFromSun(sunLongitude(instant))]
  const monthBranch = BRANCHES.indexOf(monthName)
  let day = { year: civil.year, month: civil.month, day: civil.day }
  if (civil.hour >= 23) {
    const next = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + 1))
    day = { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() }
  }
  const pillar = dayPillarIndex(day.year, day.month, day.day)
  return { monthBranch, dayBranch: pillar.branch, dayStem: pillar.stem }
}

export function nineYearStar(year: number) {
  const rem = (11 - (year % 9)) % 9
  return rem === 0 ? 9 : rem
}

export function nineMonthStar(yearStar: number, monthFromYin: number) {
  const base = yearStar % 3 === 1 ? 8 : yearStar % 3 === 2 ? 5 : 2
  return ((base - monthFromYin - 1) % 9 + 9) % 9 + 1
}

export const NINE_DIR = ['', '北', '西南', '東', '東南', '中', '西北', '西', '東北', '南']

const CLASH = ['馬', '羊', '猴', '雞', '狗', '豬', '鼠', '牛', '虎', '兔', '龍', '蛇']

export function clashAnimal(dayBranch: number) {
  return CLASH[dayBranch]
}

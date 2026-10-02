import { cityById } from '../data/cities'
import { castBazi } from './bazi'
import { taipeiNow } from './civil'
import { castZodiac } from './zodiac'
import { castZiwei } from './ziwei'

export type TodayMark = {
  pillar: string
  animal: string
  sun: string
  lunar: string
}

export function readToday(): TodayMark {
  const civil = taipeiNow()
  const sky = castZodiac(civil, cityById('taipei'))
  const bazi = castBazi(civil, { offsetMinutes: 480 })
  let lunar = ''
  try {
    lunar = castZiwei(civil, '男').lunarDate
  } catch {
    lunar = ''
  }
  return {
    pillar: bazi.pillars[0].pillar.stem + bazi.pillars[0].pillar.branch,
    animal: bazi.animal,
    sun: `${sky.sun.sign.name} ${sky.sun.deg}°`,
    lunar,
  }
}

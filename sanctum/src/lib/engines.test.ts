import { describe, expect, it } from 'vitest'
import { cityById, offsetOf } from '../data/cities'
import { STICKS } from '../data/sticks'
import { castBazi } from './bazi'
import { isEuDst, isSydneyDst, isUsDst } from './civil'
import { guaRemainder, annualCenter } from './fengshui'
import { tenGod, ziweiTimeIndex } from './ganzhi'
import { castZodiac } from './zodiac'
import { castZiwei } from './ziwei'

const noon = { hour: 12, minute: 0 }

describe('bazi', () => {
  it('anchors 2000-01-01 noon in Taipei to 己卯 丙子 戊午 戊午', () => {
    const chart = castBazi({ year: 2000, month: 1, day: 1, ...noon }, { offsetMinutes: 480 })
    expect(chart.pillars.map((item) => item.pillar.stem + item.pillar.branch)).toEqual(['己卯', '丙子', '戊午', '戊午'])
    expect(chart.pillars[0].pillar.nayin).toBe('城頭土')
    expect(chart.pillars[2].pillar.nayin).toBe('天上火')
  })

  it('rolls the day pillar at 23:00', () => {
    const chart = castBazi({ year: 2000, month: 1, day: 1, hour: 23, minute: 30 }, { offsetMinutes: 480 })
    expect(chart.pillars[2].pillar.stem + chart.pillars[2].pillar.branch).toBe('己未')
    expect(chart.pillars[3].pillar.stem + chart.pillars[3].pillar.branch).toBe('甲子')
  })

  it('changes the year pillar at 立春, not at lunar new year', () => {
    const before = castBazi({ year: 2026, month: 1, day: 20, ...noon }, { offsetMinutes: 480 })
    const after = castBazi({ year: 2026, month: 6, day: 1, ...noon }, { offsetMinutes: 480 })
    expect(before.pillars[0].pillar.stem + before.pillars[0].pillar.branch).toBe('乙巳')
    expect(after.pillars[0].pillar.stem + after.pillars[0].pillar.branch).toBe('丙午')
    expect(after.animal).toBe('馬')
  })

  it('places 2 October 2026 in 酉月', () => {
    const chart = castBazi({ year: 2026, month: 10, day: 2, hour: 15, minute: 0 }, { offsetMinutes: 480 })
    expect(chart.pillars[1].pillar.branch).toBe('酉')
  })

  it('names the ten gods from 甲', () => {
    expect(tenGod(0, 0)).toBe('比肩')
    expect(tenGod(0, 1)).toBe('劫財')
    expect(tenGod(0, 2)).toBe('食神')
    expect(tenGod(0, 5)).toBe('正財')
    expect(tenGod(0, 6)).toBe('七殺')
    expect(tenGod(0, 9)).toBe('正印')
  })
})

describe('zodiac', () => {
  it('casts Obama as Leo sun, Gemini moon, Aquarius rising', () => {
    const chart = castZodiac(
      { year: 1961, month: 8, day: 4, hour: 19, minute: 24 },
      cityById('honolulu'),
    )
    expect(chart.sun.sign.name, JSON.stringify({ sun: chart.sun.lon, moon: chart.moon.lon, asc: chart.asc?.lon })).toBe('獅子')
    expect(chart.moon.sign.name).toBe('雙子')
    expect(chart.asc?.sign.name).toBe('水瓶')
  })

  it('omits the ascendant when the clock time is absent', () => {
    const chart = castZodiac({ year: 2026, month: 10, day: 2 }, cityById('taipei'))
    expect(chart.sun.sign.name).toBe('天秤')
    expect(chart.asc).toBeNull()
    expect(chart.moonNote).toBeTruthy()
  })
})

describe('feng shui', () => {
  it('derives ming gua across the 2000 boundary', () => {
    expect(guaRemainder(1990, 'male')).toBe(1)
    expect(guaRemainder(1990, 'female')).toBe(5)
    expect(guaRemainder(2000, 'male')).toBe(9)
    expect(guaRemainder(2000, 'female')).toBe(6)
  })

  it('counts the annual center down from 2024', () => {
    expect(annualCenter(2024)).toBe(3)
    expect(annualCenter(2025)).toBe(2)
    expect(annualCenter(2026)).toBe(1)
    expect(annualCenter(2027)).toBe(9)
  })
})

describe('time and daylight saving', () => {
  it('maps clock hours onto ziwei time indexes', () => {
    expect(ziweiTimeIndex(23)).toBe(12)
    expect(ziweiTimeIndex(0)).toBe(0)
    expect(ziweiTimeIndex(1)).toBe(1)
    expect(ziweiTimeIndex(2)).toBe(1)
    expect(ziweiTimeIndex(11)).toBe(6)
    expect(ziweiTimeIndex(22)).toBe(11)
  })

  it('shifts London, New York, and Sydney in their summers', () => {
    const summer = { year: 2026, month: 7, day: 15, hour: 12, minute: 0 }
    const winter = { year: 2026, month: 1, day: 15, hour: 12, minute: 0 }
    expect(isEuDst(summer)).toBe(true)
    expect(isEuDst(winter)).toBe(false)
    expect(offsetOf(cityById('london'), summer)).toBe(60)
    expect(offsetOf(cityById('london'), winter)).toBe(0)
    expect(isUsDst(summer)).toBe(true)
    expect(isUsDst(winter)).toBe(false)
    expect(offsetOf(cityById('newyork'), summer)).toBe(-240)
    expect(isSydneyDst(winter)).toBe(true)
    expect(isSydneyDst(summer)).toBe(false)
    expect(offsetOf(cityById('sydney'), winter)).toBe(660)
  })
})

describe('ziwei', () => {
  it('returns twelve palaces and a five-element class', () => {
    const chart = castZiwei({ year: 1990, month: 8, day: 16, hour: 14, minute: 0 }, '女')
    expect(chart.palaces).toHaveLength(12)
    expect(chart.fiveElementsClass).toMatch(/局/)
    expect(chart.palaces.some((palace) => palace.name === '命宮')).toBe(true)
    expect(chart.reading).toContain('命宮')
  })
})

describe('slips', () => {
  it('keeps every verse to seven characters', () => {
    expect(STICKS).toHaveLength(24)
    for (const stick of STICKS) {
      for (const verse of stick.verses) expect(Array.from(verse), verse).toHaveLength(7)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { toHans } from '../i18n/hans'
import { DICT } from '../i18n/dict'
import { clashAnimal, jianchuIndex, mansionOf, nineMonthStar, nineYearStar, rokuyoIndex } from './almanac'
import { castQizheng } from './qizheng'
import { OMIKUJI } from '../data/omikuji'
import { tarotAnswer, tarotDeck } from './tarot'
import { castYijing, hexagramFromLines, hexCount, type Line } from './yijing'

function line(yang: boolean): Line {
  return { value: yang ? 7 : 8, yang, changing: false }
}

describe('language and east asian charts', () => {
  it('converts traditional characters used on the doors', () => {
    expect(toHans('國門東風龍馬')).toBe('国门东风龙马')
    expect(DICT['zh-Hans'].brand).toBe('承问')
    expect(DICT.en.themeLight).toBe('Light')
    expect(DICT.ja.themeDark).toBe('黒')
  })

  it('places the moon in one of twenty-eight mansions', () => {
    const hit = mansionOf(210)
    expect(hit.index).toBeGreaterThanOrEqual(0)
    expect(hit.index).toBeLessThan(28)
    expect(hit.name.length).toBeGreaterThan(0)
  })

  it('counts nine stars and rokuyo', () => {
    expect(nineYearStar(2026)).toBe(1)
    expect(nineYearStar(2024)).toBe(3)
    expect(nineMonthStar(1, 0)).toBe(8)
    expect(rokuyoIndex(1, 1)).toBe(2)
    expect(jianchuIndex(2, 2)).toBe(0)
    expect(clashAnimal(0)).toBe('馬')
  })

  it('casts seven luminaries and four remainders inside the ecliptic', () => {
    const chart = castQizheng(new Date(Date.UTC(2026, 9, 2, 4, 0)))
    expect(chart.bodies).toHaveLength(11)
    for (const body of chart.bodies) {
      expect(body.lon).toBeGreaterThanOrEqual(0)
      expect(body.lon).toBeLessThan(360)
    }
    expect(chart.bodies[0].signId).toBe('libra')
  })

  it('knows all sixty-four hexagrams', () => {
    expect(hexCount()).toBe(64)
    const heaven = hexagramFromLines([line(true), line(true), line(true), line(true), line(true), line(true)])
    const earth = hexagramFromLines([line(false), line(false), line(false), line(false), line(false), line(false)])
    expect(heaven.hant).toBe('乾為天')
    expect(earth.no).toBe(2)
    const cast = castYijing()
    expect(cast.lines).toHaveLength(6)
    expect(cast.primary.no).toBeGreaterThanOrEqual(1)
  })

  it('builds a seventy-eight card tarot deck', () => {
    expect(tarotDeck()).toHaveLength(78)
    expect(tarotDeck()[0].title.en).toBe('The Fool')
  })

  it('answers the question with the drawn cards', () => {
    const fool = tarotDeck()[0]
    const text = tarotAnswer('這份工作要不要接', [{ card: fool, reversed: false }], 'zh-Hant')
    expect(text).toContain('這份工作要不要接')
    expect(text).toContain('愚者')
    expect(text).toContain('可以')
  })

  it('keeps omikuji slips distinct', () => {
    expect(OMIKUJI.length).toBeGreaterThanOrEqual(30)
    expect(new Set(OMIKUJI.map((slip) => slip.id)).size).toBe(OMIKUJI.length)
  })
})

import { cityById, offsetOf, type City } from '../data/cities'
import { ASPECTS, SIGNS, type SignInfo } from '../data/signs'
import { civilToUtc, mod, type Civil } from './civil'
import { ascendantLongitude, midheavenLongitude, moonLongitude, sunLongitude } from './sky'

export type Placement = {
  lon: number
  deg: number
  sign: SignInfo
}

export type ZodiacChart = {
  sun: Placement
  moon: Placement
  asc: Placement | null
  mc: Placement | null
  aspect: string | null
  aspectText: string | null
  moonNote: string | null
  city: string
  reading: string
  master: string
}

export function signAt(longitude: number): Placement {
  const lon = mod(longitude, 360)
  const sign = SIGNS[Math.floor(lon / 30) % 12]
  return { lon, deg: Math.floor(lon % 30), sign }
}

export function aspectName(a: number, b: number): string | null {
  let delta = Math.abs(mod(a - b, 360))
  if (delta > 180) delta = 360 - delta
  const aspects: [number, number, string][] = [
    [0, 8, '合相'],
    [60, 6, '六分'],
    [90, 7, '四分'],
    [120, 7, '三分'],
    [180, 8, '對分'],
  ]
  for (const [angle, orb, name] of aspects) {
    if (Math.abs(delta - angle) <= orb) return name
  }
  return null
}

export function castZodiac(
  civil: Omit<Civil, 'hour' | 'minute'> & { hour?: number; minute?: number },
  city: City = cityById('taipei'),
  question = '',
): ZodiacChart {
  const timed = civil.hour !== undefined
  const clock: Civil = {
    year: civil.year,
    month: civil.month,
    day: civil.day,
    hour: civil.hour ?? 12,
    minute: civil.minute ?? 0,
  }
  const instant = civilToUtc(clock, offsetOf(city, clock))
  const sun = signAt(sunLongitude(instant))
  const moon = signAt(moonLongitude(instant))
  const asc = timed ? signAt(ascendantLongitude(instant, city.lat, city.lon)) : null
  const mc = timed ? signAt(midheavenLongitude(instant, city.lon)) : null
  const aspect = aspectName(sun.lon, moon.lon)
  const moonNote = timed ? null : '未提供出生時間。月亮取當地正午，上升暫缺。'
  const place = `${sun.sign.name} ${sun.deg}°`
  const moonPlace = `${moon.sign.name} ${moon.deg}°`
  const ascPlace = asc ? `${asc.sign.name} ${asc.deg}°` : '未起'
  const asked = question.trim() ? `所問「${question.trim().slice(0, 48)}」。` : ''
  const reading = `${asked}太陽在${place}，月亮在${moonPlace}，上升${ascPlace}。${sun.sign.sun}${moon.sign.moon}${asc ? asc.sign.rising : ''}${aspect ? ASPECTS[aspect] : ''}`
  const master = `${sun.sign.master}${mc ? `中天在${mc.sign.name}，外界會把你的位置看成${mc.sign.element === '土' || mc.sign.element === '火' ? '能扛事的人' : '帶來方向或感受的人'}。` : ''}星盤描述氣質與時機，不代替你的選擇。`
  return {
    sun,
    moon,
    asc,
    mc,
    aspect,
    aspectText: aspect ? ASPECTS[aspect] : null,
    moonNote,
    city: city.name,
    reading,
    master,
  }
}

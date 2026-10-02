import * as Astronomy from 'astronomy-engine'
import { mod, type Civil, civilToUtc } from './civil'

export function sunLongitude(date: Date): number {
  return mod(Astronomy.SunPosition(date).elon, 360)
}

export function moonLongitude(date: Date): number {
  return mod(Astronomy.EclipticGeoMoon(date).lon, 360)
}

export function obliquity(date: Date): number {
  return Astronomy.e_tilt(Astronomy.MakeTime(date)).tobl
}

/** Local apparent sidereal time in degrees. East longitude is positive. */
export function localSiderealDegrees(date: Date, longitude: number): number {
  const gastHours = Astronomy.SiderealTime(date)
  return mod(gastHours + longitude / 15, 24) * 15
}

export function ascendantLongitude(date: Date, latitude: number, longitude: number): number {
  const ramc = (localSiderealDegrees(date, longitude) * Math.PI) / 180
  const eps = (obliquity(date) * Math.PI) / 180
  const lat = (latitude * Math.PI) / 180
  const y = Math.cos(ramc)
  const x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))
  return mod((Math.atan2(y, x) * 180) / Math.PI, 360)
}

export function midheavenLongitude(date: Date, longitude: number): number {
  const ramc = (localSiderealDegrees(date, longitude) * Math.PI) / 180
  const eps = (obliquity(date) * Math.PI) / 180
  const y = Math.sin(ramc)
  const x = Math.cos(ramc) * Math.cos(eps)
  return mod((Math.atan2(y, x) * 180) / Math.PI, 360)
}

/**
 * Bazi year changes at 立春 (sun longitude 315°), which always falls in early February.
 * Longitude alone cannot name the year, because the year wraps the whole ecliptic.
 */
export function baziYearNumber(civil: Civil, offsetMinutes: number): number {
  if (civil.month >= 3) return civil.year
  if (civil.month === 1) return civil.year - 1
  const lon = sunLongitude(civilToUtc(civil, offsetMinutes))
  return lon >= 315 ? civil.year : civil.year - 1
}

/** Month branch index, 寅 = 0 … 丑 = 11, divided on the 12 節 of 30° each from 立春. */
export function monthBranchFromSun(longitude: number): number {
  const shifted = mod(longitude - 315, 360)
  return Math.floor(shifted / 30) % 12
}

export const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const

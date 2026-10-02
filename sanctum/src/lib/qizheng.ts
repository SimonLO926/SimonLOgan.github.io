import * as Astronomy from 'astronomy-engine'
import { mod } from './civil'
import { signAt } from './zodiac'
import { mansionOf } from './almanac'

const PLANETS = [
  { id: 'mercury', body: Astronomy.Body.Mercury },
  { id: 'venus', body: Astronomy.Body.Venus },
  { id: 'mars', body: Astronomy.Body.Mars },
  { id: 'jupiter', body: Astronomy.Body.Jupiter },
  { id: 'saturn', body: Astronomy.Body.Saturn },
] as const

export type SkyBody = {
  id: string
  lon: number
  signId: string
  deg: number
}

function julianDay(date: Date) {
  return date.getTime() / 86_400_000 + 2440587.5
}

function centuries(date: Date) {
  return (julianDay(date) - 2451545) / 36525
}

export function meanRemainders(date: Date) {
  const t = centuries(date)
  const node = mod(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t, 360)
  const perigee = mod(83.3532465 + 4069.0137287 * t - 0.01032 * t * t, 360)
  const days = julianDay(date) - 2451545
  return {
    rahu: node,
    ketu: mod(node + 180, 360),
    lilith: mod(perigee + 180, 360),
    ziqi: mod(276.74 + days * 0.004178, 360),
  }
}

function point(id: string, lon: number): SkyBody {
  const placed = signAt(lon)
  return { id, lon: placed.lon, signId: placed.sign.id, deg: placed.deg }
}

export function castQizheng(date: Date) {
  const sun = point('sun', Astronomy.SunPosition(date).elon)
  const moon = point('moon', Astronomy.EclipticGeoMoon(date).lon)
  const planets = PLANETS.map((item) => {
    const ecl = Astronomy.Ecliptic(Astronomy.GeoVector(item.body, date, true))
    return point(item.id, ecl.elon)
  })
  const extra = meanRemainders(date)
  const remainders = (['rahu', 'ketu', 'lilith', 'ziqi'] as const).map((id) => point(id, extra[id]))
  return {
    bodies: [sun, moon, ...planets, ...remainders],
    mansion: mansionOf(moon.lon),
  }
}

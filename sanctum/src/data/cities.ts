import { isEuDst, isSydneyDst, isUsDst, type Civil } from '../lib/civil'

export type City = {
  id: string
  name: string
  lat: number
  lon: number
  /** Standard offset in minutes, east of UTC positive. */
  tz: number
  dst: 'none' | 'eu' | 'us' | 'sydney'
}

export const CITIES: City[] = [
  { id: 'taipei', name: '臺北', lat: 25.0375, lon: 121.5637, tz: 480, dst: 'none' },
  { id: 'hongkong', name: '香港', lat: 22.3193, lon: 114.1694, tz: 480, dst: 'none' },
  { id: 'shanghai', name: '上海', lat: 31.2304, lon: 121.4737, tz: 480, dst: 'none' },
  { id: 'tokyo', name: '東京', lat: 35.6812, lon: 139.7671, tz: 540, dst: 'none' },
  { id: 'seoul', name: '首爾', lat: 37.5665, lon: 126.978, tz: 540, dst: 'none' },
  { id: 'singapore', name: '新加坡', lat: 1.3521, lon: 103.8198, tz: 480, dst: 'none' },
  { id: 'london', name: '倫敦', lat: 51.5074, lon: -0.1278, tz: 0, dst: 'eu' },
  { id: 'paris', name: '巴黎', lat: 48.8566, lon: 2.3522, tz: 60, dst: 'eu' },
  { id: 'newyork', name: '紐約', lat: 40.7128, lon: -74.006, tz: -300, dst: 'us' },
  { id: 'honolulu', name: '檀香山', lat: 21.3069, lon: -157.8583, tz: -600, dst: 'none' },
  { id: 'sydney', name: '雪梨', lat: -33.8688, lon: 151.2093, tz: 600, dst: 'sydney' },
]

export const DEFAULT_CITY = CITIES[0]

export function cityById(id: string): City {
  return CITIES.find((city) => city.id === id) ?? DEFAULT_CITY
}

export function offsetOf(city: City, civil: Civil): number {
  if (city.dst === 'eu' && isEuDst(civil)) return city.tz + 60
  if (city.dst === 'us' && isUsDst(civil)) return city.tz + 60
  if (city.dst === 'sydney' && isSydneyDst(civil)) return city.tz + 60
  return city.tz
}

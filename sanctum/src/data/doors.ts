export const DOORS = [
  { id: 'sticks', index: '01', accent: '#e6c98a' },
  { id: 'omikuji', index: '02', accent: '#e07a64' },
  { id: 'tarot', index: '03', accent: '#d7c4a2' },
  { id: 'oracle', index: '04', accent: '#d9d4ea' },
  { id: 'zodiac', index: '05', accent: '#f4efe6' },
  { id: 'qizheng', index: '06', accent: '#f0e2c0' },
  { id: 'mansion', index: '07', accent: '#9eb4c8' },
  { id: 'bazi', index: '08', accent: '#e0b56a' },
  { id: 'ziwei', index: '09', accent: '#c9a6de' },
  { id: 'fengshui', index: '10', accent: '#9cba9a' },
  { id: 'nine', index: '11', accent: '#c4a574' },
  { id: 'almanac', index: '12', accent: '#e7d7b8' },
  { id: 'yijing', index: '13', accent: '#d7b07a' },
  { id: 'blood', index: '14', accent: '#c46a6a' },
] as const

export type DoorId = (typeof DOORS)[number]['id']
export type Preview = 'hall' | DoorId

export function doorById(id: DoorId) {
  return DOORS.find((door) => door.id === id) ?? DOORS[0]
}

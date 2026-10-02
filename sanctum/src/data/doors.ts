export const DOORS = [
  { id: 'sticks', index: '01', place: '漢', name: '靈籤', en: 'SLIPS', line: '竹筒裡的一支，只回答你這一問。', accent: '#e6c98a' },
  { id: 'omikuji', index: '02', place: '和', name: '御神籤', en: 'OMIKUJI', line: '神社的紙籤。搖一次，展開一條。', accent: '#e07a64' },
  { id: 'oracle', index: '03', place: '西', name: '神諭', en: 'ORACLE', line: '二十二個原創之象。不是塔羅牌面的複製。', accent: '#d9d4ea' },
  { id: 'zodiac', index: '04', place: '黃道', name: '星座', en: 'ZODIAC', line: '太陽、月亮、上升。用星曆，不用報紙日期。', accent: '#f4efe6' },
  { id: 'fengshui', index: '05', place: '宅', name: '風水', en: 'FENG SHUI', line: '八宅命卦，並看今年九宮飛星落在哪。', accent: '#9cba9a' },
  { id: 'bazi', index: '06', place: '柱', name: '八字', en: 'PILLARS', line: '以節氣換柱。年、月、日、時，與十神。', accent: '#e0b56a' },
  { id: 'ziwei', index: '07', place: '斗', name: '紫微', en: 'ZI WEI', line: '十二宮。命主、五行局、四化與流年。', accent: '#c9a6de' },
] as const

export type DoorId = (typeof DOORS)[number]['id']
export type Preview = 'hall' | DoorId

export function doorById(id: DoorId) {
  return DOORS.find((door) => door.id === id) ?? DOORS[0]
}

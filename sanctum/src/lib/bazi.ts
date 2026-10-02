import { addDays, civilToUtc, type Civil } from './civil'
import {
  ANIMALS,
  BRANCHES,
  controllerOf,
  controls,
  elementOfStem,
  ELEMENTS,
  HIDDEN,
  hourBranchIndex,
  hourStemIndex,
  makePillar,
  monthStemIndex,
  producerOf,
  produces,
  STEMS,
  yearPillarIndex,
  dayPillarIndex,
  type Element,
  type Pillar,
} from './ganzhi'
import { baziYearNumber, monthBranchFromSun, MONTH_BRANCHES, sunLongitude } from './sky'

export type PillarView = {
  label: string
  pillar: Pillar
  hidden: string
}

export type BaziChart = {
  pillars: PillarView[]
  dayMaster: string
  dayElement: Element
  strength: '身強' | '身弱' | '中和'
  scores: Record<Element, number>
  useful: Element[]
  avoid: Element[]
  luck: string | null
  portrait: string
  reading: string
  master: string
  animal: string
}

const PORTRAIT: Record<string, string> = {
  甲: '甲木像一棵要往上長的樹。適合開路，不適合在別人的框架裡反覆修剪自己。',
  乙: '乙木柔軟，能纏住機會。勝在持續，不在正面對撞。',
  丙: '丙火是外面的光。能照亮場面，也容易把自己燒乾。',
  丁: '丁火是燭。小而準，適合把一件事做到別人看不見的精細。',
  戊: '戊土厚，能承重。怕的是一味堆高，卻不留出口。',
  己: '己土像田。會養人，也容易把別人的事攬成自己的事。',
  庚: '庚金決定快，改口慢。用在該切斷的地方，不要用在該圓的地方。',
  辛: '辛金標準很高。成敗常在你肯不肯把標準說成一句明白的話。',
  壬: '壬水要流動、要遠方。堵住就淤，放行就清。',
  癸: '癸水感覺準，邊界得自己畫。適合研究、寫作、療癒這類滲進去的工作。',
}

export function castBazi(
  civil: Civil,
  options: { offsetMinutes?: number; gender?: 'male' | 'female' | null } = {},
): BaziChart {
  const offset = options.offsetMinutes ?? 480
  const instant = civilToUtc(civil, offset)
  const year = baziYearNumber(civil, offset)
  const yearIndex = yearPillarIndex(year)
  const monthBranch = BRANCHES.indexOf(MONTH_BRANCHES[monthBranchFromSun(sunLongitude(instant))])
  const monthStem = monthStemIndex(yearIndex.stem, monthBranch)

  let dayCivil = { year: civil.year, month: civil.month, day: civil.day }
  if (civil.hour >= 23) dayCivil = addDays(civil.year, civil.month, civil.day, 1)
  const dayIndex = dayPillarIndex(dayCivil.year, dayCivil.month, dayCivil.day)
  const hourBranch = hourBranchIndex(civil.hour)
  const hourStem = hourStemIndex(dayIndex.stem, hourBranch)

  const yearPillar = makePillar(yearIndex.stem, yearIndex.branch, dayIndex.stem)
  const monthPillar = makePillar(monthStem, monthBranch, dayIndex.stem)
  const dayPillar = makePillar(dayIndex.stem, dayIndex.branch, null)
  const hourPillar = makePillar(hourStem, hourBranch, dayIndex.stem)

  const pillars: PillarView[] = [
    { label: '年柱', pillar: yearPillar, hidden: hiddenText(yearPillar.branch) },
    { label: '月柱', pillar: monthPillar, hidden: hiddenText(monthPillar.branch) },
    { label: '日柱', pillar: dayPillar, hidden: hiddenText(dayPillar.branch) },
    { label: '時柱', pillar: hourPillar, hidden: hiddenText(hourPillar.branch) },
  ]

  const scores = emptyScores()
  for (const view of pillars) {
    scores[elementOfStem(view.pillar.stemIndex)] += 1
    for (const hidden of HIDDEN[view.pillar.branch]) {
      scores[elementOfStem(hidden.stem)] += hidden.weight
    }
  }

  const dayElement = elementOfStem(dayIndex.stem)
  const support = scores[dayElement] + scores[producerOf(dayElement)]
  const drain = scores[produces(dayElement)] + scores[controls(dayElement)] + scores[controllerOf(dayElement)]
  const ratio = support / (drain || 0.1)
  const strength: BaziChart['strength'] = ratio > 1.25 ? '身強' : ratio < 0.8 ? '身弱' : '中和'
  const resource = producerOf(dayElement)
  const output = produces(dayElement)
  const wealth = controls(dayElement)
  const power = controllerOf(dayElement)
  const ranked = [...ELEMENTS].sort((a, b) => scores[b] - scores[a])
  const useful = unique(strength === '身強' ? [output, wealth, power] : strength === '身弱' ? [resource, dayElement] : [ranked[ranked.length - 1]])
  const avoid = unique(strength === '身強' ? [dayElement, resource] : strength === '身弱' ? [output, wealth, power] : [ranked[0]])

  const yangYear = yearIndex.stem % 2 === 0
  const luck = options.gender
    ? (options.gender === 'male' ? yangYear : !yangYear)
      ? '大運順行'
      : '大運逆行'
    : null

  const dayMaster = STEMS[dayIndex.stem]
  const animal = ANIMALS[yearIndex.branch]
  const portrait = PORTRAIT[dayMaster]
  const strengthLine =
    strength === '身強'
      ? '能量夠用。宜把事情做成、把資源用出去，而不是再找同類來壯膽。'
      : strength === '身弱'
        ? '先找生你的節奏與人，再談擴張。硬衝容易散。'
        : '不必大補，也不必大洩。缺出口就做，缺根就先等一等。'
  const pillarText = pillars.map((item) => item.pillar.stem + item.pillar.branch).join(' ')
  const reading = `${year} 年${animal}，四柱 ${pillarText}。日主${dayMaster}${dayElement}。${portrait}${strengthLine}`
  const master = `扶抑簡法取用${useful.join('、')}，少去加碼${avoid.join('、')}。${luck ? `${luck}。起運歲數要看精確節氣，此處不臆造歲數。` : '未記性別，故不標大運順逆。'}這是一張結構圖，不是判決。`

  return {
    pillars,
    dayMaster,
    dayElement,
    strength,
    scores,
    useful,
    avoid,
    luck,
    portrait,
    reading,
    master,
    animal,
  }
}

function hiddenText(branch: Pillar['branch']): string {
  return HIDDEN[branch].map((item) => STEMS[item.stem]).join('')
}

function emptyScores(): Record<Element, number> {
  return { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
}

function unique(list: Element[]): Element[] {
  return [...new Set(list)]
}

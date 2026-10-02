import type { ReactNode } from 'react'

export type CompassTick = {
  angle: number
  label: string
  active?: boolean
  r?: number
}

export function Compass({
  ticks,
  needle,
  center,
  caption,
}: {
  ticks: CompassTick[]
  needle?: number
  center: ReactNode
  caption?: string
}) {
  const c = 160
  const needlePoint = needle === undefined ? null : at(needle, 92, c)
  return (
    <figure className="compass-wrap">
      <svg className="compass" viewBox="0 0 320 320" role="img">
        <circle cx={c} cy={c} r="132" className="wheel-ring" />
        <circle cx={c} cy={c} r="86" className="wheel-ring inner" />
        {ticks.map((tick) => {
          const [x, y] = at(tick.angle, tick.r ?? 112, c)
          return (
            <text key={`${tick.label}-${tick.angle}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={tick.active ? 'good-dir' : 'star-name'}>
              {tick.label}
            </text>
          )
        })}
        {needlePoint && (
          <line x1={c} y1={c} x2={needlePoint[0]} y2={needlePoint[1]} className="compass-needle" />
        )}
        <circle cx={c} cy={c} r="46" className="wheel-core" />
      </svg>
      <div className="compass-center">{center}</div>
      {caption && <figcaption className="fine">{caption}</figcaption>}
    </figure>
  )
}

function at(angle: number, radius: number, c: number): [number, number] {
  const t = (angle * Math.PI) / 180
  return [c + radius * Math.sin(t), c - radius * Math.cos(t)]
}

export const BRANCH_ANGLE: Record<string, number> = {
  子: 0, 丑: 30, 寅: 60, 卯: 90, 辰: 120, 巳: 150,
  午: 180, 未: 210, 申: 240, 酉: 270, 戌: 300, 亥: 330,
}

export const ELEMENT_ANGLE: Record<string, number> = {
  水: 0, 木: 90, 火: 180, 土: 225, 金: 270,
}

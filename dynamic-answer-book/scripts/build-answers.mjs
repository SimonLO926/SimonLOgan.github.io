import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve('src/data/corpus')
const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('.txt'))
  .sort()

const rows = []
for (const file of files) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8')
  const lines = raw.split('\n')
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const parts = trimmed.split(' || ')
    if (parts.length !== 2) {
      throw new Error(`${file}:${index + 1} expected "zh || en"`)
    }
    const zh = parts[0].trim()
    const en = parts[1].trim()
    if (!zh || !en) throw new Error(`${file}:${index + 1} empty side`)
    rows.push({ zh, en, file, line: index + 1 })
  })
}

const simplified =
  /[这书为会还时对说问现开长东车电话见让给应经选决认觉爱亲离头体国万无实点边种样发历难轻满热梦灯纸笔页签约结继续断绝缘运气机风云电读听观谢请题单双错确诚谎语词递达迟钟节周将来从进门锁钥桥钱贵买卖价业务职习惯变换动静乐欢伤险须们个么吗涂乱顺碍帮独于后里干灵际华网软视频显总组织经验]/

const problems = []
const zhSeen = new Map()
const enSeen = new Map()
for (const row of rows) {
  if (zhSeen.has(row.zh)) problems.push(`dup zh: ${row.zh}`)
  if (enSeen.has(row.en)) problems.push(`dup en: ${row.en}`)
  zhSeen.set(row.zh, row)
  enSeen.set(row.en, row)
  if (row.zh.length > 28) problems.push(`long zh (${row.zh.length}): ${row.zh}`)
  if (row.en.length > 92) problems.push(`long en (${row.en.length}): ${row.en}`)
  const hit = row.zh.match(simplified)
  if (hit) problems.push(`simplified 「${hit[0]}」 in ${row.file}:${row.line} ${row.zh}`)
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}

if (rows.length < 1000) {
  console.error(`only ${rows.length} answers`)
  process.exit(1)
}

const body = rows
  .map((row) => `  { zh: ${JSON.stringify(row.zh)}, en: ${JSON.stringify(row.en)} },`)
  .join('\n')

const ts = `export type Answer = {
  zh: string
  en: string
}

export const answers: Answer[] = [
${body}
]

export const ANSWER_COUNT = answers.length
`

fs.writeFileSync(path.resolve('src/data/answers.ts'), ts)
console.log(`wrote ${rows.length} answers`)

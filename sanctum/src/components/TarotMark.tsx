const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function TarotMark({ id }: { id: string }) {
  const minor = id.match(/^(ace|\d+|page|knight|queen|king)-(wands|cups|swords|pentacles)$/)
  return (
    <svg className="tarot-mark" viewBox="0 0 120 168" aria-hidden="true">
      <rect x="6" y="6" width="108" height="156" rx="6" {...stroke} />
      <rect x="12" y="12" width="96" height="144" rx="3" {...stroke} opacity="0.45" />
      {minor ? <MinorArt rank={minor[1]} suit={minor[2]} /> : <MajorArt id={id} />}
    </svg>
  )
}

function MajorArt({ id }: { id: string }) {
  switch (id) {
    case 'fool':
      return <g {...stroke}><circle cx="60" cy="46" r="10" /><path d="M40 120c8-28 32-28 40 0M48 120l-8 22M72 120l8 22M36 78h48" /></g>
    case 'magician':
      return <g {...stroke}><path d="M60 28v88M36 52h48" /><circle cx="36" cy="130" r="6" /><circle cx="84" cy="130" r="6" /><circle cx="48" cy="146" r="6" /><circle cx="72" cy="146" r="6" /></g>
    case 'priestess':
      return <g {...stroke}><path d="M34 36v96M86 36v96M34 36h52" /><circle cx="60" cy="78" r="14" /><path d="M60 92v28" /></g>
    case 'empress':
      return <g {...stroke}><path d="M30 58h60M40 58c8 20 32 20 40 0M48 40c0 10 24 10 24 0" /><circle cx="60" cy="100" r="18" /><path d="M42 128c8 14 28 14 36 0" /></g>
    case 'emperor':
      return <g {...stroke}><path d="M34 44h52l-8 18H42zM42 62v62h36V62M50 80h20M50 96h20" /></g>
    case 'hierophant':
      return <g {...stroke}><path d="M60 34v18M48 52h24M40 78c12 10 28 10 40 0M36 110h48M36 126h48" /><circle cx="46" cy="142" r="5" /><circle cx="74" cy="142" r="5" /></g>
    case 'lovers':
      return <g {...stroke}><circle cx="44" cy="58" r="12" /><circle cx="76" cy="58" r="12" /><path d="M32 120c8-22 16-22 24 0M64 120c8-22 16-22 24 0M60 40l8-12 8 12" /></g>
    case 'chariot':
      return <g {...stroke}><path d="M34 48h52v40H34zM46 88v22M74 88v22" /><circle cx="42" cy="124" r="12" /><circle cx="78" cy="124" r="12" /></g>
    case 'strength':
      return <g {...stroke}><circle cx="60" cy="70" r="22" /><path d="M40 118c20-16 20 16 40 0" /><path d="M48 54c8 8 16-8 24 0" /></g>
    case 'hermit':
      return <g {...stroke}><path d="M60 36v70M48 150l12-44 12 44" /><circle cx="60" cy="36" r="8" /><path d="M60 28V18" /></g>
    case 'wheel':
      return <g {...stroke}><circle cx="60" cy="84" r="34" /><circle cx="60" cy="84" r="8" /><path d="M60 50v68M26 84h68M36 60l48 48M84 60L36 108" /></g>
    case 'justice':
      return <g {...stroke}><path d="M60 36v96M36 58h48" /><circle cx="36" cy="86" r="14" /><circle cx="84" cy="86" r="14" /><path d="M48 140h24" /></g>
    case 'hanged':
      return <g {...stroke}><path d="M36 36h48M60 36v28M60 64l-16 36M60 64l16 36M48 124h24" /></g>
    case 'death':
      return <g {...stroke}><path d="M28 120c24-48 40-48 64 0M28 120h64" /><circle cx="78" cy="52" r="12" /><path d="M78 40v-12" /></g>
    case 'temperance':
      return <g {...stroke}><path d="M36 56c12 16 0 28 12 40M84 56c-12 16 0 28-12 40M48 48h-8M80 48h8M40 128h40" /></g>
    case 'devil':
      return <g {...stroke}><circle cx="60" cy="62" r="16" /><path d="M44 50l-8-14M76 50l8-14M40 110h40M48 110v22M72 110v22" /></g>
    case 'tower':
      return <g {...stroke}><path d="M46 150V70h28v80M46 70l14-24 14 24M30 40l24 28M90 36L62 70" /></g>
    case 'star':
      return <g {...stroke}><path d="M60 36l6 18h18l-14 12 6 18-16-10-16 10 6-18-14-12h18z" /><circle cx="36" cy="128" r="4" /><circle cx="84" cy="120" r="3" /><circle cx="70" cy="142" r="3" /></g>
    case 'moon':
      return <g {...stroke}><path d="M78 48a28 28 0 1 0 0 56 22 22 0 1 1 0-56z" /><path d="M40 130c8-10 32-10 40 0" /></g>
    case 'sun':
      return <g {...stroke}><circle cx="60" cy="78" r="18" /><path d="M60 40v12M60 104v12M22 78h12M86 78h12M34 52l8 8M78 96l8 8M86 52l-8 8M42 96l-8 8" /></g>
    case 'judgement':
      return <g {...stroke}><path d="M40 70h40v18a20 20 0 0 1-40 0zM60 40v30M48 48h24" /><path d="M36 140c8-12 16-12 24 0s16 12 24 0" /></g>
    default:
      return <g {...stroke}><circle cx="60" cy="84" r="28" /><ellipse cx="60" cy="84" rx="46" ry="18" /><path d="M60 40v88" /></g>
  }
}

function MinorArt({ rank, suit }: { rank: string; suit: string }) {
  const pips = rank === 'ace' ? 1 : rank === 'page' || rank === 'knight' || rank === 'queen' || rank === 'king' ? 0 : Number(rank)
  const court = pips === 0 && rank !== 'ace'
  return (
    <g {...stroke}>
      <Suit x={60} y={court || rank === 'ace' ? 78 : 36} s={court || rank === 'ace' ? 16 : 8} suit={suit} />
      {court && <Court rank={rank} />}
      {pips > 1 && <Pips count={pips} suit={suit} />}
    </g>
  )
}

function Court({ rank }: { rank: string }) {
  if (rank === 'page') return <path d="M48 110h24l-4 28H52z" />
  if (rank === 'knight') return <path d="M36 118h48M48 118c0 18 24 18 24 0" />
  if (rank === 'queen') return <path d="M42 108h36l-6 8H48zM48 116v24h24v-24" />
  return <path d="M40 108h40v8H40zM46 116v24h28v-24" />
}

function Pips({ count, suit }: { count: number; suit: string }) {
  const spots = Array.from({ length: count }, (_, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    return { x: 44 + col * 32, y: 62 + row * 18 }
  })
  return (
    <>
      {spots.map((spot) => <Suit key={`${spot.x}-${spot.y}`} x={spot.x} y={spot.y} s={7} suit={suit} />)}
    </>
  )
}

function Suit({ x, y, s, suit }: { x: number; y: number; s: number; suit: string }) {
  if (suit === 'wands') return <path d={`M${x} ${y - s}v${s * 2}M${x - s * 0.45} ${y - s * 0.2}h${s * 0.9}`} />
  if (suit === 'cups') return <path d={`M${x - s} ${y - s * 0.4}h${s * 2}c0 ${s} ${-s * 2} ${s} ${-s} ${s * 1.3}c${s} ${-s * 0.3} ${s} ${-s * 0.3} ${s} ${-s * 1.3}`} />
  if (suit === 'swords') return <path d={`M${x} ${y - s}v${s * 2}M${x - s * 0.6} ${y}h${s * 1.2}M${x - s * 0.3} ${y + s * 0.7}l${s * 0.3} ${s * 0.5}l${s * 0.3} ${-s * 0.5}`} />
  return <circle cx={x} cy={y} r={s * 0.55} />
}

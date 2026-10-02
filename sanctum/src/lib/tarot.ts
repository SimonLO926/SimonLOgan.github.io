import type { Lang } from '../i18n/types'
import { drawMany, randomIndex } from './draw'

export type TarotCard = {
  id: string
  title: Record<Lang, string>
  upright: Record<Lang, string>
  reversed: Record<Lang, string>
}

export type DrawnCard = { card: TarotCard; reversed: boolean }
export type Domain = 'love' | 'work' | 'money' | 'health' | 'general'

function L(hant: string, hans: string, en: string, ja: string): Record<Lang, string> {
  return { 'zh-Hant': hant, 'zh-Hans': hans, en, ja }
}

function major(
  id: string,
  title: [string, string, string, string],
  up: [string, string, string, string],
  rev: [string, string, string, string],
): TarotCard {
  return {
    id,
    title: L(...title),
    upright: L(...up),
    reversed: L(...rev),
  }
}

const MAJORS: TarotCard[] = [
  major('fool', ['愚者', '愚者', 'The Fool', '愚者'], ['起步本身就是路。帶很少的東西出門。', '起步本身就是路。带很少的东西出门。', 'Starting is already the road. Travel light.', '歩き出すこと自体が道。荷物は少なく。'], ['還沒出發，只在邊緣試探。', '还没出发，只在边缘试探。', 'You are still testing the edge, not walking.', 'まだ出ていない。縁で試している。']),
  major('magician', ['魔術師', '魔术师', 'The Magician', '魔術師'], ['工具已經在桌上。用一種，不要四種一起。', '工具已经在桌上。用一种，不要四种一起。', 'The tools are on the table. Use one, not all four.', '道具はもう卓の上。一つだけ使う。'], ['手法很多，手沒有落下。', '手法很多，手没有落下。', 'Many methods, and the hand has not landed.', '手法ばかりで、手が降りない。']),
  major('priestess', ['女祭司', '女祭司', 'The High Priestess', '女教皇'], ['先安靜。答案在還沒說出口的那一層。', '先安静。答案在还没说出口的那一层。', 'Be quiet first. The answer is in the layer not yet spoken.', 'まず静かに。答はまだ口にしていない層にある。'], ['沉默變成躲避。該問的還是要問。', '沉默变成躲避。该问的还是要问。', 'Silence has become avoidance. Ask the thing.', '沈黙が回避になった。問うべきことは問う。']),
  major('empress', ['女皇', '女皇', 'The Empress', '女帝'], ['養育與完成。讓一件事長到能用。', '养育与完成。让一件事长到能用。', 'Nourish it until it is usable.', '育てて、使えるところまで。'], ['照顧太多，自己空了。', '照顾太多，自己空了。', 'Care has emptied you.', '世話のしすぎで、自分が空になる。']),
  major('emperor', ['皇帝', '皇帝', 'The Emperor', '皇帝'], ['立一個邊界，並遵守它。', '立一个边界，并遵守它。', 'Set a boundary and keep it.', '境界を一つ立て、それを守る。'], ['秩序變成控制。鬆一格。', '秩序变成控制。松一格。', 'Order has turned into control. Loosen one notch.', '秩序が支配になった。一マス緩める。']),
  major('hierophant', ['教皇', '教皇', 'The Hierophant', '法王'], ['走一條已有的路：師、制度、或舊的規矩。', '走一条已有的路：师、制度、或旧的规矩。', 'Take a path that already exists: a teacher, a form, an old rule.', 'すでに道がある。師、制度、古い規則。'], ['規矩只是習慣。問它還適不適合。', '规矩只是习惯。问它还适不适合。', 'The rule is only a habit. Ask if it still fits.', '規則は習慣かもしれない。まだ合うか問う。']),
  major('lovers', ['戀人', '恋人', 'The Lovers', '恋人'], ['這是選擇，不是氣氛。選了就要對齊。', '这是选择，不是气氛。选了就要对齐。', 'This is a choice, not a mood. Once chosen, align with it.', 'これは選択であり、雰囲気ではない。選んだら揃える。'], ['兩邊都想要，所以還沒選。', '两边都想要，所以还没选。', 'You want both, so you have not chosen.', '両方欲しいので、まだ選んでいない。']),
  major('chariot', ['戰車', '战车', 'The Chariot', '戦車'], ['方向已定。把兩股力氣併成一條。', '方向已定。把两股力气并成一条。', 'The direction is set. Join the two forces into one.', '方向は決まった。二つの力を一本に。'], ['硬衝。先對齊輪子再出發。', '硬冲。先对齐轮子再出发。', 'You are forcing it. Align the wheels first.', '無理に進んでいる。車輪を揃えてから。']),
  major('strength', ['力量', '力量', 'Strength', '力'], ['力是柔的。把猛的那一部分安頓好。', '力是柔的。把猛的那一部分安顿好。', 'Strength is soft. Settle the fierce part.', '力は柔らかい。荒い部分を収める。'], ['在硬撐。承認累，力才回來。', '在硬撑。承认累，力才回来。', 'You are bracing. Admit the tiredness and the strength returns.', '無理に支えている。疲れを認めると力が戻る。']),
  major('hermit', ['隱者', '隐者', 'The Hermit', '隠者'], ['退一步看。燈只照腳下就夠。', '退一步看。灯只照脚下就够。', 'Step back. A lamp at your feet is enough.', '一歩引いて見る。灯は足元だけでよい。'], ['孤立變成斷線。找一個人說話。', '孤立变成断线。找一个人说话。', 'Solitude has become a cut line. Speak to one person.', '孤立が断線になった。一人に話す。']),
  major('wheel', ['命運之輪', '命运之轮', 'The Wheel', '運命の輪'], ['週期在轉。順這一段，不要跟整個輪子對幹。', '周期在转。顺这一段，不要跟整个轮子对干。', 'The cycle is turning. Work with this arc.', '周期が回っている。この一弧に沿う。'], ['以為自己能停住輪子。停的是你自己。', '以为自己能停住轮子。停的是你自己。', 'You think you can stop the wheel. You are the one who has stopped.', '輪を止められると思っている。止まっているのは自分。']),
  major('justice', ['正義', '正义', 'Justice', '正義'], ['把兩邊放上秤。補上你欠的那一側。', '把两边放上秤。补上你欠的那一侧。', 'Weigh both sides. Repair the side you owe.', '両方を秤に。借りている側を補う。'], ['秤沒有放上你自己。把自己放回去。', '秤没有放上你自己。把自己放回去。', 'You left yourself off the scale. Put yourself back.', '秤に自分が乗っていない。自分を戻す。']),
  major('hanged', ['吊人', '倒吊人', 'The Hanged Man', '吊された男'], ['停在半空是有用的。換一個角度看同一件事。', '停在半空是有用的。换一个角度看同一件事。', 'Hanging still is useful. See the same thing from another angle.', '空中で止まることには用がある。角度を変える。'], ['拖延打扮成等待。給一個日期。', '拖延打扮成等待。给一个日期。', 'Delay is dressed as waiting. Give it a date.', '先延ばしが待機のふりをしている。日付を置く。']),
  major('death', ['死神', '死神', 'Death', '死神'], ['某一段已經結束。收乾淨，新的才進得來。', '某一段已经结束。收干净，新的才进得来。', 'A chapter has ended. Clear it so the next can enter.', '一つの章は終わった。収めて、次を入れる。'], ['抓著已結束的東西。放手是這張牌的正文。', '抓着已结束的东西。放手是这张牌的正文。', 'You are holding what has finished. Letting go is the text.', '終わったものを掴んでいる。手放すことが本文。']),
  major('temperance', ['節制', '节制', 'Temperance', '節制'], ['調和。少一點，準一點。', '调和。少一点，准一点。', 'Blend it. A little less, and more exact.', '調合。少なく、正確に。'], ['忽冷忽熱。把比例固定下來。', '忽冷忽热。把比例固定下来。', 'Hot then cold. Fix the proportion.', '熱くなったり冷めたり。割合を決める。']),
  major('devil', ['惡魔', '恶魔', 'The Devil', '悪魔'], ['你看得很清楚自己被什麼拴住。鏈子沒有鎖死。', '你看得很清楚自己被什么拴住。链子没有锁死。', 'You can see what holds you. The chain is not locked.', '何に繋がれているか見えている。鎖は掛かっていない。'], ['把慾望說成命運。它只是一個習慣。', '把欲望说成命运。它只是一个习惯。', 'Desire is being called fate. It is a habit.', '欲望を運命と呼んでいる。それは習慣。']),
  major('tower', ['高塔', '高塔', 'The Tower', '塔'], ['不實的結構會掉。掉了才看得清楚。', '不实的结构会掉。掉了才看得清楚。', 'A false structure falls. After it falls, you can see.', '偽りの構造は落ちる。落ちてから見える。'], ['在補一座該拆的塔。停止修補。', '在补一座该拆的塔。停止修补。', 'You are repairing a tower that should come down.', '壊すべき塔を直している。補修をやめる。']),
  major('star', ['星星', '星星', 'The Star', '星'], ['希望是具體的。給它一點水，和一個遠的方向。', '希望是具体的。给它一点水，和一个远的方向。', 'Hope is concrete. Give it water and a distant bearing.', '希望は具体的。水と、遠い方角を。'], ['等靈感，不做容器。先做一個很小的杯子。', '等灵感，不做容器。先做一个很小的杯子。', 'You wait for inspiration and build no vessel. Make a small cup.', '霊感を待ち、器を作らない。小さな杯を先に。']),
  major('moon', ['月亮', '月亮', 'The Moon', '月'], ['看不清是正常的。不要在霧裡做永久決定。', '看不清是正常的。不要在雾里做永久决定。', 'Not seeing clearly is normal. Make no permanent decision in the fog.', '見えないのは普通。霧の中で恒久の決定をしない。'], ['恐懼在編故事。把事實寫成三條。', '恐惧在编故事。把事实写成三条。', 'Fear is writing the story. Write three facts.', '恐れが物語を編んでいる。事実を三つ書く。']),
  major('sun', ['太陽', '太阳', 'The Sun', '太陽'], ['明白、可見、可以拿出來說。', '明白、可见、可以拿出来说。', 'Clear, visible, and sayable.', '明らかで、見せられて、言える。'], ['太亮，忽略了影子裡的人。', '太亮，忽略了影子里的人。', 'So bright that the person in the shadow is missed.', '明るすぎて、影の人を見落としている。']),
  major('judgement', ['審判', '审判', 'Judgement', '審判'], ['舊的名字可以放下。回應那一聲呼喚。', '旧的名字可以放下。回应那一声呼唤。', 'An old name can be set down. Answer the call.', '古い名は置いてよい。呼びかけに応える。'], ['在審判自己，而不是在醒來。', '在审判自己，而不是在醒来。', 'You are judging yourself instead of waking.', '目覚める代わりに、自分を裁いている。']),
  major('world', ['世界', '世界', 'The World', '世界'], ['一個循環完成。慶祝，然後再出發。', '一个循环完成。庆祝，然后再出发。', 'A cycle is complete. Mark it, then set out again.', '一つの循環が完了した。祝って、また出る。'], ['差最後一步卻不去收尾。', '差最后一步却不去收尾。', 'One step remains, and you will not close it.', '最後の一歩が残っているのに、閉じない。']),
]

const SUITS = [
  { id: 'wands', title: L('權杖', '权杖', 'Wands', 'ワンド'), theme: L('意志與行動', '意志与行动', 'will and action', '意志と行動') },
  { id: 'cups', title: L('聖杯', '圣杯', 'Cups', 'カップ'), theme: L('情感與關係', '情感与关系', 'feeling and relation', '感情と関係') },
  { id: 'swords', title: L('寶劍', '宝剑', 'Swords', 'ソード'), theme: L('思想與決斷', '思想与决断', 'thought and decision', '思考と決断') },
  { id: 'pentacles', title: L('星幣', '星币', 'Pentacles', 'ペンタクル'), theme: L('身體與資源', '身体与资源', 'body and resources', '体と資源') },
]

const RANKS = [
  { id: 'ace', title: L('王牌', '王牌', 'Ace', 'エース'), beat: L('一個開頭', '一个开头', 'a beginning', '始まり') },
  { id: '2', title: L('二', '二', 'Two', '2'), beat: L('兩股力氣並排', '两股力气并排', 'two forces side by side', '二つの力が並ぶ') },
  { id: '3', title: L('三', '三', 'Three', '3'), beat: L('初步的成果', '初步的成果', 'a first result', '最初の成果') },
  { id: '4', title: L('四', '四', 'Four', '4'), beat: L('穩定下來', '稳定下来', 'a settling', '安定') },
  { id: '5', title: L('五', '五', 'Five', '5'), beat: L('摩擦與不齊', '摩擦与不齐', 'friction', '摩擦') },
  { id: '6', title: L('六', '六', 'Six', '6'), beat: L('走過一段之後的調整', '走过一段之后的调整', 'an adjustment after the road', '道のりの後の調整') },
  { id: '7', title: L('七', '七', 'Seven', '7'), beat: L('堅持或重新評估', '坚持或重新评估', 'holding on, or looking again', '守り続けるか、見直すか') },
  { id: '8', title: L('八', '八', 'Eight', '8'), beat: L('速度與技巧', '速度与技巧', 'speed and skill', '速さと技') },
  { id: '9', title: L('九', '九', 'Nine', '9'), beat: L('接近完成的壓力', '接近完成的压力', 'the pressure near the end', '終わりに近い圧') },
  { id: '10', title: L('十', '十', 'Ten', '10'), beat: L('一個階段的滿', '一个阶段的满', 'a stage that is full', '一つの段階の充満') },
  { id: 'page', title: L('侍者', '侍者', 'Page', 'ペイジ'), beat: L('學徒的消息', '学徒的消息', 'a student’s message', '見習いの知らせ') },
  { id: 'knight', title: L('騎士', '骑士', 'Knight', 'ナイト'), beat: L('推進', '推进', 'a push', '推進') },
  { id: 'queen', title: L('皇后', '皇后', 'Queen', 'クイーン'), beat: L('內在的掌握', '内在的掌握', 'inward mastery', '内なる掌握') },
  { id: 'king', title: L('國王', '国王', 'King', 'キング'), beat: L('對外的承擔', '对外的承担', 'outward responsibility', '外に向かう責任') },
]

function minorText(rank: (typeof RANKS)[number], suit: (typeof SUITS)[number], lang: Lang, reversed: boolean) {
  const title = lang === 'en' ? `${rank.title.en} of ${suit.title.en}` : lang === 'ja' ? `${suit.title.ja}の${rank.title.ja}` : `${suit.title[lang]}${rank.title[lang]}`
  const body = lang === 'en'
    ? `${rank.beat.en} of ${suit.theme.en}.`
    : lang === 'ja'
      ? `${suit.theme.ja}における${rank.beat.ja}。`
      : `${rank.beat[lang]}，落在${suit.theme[lang]}。`
  const turned = lang === 'en'
    ? `Turned inward: ${body.charAt(0).toUpperCase()}${body.slice(1)}`
    : lang === 'ja'
      ? `内側に向くと、${body}`
      : `轉向內側：${body}`
  return { title, text: reversed ? turned : body }
}

function minors(): TarotCard[] {
  const cards: TarotCard[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const title = {} as Record<Lang, string>
      const upright = {} as Record<Lang, string>
      const reversed = {} as Record<Lang, string>
      for (const lang of ['zh-Hant', 'zh-Hans', 'en', 'ja'] as const) {
        const up = minorText(rank, suit, lang, false)
        const down = minorText(rank, suit, lang, true)
        title[lang] = up.title
        upright[lang] = up.text
        reversed[lang] = down.text
      }
      cards.push({ id: `${rank.id}-${suit.id}`, title, upright, reversed })
    }
  }
  return cards
}

let deckCache: TarotCard[] | null = null

export function tarotDeck() {
  deckCache ??= [...MAJORS, ...minors()]
  return deckCache
}

export function drawTarot(count: number): DrawnCard[] {
  return drawMany(tarotDeck(), count).map((card) => ({ card, reversed: randomIndex(2) === 1 }))
}

const PLACE: Record<Lang, [string, string, string]> = {
  'zh-Hant': ['過去', '現在', '未來'],
  'zh-Hans': ['过去', '现在', '未来'],
  en: ['Past', 'Present', 'Future'],
  ja: ['過去', '現在', '未来'],
}

function stanceOf(cards: DrawnCard[]) {
  const score = cards.reduce((sum, item) => sum + (item.reversed ? -1 : 1), 0)
  if (score > 0) return 'go'
  if (score < 0) return 'stop'
  return 'wait'
}

function closing(stance: 'go' | 'wait' | 'stop', domain: Domain, question: string, lang: Lang) {
  const q = question
  const table: Record<typeof stance, Record<Domain, Record<Lang, string>>> = {
    go: {
      love: L(`所以「${q}」可以往前，但只把感情說成一個具體的約定。`, `所以「${q}」可以往前，但只把感情说成一个具体的约定。`, `So “${q}” can go forward, as one concrete promise.`, `だから「${q}」は進めてよい。ただし約束は一つに。`),
      work: L(`所以「${q}」牌面偏向可以做，只做牌上那一步，不要一次押上整個決定。`, `所以「${q}」牌面偏向可以做，只做牌上那一步，不要一次押上整个决定。`, `So “${q}” leans yes. Do only the step the cards name, not the whole decision at once.`, `だから「${q}」は進めてよい。牌が言う一歩だけ。`),
      money: L(`所以「${q}」可以小額前進，數目要能一句話說明。`, `所以「${q}」可以小额前进，数目要能一句话说明。`, `So “${q}” can move in a small amount you can explain in one sentence.`, `だから「${q}」は小さい額なら進めてよい。一言で説明できる分だけ。`),
      health: L(`所以「${q}」方向是對的，但今天先做休息和一個預約，不做猛的治療決定。`, `所以「${q}」方向是对的，但今天先做休息和一个预约，不做猛的治疗决定。`, `So “${q}” is aimed right, but today only rest and one appointment.`, `だから「${q}」の方向は合っている。今日は休息と予約だけ。`),
      general: L(`所以「${q}」可以動。照牌上的那一句做，做完再看要不要加碼。`, `所以「${q}」可以动。照牌上的那一句做，做完再看要不要加码。`, `So “${q}” can move. Follow the sentence on the card, then decide whether to add more.`, `だから「${q}」は動いてよい。牌の一文どおりに。`),
    },
    wait: {
      love: L(`所以「${q}」先不要答是或否。把話留到兩個人都空的時候。`, `所以「${q}」先不要答是或否。把话留到两个人都空的时候。`, `So “${q}” is not a yes or a no yet. Speak when both of you are actually free.`, `だから「${q}」はまだ是非を出さない。二人とも空いたときに。`),
      work: L(`所以「${q}」先不要接，也不要拒。缺的是一個日期和一個條件。`, `所以「${q}」先不要接，也不要拒。缺的是一个日期和一个条件。`, `So “${q}” should be neither accepted nor refused yet. You still need a date and a condition.`, `だから「${q}」はまだ受けず、拒まない。日付と条件が足りない。`),
      money: L(`所以「${q}」先不要進出。等你能把數目寫下來。`, `所以「${q}」先不要进出。等你能把数目写下来。`, `So “${q}” should not move money yet. Wait until the number is written down.`, `だから「${q}」はまだ金を動かさない。額を書いてから。`),
      health: L(`所以「${q}」今天只觀察，不改大方向。`, `所以「${q}」今天只观察，不改大方向。`, `So “${q}” is for watching today, not for changing the whole plan.`, `だから「${q}」は今日は観察だけ。大きな方向は変えない。`),
      general: L(`所以「${q}」先停在半空。牌要你換角度，不是要你立刻表態。`, `所以「${q}」先停在半空。牌要你换角度，不是要你立刻表态。`, `So “${q}” stays in mid-air. The cards want another angle, not an instant verdict.`, `だから「${q}」は空中で止まる。すぐ態度を決めるのではなく、角度を変える。`),
    },
    stop: {
      love: L(`所以「${q}」現在不要攤牌，也不要追問。先把最後那句話留到明天。`, `所以「${q}」现在不要摊牌，也不要追问。先把最后那句话留到明天。`, `So “${q}” should not be forced open now. Keep the last sentence until tomorrow.`, `だから「${q}」は今は突きつけない。最後の一言は明日まで。`),
      work: L(`所以「${q}」現在不要接。牌說這結構還會掉，先收，不要補。`, `所以「${q}」现在不要接。牌说这结构还会掉，先收，不要补。`, `So “${q}” is a no for now. The structure is still falling. Gather it in. Do not patch it.`, `だから「${q}」は今は受けない。構造はまだ落ちる。直すより収める。`),
      money: L(`所以「${q}」不要進場。先處理已經漏的那一筆。`, `所以「${q}」不要进场。先处理已经漏的那一笔。`, `So “${q}” should not enter. Deal with the leak you already have.`, `だから「${q}」は入らない。すでに漏れている分を先に。`),
      health: L(`所以「${q}」不要硬撐。今天的回答是停，並讓人知道你停了。`, `所以「${q}」不要硬撑。今天的回答是停，并让人知道你停了。`, `So “${q}” should not be pushed through. Today’s answer is to stop, and to say that you stopped.`, `だから「${q}」は無理に進まない。今日の答は止まること。`),
      general: L(`所以「${q}」現在的回答是不要。等牌上說的那件結束，再重新問。`, `所以「${q}」现在的回答是不要。等牌上说的那件结束，再重新问。`, `So the answer to “${q}” is not now. Ask again after the thing the cards named has ended.`, `だから「${q}」への答は、今は否。牌が言うものが終わってから、もう一度。`),
    },
  }
  return table[stance][domain][lang]
}

export function tarotAnswer(question: string, cards: DrawnCard[], lang: Lang) {
  const asked = question.trim()
  const subject = asked || (lang === 'en' ? 'the thing you would not write down' : lang === 'ja' ? '書かれなかった一件' : lang === 'zh-Hans' ? '你没有写下的那件事' : '你沒有寫下的那件事')
  const domain = detectDomain(asked)
  const open = lang === 'en'
    ? `You asked “${subject}”.`
    : lang === 'ja'
      ? `問いは「${subject}」。`
      : lang === 'zh-Hans'
        ? `你问的是「${subject}」。`
        : `你問的是「${subject}」。`
  const lines = cards.map((item, index) => {
    const place = cards.length === 3 ? `${PLACE[lang][index]}，` : ''
    const title = item.card.title[lang]
    const side = item.reversed ? (lang === 'en' ? 'reversed' : lang === 'ja' ? '逆' : '逆位') : (lang === 'en' ? 'upright' : lang === 'ja' ? '正' : '正位')
    const meaning = item.reversed ? item.card.reversed[lang] : item.card.upright[lang]
    if (lang === 'en') return `${place}${title} (${side}) answers “${subject}” like this: ${meaning}`
    if (lang === 'ja') return `${place}${title}（${side}）は「${subject}」にこう答える。${meaning}`
    if (lang === 'zh-Hans') return `${place}${title}（${side}）直接回答「${subject}」：${meaning}`
    return `${place}${title}（${side}）直接回答「${subject}」：${meaning}`
  })
  return [open, ...lines, closing(stanceOf(cards), domain, subject, lang)].join('\n')
}

export function detectDomain(question: string): Domain {
  const text = question.toLowerCase()
  const table: [Domain, string[]][] = [
    ['love', ['愛', '情', '恋', '婚', '喜歡', '喜欢', 'love', 'relationship', '恋人', '恋愛', '好き']],
    ['work', ['工作', '事業', '事业', '職', '职', 'job', 'work', 'career', '仕事', '転職']],
    ['money', ['錢', '钱', '財', '财', 'money', '投資', '投资', 'お金']],
    ['health', ['健康', '病', '身體', '身体', 'health', '病気']],
  ]
  for (const [domain, keys] of table) {
    if (keys.some((key) => text.includes(key.toLowerCase()))) return domain
  }
  return 'general'
}

export const DOMAIN_LINE: Record<Domain, Record<Lang, string>> = {
  love: L('若這問的是感情，先把話說明確。', '若这问的是感情，先把话说明确。', 'If this is love, say the thing plainly.', '恋の問いなら、まず一言をはっきり。'),
  work: L('若這問的是工作，指向下一步能做完的動作。', '若这问的是工作，指向下一步能做完的动作。', 'If this is work, take the next finishable step.', '仕事の問いなら、次に終われる一手。'),
  money: L('若這問的是錢，只看你能說清楚的數目。', '若这问的是钱，只看你能说清楚的数目。', 'If this is money, keep to the amount you can explain.', '金の問いなら、説明できる額だけ。'),
  health: L('若這問的是身體，先停一下再決定。', '若这问的是身体，先停一下再决定。', 'If this is the body, pause before deciding.', '体の問いなら、決める前に一度止まる。'),
  general: L('牌不回答字面，它把這問的力氣照出來。', '牌不回答字面，它把这问的力气照出来。', 'The cards do not answer the wording. They show the force of the question.', 'カードは字面に答えない。問いの力を照らす。'),
}

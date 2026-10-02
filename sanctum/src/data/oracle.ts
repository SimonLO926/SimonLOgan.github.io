export type OracleCard = {
  id: string
  name: string
  latin: string
  upright: string
  shadow: string
  master: string
}

export const ORACLE: OracleCard[] = [
  { id: 'gate', name: '門', latin: 'GATE', upright: '門已開一條縫。要決定的是進，不是再確認門在不在。', shadow: '你在門前整理鞋子。整理本身變成了不進去的理由。', master: '今天跨過一個具體的門檻：寄出、報名、或推開那扇你已站了很久的門。' },
  { id: 'mirror', name: '鏡', latin: 'MIRROR', upright: '你看見的別人，有一半是自己的角度。把鏡子轉正，話就會變短。', shadow: '你在等一個會照出你想要的樣子的人。那不是鏡，是觀眾。', master: '寫下你剛批評的那個人，哪一點其實也在你身上。只留一句。' },
  { id: 'tide', name: '潮', latin: 'TIDE', upright: '力量在漲。順著它整理舊約，不必另開一條河。', shadow: '你把退潮當成失敗。潮會回來，但不會回到同一個腳印。', master: '這週只做順水能完成的事。逆水的計畫放到下一個滿潮。' },
  { id: 'lamp', name: '燈', latin: 'LAMP', upright: '照亮一小圈就夠。看清腳下，比照亮整個未來有用。', shadow: '燈被你舉得太高，近處反而全是影子。', master: '把問題縮成今晚能看清的一步。只點一盞燈。' },
  { id: 'seed', name: '種', latin: 'SEED', upright: '一件很小的開始，已經夠稱為開始。埋下去，不要每天挖開來看。', shadow: '你收藏種子，卻不給它土。可能性因此變成壓力。', master: '選一顆種子，給它一個容器和一個日期。其他的先收進抽屜。' },
  { id: 'bridge', name: '橋', latin: 'BRIDGE', upright: '兩邊都要。你的位置在中間，把人與人、過去與下一步接上。', shadow: '你成了唯一的橋，於是誰也不肯自己下水。', master: '做一次連接，然後退開。橋不應該住在河中央。' },
  { id: 'crown', name: '冠', latin: 'CROWN', upright: '位置是你的，但冠要輕。領導是把燈光分給對的人。', shadow: '你抓住頭銜，因為害怕一旦放下就沒有人看見你。', master: '公開把一件功劳交給做出它的人。你的位置不會因此消失。' },
  { id: 'beast', name: '獸', latin: 'BEAST', upright: '有一股不肯被禮貌蓋住的力氣。給它一個正當的用途，它就是才能。', shadow: '力氣咬住了自己。怒氣若沒有任務，就只是消耗。', master: '把這股勁用在一件需要體力或決心的工作上，不要用在訊息裡。' },
  { id: 'well', name: '井', latin: 'WELL', upright: '答案在深處，不在更多的井。回到你已經挖過的那一口。', shadow: '你不停換地方打井，所以每一口都只到乾土。', master: '回到一個舊的技能或舊的關係，再挖一尺。不要新開題目。' },
  { id: 'voyage', name: '航', latin: 'VOYAGE', upright: '離開是對的。離開前把港口的帳結清，船才輕。', shadow: '你用遠方逃避一個還停在碼頭的對話。', master: '先完成告別或交接，再買票。順序不能反。' },
  { id: 'scale', name: '衡', latin: 'SCALE', upright: '把兩邊放上秤。重量一出來，你就不必再問感覺。', shadow: '你為了看起來公平，把自己的那一端拿掉了。', master: '用數字或時間重秤一次：你付出的，和你收下的。差多少，寫下來。' },
  { id: 'ember', name: '燼', latin: 'EMBER', upright: '看起來滅了，芯還熱。輕輕撥開灰，火可以再起。不要灌一桶油。', shadow: '你不斷戳那堆灰，把最後的熱也散掉。', master: '只復燃一件舊事。用很小的燃料：一封短訊、一個小時、一次重讀。' },
  { id: 'key', name: '鑰', latin: 'KEY', upright: '鑰匙已在你身上。它可能不像鑰匙，像一句你不肯說的話。', shadow: '你向所有人要鑰匙，唯獨不翻自己的口袋。', master: '找出你一直覺得「還不到時候」的那句話。時候就是這張牌。' },
  { id: 'curtain', name: '幕', latin: 'CURTAIN', upright: '有些東西該被看見，有些該留在幕後。你分得清，就會好看。', shadow: '你把私生活整場搬上舞台，然後抱怨燈光太燙。', master: '決定哪一件公開、哪一件只告訴一個人。幕是選擇，不是躲。' },
  { id: 'root', name: '根', latin: 'ROOT', upright: '先扎根。可見的高度可以晚一點。根穩的人，移動也穩。', shadow: '你嫌根部無趣，於是枝葉很多，風一來就倒。', master: '這週投資一件看不見的基本功：睡眠、帳、或技術的重複。' },
  { id: 'bell', name: '鐘', latin: 'BELL', upright: '到點了。鐘不跟你討論準備好沒有。站起來，儀式就開始。', shadow: '你把所有鐘都按掉，然後說生活沒有節奏。', master: '設一個今天會響的時間，並在它響時做那件你已決定的事。' },
  { id: 'field', name: '野', latin: 'FIELD', upright: '留白是有產能的。空的野地讓你看見哪裡該種。', shadow: '空白讓你恐慌，於是你用雜事把它填滿。', master: '空出連續的九十分鐘，不安排產出。結束時只記下浮上來的那一件。' },
  { id: 'blade', name: '刃', latin: 'BLADE', upright: '該切的東西已經清楚。切乾淨，傷口才小。', shadow: '刃朝向了不該切的人，多半是最近的人。', master: '只切一個：一個承諾、一個專案、或一個自我要求。切完就收。' },
  { id: 'nest', name: '巢', latin: 'NEST', upright: '你需要一個能回去的地方。先把巢修好，外面的風才是風景。', shadow: '巢變成了不出去的理由。安全若沒有門，就只是關。', master: '整理一個具體的角落，讓它真的能讓你坐下。然後再談外面的事。' },
  { id: 'star', name: '星', latin: 'STAR', upright: '方向在較遠的地方。你不必今晚到達，但要知道自己朝哪裡。', shadow: '你用星空逃避地面的地圖。遠方不能代替下一條街。', master: '寫下一個遠的方向，再寫下這一週朝它移動的一步。兩句都要有。' },
  { id: 'salt', name: '鹽', latin: 'SALT', upright: '少而準。一句真話、一點調味，就讓整鍋成立。', shadow: '你加得太多。解釋、道歉、承諾，都過鹹了。', master: '把你準備說的話刪到三句以內。鹽只要這麼多。' },
  { id: 'return', name: '返', latin: 'RETURN', upright: '回去不是失敗。你有東西落在來時的路上，值得回頭拿。', shadow: '你回到舊處，只為了證明自己沒有長大。', master: '回去做一件修補：道歉、取回作品、或重新學習一個舊技能。拿了就離開。' },
]

/* Fortuna — 占術計算ロジック */

/* ---------- シード付き乱数(同じ入力なら同じ結果を返す) ---------- */
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRng(str) {
  return mulberry32(hashString(str));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------- 西洋占星術 ---------- */
function getZodiac(month, day) {
  for (const z of ZODIAC) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (fm > tm) { // 年をまたぐ(山羊座)
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return z;
    } else {
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return z;
    }
  }
  return ZODIAC[0];
}

/* ---------- 東洋占術 ---------- */
// 立春(2/4頃)より前の生まれは前年扱い(簡易版)
function etoYear(y, m, d) {
  return (m === 1 || (m === 2 && d <= 3)) ? y - 1 : y;
}

function getEto(y, m, d) {
  const yy = etoYear(y, m, d);
  return ETO[((yy - 4) % 12 + 12) % 12];
}

function getJikkan(y, m, d) {
  const yy = etoYear(y, m, d);
  return JIKKAN[((yy - 4) % 10 + 10) % 10];
}

function getKyusei(y, m, d) {
  const yy = etoYear(y, m, d);
  let s = yy;
  while (s > 9) {
    s = String(s).split("").reduce((a, c) => a + Number(c), 0);
  }
  let star = 11 - s;
  if (star > 9) star -= 9;
  if (star < 1) star += 9;
  return KYUSEI[star - 1];
}

/* ---------- 今日の運勢スコア ----------
   乱数ではなく命理で組み立てる:
   基礎3点 + 日運の通変星(日主×今日の日干) + 月運の通変星(半分の重み)
   + 月相の補正 + わずかな日替わりゆらぎ。理由も一緒に返す。 */
function dailyFortune(birthdate) {
  const rng = seededRng(`${birthdate}::${todayKey()}`);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  const flow = kiFlow(birthdate);
  const dayW = flow.day.star.weights;
  const monthW = flow.month.star.weights;

  const phase = moonPhaseToday();
  const moonAdj = {
    "新月": { work: 0.4 }, "三日月": { work: 0.3 }, "上弦の月": { work: 0.4, love: 0.2 },
    "十三夜の月": { money: 0.3 }, "満月": { love: 0.5 }, "居待月": { health: 0.3 },
    "下弦の月": { health: 0.4 }, "有明月": { health: 0.3, love: 0.2 },
  }[phase.name] || {};

  const scores = {};
  for (const k of ["love", "work", "money", "health"]) {
    let v = 3 + (dayW[k] || 0) + (monthW[k] || 0) * 0.5 + (moonAdj[k] || 0) + (rng() * 2 - 1) * 0.7;
    scores[k] = Math.max(1, Math.min(5, Math.round(v)));
  }
  const total = Math.round((scores.love + scores.work + scores.money + scores.health) / 4 * 10) / 10;

  return {
    scores,
    total,
    myKan: flow.myKan,
    mySymbol: flow.nikkan.symbol,
    dayStar: flow.day.star,
    monthStar: flow.month.star,
    dayKanshi: flow.day.pillar.kan + flow.day.pillar.shi,
    reason: `今日は${flow.day.pillar.kan}${flow.day.pillar.shi}の日 — あなたの日主「${flow.myKan}」から見て「${flow.day.star.name}」にあたる日です。${flow.day.star.day}`,
    score100: Math.max(1, Math.min(100, Math.round(total * 20))),
    action: pick(LUCKY_ACTIONS),
    luckyColor: pick(LUCKY_COLORS),
    luckyItem: pick(LUCKY_ITEMS),
    luckyPlace: pick(LUCKY_PLACES),
    luckyNumber: 1 + Math.floor(rng() * 9),
  };
}

/* 日替わりでバリエーションが変わるスコア別コメント */
function pickScoreComment(theme, level) {
  const variants = SCORE_COMMENT[theme]?.[Math.min(4, Math.max(0, level - 1))];
  if (!variants) return "";
  return variants[hashString(todayKey() + theme) % variants.length];
}

/* ---------- タロット ---------- */
function drawTarot(count, seedStr) {
  const rng = seedStr ? seededRng(seedStr) : Math.random;
  const deck = [...TAROT];
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * deck.length);
    const card = deck.splice(idx, 1)[0];
    drawn.push({ ...card, reversed: rng() < 0.4 });
  }
  return drawn;
}

/* ---------- 暦計算(ユリウス通日) ---------- */
function toJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
    Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

/* ---------- 四柱推命(年柱・月柱・日柱) ---------- */
// 日柱: ユリウス通日から六十干支を連続計算(検証: 1900-01-01=甲戌, 2000-01-01=戊午)
function dayPillar(y, m, d) {
  const idx = ((toJDN(y, m, d) + 49) % 60 + 60) % 60;
  return { kan: JIKKAN[idx % 10], shi: JUNISHI[idx % 12] };
}

// 月柱: 節入り(簡易日付)で月支を決め、五虎遁で月干を求める
function monthPillar(y, m, d) {
  // 生まれ日がどの節月に属するか
  let idx = SETSU_TABLE.findIndex(([sm, sd]) => m < sm || (m === sm && d < sd));
  if (idx === -1) idx = 0; // 12/7以降は子月
  idx = (idx - 1 + 12) % 12;
  const shi = SETSU_TABLE[idx][2];

  const yearKanIdx = JIKKAN.indexOf(getJikkan(y, m, d));
  const toraKan = ((yearKanIdx % 5) * 2 + 2) % 10; // 五虎遁: 寅月の干
  const branchOrder = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const monthsFromTora = branchOrder.indexOf(shi);
  return { kan: JIKKAN[(toraKan + monthsFromTora) % 10], shi };
}

function fourPillars(y, m, d) {
  const yearP = { kan: getJikkan(y, m, d), shi: getEto(y, m, d).name };
  const monthP = monthPillar(y, m, d);
  const dayP = dayPillar(y, m, d);
  const nikkan = NIKKAN_DESC[dayP.kan];
  return { year: yearP, month: monthP, day: dayP, nikkan };
}

/* ---------- 月星座(月の黄経の略算) ---------- */
// 正午(JST)時点の月の黄経から星座を判定。誤差±1°程度(境界日は前後の可能性あり)
function moonSign(y, m, d) {
  const jd = toJDN(y, m, d) - 0.375; // 正午JST = 03:00 UTC
  const t = jd - 2451545.0;
  const rad = Math.PI / 180;
  const Lp = 218.316 + 13.176396 * t;      // 月の平均黄経
  const M = 357.529 + 0.98560028 * t;      // 太陽の平均近点角
  const Mp = 134.963 + 13.064993 * t;      // 月の平均近点角
  const D = 297.850 + 12.190749 * t;       // 平均離角
  const F = 93.272 + 13.229350 * t;        // 平均昇交点黄経差
  let lon = Lp
    + 6.289 * Math.sin(Mp * rad)
    + 1.274 * Math.sin((2 * D - Mp) * rad)
    + 0.658 * Math.sin(2 * D * rad)
    + 0.214 * Math.sin(2 * Mp * rad)
    - 0.186 * Math.sin(M * rad)
    - 0.114 * Math.sin(2 * F * rad);
  lon = ((lon % 360) + 360) % 360;
  const order = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
  const name = order[Math.floor(lon / 30)];
  const zodiac = ZODIAC.find((z) => z.name === name);
  return { name, symbol: zodiac.symbol, desc: MOONSIGN_DESC[name], longitude: lon };
}

/* ---------- 通変星(日主から見た十干の関係) ---------- */
const KAN_INFO = {
  "甲": { element: "木", yang: true }, "乙": { element: "木", yang: false },
  "丙": { element: "火", yang: true }, "丁": { element: "火", yang: false },
  "戊": { element: "土", yang: true }, "己": { element: "土", yang: false },
  "庚": { element: "金", yang: true }, "辛": { element: "金", yang: false },
  "壬": { element: "水", yang: true }, "癸": { element: "水", yang: false },
};
const SEI_CYCLE = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" }; // 相生
const KOKU_CYCLE = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" }; // 相剋

function tsuhensei(dayKan, otherKan) {
  const me = KAN_INFO[dayKan], other = KAN_INFO[otherKan];
  const same = me.yang === other.yang;
  let name;
  if (me.element === other.element) name = same ? "比肩" : "劫財";
  else if (SEI_CYCLE[me.element] === other.element) name = same ? "食神" : "傷官";
  else if (KOKU_CYCLE[me.element] === other.element) name = same ? "偏財" : "正財";
  else if (KOKU_CYCLE[other.element] === me.element) name = same ? "偏官" : "正官";
  else name = same ? "偏印" : "印綬"; // 相手が自分を生じる
  return { name, ...TSUHENSEI[name] };
}

/* ---------- 気の流れ(年運・月運・日運・週間) ---------- */
function kiFlow(birthdate, baseDate = new Date()) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const myKan = dayPillar(by, bm, bd).kan;
  const y = baseDate.getFullYear(), m = baseDate.getMonth() + 1, d = baseDate.getDate();
  const now = fourPillars(y, m, d);
  return {
    myKan,
    nikkan: NIKKAN_DESC[myKan],
    year: { pillar: now.year, star: tsuhensei(myKan, now.year.kan) },
    month: { pillar: now.month, star: tsuhensei(myKan, now.month.kan) },
    day: { pillar: now.day, star: tsuhensei(myKan, now.day.kan) },
  };
}

function weekFlow(birthdate, days = 7) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const myKan = dayPillar(by, bm, bd).kan;
  const week = [];
  const WD = ["日", "月", "火", "水", "木", "金", "土"];
  for (let i = 0; i < days; i++) {
    const t = new Date();
    t.setDate(t.getDate() + i);
    const p = dayPillar(t.getFullYear(), t.getMonth() + 1, t.getDate());
    const star = tsuhensei(myKan, p.kan);
    const w = star.weights;
    const power = w.love + w.work + w.money + w.health;
    week.push({
      date: t, label: `${t.getMonth() + 1}/${t.getDate()}`, wd: WD[t.getDay()],
      kanshi: p.kan + p.shi, star, power,
      today: i === 0,
    });
  }
  return week;
}

/* ---------- 九星気学:月盤と吉方位 ---------- */
// 月盤の中宮星: 子午卯酉年→寅月は八白 / 辰戌丑未年→五黄 / 寅申巳亥年→二黒、以降毎月逆行
function monthCenterStar(y, m, d) {
  const yy = etoYear(y, m, d);
  const branch = ETO[((yy - 4) % 12 + 12) % 12].name;
  const start = "子午卯酉".includes(branch) ? 8 : "辰戌丑未".includes(branch) ? 5 : 2;
  let idx = SETSU_TABLE.findIndex(([sm, sd]) => m < sm || (m === sm && d < sd));
  if (idx === -1) idx = 0;
  idx = (idx - 1 + 12) % 12;
  const branchOrder = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const monthsFromTora = branchOrder.indexOf(SETSU_TABLE[idx][2]);
  return ((start - 1 - monthsFromTora) % 9 + 9) % 9 + 1;
}

// 中宮星から各方位に回座する星を求める(後天定位からの平行移動)
function directionBoard(center) {
  const board = {};
  for (const dir of DIRECTIONS) {
    board[dir.name] = ((dir.teiiStar - 1 + center - 5) % 9 + 9) % 9 + 1;
  }
  return board;
}

// 本命星に対する今月の吉方位・凶方位(簡易版: 五黄殺・暗剣殺・本命殺・本命的殺を除外)
function kichiHoi(honmeiIdx, y, m, d) {
  const center = monthCenterStar(y, m, d);
  const board = directionBoard(center);
  const myElement = KYUSEI[honmeiIdx - 1].element;

  const bad = {};
  for (const [dir, star] of Object.entries(board)) {
    if (star === 5) { bad[dir] = "五黄殺"; bad[OPPOSITE_DIR[dir]] = bad[OPPOSITE_DIR[dir]] || "暗剣殺"; }
  }
  for (const [dir, star] of Object.entries(board)) {
    if (star === honmeiIdx) {
      bad[dir] = bad[dir] || "本命殺";
      bad[OPPOSITE_DIR[dir]] = bad[OPPOSITE_DIR[dir]] || "本命的殺";
    }
  }

  const good = [];
  for (const [dir, star] of Object.entries(board)) {
    if (bad[dir]) continue;
    const starElement = KYUSEI[star - 1].element;
    const isShowsei = SEI_CYCLE[starElement] === myElement; // 生気(自分を生じる)
    const isHiwa = starElement === myElement && star !== honmeiIdx; // 比和
    const isTaiki = SEI_CYCLE[myElement] === starElement; // 退気(自分が生じる)
    if (isShowsei || isHiwa || isTaiki) {
      good.push({ dir, star: KYUSEI[star - 1].name, grade: isShowsei ? "大吉" : isHiwa ? "吉" : "小吉" });
    }
  }
  good.sort((a, b) => ["大吉", "吉", "小吉"].indexOf(a.grade) - ["大吉", "吉", "小吉"].indexOf(b.grade));
  return { center, board, good, bad };
}

// テーマ別のおすすめ方位(吉方位の中からテーマに合う定位の方位を選ぶ)
function themeDirections(kichi) {
  const prefer = {
    love: ["南東", "北", "西"],
    work: ["北西", "東", "北東"],
    money: ["西", "北東", "南西"],
    health: ["南西", "北", "南"],
  };
  const goodDirs = kichi.good.map((g) => g.dir);
  const pick = (list) => list.find((dir) => goodDirs.includes(dir)) || null;
  return {
    love: pick(prefer.love),
    work: pick(prefer.work),
    money: pick(prefer.money),
    health: pick(prefer.health),
  };
}

/* ---------- 運命の称号 ---------- */
function fortuneTitle(birthdate) {
  const [y, m, d] = birthdate.split("-").map(Number);
  const zodiac = getZodiac(m, d);
  const kyusei = getKyusei(y, m, d);
  const nikkan = NIKKAN_DESC[dayPillar(y, m, d).kan];
  const kan = dayPillar(y, m, d).kan;
  return {
    title: `${SHOGO_NIKKAN[kan]}を宿す、${SHOGO_ZODIAC[zodiac.name]}${SHOGO_KYUSEI[kyusei.name]}`,
    parts: { nikkan: nikkan.symbol, zodiac: zodiac.name, kyusei: kyusei.name },
    // 称号の由来(ユーザーに見せる分解)
    origin: [
      { word: SHOGO_NIKKAN[kan], from: `日主「${kan}」(${nikkan.symbol})`, why: "生まれた日の十干 — あなたの本質" },
      { word: SHOGO_ZODIAC[zodiac.name], from: zodiac.name, why: "太陽星座 — 外に向かう顔" },
      { word: SHOGO_KYUSEI[kyusei.name], from: kyusei.name, why: "九星の本命星 — 世界での役回り" },
    ],
    total: 1080,
  };
}

/* ---------- 総合判定「今日の結論」 ----------
   複数の手法論の「票」を合算して、今日がどういう日かを一言で結論づける */
const SANGO_GROUPS = [["申", "子", "辰"], ["巳", "酉", "丑"], ["寅", "午", "戌"], ["亥", "卯", "未"]];

function dailyVerdict(birthdate) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const flow = kiFlow(birthdate);
  const phase = moonPhaseToday();
  const factors = [];
  const starPower = (star) => Object.values(star.weights).reduce((a, b) => a + b, 0);

  // 1. 四柱推命・日運(星の意味+その日どう過ごすかまで解説)
  const ds = flow.day.star;
  const dp = starPower(ds);
  const dScore = dp >= 1.2 ? 2 : dp >= 0.5 ? 1 : dp >= 0 ? 0 : -1;
  factors.push({
    method: "四柱推命・日運", label: `「${ds.name}」の日`,
    score: dScore,
    note: `「${ds.name}」は${ds.gloss}。今日は${ds.day}`,
  });

  // 2. 四柱推命・月運(月全体に流れる気流の解説)
  const ms = flow.month.star;
  const mp = starPower(ms);
  const mScore = mp >= 1.2 ? 1 : mp >= 0 ? 0 : -1;
  const monthDetail = ms.month.includes("— ") ? ms.month.split("— ")[1] : ms.month;
  factors.push({
    method: "四柱推命・月運", label: `「${ms.name}」の月`,
    score: mScore,
    note: `日ごとの運気の土台になる、月全体の気流です。今月は${monthDetail}`,
  });

  // 3. 干支の巡り(今日の日支 × 生まれ年支)
  const myBranch = getEto(by, bm, bd).name;
  const now = new Date();
  const todayBranch = dayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate()).shi;
  const diff = ((JUNISHI.indexOf(todayBranch) - JUNISHI.indexOf(myBranch)) % 12 + 12) % 12;
  const isSango = SANGO_GROUPS.some((g) => g.includes(myBranch) && g.includes(todayBranch)) && myBranch !== todayBranch;
  const isShigou = SHIGOU_PAIRS.some(([a, b]) => (a === myBranch && b === todayBranch) || (b === myBranch && a === todayBranch));
  let eScore = 0, eNote = `あなたの生まれ年(${myBranch})と今日の暦(${todayBranch})の十二支の相性です。今日は特別な引き合いも反発もない、ニュートラルな巡り。普段どおりの自分でいられる組み合わせです。`;
  if (isSango) { eScore = 2; eNote = `${myBranch}と${todayBranch}は、十二支の中でも強く引き合う「三合」の関係。強力な援軍が巡る吉日で、人に頼ること・共同作業が驚くほどスムーズに進みます。`; }
  else if (isShigou) { eScore = 2; eNote = `${myBranch}と${todayBranch}は、ぴたりと組み合う「支合」の関係。ご縁がまとまりやすい日で、約束・契約・仲直りに向いています。`; }
  else if (diff === 6) { eScore = -2; eNote = `${myBranch}と${todayBranch}は十二支の正反対に位置する「冲(ちゅう)」の関係。予定変更や衝突が起きやすい日なので、大事な決断はずらし、確認をいつもより丁寧に。`; }
  else if (diff === 0) { eScore = 1; eNote = `今日は生まれ年と同じ「${myBranch}」の気が巡る日。自分らしさが自然に出せる、ホームグラウンドのような一日です。`; }
  factors.push({ method: "干支の巡り", label: `${todayBranch}の日 × ${myBranch}年生まれ`, score: eScore, note: eNote });

  // 4. 月相
  const waxing = ["新月", "三日月", "上弦の月", "十三夜の月"].includes(phase.name);
  const pScore = ["新月", "上弦の月", "満月"].includes(phase.name) ? 1 : waxing ? 0 : -1;
  factors.push({
    method: "月相", label: `${phase.emoji} ${phase.name}`,
    score: pScore,
    note: waxing || phase.name === "満月"
      ? "月が満ちていく時期。新しく始める・育てる・人に会うことに、月のリズムが味方します。"
      : "月が欠けていく時期。手放す・整理する・締めくくることが自然とうまくいくタイミング。焦って新しく始めるより、身軽になる準備を。",
  });

  const total = factors.reduce((a, f) => a + f.score, 0);
  const [rank, word, advice] =
    total >= 4 ? ["大吉", "攻めの日", "複数の暦が同時に追い風を示す、めったにない日。大一番・告白・提案はこの日に。"] :
    total >= 2 ? ["吉", "前進の日", "流れは味方しています。準備してきたことを一歩、形にしましょう。"] :
    total >= 0 ? ["平", "平常の日", "特別な追い風も向かい風もない日。ルーティンを丁寧に積むのが最善手です。"] :
    total >= -2 ? ["静", "整えの日", "攻めるより整える日。振り返り・片付け・仕込みが、明日からの追い風になります。"] :
    ["休", "充電の日", "複数の暦が休息を勧めています。今日は自分を甘やかしてOK。休むのも戦略です。"];

  return { factors, total, rank, word, advice };
}

/* ---------- 月相(今日の月) ---------- */
function moonPhaseToday() {
  const now = new Date();
  const jd = toJDN(now.getFullYear(), now.getMonth() + 1, now.getDate()) - 0.375;
  const age = (((jd - 2451550.1) % 29.530588853) + 29.530588853) % 29.530588853;
  const idx = Math.floor((age / 29.530588853) * 8 + 0.5) % 8;
  return { ...MOON_PHASES[idx], age: Math.round(age) };
}

/* ---------- 今日の言葉(日替わり) ---------- */
function dailyQuote() {
  return DAILY_QUOTES[hashString(todayKey()) % DAILY_QUOTES.length];
}

/* ---------- 相性診断 ---------- */
const GOGYO_KOKU = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" }; // 相剋
const SHIGOU_PAIRS = [["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"]]; // 支合

function zodiacCompatScore(e1, e2) {
  if (e1 === e2) return { score: 88, note: "同じエレメント同士。価値観や行動のリズムが自然と噛み合う組み合わせです。" };
  const pair = [e1, e2].sort().join("");
  if (pair === "火風") return { score: 92, note: "火と風は互いを高め合う最高の相性。一緒にいると行動力も発想力も倍増します。" };
  if (pair === "地水") return { score: 90, note: "地と水は育み合う相性。安心感と情緒が調和し、長続きする関係を築けます。" };
  if (pair === "水風") return { score: 62, note: "感性の水と理性の風。テンポは違いますが、違いを面白がれれば良い刺激になります。" };
  if (pair === "地火") return { score: 58, note: "堅実な地と情熱の火。ペースの違いを認め合うことが関係を深める鍵です。" };
  if (pair === "水火") return { score: 55, note: "水と火は正反対の気質。だからこそ、お互いにない魅力に強く惹かれ合う関係です。" };
  return { score: 56, note: "風と地は自由と安定のコンビ。役割分担がうまくいくと最強のチームになります。" }; // 風地
}

function gogyoCompatScore(k1, k2) {
  const e1 = k1.element, e2 = k2.element;
  if (e1 === e2) return { score: 80, note: `どちらも「${e1}」の気を持つ比和の関係。似た者同士で居心地の良い組み合わせです。` };
  if (GOGYO_RELATION[e1]?.boosts === e2 || GOGYO_RELATION[e2]?.boosts === e1)
    return { score: 90, note: `「${e1}」と「${e2}」は相生(そうじょう)の関係。一方がもう一方の運気を自然に育てます。` };
  if (GOGYO_KOKU[e1] === e2 || GOGYO_KOKU[e2] === e1)
    return { score: 55, note: `「${e1}」と「${e2}」は相剋(そうこく)の関係。ぶつかりやすい分、乗り越えれば強い絆になります。` };
  return { score: 70, note: `「${e1}」と「${e2}」は程よい距離感の関係。互いのペースを尊重できる組み合わせです。` };
}

function etoCompatScore(eto1, eto2) {
  const i = ETO.findIndex((e) => e.name === eto1.name);
  const j = ETO.findIndex((e) => e.name === eto2.name);
  const diff = ((i - j) % 12 + 12) % 12;
  const isShigou = SHIGOU_PAIRS.some(([a, b]) =>
    (a === eto1.name && b === eto2.name) || (a === eto2.name && b === eto1.name));
  if (isShigou) return { score: 88, note: `${eto1.name}と${eto2.name}は「支合」。互いを引き立て合う、縁の深い組み合わせです。` };
  if (diff === 0) return { score: 85, note: "同じ干支同士。考え方の癖まで似ていて、言葉にしなくても通じ合えます。" };
  if (diff === 4 || diff === 8) return { score: 90, note: `${eto1.name}と${eto2.name}は「三合」の吉配置。一緒に何かを成し遂げる力に恵まれます。` };
  if (diff === 6) return { score: 52, note: "正反対に位置する「冲」の関係。衝突もありますが、自分にない視点をくれる貴重な相手です。" };
  if (diff === 1 || diff === 11) return { score: 72, note: "隣り合う干支同士。近すぎず遠すぎず、日常を心地よく共有できる関係です。" };
  return { score: 66, note: "穏やかな中間の相性。共通の目標を持つことで絆がぐっと深まります。" };
}

function compatibilityReading(p1, p2) {
  const parse = (p) => {
    const [y, m, d] = p.birthdate.split("-").map(Number);
    return {
      name: p.name,
      zodiac: getZodiac(m, d),
      eto: getEto(y, m, d),
      kyusei: getKyusei(y, m, d),
      kan: dayPillar(y, m, d).kan,
    };
  };
  const a = parse(p1), b = parse(p2);
  const zodiac = zodiacCompatScore(a.zodiac.element, b.zodiac.element);
  const gogyo = gogyoCompatScore(a.kyusei, b.kyusei);
  const eto = etoCompatScore(a.eto, b.eto);
  /* 絆の質: 日主(生まれた「日」の十干)同士の通変星。年や月が同じでも、日が違えばここが変わる */
  const bondAB = { star: tsuhensei(a.kan, b.kan).name };
  const bondBA = { star: tsuhensei(b.kan, a.kan).name };
  Object.assign(bondAB, AISHO_BOND[bondAB.star]);
  Object.assign(bondBA, AISHO_BOND[bondBA.star]);
  const bond = { ab: bondAB, ba: bondBA, score: Math.round((bondAB.score + bondBA.score) / 2) };
  const total = Math.round(zodiac.score * 0.3 + gogyo.score * 0.25 + eto.score * 0.25 + bond.score * 0.2);

  const band = total >= 85 ? "運命的な好相性" : total >= 72 ? "とても良い相性" : total >= 60 ? "磨けば光る相性" : "刺激し合う成長の相性";
  const advice = total >= 85
    ? "自然体のままで息の合う二人。感謝を言葉にする習慣が、この良い流れをさらに長続きさせます。"
    : total >= 72
      ? "土台のしっかりした組み合わせ。小さなすれ違いは早めに話し合えば、絆はむしろ深まります。"
      : total >= 60
        ? "違いが目につく時期もありますが、それは伸びしろの証。相手の得意分野を頼ってみると関係が好転します。"
        : "正反対だからこそ学びの多い二人。「自分と違う」を「面白い」に変換できれば、唯一無二のパートナーになります。";

  return { a, b, zodiac, gogyo, eto, bond, total, band, advice };
}

/* 相性: あなたから見た相手/相手から見たあなた(五行の向きで読む) */
function perspectiveCompat(me, other, meName, otherName) {
  const em = me.kyusei.element, eo = other.kyusei.element;
  if (GOGYO_RELATION[eo]?.boosts === em) return {
    score: 90, label: "支えてもらえる相手",
    note: `${otherName}の「${eo}」の気が、${meName}の「${em}」を自然に育ててくれます。そばにいるだけで充電できる関係です。`,
  };
  if (GOGYO_RELATION[em]?.boosts === eo) return {
    score: 80, label: "つい尽くしたくなる相手",
    note: `${meName}の気が${otherName}を育てる巡り。与える喜びが大きい関係です。自分の充電も忘れずに。`,
  };
  if (em === eo) {
    // 同じ五行でも、視点ごとに星座エレメントで書き分ける
    const zm = me.zodiac.element, zo = other.zodiac.element;
    if (zm === zo) return {
      score: 84, label: "以心伝心の同志",
      note: `五行も星座の気質も同じ。${meName}にとって${otherName}は、言葉にしなくても通じ合える鏡のような存在です。`,
    };
    return {
      score: 78, label: "似た者同士の好相性",
      note: `同じ「${em}」の気を持ちつつ、${otherName}は星座では「${zo}」の質。${meName}から見ると、根っこは同じなのに違う景色を見せてくれる相手です。`,
    };
  }
  if (GOGYO_KOKU[eo] === em) return {
    score: 62, label: "あなたを鍛えてくれる相手",
    note: `${otherName}の「${eo}」は${meName}の「${em}」に負荷をかける巡り。ぶつかった分だけ、あなたを強くしてくれる存在です。`,
  };
  return {
    score: 68, label: "あなたがリードする相手",
    note: `${meName}の「${em}」が主導権を握る巡り。引っ張る場面が多い分、相手の歩幅への気配りが絆を深めます。`,
  };
}

/* ふたりの取扱説明書: 遊び方・ケンカの火種・ふたりの吉日 */
function aishoTopics(r) {
  // 遊び方(星座エレメントの組み合わせ)
  const pairKey = [r.a.zodiac.element, r.b.zodiac.element].sort().join("");
  const play = AISHO_PLAY[pairKey];

  // ケンカの火種: 4層のうちいちばん点が低い層から具体的に
  const weakerBond = r.bond.ab.score <= r.bond.ba.score ? r.bond.ab : r.bond.ba;
  const layers = [
    { s: r.zodiac.score, text: "ノリとテンポのズレ。誘いの返事の速さや盛り上がり方は違って当たり前、と最初から知っておくだけで衝突が減ります。" },
    { s: r.gogyo.score, text: "「正しさ」のぶつかり合い。どちらも間違っていないことが多いので、先に相手の言い分を全部聞いた方が勝ちです。" },
    { s: r.eto.score, text: "予定と価値観の食い違い。大事な決めごとは、どちらかが疲れている日を避けるだけで驚くほど揉めなくなります。" },
    { s: r.bond.score, text: BOND_FRICTION[weakerBond.star] },
  ];
  const friction = layers.reduce((a, b) => (b.s < a.s ? b : a));

  // ふたりの吉日: 向こう30日で、日の十二支がふたりの年支と良い角度を結ぶ日
  const rate = (dayShi, yearShi) => {
    if (SANGO_GROUPS.some((g) => g.includes(dayShi) && g.includes(yearShi)) && dayShi !== yearShi) return 2;
    if (SHIGOU_PAIRS.some(([x, z]) => (x === dayShi && z === yearShi) || (z === dayShi && x === yearShi))) return 2;
    const diff = Math.abs(JUNISHI.indexOf(dayShi) - JUNISHI.indexOf(yearShi));
    if (diff === 6) return -3;
    return 0;
  };
  const now = new Date();
  let best = null;
  for (let k = 1; k <= 30; k++) {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    const shi = dayPillar(t.getFullYear(), t.getMonth() + 1, t.getDate()).shi;
    const score = rate(shi, r.a.eto.name) + rate(shi, r.b.eto.name);
    if (!best || score > best.score) best = { score, m: t.getMonth() + 1, d: t.getDate(), shi };
  }
  const luckyNote = best.score >= 4
    ? "ふたりの生まれ年の気と強く響き合う、この30日でいちばんの吉日です。"
    : best.score >= 2
      ? "どちらかの気と良い角度を結ぶ、ふたりで動くのに向いた日です。"
      : "大きな衝突のない、穏やかに過ごせる日です。";
  return { play, friction: friction.text, lucky: { m: best.m, d: best.d, note: luckyNote } };
}

/* 二人の関係を一言で */
function aishoKeyword(r) {
  if (r.total >= 85) return "運命の共鳴";
  const em = r.a.kyusei.element, eo = r.b.kyusei.element;
  const sei = GOGYO_RELATION[em]?.boosts === eo || GOGYO_RELATION[eo]?.boosts === em;
  if (r.total >= 72) return sei ? "育て合うふたり" : em === eo ? "以心伝心の同志" : "磨き合う原石";
  if (r.total >= 60) return "伸びしろだらけのふたり";
  return "正反対という才能";
}

/* ---------- 統合鑑定 ---------- */
function integratedReading({ name, birthdate, theme }) {
  const [y, m, d] = birthdate.split("-").map(Number);
  const zodiac = getZodiac(m, d);
  const eto = getEto(y, m, d);
  const jikkan = getJikkan(y, m, d);
  const kyusei = getKyusei(y, m, d);
  const pillars = fourPillars(y, m, d);
  const moon = moonSign(y, m, d);
  const daily = dailyFortune(birthdate);
  const [card] = drawTarot(1, `${birthdate}::tarot::${todayKey()}`);

  // 五行の相性:九星の五行と西洋エレメントの関係で一言
  const rel = GOGYO_RELATION[zodiac.element];
  const elementNote = rel && rel.boosts === kyusei.element
    ? `西洋の「${zodiac.element}」のエレメントが東洋の「${kyusei.element}」の気を育てる、エネルギーの流れが良い組み合わせです。`
    : rel && rel.boostedBy === kyusei.element
      ? `東洋の「${kyusei.element}」の気が西洋の「${zodiac.element}」のエレメントを支える、土台の安定した組み合わせです。`
      : `西洋の「${zodiac.element}」と東洋の「${kyusei.element}」、異なる気質を併せ持つバランス型です。`;

  const themeScore = theme === "total" ? Math.round(daily.total) : daily.scores[theme];
  const themeComment = pickScoreComment(theme, themeScore);

  return { name, birthdateStr: birthdate, zodiac, eto, jikkan, kyusei, pillars, moon, daily, card, theme, themeScore, themeComment, elementNote };
}

/* ---------- ホロスコープ(出生図・10天体の位置) ----------
   Paul Schlyter の近似法による黄経計算(精度±1度程度、娯楽用途に十分)。
   出生時刻が不明の場合は正午JSTで計算します。 */
const PLANET_BODIES = [
  { key: "sun", ja: "太陽", glyph: "☉", role: "人生の核・生き方" },
  { key: "moon", ja: "月", glyph: "☽", role: "素の感情・安心のかたち" },
  { key: "mercury", ja: "水星", glyph: "☿", role: "頭の使い方・言葉" },
  { key: "venus", ja: "金星", glyph: "♀", role: "愛し方・美意識" },
  { key: "mars", ja: "火星", glyph: "♂", role: "行動力・情熱の出し方" },
  { key: "jupiter", ja: "木星", glyph: "♃", role: "幸運の広がり方" },
  { key: "saturn", ja: "土星", glyph: "♄", role: "課題・鍛えられる場所" },
  { key: "uranus", ja: "天王星", glyph: "♅", role: "変革の衝動", gen: true },
  { key: "neptune", ja: "海王星", glyph: "♆", role: "夢と直感", gen: true },
  { key: "pluto", ja: "冥王星", glyph: "♇", role: "根源的な変容", gen: true },
];

const ORBITAL_ELEMENTS = {
  mercury: { N: [48.3313, 3.24587e-5], i: [7.0047, 5.0e-8], w: [29.1241, 1.01444e-5], a: [0.387098, 0], e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368] },
  venus: { N: [76.6799, 2.4659e-5], i: [3.3946, 2.75e-8], w: [54.891, 1.38374e-5], a: [0.72333, 0], e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244] },
  mars: { N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8], w: [286.5016, 2.92961e-5], a: [1.523688, 0], e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766] },
  jupiter: { N: [100.4542, 2.76854e-5], i: [1.303, -1.557e-7], w: [273.8777, 1.64505e-5], a: [5.20256, 0], e: [0.048498, 4.469e-9], M: [19.895, 0.0830853001] },
  saturn: { N: [113.6634, 2.3898e-5], i: [2.4886, -1.081e-7], w: [339.3939, 2.97661e-5], a: [9.55475, 0], e: [0.055546, -9.499e-9], M: [316.967, 0.0334442282] },
  uranus: { N: [74.0005, 1.3978e-5], i: [0.7733, 1.9e-8], w: [96.6612, 3.0565e-5], a: [19.18171, -1.55e-8], e: [0.047318, 7.45e-9], M: [142.5905, 0.011725806] },
  neptune: { N: [131.7806, 3.0173e-5], i: [1.77, -2.55e-7], w: [272.8461, -6.027e-6], a: [30.05826, 3.313e-8], e: [0.008606, 2.15e-9], M: [260.2471, 0.005995147] },
};

function planetLongitudes(y, m, d, hourJST) {
  const rad = Math.PI / 180;
  const rev360 = (x) => ((x % 360) + 360) % 360;
  const sinD = (x) => Math.sin(x * rad), cosD = (x) => Math.cos(x * rad);
  const ut = hourJST - 9; // JST -> UT
  const dd = 367 * y - Math.floor((7 * (y + Math.floor((m + 9) / 12))) / 4) + Math.floor((275 * m) / 9) + d - 730530 + ut / 24;

  // 太陽(=地球の位置の裏返し)
  const ws = 282.9404 + 4.70935e-5 * dd;
  const es = 0.016709 - 1.151e-9 * dd;
  const Ms = rev360(356.047 + 0.9856002585 * dd);
  const Es = Ms + es * (180 / Math.PI) * sinD(Ms) * (1 + es * cosD(Ms));
  const xv0 = cosD(Es) - es, yv0 = Math.sqrt(1 - es * es) * sinD(Es);
  const sunLon = rev360(Math.atan2(yv0, xv0) / rad + ws);
  const rs = Math.sqrt(xv0 * xv0 + yv0 * yv0);
  const xs = rs * cosD(sunLon), ys = rs * sinD(sunLon);

  // 月(地心黄経・主要摂動6項)
  const t = dd - 1.5; // moonSign と同じ J2000 基準
  const Lp = 218.316 + 13.176396 * t;
  const Mm = 357.529 + 0.98560028 * t;
  const Mp = 134.963 + 13.064993 * t;
  const D = 297.85 + 12.190749 * t;
  const F = 93.272 + 13.22935 * t;
  const moonLon = rev360(Lp + 6.289 * sinD(Mp) + 1.274 * sinD(2 * D - Mp) + 0.658 * sinD(2 * D)
    + 0.214 * sinD(2 * Mp) - 0.186 * sinD(Mm) - 0.114 * sinD(2 * F));

  // 惑星(日心 -> 地心)
  function helio(el) {
    const N = el.N[0] + el.N[1] * dd, inc = el.i[0] + el.i[1] * dd, w = el.w[0] + el.w[1] * dd;
    const a = el.a[0] + el.a[1] * dd, e = el.e[0] + el.e[1] * dd, M = rev360(el.M[0] + el.M[1] * dd);
    let E = M + e * (180 / Math.PI) * sinD(M) * (1 + e * cosD(M));
    for (let k = 0; k < 6; k++) E = E - (E - e * (180 / Math.PI) * sinD(E) - M) / (1 - e * cosD(E));
    const xv = a * (cosD(E) - e), yv = a * Math.sqrt(1 - e * e) * sinD(E);
    const v = Math.atan2(yv, xv) / rad, r = Math.sqrt(xv * xv + yv * yv);
    const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(inc));
    const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(inc));
    return { xh, yh, r, M, lonecl: rev360(Math.atan2(yh, xh) / rad) };
  }

  const H = {};
  for (const key of Object.keys(ORBITAL_ELEMENTS)) H[key] = helio(ORBITAL_ELEMENTS[key]);

  // 木星・土星・天王星の主要摂動(黄経補正)
  const Mj = H.jupiter.M, Msa = H.saturn.M, Mu = H.uranus.M;
  H.jupiter.lonecl += -0.332 * sinD(2 * Mj - 5 * Msa - 67.6) - 0.056 * sinD(2 * Mj - 2 * Msa + 21)
    + 0.042 * sinD(3 * Mj - 5 * Msa + 21) - 0.036 * sinD(Mj - 2 * Msa) + 0.022 * cosD(Mj - Msa)
    + 0.023 * sinD(2 * Mj - 3 * Msa + 52) - 0.016 * sinD(Mj - 5 * Msa - 69);
  H.saturn.lonecl += 0.812 * sinD(2 * Mj - 5 * Msa - 67.6) - 0.229 * cosD(2 * Mj - 4 * Msa - 2)
    + 0.119 * sinD(Mj - 2 * Msa - 3) + 0.046 * sinD(2 * Mj - 6 * Msa - 69) + 0.014 * sinD(Mj - 3 * Msa + 32);
  H.uranus.lonecl += 0.04 * sinD(Msa - 2 * Mu + 6) + 0.035 * sinD(Msa - 3 * Mu + 33) - 0.015 * sinD(Mj - Mu + 20);

  const geo = (h) => {
    const xh = h.r * cosD(h.lonecl), yh = h.r * sinD(h.lonecl);
    return rev360(Math.atan2(yh + ys, xh + xs) / rad);
  };

  // 冥王星(Schlyterの近似級数, 1900-2100)
  const S = 50.03 + 0.033459652 * dd, P = 238.95 + 0.003968789 * dd;
  const plutoLonecl = 238.9508 + 0.00400703 * dd
    - 19.799 * sinD(P) + 19.848 * cosD(P) + 0.897 * sinD(2 * P) - 4.956 * cosD(2 * P)
    + 0.61 * sinD(3 * P) + 1.211 * cosD(3 * P) - 0.341 * sinD(4 * P) - 0.19 * cosD(4 * P)
    + 0.128 * sinD(5 * P) - 0.034 * cosD(5 * P) - 0.038 * sinD(6 * P) + 0.031 * cosD(6 * P)
    + 0.02 * sinD(S - P) - 0.01 * cosD(S - P);
  const plutoR = 40.72 + 6.68 * sinD(P) + 6.9 * cosD(P) - 1.18 * sinD(2 * P) - 0.03 * cosD(2 * P) + 0.15 * sinD(3 * P) - 0.14 * cosD(3 * P);
  const plutoGeo = rev360(Math.atan2(plutoR * sinD(plutoLonecl) + ys, plutoR * cosD(plutoLonecl) + xs) / rad);

  return {
    sun: sunLon, moon: moonLon,
    mercury: geo(H.mercury), venus: geo(H.venus), mars: geo(H.mars),
    jupiter: geo(H.jupiter), saturn: geo(H.saturn),
    uranus: geo(H.uranus), neptune: geo(H.neptune), pluto: plutoGeo,
  };
}

const SIGN_ORDER = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
const ELEMENT_STYLE = {
  "火": "直感とひらめきで動く",
  "地": "現実的に、着実に形へ落とす",
  "風": "言葉と知性でつないでいく",
  "水": "感情と共感で深く感じ取る",
};
const ASPECT_TYPES = [
  { angle: 0, ja: "コンジャンクション(0°)", tone: "hard0", note: "重なり合って、互いの性質を強め合います。あなたの中で特に濃いテーマ。" },
  { angle: 60, ja: "セクスタイル(60°)", tone: "soft", note: "軽やかに助け合う心地よい角度。意識して使うほど伸びる才能です。" },
  { angle: 90, ja: "スクエア(90°)", tone: "hard", note: "摩擦を生む角度。ただし乗り越えるたびに、あなたの強さに変わります。" },
  { angle: 120, ja: "トライン(120°)", tone: "soft", note: "自然に調和する角度。努力の自覚なしに流れ出る、生まれつきの才能です。" },
  { angle: 180, ja: "オポジション(180°)", tone: "hard", note: "引っ張り合う角度。両極を行き来しながら、バランスの取り方を学ばせます。" },
];

function horoscope(y, m, d, hourJST = 12, hasTime = false) {
  const lons = planetLongitudes(y, m, d, hourJST);
  const planets = PLANET_BODIES.map((b) => {
    const lon = lons[b.key];
    const signName = SIGN_ORDER[Math.floor(lon / 30)];
    const sign = ZODIAC.find((z) => z.name === signName);
    return { ...b, lon, sign, deg: Math.floor(lon % 30) };
  });

  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i], b = planets[j];
      if (a.gen && b.gen) continue; // 世代天体同士は個人差が出ないので省く
      let diff = Math.abs(a.lon - b.lon);
      if (diff > 180) diff = 360 - diff;
      for (const t of ASPECT_TYPES) {
        const orb = Math.abs(diff - t.angle);
        const maxOrb = (a.key === "sun" || a.key === "moon" || b.key === "sun" || b.key === "moon")
          ? (t.angle === 60 ? 5 : 8) : (t.angle === 60 ? 4 : 6);
        if (orb <= maxOrb) aspects.push({ a, b, type: t, orb });
      }
    }
  }
  aspects.sort((x, y2) => x.orb - y2.orb);

  return { planets, aspects: aspects.slice(0, 7), hasTime };
}

/* ---------- アセンダント(上昇星座) ----------
   出生時刻+出生地の緯度経度から、生まれた瞬間に東の地平線を昇っていた星座を求める。
   GMST -> 地方恒星時 -> 標準のアセンダント公式(検証: 日の出時に太陽黄経と一致) */
function ascendantSign(y, m, d, hourJST, lat, lon) {
  const rad = Math.PI / 180;
  const rev = (x) => ((x % 360) + 360) % 360;
  const ut = hourJST - 9;
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const jd = jdn + (ut - 12) / 24;
  const gmst = rev(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const lst = rev(gmst + lon);
  const eps = 23.4393;
  const ascR = Math.atan2(
    Math.cos(lst * rad),
    -(Math.sin(lst * rad) * Math.cos(eps * rad) + Math.tan(lat * rad) * Math.sin(eps * rad))
  );
  const asc = rev(ascR / rad);
  return { lon: asc, sign: SIGN_ORDER[Math.floor(asc / 30)], deg: Math.floor(asc % 30) };
}

/* ---------- 今日の空(トランジット) ----------
   いま空にある天体と、あなたの出生図の対話を毎日読む。月は約2.5日で星座を移る */
function skyToday(natalLons) {
  const now = new Date();
  const t = planetLongitudes(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12);
  const moonSign = SIGN_ORDER[Math.floor(t.moon / 30)];
  const tm = new Date(now); tm.setDate(tm.getDate() + 1);
  const t2 = planetLongitudes(tm.getFullYear(), tm.getMonth() + 1, tm.getDate(), 12);
  const moonTomorrow = SIGN_ORDER[Math.floor(t2.moon / 30)];

  const hits = [];
  const transitKeys = ["moon", "sun", "venus", "mars", "jupiter", "saturn"];
  const natalKeys = ["sun", "moon", "mercury", "venus", "mars"];
  for (const tk of transitKeys) {
    for (const nk of natalKeys) {
      let diff = Math.abs(t[tk] - natalLons[nk]);
      if (diff > 180) diff = 360 - diff;
      for (const at of ASPECT_TYPES) {
        const orb = Math.abs(diff - at.angle);
        const maxOrb = tk === "moon" ? 4 : tk === "sun" ? 3 : 2.5;
        if (orb <= maxOrb) hits.push({ t: tk, n: nk, type: at, orb });
      }
    }
  }
  hits.sort((a, b) => a.orb - b.orb);
  return {
    moonSign, moonTomorrow,
    moonNote: MOON_TODAY_DESC[moonSign],
    hits: hits.slice(0, 3),
  };
}

/* ---------- ホロスコープ:テーマ別の「流れ」読み ----------
   土星(約29.5年で一周 = 約7年ごとの節目)と木星(約12年で一周)の
   トランジット(現在位置と出生位置の角度)から、5年単位の流れを読む。 */
const SATURN_PHASES = [
  {
    title: "種まきと再出発",
    work: "キャリアの新しい章が始まる位置。実績のリセットを恐れず、小さくても「自分の名前で始めたこと」が5年後の柱に育つ可能性が高い時期です。",
    love: "関係が「はじまり」に向かう位置。新しい出会いも、いまの関係の仕切り直しも、ここで蒔いた種がこの先の形になります。焦らず土を耕すつもりで。",
    life: "人生の新しいサイクルの入り口。過去のやり方を手放して身軽になった人ほど、この時期の選択が次の約7年を方向づけます。",
  },
  {
    title: "成長と鍛錬",
    work: "力が試される位置。負荷は増えますが、それは「任され始めた」証拠。ここで逃げずに磨いたスキルが、次の収穫期にそのまま報酬に変わる可能性が高い時期です。",
    love: "関係の本気度が試される位置。すれ違いや現実的な課題が出やすい一方、それを一緒に越えた関係は格段に強くなります。向き合うことから逃げないのが鍵。",
    life: "土台を固める位置。思うように進まない感覚があるかもしれませんが、それは停滞ではなく筋トレ。この時期の粘りが人生の底力になります。",
  },
  {
    title: "収穫と拡張",
    work: "積み上げの成果が見えはじめる位置。評価・昇進・独立など、キャリアがいちばん外に開く時期。求められたら遠慮なく引き受けて拡げてください。",
    love: "関係が実る位置。付き合いが深まる・結婚など、形になりやすい時期です。一人の方も、あなたの魅力がいちばん外に見える時期なので出会いの好機。",
    life: "見晴らしのいい高台に立つ位置。これまでの選択の答え合わせができる時期です。得たものを味わいつつ、次に何を運ぶかを選び始めるとき。",
  },
  {
    title: "整理と手放し",
    work: "次のサイクルへ向けた棚卸しの位置。役割の変化や「これはもう卒業かも」という感覚が出やすい時期。手放した分だけ、次の章のスペースが生まれます。",
    love: "関係の本質だけが残る位置。表面的な付き合いは自然と離れ、本当に大切な縁が浮かび上がります。整理は喪失ではなく、選び直しです。",
    life: "締めくくりの位置。この約7年でやり切ったことと、次に持ち越さないことを静かに仕分ける時期。空いた手にしか、新しいものは掴めません。",
  },
];
const JUPITER_PHASES = [
  "木星は追い風の始まりを示しています。新しいチャンスが向こうからやって来やすい配置。",
  "木星は「育てる」配置。すでに手の中にあるものを大きくすることに幸運が宿ります。",
  "木星は実りの配置。これまで育ててきたものが、目に見える形で返ってきやすいタイミング。",
  "木星は仕込みの配置。次の幸運期(木星は約12年で一周します)に向けて、種を選んでおくとき。",
];

function horoscopeFlow(y, m, d, theme) {
  const natal = planetLongitudes(y, m, d, 12);
  const now = new Date();
  const Y = now.getFullYear();
  const qOf = (lonT, lonN) => Math.floor(((((lonT - lonN) % 360) + 360) % 360) / 90);
  const satQ = (yr) => qOf(planetLongitudes(yr, now.getMonth() + 1, 15, 12).saturn, natal.saturn);
  const jupQ = (yr) => qOf(planetLongitudes(yr, now.getMonth() + 1, 15, 12).jupiter, natal.sun);

  // いまの章(土星の象限)の実際の始まり・終わりの年を探す
  const curQ = satQ(Y);
  let start = Y;
  while (start > Y - 9 && satQ(start - 1) === curQ) start--;
  let end = Y;
  while (end < Y + 9 && satQ(end + 1) === curQ) end++;
  const prevQ = (curQ + 3) % 4;
  const nextQ = (curQ + 1) % 4;

  /* パーソナライズ層:章のリズム(いつ)は万人共通の土星周期だが、
     「どこで起きるか」= トランジット土星のソーラーハウス(生まれ月で変わる)
     「どう進むか」= テーマ担当天体のあなたのサイン(出生図で変わる)を重ねる */
  const sunSignIdx = Math.floor(natal.sun / 30);
  const houseOf = (lon) => ((Math.floor(lon / 30) - sunSignIdx) + 12) % 12;
  const arenaNow = HOUSE_THEMES[houseOf(planetLongitudes(Y, now.getMonth() + 1, 15, 12).saturn)];
  const arenaNext = HOUSE_THEMES[houseOf(planetLongitudes(end + 1, 6, 15, 12).saturn)];

  const themePlanet = theme === "work"
    ? { key: "mars", ja: "火星", role: "攻め方" }
    : theme === "love"
      ? { key: "venus", ja: "金星", role: "愛し方" }
      : { key: "sun", ja: "太陽", role: "生き方" };
  const pSign = SIGN_ORDER[Math.floor(natal[themePlanet.key] / 30)];
  const pEl = ZODIAC.find((z) => z.name === pSign).element;
  const personal = `この章を進むあなたの型 — ${themePlanet.ja}(${themePlanet.role})が${pSign}にあるあなたは、「${ELEMENT_STYLE[pEl]}」やり方がいちばん通ります。章のテーマが同じでも、勝ち筋は人それぞれ。あなたはこの型で。`;

  const blocks = [
    { era: `${start - 1}年ごろまで`, label: "前の章", q: prevQ, jq: jupQ(start - 1) },
    { era: `${start}年 〜 ${end}年(いま)`, label: "いまの章", q: curQ, jq: jupQ(Y), now: true, arena: arenaNow },
    { era: `${end + 1}年ごろから`, label: "次の章", q: nextQ, jq: jupQ(end + 1), arena: arenaNext !== arenaNow ? arenaNext : null },
  ].map((b) => ({
    ...b,
    title: SATURN_PHASES[b.q].title,
    text: SATURN_PHASES[b.q][theme]
      + (b.now ? `いま、その主戦場になっているのは「${b.arena}」のエリアです。` : "")
      + (!b.now && b.arena ? `この章は「${b.arena}」のエリアから幕を開けます。` : ""),
    jupText: JUPITER_PHASES[b.jq],
  }));
  return { blocks, nextShift: end + 1, chapterSpan: `${start}〜${end}`, personal };
}

/* 今年の星模様:トランジット木星・土星が、太陽から見てどの部屋にいるか(ソーラーハウス) */
const HOUSE_THEMES = [
  "自分自身と新しいスタート", "お金と才能", "学び・発信・フットワーク", "家と心の土台",
  "恋愛・遊び・創造", "仕事の習慣と健康", "パートナーシップ", "深い縁と受け継ぐもの",
  "冒険・旅・専門の学び", "キャリアと到達点", "仲間とコミュニティ", "内面の整理と充電",
];

function horoscopeYear(y, m, d) {
  const natal = planetLongitudes(y, m, d, 12);
  const now = new Date();
  const t = planetLongitudes(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12);
  const houseOf = (lon) => ((Math.floor(lon / 30) - Math.floor(natal.sun / 30)) + 12) % 12;
  const jh = houseOf(t.jupiter), sh = houseOf(t.saturn);
  return {
    year: now.getFullYear(),
    jupiter: { house: jh + 1, theme: HOUSE_THEMES[jh], sign: SIGN_ORDER[Math.floor(t.jupiter / 30)] },
    saturn: { house: sh + 1, theme: HOUSE_THEMES[sh], sign: SIGN_ORDER[Math.floor(t.saturn / 30)] },
  };
}

/* 太陽×月の重ね読み:外向きの顔と素顔の関係 */
function sunMoonBlend(sunSign, moonSign2) {
  const pair = (a, b) => (a === b ? "same"
    : (a === "火" && b === "風") || (a === "風" && b === "火") || (a === "地" && b === "水") || (a === "水" && b === "地") ? "support"
    : "tension");
  const rel = pair(sunSign.element, moonSign2.element);
  if (sunSign.name === moonSign2.name) {
    return `太陽も月も${sunSign.name}。外の顔と素顔が一致した、裏表のない純度の高いタイプです。「${sunSign.keyword}」の質が、どこにいてもぶれずに出ます。`;
  }
  if (rel === "same") {
    return `太陽と月が同じ「${sunSign.element}」の質。見せている顔と素顔の方向が揃っていて、意志と感情が同じ方向に流れやすい、迷いの少ない配置です。`;
  }
  if (rel === "support") {
    return `太陽(${sunSign.element})と月(${moonSign2.element})は支え合う組み合わせ。外での振る舞いを、内側の感情が自然に後押しします。無理なく人に好かれる配置です。`;
  }
  return `太陽(${sunSign.element})と月(${moonSign2.element})は質の違う組み合わせ。外の顔と素顔にギャップがあるぶん、両方を知る人には深い魅力に映ります。ギャップは弱点ではなく振り幅です。`;
}

/* テーマ別の出生図リーディング(天体×サインの合成) */
const JOB_FIELDS = {
  "火": "企画・営業・新規事業・エンタメ・スポーツなど、ゼロから火をつける現場",
  "地": "金融・製造・不動産・食・ものづくりなど、形と価値が残る仕事",
  "風": "IT・メディア・教育・企画・コンサルなど、情報と言葉を扱う仕事",
  "水": "医療・ケア・カウンセリング・クリエイティブ・接客など、人の心に触れる仕事",
};

function horoscopeTheme(horo, theme) {
  const P = (key) => horo.planets.find((p) => p.key === key);
  const line = (p, prefix) => `<strong>${p.ja}(${p.role})は${p.sign.name}</strong> — ${p.sign.keyword}。${prefix}${ELEMENT_STYLE[p.sign.element]}スタイルです。`;

  if (theme === "work") {
    const counts = {};
    ["sun", "mars", "jupiter", "saturn"].forEach((k) => {
      const el = P(k).sign.element;
      counts[el] = (counts[el] || 0) + 1;
    });
    const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return {
      title: "仕事のかたち",
      lead: `仕事に関わる4天体(太陽・火星・木星・土星)は「${dom}」の質がいちばん濃く出ています。向いているのは——${JOB_FIELDS[dom]}。`,
      points: [
        line(P("sun"), "働く姿の核は、"),
        line(P("mars"), "攻め方・頑張り方は、"),
        `<strong>木星(伸びる方向)は${P("jupiter").sign.name}</strong> — ${JOB_FIELDS[P("jupiter").sign.element]}に幸運の入口があります。`,
        `<strong>土星(鍛えられる場所)は${P("saturn").sign.name}</strong> — ここは時間がかかる分、続けた人だけの専門性に変わる領域です。`,
      ],
    };
  }
  if (theme === "love") {
    return {
      title: "愛のかたち",
      lead: `愛し方は金星、求め方は火星、安心は月。この3つの組み合わせが、あなたの恋愛の設計図です。`,
      points: [
        line(P("venus"), "愛し方・ときめき方は、"),
        line(P("mars"), "距離の詰め方は、"),
        line(P("moon"), "本当に安心できる関係は、"),
        `<strong>相性のヒント</strong> — 金星が${P("venus").sign.element}のサインのあなたは、同じ${P("venus").sign.element}や、支え合う元素を持つ人と自然に呼吸が合います。`,
      ],
    };
  }
  return {
    title: "人生のかたち",
    lead: `太陽が進む方向、土星が出す宿題、木星が開く扉。3つを重ねると、あなたの人生の地図になります。`,
    points: [
      line(P("sun"), "人生で向かう方角は、"),
      `<strong>土星(人生の宿題)は${P("saturn").sign.name}</strong> — ${P("saturn").sign.keyword}にまつわるテーマを、時間をかけて自分のものにしていく星回りです。`,
      `<strong>木星(幸運の扉)は${P("jupiter").sign.name}</strong> — ${JOB_FIELDS[P("jupiter").sign.element]}の方向に、人生が広がる入口があります。`,
      line(P("moon"), "疲れたときに帰る場所は、"),
    ],
  };
}

/* ---------- 四柱推命:これから12ヶ月の気流 ---------- */
function monthFlow12(birthdate) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const myKan = dayPillar(by, bm, bd).kan;
  const now = new Date();
  const months = [];
  for (let k = 0; k < 12; k++) {
    const t = new Date(now.getFullYear(), now.getMonth() + k, 15);
    const p = monthPillar(t.getFullYear(), t.getMonth() + 1, 15);
    const star = tsuhensei(myKan, p.kan);
    const w = star.weights;
    months.push({
      y: t.getFullYear(), m: t.getMonth() + 1,
      kanshi: p.kan + p.shi, star,
      power: w.love + w.work + w.money + w.health,
      love: w.love, work: w.work, money: w.money,
      current: k === 0,
    });
  }
  const best = (key) => months.reduce((a, b) => (b[key] > a[key] ? b : a));
  return { months, bestWork: best("work"), bestLove: best("love"), bestMoney: best("money"), bestTotal: best("power") };
}

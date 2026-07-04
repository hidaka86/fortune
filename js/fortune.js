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

/* ---------- 総合判定「今日の結論」 ----------
   複数の手法論の「票」を合算して、今日がどういう日かを一言で結論づける */
const SANGO_GROUPS = [["申", "子", "辰"], ["巳", "酉", "丑"], ["寅", "午", "戌"], ["亥", "卯", "未"]];

function dailyVerdict(birthdate) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const flow = kiFlow(birthdate);
  const phase = moonPhaseToday();
  const factors = [];
  const starPower = (star) => Object.values(star.weights).reduce((a, b) => a + b, 0);

  // 1. 四柱推命・日運
  const dp = starPower(flow.day.star);
  const dScore = dp >= 1.2 ? 2 : dp >= 0.5 ? 1 : dp >= 0 ? 0 : -1;
  factors.push({
    method: "四柱推命・日運", label: `「${flow.day.star.name}」の日`,
    score: dScore, note: flow.day.star.day.split("。")[0] + "。",
  });

  // 2. 四柱推命・月運
  const mp = starPower(flow.month.star);
  const mScore = mp >= 1.2 ? 1 : mp >= 0 ? 0 : -1;
  factors.push({
    method: "四柱推命・月運", label: `「${flow.month.star.name}」の月`,
    score: mScore, note: mScore > 0 ? "月の基調も追い風です。" : mScore === 0 ? "月の基調は穏やか。" : "月の基調は充電寄りです。",
  });

  // 3. 干支の巡り(今日の日支 × 生まれ年支)
  const myBranch = getEto(by, bm, bd).name;
  const now = new Date();
  const todayBranch = dayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate()).shi;
  const diff = ((JUNISHI.indexOf(todayBranch) - JUNISHI.indexOf(myBranch)) % 12 + 12) % 12;
  const isSango = SANGO_GROUPS.some((g) => g.includes(myBranch) && g.includes(todayBranch)) && myBranch !== todayBranch;
  const isShigou = SHIGOU_PAIRS.some(([a, b]) => (a === myBranch && b === todayBranch) || (b === myBranch && a === todayBranch));
  let eScore = 0, eNote = "穏やかな巡り合わせです。";
  if (isSango) { eScore = 2; eNote = `${myBranch}と${todayBranch}は「三合」。強力な援軍が巡る吉日です。`; }
  else if (isShigou) { eScore = 2; eNote = `${myBranch}と${todayBranch}は「支合」。縁がまとまりやすい日です。`; }
  else if (diff === 6) { eScore = -2; eNote = `${myBranch}と${todayBranch}は正反対の「冲」。予定変更や衝突が起きやすい日です。`; }
  else if (diff === 0) { eScore = 1; eNote = "生まれ年と同じ気が巡る、自分らしくいられる日。"; }
  factors.push({ method: "干支の巡り", label: `${todayBranch}の日 × ${myBranch}年生まれ`, score: eScore, note: eNote });

  // 4. 月相
  const waxing = ["新月", "三日月", "上弦の月", "十三夜の月"].includes(phase.name);
  const pScore = ["新月", "上弦の月", "満月"].includes(phase.name) ? 1 : waxing ? 0 : -1;
  factors.push({
    method: "月相", label: `${phase.emoji} ${phase.name}`,
    score: pScore, note: waxing || phase.name === "満月" ? "月が満ちていく、始めることに向く時期。" : "月が欠けていく、整理と手放しに向く時期。",
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
    };
  };
  const a = parse(p1), b = parse(p2);
  const zodiac = zodiacCompatScore(a.zodiac.element, b.zodiac.element);
  const gogyo = gogyoCompatScore(a.kyusei, b.kyusei);
  const eto = etoCompatScore(a.eto, b.eto);
  const total = Math.round(zodiac.score * 0.4 + gogyo.score * 0.3 + eto.score * 0.3);

  const band = total >= 85 ? "運命的な好相性" : total >= 72 ? "とても良い相性" : total >= 60 ? "磨けば光る相性" : "刺激し合う成長の相性";
  const advice = total >= 85
    ? "自然体のままで息の合う二人。感謝を言葉にする習慣が、この良い流れをさらに長続きさせます。"
    : total >= 72
      ? "土台のしっかりした組み合わせ。小さなすれ違いは早めに話し合えば、絆はむしろ深まります。"
      : total >= 60
        ? "違いが目につく時期もありますが、それは伸びしろの証。相手の得意分野を頼ってみると関係が好転します。"
        : "正反対だからこそ学びの多い二人。「自分と違う」を「面白い」に変換できれば、唯一無二のパートナーになります。";

  return { a, b, zodiac, gogyo, eto, total, band, advice };
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
  if (em === eo) return {
    score: 84, label: "以心伝心の同志",
    note: `同じ「${em}」の気を持つ者同士。言葉にしなくても通じ合える、居心地の良い関係です。`,
  };
  if (GOGYO_KOKU[eo] === em) return {
    score: 62, label: "あなたを鍛えてくれる相手",
    note: `${otherName}の「${eo}」は${meName}の「${em}」に負荷をかける巡り。ぶつかった分だけ、あなたを強くしてくれる存在です。`,
  };
  return {
    score: 68, label: "あなたがリードする相手",
    note: `${meName}の「${em}」が主導権を握る巡り。引っ張る場面が多い分、相手の歩幅への気配りが絆を深めます。`,
  };
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

  return { name, zodiac, eto, jikkan, kyusei, pillars, moon, daily, card, theme, themeScore, themeComment, elementNote };
}

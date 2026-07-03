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

/* ---------- 今日の運勢スコア(生年月日×日付で決定論的) ---------- */
function dailyFortune(birthdate) {
  const rng = seededRng(`${birthdate}::${todayKey()}`);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const score = () => 1 + Math.floor(rng() * 5); // 1〜5

  const scores = { love: score(), work: score(), money: score(), health: score() };
  const total = Math.round((scores.love + scores.work + scores.money + scores.health) / 4 * 10) / 10;
  return {
    scores,
    total,
    luckyColor: pick(LUCKY_COLORS),
    luckyItem: pick(LUCKY_ITEMS),
    luckyPlace: pick(LUCKY_PLACES),
    luckyNumber: 1 + Math.floor(rng() * 9),
  };
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

/* ---------- 統合鑑定 ---------- */
function integratedReading({ name, birthdate, theme }) {
  const [y, m, d] = birthdate.split("-").map(Number);
  const zodiac = getZodiac(m, d);
  const eto = getEto(y, m, d);
  const jikkan = getJikkan(y, m, d);
  const kyusei = getKyusei(y, m, d);
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
  const themeComment = theme === "total"
    ? SCORE_COMMENT.work[Math.min(4, Math.max(0, Math.round(daily.total) - 1))]
    : SCORE_COMMENT[theme][themeScore - 1];

  return { name, zodiac, eto, jikkan, kyusei, daily, card, theme, themeScore, themeComment, elementNote };
}

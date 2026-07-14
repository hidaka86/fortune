/* MYOURISCOPE — i18n(日英切替)
   言語の決め方: ?lang=en|ja → localStorage(ms_lang) → ブラウザ言語(日本語以外はEN)。
   日本語表示は従来と完全に同一。英語時のみ辞書・データ差し替えが働く。 */

(function detectLang() {
  const KEY = "ms_lang";
  let lang = null;
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "ja" || q === "en") {
      lang = q;
      try { localStorage.setItem(KEY, lang); } catch { /* noop */ }
    }
  } catch { /* noop */ }
  if (!lang) {
    try { const s = localStorage.getItem(KEY); if (s === "ja" || s === "en") lang = s; } catch { /* noop */ }
  }
  if (!lang) {
    const nav = (navigator.language || "ja").toLowerCase();
    lang = nav.startsWith("ja") ? "ja" : "en";
  }
  window.I18N = { lang, en: lang === "en" };
})();

/* ---------- 基本ヘルパー ---------- */
/* L(ja, en): 文章の二言語ペア。日本語は既存文字列そのまま */
function L(ja, en) { return I18N.en ? en : ja; }

/* 用語辞書: 日本語の固有名(キーとしても使われる)を表示時にだけ英語化する。
   ※ ロジック側のキー(rank, phase.name, dir.name 等)は絶対に書き換えない */
const I18N_TERMS = {
  // 星座
  "牡羊座": "Aries", "牡牛座": "Taurus", "双子座": "Gemini", "蟹座": "Cancer",
  "獅子座": "Leo", "乙女座": "Virgo", "天秤座": "Libra", "蠍座": "Scorpio",
  "射手座": "Sagittarius", "山羊座": "Capricorn", "水瓶座": "Aquarius", "魚座": "Pisces",
  // エレメント・五行
  "火": "Fire", "地": "Earth", "風": "Air", "水": "Water", "木": "Wood", "土": "Earth", "金": "Metal",
  // 十干(日主)
  "甲": "Yang Wood", "乙": "Yin Wood", "丙": "Yang Fire", "丁": "Yin Fire", "戊": "Yang Earth",
  "己": "Yin Earth", "庚": "Yang Metal", "辛": "Yin Metal", "壬": "Yang Water", "癸": "Yin Water",
  // 十二支
  "子": "Rat", "丑": "Ox", "寅": "Tiger", "卯": "Rabbit", "辰": "Dragon", "巳": "Snake",
  "午": "Horse", "未": "Goat", "申": "Monkey", "酉": "Rooster", "戌": "Dog", "亥": "Boar",
  // 九星
  "一白水星": "One White Water", "二黒土星": "Two Black Earth", "三碧木星": "Three Jade Wood",
  "四緑木星": "Four Green Wood", "五黄土星": "Five Yellow Earth", "六白金星": "Six White Metal",
  "七赤金星": "Seven Red Metal", "八白土星": "Eight White Earth", "九紫火星": "Nine Purple Fire",
  // 通変星(英語圏の四柱推命で通用する標準訳)
  "比肩": "Friend", "劫財": "Rob Wealth", "食神": "Eating God", "傷官": "Hurting Officer",
  "偏財": "Indirect Wealth", "正財": "Direct Wealth", "偏官": "Seven Killings", "正官": "Direct Officer",
  "偏印": "Indirect Resource", "印綬": "Direct Resource",
  // 月相
  "新月": "New Moon", "三日月": "Waxing Crescent", "上弦の月": "First Quarter", "十三夜の月": "Waxing Gibbous",
  "満月": "Full Moon", "居待月": "Waning Gibbous", "下弦の月": "Last Quarter", "有明月": "Waning Crescent",
  // 方位
  "北": "North", "北東": "Northeast", "東": "East", "南東": "Southeast",
  "南": "South", "南西": "Southwest", "西": "West", "北西": "Northwest",
  // 結論ランク・方位グレード
  "大吉": "Excellent", "吉": "Good", "平": "Even", "静": "Quiet", "休": "Rest", "小吉": "Fair",
  // 凶方位
  "五黄殺": "Five-Yellow", "暗剣殺": "Hidden Blade", "本命殺": "Natal Star", "本命的殺": "Natal Opposite",
  // タロットの向き
  "正位置": "Upright", "逆位置": "Reversed", "正": "Upright", "逆": "Rev",
  // 運勢テーマ
  "総合運": "Overall", "恋愛運": "Love", "仕事運": "Work", "金運": "Money", "健康運": "Health",
  "人生": "Life", "仕事": "Work", "恋愛": "Love",
  // 天体
  "太陽": "Sun", "月": "Moon", "水星": "Mercury", "金星": "Venus", "火星": "Mars",
  "木星": "Jupiter", "土星": "Saturn", "天王星": "Uranus", "海王星": "Neptune", "冥王星": "Pluto",
};

/* NM(term): 用語をそのまま表示するとき用。辞書にない語はそのまま返す。
   ※ 曜日の一文字(日月火水木金土)には使わないこと(五行と衝突する) */
function NM(term) { return I18N.en ? (I18N_TERMS[term] || term) : term; }

/* NMK("甲戌"): 干支ペアを "Yang Wood / Dog" 形式に */
function NMK(kanshi) {
  if (!I18N.en || !kanshi) return kanshi;
  return kanshi.split("").map((c) => I18N_TERMS[c] || c).join(" / ");
}

/* タロットカードの表示名(英語時は en フィールドを使う) */
function cardName(c) { return I18N.en ? (c.en || c.name) : c.name; }

/* 日付まわり */
const I18N_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const I18N_WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const I18N_WD_JA = ["日", "月", "火", "水", "木", "金", "土"];
/* 例: JA "7/14" / EN "Jul 14" */
function fmtMD(m, d) { return I18N.en ? `${I18N_MONTHS[m - 1]} ${d}` : `${m}/${d}`; }
/* 例: JA "2026.7.14" / EN "Jul 14, 2026" */
function fmtYMD(y, m, d) { return I18N.en ? `${I18N_MONTHS[m - 1]} ${d}, ${y}` : `${y}.${m}.${d}`; }
/* 曜日(Dateの getDay() 値から) */
function fmtWD(i) { return I18N.en ? I18N_WD_EN[i] : I18N_WD_JA[i]; }
/* 呼びかけ: JA「◯◯さん」/「あなた」、EN は名前 or "you" */
function whoLabel(name) {
  if (I18N.en) return name ? name : "you";
  return name ? `${name}さん` : "あなた";
}

/* ---------- 静的HTML(index.html)の辞書 ---------- */
const I18N_UI = {
  "nav.home": "Home",
  "nav.today": "Today",
  "nav.tarot": "Tarot",
  "nav.western": "Horoscope",
  "nav.eastern": "Four Pillars",
  "nav.aisho": "Compatibility",
  "nav.guide": "Readings",
  "nav.integrated": "Full Reading",
  "nav.mypage": "My Page",
  "cta.start": "Start today's reading",
  "home.divinations": "Five Ways of Observing",
  "home.tarot.tag": "Most popular",
  "home.tarot.title": "Tarot",
  "home.tarot.copy": "The cards have already decided. The shuffle — and the draw — are in your hands.",
  "home.tarot.link": "Draw today's card",
  "home.western.title": "Horoscope",
  "home.western.copy": "Read the five-year currents from your birth chart of ten planets.",
  "home.eastern.title": "Four Pillars",
  "home.eastern.copy": "With Nine Star Ki, discover the vessel you were born with.",
  "home.aisho.title": "Compatibility",
  "home.aisho.copy": "Zodiac × Five Elements × Chinese zodiac. Your bond, from three angles.",
  "home.integrated.title": "Full Reading",
  "home.integrated.copy": "Across every method: your destined title and today's answer.",
  "home.observe": "Observe",
  "integrated.title": "Full Reading",
  "integrated.sub": "From your birth date, across every method — one complete reading.",
  "western.title": "Horoscope",
  "western.sub": "Reading you and your currents from the ten planets of your birth sky.",
  "western.place": "Birthplace (optional — reveals your rising sign)",
  "western.time": "Birth time (optional — improves precision)",
  "eastern.title": "Four Pillars",
  "eastern.sub": "Year, month and day pillars, with Nine Star Ki. Your innate vessel, and the rhythm of your luck.",
  "tarot.title": "Tarot",
  "tarot.sub": "Your own hands decide the outcome — the real ritual, step by step.",
  "aisho.title": "Compatibility",
  "aisho.sub": "Zodiac × Five Elements × Chinese zodiac. Your bond, from three angles.",
  "aisho.name1": "Your name (optional)",
  "aisho.bd1": "Your birth date",
  "aisho.name2": "Their name (optional)",
  "aisho.bd2": "Their birth date",
  "aisho.submit": "Read our compatibility",
  "guide.title": "A Guide to the Readings",
  "guide.sub": "What each method observes, and how — from mechanics to philosophy.",
  "form.name": "Name (optional)",
  "ph.name": "e.g. Alex",
  "ph.name2": "e.g. Sam",
  "form.birthdate": "Birth date",
  "form.required": "required",
  "form.theme": "What do you want to ask?",
  "form.submit": "Read",
  "western.submit": "Chart the stars",
  "theme.total": "Overall",
  "theme.love": "Love",
  "theme.work": "Work",
  "theme.money": "Money",
  "theme.health": "Health",
  "seg.life": "Life",
  "seg.work": "Work",
  "seg.love": "Love",
  "place.unknown": "Unknown / outside Japan",
  "footer.tagline": "Observing the order of things, and the current that carries you.",
  "footer.note": "Please enjoy these readings as entertainment. © 2026 MYOURISCOPE",
};

/* ---------- 英語時のメタ情報 ---------- */
const I18N_META = {
  title: "MYOURISCOPE — Observe the order of things, and your own current.",
  description: "Western astrology, Four Pillars, Nine Star Ki, tarot and compatibility — multiple traditions woven into one quiet act of observation, reading your past, present and future as a single current.",
};

/* ---------- 適用 ---------- */
(function applyStaticI18n() {
  if (!I18N.en) return;

  document.documentElement.lang = "en";
  document.title = I18N_META.title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", I18N_META.description);
  const ogt = document.querySelector('meta[property="og:title"]');
  if (ogt) ogt.setAttribute("content", I18N_META.title);
  const ogd = document.querySelector('meta[property="og:description"]');
  if (ogd) ogd.setAttribute("content", I18N_META.description);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const t = I18N_UI[el.dataset.i18n];
    if (t) el.textContent = t;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const t = I18N_UI[el.dataset.i18nPh];
    if (t) el.setAttribute("placeholder", t);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const t = I18N_UI[el.dataset.i18nAria];
    if (t) { el.setAttribute("aria-label", t); if (el.title) el.title = t; }
  });

  // 出生時刻セレクト(0時→"0:00"、00分→":00")
  document.querySelectorAll('#western-form select[name="bh"]').forEach((sel) => {
    sel.setAttribute("aria-label", "Hour");
    [...sel.options].forEach((o) => { o.textContent = o.value === "" ? "Unknown" : `${o.value}:00`; });
  });
  document.querySelectorAll('#western-form select[name="bm"]').forEach((sel) => {
    sel.setAttribute("aria-label", "Minutes");
    [...sel.options].forEach((o) => { o.textContent = `:${String(o.value).padStart(2, "0")}`; });
  });
})();

/* ---------- 言語切替ボタン(ヘッダー) ---------- */
(function langToggle() {
  const headerInner = document.querySelector(".header-inner");
  if (!headerInner) return;
  const btn = document.createElement("button");
  btn.className = "nav-btn lang-btn";
  btn.id = "lang-toggle";
  btn.setAttribute("aria-label", I18N.en ? "日本語に切り替える" : "Switch to English");
  btn.textContent = I18N.en ? "日本語" : "EN";
  btn.addEventListener("click", () => {
    const next = I18N.en ? "ja" : "en";
    try { localStorage.setItem("ms_lang", next); } catch { /* noop */ }
    if (typeof window.gtag === "function") window.gtag("event", "lang_switch", { to: next });
    const u = new URL(location.href);
    u.searchParams.set("lang", next);
    location.href = u.toString();
  });
  const mypageBtn = headerInner.querySelector(".mypage-btn");
  headerInner.insertBefore(btn, mypageBtn || null);
})();

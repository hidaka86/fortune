/* MYOURISCOPE — UIロジック */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- ナビゲーション ---------- */
const views = document.querySelectorAll(".view");
const navBtns = document.querySelectorAll(".nav-btn");

function navigate(target, push = true) {
  if (!document.getElementById(`view-${target}`)) target = "home";
  if (target === "mypage") renderMypage();
  if (target === "today") renderToday();
  if (target === "guide") renderGuide();
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${target}`));
  navBtns.forEach((b) => b.classList.toggle("active", b.dataset.nav === target));
  if (push) {
    try { history.pushState(null, "", target === "home" ? location.pathname + location.search : `#${target}`); } catch { /* file://等 */ }
  }
  window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
}

window.addEventListener("popstate", () => navigate(location.hash.slice(1) || "home", false));

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-nav]");
  if (el) {
    e.preventDefault();
    navigate(el.dataset.nav);
  }
});

/* ---------- FVの日付 ---------- */
(function renderHeroDate() {
  const el = document.getElementById("hero-date");
  if (!el) return;
  const d = new Date();
  const phase = moonPhaseToday();
  el.textContent = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${["日","月","火","水","木","金","土"][d.getDay()]}曜日 ${phase.emoji}︎ ${phase.name}`;
})();

/* ---------- ステータスバー(今日の暦) ---------- */
(function renderStatusBar() {
  const d = new Date();
  const week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
  const phase = moonPhaseToday();
  document.getElementById("status-bar").innerHTML = `
    <span class="status-item status-quote">${dailyQuote()}</span>
    <span class="status-item"><span class="moon">${phase.emoji}</span>${phase.name} — ${phase.note}</span>`;
})();

/* ---------- ヒーローの観測盤キャンバス(orbital layering / temporal arcs) ---------- */
(function initSky() {
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let orbits = [];
  let w = 0, h = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = Math.max(w, h) * 0.72;
    orbits = Array.from({ length: 7 }, (_, i) => ({
      r: R * (0.16 + i * 0.14),
      speed: (i % 2 ? 1 : -1) * (0.018 + 0.011 * i),
      dots: 1 + (i % 3),
      phase: i * 1.9,
      alpha: 0.085 - i * 0.009,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.46;
    ctx.fillStyle = "rgba(168,132,78,.85)";
    ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, Math.PI * 2); ctx.fill();
    for (const o of orbits) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(28,35,51,${Math.max(o.alpha, 0.03)})`;
      ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, Math.PI * 2); ctx.stroke();
      const a0 = o.phase + t * 0.00012 * o.speed * 60;
      ctx.strokeStyle = "rgba(168,132,78,.14)";
      ctx.beginPath(); ctx.arc(cx, cy, o.r, a0, a0 + 0.45); ctx.stroke();
      for (let d = 0; d < o.dots; d++) {
        const ang = o.phase + (d / o.dots) * Math.PI * 2 + t * 0.001 * o.speed;
        const x = cx + Math.cos(ang) * o.r;
        const y = cy + Math.sin(ang) * o.r;
        ctx.fillStyle = d === 0 ? "rgba(168,132,78,.6)" : "rgba(28,35,51,.28)";
        ctx.beginPath(); ctx.arc(x, y, d === 0 ? 2.2 : 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (!REDUCED_MOTION) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
  if (REDUCED_MOTION) frame(0);
})();

/* ---------- 共通レンダリング部品 ---------- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function starsHtml(score) {
  let html = "";
  for (let i = 1; i <= 5; i++) html += `<span class="${i <= score ? "" : "off"}">★</span>`;
  return `<span class="stars">${html}</span>`;
}

function metersHtml(scores) {
  const labels = { love: "恋愛運", work: "仕事運", money: "金運", health: "健康運" };
  const band = (v) => (v >= 4 ? "hi" : v >= 3 ? "mid" : "lo");
  return `<div class="meter-list">${Object.entries(scores).map(([k, v]) => `
    <div class="meter">
      <span class="meter-label">${labels[k]}</span>
      <div class="meter-track"><div class="meter-fill ${band(v)}" data-w="${v * 20}"></div></div>
      <span class="meter-value ${band(v)}">${v}.0</span>
    </div>`).join("")}</div>`;
}

function luckyHtml(daily) {
  return `<div class="lucky-grid">
    <div class="lucky-item"><span class="k">COLOR</span><span class="v">${daily.luckyColor}</span></div>
    <div class="lucky-item"><span class="k">ITEM</span><span class="v">${daily.luckyItem}</span></div>
    <div class="lucky-item"><span class="k">PLACE</span><span class="v">${daily.luckyPlace}</span></div>
    <div class="lucky-item"><span class="k">NUMBER</span><span class="v">${daily.luckyNumber}</span></div>
  </div>`;
}

function cardH4(en, ja) {
  return `<h4>${en}<span class="h4-ja">${ja}</span></h4>`;
}

/* ロジックの可視化: 「A × B = C」を図解する */
function logicFlowHtml(items) {
  return `<div class="logic-flow">${items.map((it) =>
    typeof it === "string"
      ? `<span class="lf-op">${it}</span>`
      : `<div class="lf-node ${it.result ? "lf-result" : ""}">
          <span class="lf-tag">${it.tag}</span>
          <span class="lf-main">${it.main}</span>
          <span class="lf-sub">${it.sub || ""}</span>
        </div>`
  ).join("")}</div>`;
}

function explainHtml(summary, body) {
  return `<details class="explain"><summary>${summary}</summary><p>${body}</p></details>`;
}

const EXPLAIN_TSUHENSEI = "四柱推命では、生まれた日の十干(=日主)があなた自身を表します。そこに毎日・毎月めぐってくる干支との関係を「通変星」という10タイプで読み、その日の追い風・向かい風を判断します。同じ日でも人によって吹く風が違う——それがこのスコアの根拠です。";

/* 今日の気流ブロック(数式図+ひとこと+解説) */
function todayLogicHtml(daily) {
  const d = new Date();
  return `
    ${logicFlowHtml([
      { tag: "あなたの日主", main: daily.myKan, sub: daily.mySymbol },
      "×",
      { tag: "今日の干支", main: daily.dayKanshi, sub: `${d.getMonth() + 1}/${d.getDate()}` },
      "=",
      { tag: "今日の気流", main: daily.dayStar.name, sub: daily.dayStar.day.split("。")[0], result: true },
    ])}
    <p class="sub">${daily.dayStar.day}</p>
    ${explainHtml(`「${daily.dayStar.name}」って何?通変星のしくみ`, EXPLAIN_TSUHENSEI)}`;
}

/* 観測中オーバーレイ:占う人のドキドキを引き出す、結果までの溜め */
const OBS_STEPS = {
  today: ["今日の暦をめくっています……", "あなたの気流を観測しています……", "今日のマインドを言葉にしています……"],
  integrated: ["生年月日から暦を立てています……", "十干と九星を照合しています……", "運命の称号を探しています……"],
  western: ["10天体の位置を計算しています……", "土星と木星の巡りを読んでいます……", "あなたの章をめくっています……"],
  eastern: ["年柱・月柱・日柱を立てています……", "日主から通変星を読んでいます……"],
  aisho: ["二人の暦を並べています……", "星・五行・干支を照合しています……", "縁の形を観測しています……"],
};

function observeThen(kind, reveal, after) {
  if (REDUCED_MOTION) { reveal(); after?.(); return; }
  const steps = OBS_STEPS[kind] || ["観測しています……"];
  const ov = document.createElement("div");
  ov.className = "obs-overlay";
  ov.innerHTML = `
    <div class="obs-core">
      <div class="obs-rings" aria-hidden="true"><i></i><i></i><i></i><span class="obs-dot"></span></div>
      <p class="obs-text"></p>
    </div>`;
  document.body.appendChild(ov);
  document.body.classList.add("ritual-open");
  const textEl = ov.querySelector(".obs-text");
  steps.forEach((t, i) => setTimeout(() => {
    textEl.textContent = t;
    textEl.classList.remove("obs-in");
    void textEl.offsetWidth; // アニメーション再始動
    textEl.classList.add("obs-in");
    vibrate(8);
  }, i * 900));
  setTimeout(() => {
    reveal();
    after?.();
    ov.classList.add("obs-done");
    document.body.classList.remove("ritual-open");
    setTimeout(() => ov.remove(), 500);
  }, steps.length * 900 + 500);
}

/* 回遊導線:結果の下に「次の扉」を提示 */
const CROSS_SUGGEST = {
  integrated: [["tarot", "3枚スプレッドで深掘りする"], ["aisho", "気になる人との相性をみる"], ["western", "ホロスコープをみる"]],
  western: [["integrated", "まとめて統合鑑定"], ["eastern", "四柱推命ではどう出る?"], ["tarot", "今日の一枚を引く"]],
  eastern: [["western", "ホロスコープで流れをみる"], ["integrated", "統合鑑定で全体をみる"], ["aisho", "大切な人との相性をみる"]],
  tarot: [["integrated", "生年月日から統合鑑定"], ["western", "ホロスコープをみる"], ["eastern", "四柱推命で器をみる"]],
  aisho: [["integrated", "自分の統合鑑定をみる"], ["tarot", "二人の今日を一枚で占う"], ["western", "月星座の相性も気になる?"]],
};

function crossLinksHtml(current) {
  const items = (CROSS_SUGGEST[current] || []).map(([nav, label]) =>
    `<button data-nav="${nav}">${label}</button>`).join("");
  return `<div class="crosslinks"><span class="crosslinks-label">─ 旅はつづく</span>${items}</div>`;
}

/* カウントアップ演出 */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = (el.dataset.count.split(".")[1] || "").length;
  if (REDUCED_MOTION) { el.textContent = target.toFixed(decimals); return; }
  const t0 = performance.now();
  const dur = 900;
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

function showResult(el, html) {
  el.innerHTML = html;
  el.hidden = false;
  [...el.querySelectorAll(".result-hero, .result-card, .crosslinks")].forEach((n, i) => {
    n.style.animationDelay = `${i * 90}ms`;
    n.classList.add("reveal-item");
  });
  requestAnimationFrame(() => {
    el.querySelectorAll(".meter-fill").forEach((m) => {
      requestAnimationFrame(() => { m.style.width = `${m.dataset.w}%`; });
    });
    el.querySelectorAll("[data-count]").forEach(countUp);
  });
  el.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
}

/* ---------- 生年月日セレクト(iOSのdate入力の分かりにくさ対策) ---------- */
function setupBirthdateSelects() {
  const thisYear = new Date().getFullYear();
  document.querySelectorAll(".bd-select").forEach((box) => {
    const name = box.dataset.bd;
    let opts = "";
    for (let y = thisYear; y >= 1920; y--) opts += `<option value="${y}">${y}</option>`;
    let mopts = "";
    for (let m = 1; m <= 12; m++) mopts += `<option value="${m}">${m}</option>`;
    box.innerHTML = `
      <select class="bd-y" aria-label="年" required><option value="">年</option>${opts}</select>
      <select class="bd-m" aria-label="月" required><option value="">月</option>${mopts}</select>
      <select class="bd-d" aria-label="日" required><option value="">日</option></select>
      <input type="hidden" name="${name}" />`;
    const [ySel, mSel, dSel] = box.querySelectorAll("select");
    const hidden = box.querySelector("input[type=hidden]");

    function rebuildDays() {
      const y = Number(ySel.value) || 2000;
      const m = Number(mSel.value) || 1;
      const days = new Date(y, m, 0).getDate();
      const cur = dSel.value;
      let dopts = '<option value="">日</option>';
      for (let d = 1; d <= days; d++) dopts += `<option value="${d}">${d}</option>`;
      dSel.innerHTML = dopts;
      if (cur && Number(cur) <= days) dSel.value = cur;
    }
    rebuildDays();

    box.addEventListener("change", () => {
      rebuildDays();
      const [y, m, d] = [ySel.value, mSel.value, dSel.value];
      hidden.value = (y && m && d)
        ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        : "";
    });
  });
}

function setBirthdateSelect(name, value) {
  if (!value) return;
  document.querySelectorAll(`.bd-select[data-bd="${name}"]`).forEach((box) => {
    const [y, m, d] = value.split("-").map(Number);
    const [ySel, mSel, dSel] = box.querySelectorAll("select");
    ySel.value = y; mSel.value = m;
    box.dispatchEvent(new Event("change")); // 日の選択肢を作る
    dSel.value = d;
    box.dispatchEvent(new Event("change"));
  });
}

setupBirthdateSelects();

/* ---------- プロフィール記憶(localStorage) ---------- */
const PROFILE_KEY = "fortuna:profile";
const VISIT_KEY = "fortuna:visits";

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; }
  catch { return null; }
}

function saveProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* private mode等は無視 */ }
}

function prefillForms(p) {
  if (!p?.birthdate) return;
  setBirthdateSelect("birthdate", p.birthdate);
  setBirthdateSelect("birthdate1", p.birthdate);
  const nameInput = document.querySelector('#integrated-form input[name="name"]');
  if (nameInput && p.name) nameInput.value = p.name;
  const aishoName = document.querySelector('#aisho-form input[name="name1"]');
  if (aishoName && p.name) aishoName.value = p.name;
}

/* ---------- 来訪記録(連続日数) ---------- */
function updateStreak() {
  if (!loadProfile()?.birthdate) return null;
  let v;
  try { v = JSON.parse(localStorage.getItem(VISIT_KEY)) || {}; } catch { v = {}; }
  const today = todayKey();
  if (v.last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    v.streak = v.last === yKey ? (v.streak || 0) + 1 : 1;
    v.total = (v.total || 0) + 1;
    v.last = today;
    try { localStorage.setItem(VISIT_KEY, JSON.stringify(v)); } catch { /* noop */ }
  }
  return v;
}

/* ---------- ホームFV: 会員はパーソナル羅針盤、未登録はブランド訴求 ---------- */
const heroEl = document.querySelector("#view-home .hero");
const heroContentEl = document.querySelector("#view-home .hero-content");
const HERO_DEFAULT_HTML = heroContentEl ? heroContentEl.innerHTML : "";

function orderNav() { /* マイページはヘッダー右上の固定アイコンになったため並べ替え不要 */ }

function streakMilestone(streak) {
  if (streak >= 30) return "🎖 30日連続達成 — 暦はもう、あなたの生活の一部です。";
  if (streak >= 7) return "🔥 7日連続達成 — 星があなたの習慣を覚えはじめました。";
  return "";
}

function renderHomeDaily() {
  const p = loadProfile();
  orderNav();
  document.getElementById("home-daily").innerHTML = "";
  if (!heroContentEl) return;

  if (!p?.birthdate) {
    heroEl.classList.remove("hero-member");
    heroContentEl.innerHTML = HERO_DEFAULT_HTML;
    return;
  }

  const visits = updateStreak() || {};
  const phase = moonPhaseToday();
  const d = new Date();
  const who = p.name ? `${esc(p.name)}さん` : "あなた";
  const dc = loadDailyCard();
  heroEl.classList.add("hero-member");

  if (!dc) {
    // まだ今日を観測していない:結果は見せない(ネタバレ禁止)。静かな問いかけだけ
    heroContentEl.innerHTML = `
      <p class="hero-eyebrow">Welcome back — ${d.getMonth() + 1}.${d.getDate()} ${phase.emoji}</p>
      <h1 class="hero-title hero-title-member"><span class="nw">おかえりなさい、</span><span class="nw">${who}。</span></h1>
      <p class="hero-sub">今日の流れは、まだ誰も知りません。</p>
      <div class="hero-cta" style="margin-top:26px">
        <button class="btn-observe" data-nav="today"><span class="bo-mark" aria-hidden="true">◉</span>今日の占いをはじめる</button>
      </div>
      ${(visits.streak || 1) >= 2 ? `<p class="hero-streak">連続 ${visits.streak} 日目の観測${(visits.streak || 1) >= 7 ? " 🔥" : ""}</p>` : ""}`;
    return;
  }

  // 観測済み:今日の要点をコンパクトに
  const daily = dailyFortune(p.birthdate);
  const verdict = dailyVerdict(p.birthdate);
  const base = cardByN(dc.n);
  heroContentEl.innerHTML = `
    <p class="hero-eyebrow">Today's Compass — ${d.getMonth() + 1}.${d.getDate()} ${phase.emoji}</p>
    <h1 class="hero-title hero-title-member"><span class="nw">今日は<em>「${verdict.word}」</em>。</span></h1>
    <div class="hero-score">
      <span><span class="hs-num" data-count="${daily.score100}">0</span><span class="hs-denom"> /100</span></span>
      <span class="chip chip-card"><img src="${tarotImg(dc.n)}" alt="" class="${dc.reversed ? "is-rev" : ""}" onerror="this.remove()" />${base.name}</span>
      <span class="chip">連続 <strong>${visits.streak || 1}日目</strong>${(visits.streak || 1) >= 7 ? " 🔥" : ""}</span>
    </div>
    <p class="hero-action">今日の一手 — <strong>${daily.action}</strong></p>
    ${streakMilestone(visits.streak || 1) ? `<p class="milestone">${streakMilestone(visits.streak || 1)}</p>` : ""}
    <div class="hero-cta" style="margin-top:22px">
      <button class="btn-observe" data-nav="today"><span class="bo-mark" aria-hidden="true">◉</span>今日の結果をみる</button>
    </div>`;
  heroContentEl.querySelectorAll("[data-count]").forEach(countUp);
}

/* ---------- 今日の占い(朝の羅針盤:結論=マインドは最後に) ---------- */
function mindForToday(verdict, card, daily) {
  // その日いちばん強いテーマ(恋愛/仕事/金運/健康)
  const top = Object.entries(daily.scores).sort((a, b) => b[1] - a[1])[0];
  const set = MIND_WORDS[verdict.rank] || MIND_WORDS["平"];
  // ベース6種+トップテーマの言葉(重み2倍)をプールに
  const pool = [...set.base];
  if (top && set[top[0]]) pool.push(set[top[0]], set[top[0]]);
  // カード・トップテーマまでシードに含める:結果が違えば言葉も変わる
  const rng = seededRng(`${todayKey()}|mind|${loadProfile()?.birthdate || ""}|${card ? card.n + (card.reversed ? "r" : "") : "x"}|${top ? top[0] : ""}`);
  const word = pool[Math.floor(rng() * pool.length)];
  const points = [
    { k: "暦から", v: daily.dayStar.day.split("。")[0] + "。" },
    ...(card ? [{ k: "カードから", v: card.advice }] : []),
    { k: "開運アクション", v: daily.action },
  ];
  return { word, points };
}

function renderToday() {
  const root = document.getElementById("today-root");
  const p = loadProfile();
  const d = new Date();
  const phase = moonPhaseToday();

  if (!p?.birthdate) {
    root.innerHTML = `
      <div class="view-head">
        <p class="view-eyebrow">TODAY'S OBSERVATION</p>
        <h2>今日の占い</h2>
        <p class="view-sub">生年月日だけで、今日の流れとマインドを。データはこの端末にのみ保存されます。</p>
      </div>
      <form class="panel form" id="today-form">
        <div class="form-row">
          <label class="field">
            <span class="field-label">生年月日 <em>必須</em></span>
            <div class="bd-select" data-bd="birthdate"></div>
          </label>
          <label class="field">
            <span class="field-label">名前(任意)</span>
            <input type="text" name="name" placeholder="例:ヒナタ" maxlength="20" />
          </label>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">今日の占いをみる</button>
      </form>`;
    setupBirthdateSelects();
    document.getElementById("today-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (!fd.get("birthdate")) return;
      saveProfile({ name: fd.get("name")?.trim(), birthdate: fd.get("birthdate"), theme: "total" });
      prefillForms(loadProfile());
      renderHomeDaily();
      renderToday();
    });
    return;
  }

  // カードがまだなら、結果より先にカードの場が開く(選んで引くだけの1工程)
  const dcPre = loadDailyCard();
  if (!dcPre) {
    try { localStorage.setItem("fortuna:obsday", todayKey()); } catch { /* noop */ }
    renderQuickDraw();
    return;
  }

  // カード済みでその日はじめての表示なら、観測の溜めを一度だけ
  const OBS_TODAY_KEY = "fortuna:obsday";
  let obsSeen = true;
  try { obsSeen = localStorage.getItem(OBS_TODAY_KEY) === todayKey(); } catch { /* noop */ }
  if (!obsSeen) {
    try { localStorage.setItem(OBS_TODAY_KEY, todayKey()); } catch { /* noop */ }
    observeThen("today", () => renderToday());
    return;
  }

  const daily = dailyFortune(p.birthdate);
  const verdict = dailyVerdict(p.birthdate);
  const dc = loadDailyCard();
  const card = { ...cardByN(dc.n), reversed: dc.reversed };
  const mind = mindForToday(verdict, card, daily);
  const who = p.name ? `${esc(p.name)}さん` : "あなた";

  lastShare.today = {
    cards: [{ n: dc.n, reversed: dc.reversed }],
    eyebrow: `TODAY — ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
    title: mind.word,
    keywords: [`「${verdict.word}」`, `「${daily.dayStar.name}」の日`, `ラッキーカラーは${daily.luckyColor}`],
    score: daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    sub: null,
    x: `【MYOURISCOPE 今日の占い】「${verdict.word}」— ${mind.word}。今日の運気は${daily.score100}/100 ✦`,
  };

  const cardBlock = `
    <div class="result-card span-all">
      ${cardH4("TODAY'S CARD", "今日の一枚")}
      <div class="tp-body">
        <img class="tp-thumb ${card.reversed ? "is-rev" : ""}" src="${tarotImg(card.n)}" alt="${card.name}" loading="lazy" onerror="this.remove()" />
        <div class="tp-head">
          <p class="tp-name">${card.name}</p>
          <p class="tp-ori-line"><span class="tc-ori ${card.reversed ? "rev" : "up"}">${card.reversed ? "逆位置" : "正位置"}</span></p>
        </div>
        <div class="tp-detail">
          <p>${card.reversed ? card.rev : card.up}</p>
        </div>
      </div>
    </div>`;

  showResult(root, `
    <div class="result-hero" style="text-align:center">
      <p class="result-eyebrow">TODAY'S OBSERVATION — ${d.getMonth() + 1}.${d.getDate()} ${phase.emoji}︎ ${phase.name}</p>
      <h3 class="result-title">今日は「${verdict.word}」。</h3>
      <p class="result-lead" style="margin-inline:auto">${who}の暦とカードから、今日を観測。</p>
      <div class="chip-row" style="justify-content:center">
        <span class="chip">今日の運気 <strong>${daily.score100}</strong> /100</span>
        <span class="chip">「${daily.dayStar.name}」の日</span>
        <span class="chip">ラッキーカラー <strong>${daily.luckyColor}</strong></span>
      </div>
    </div>
    <div class="result-grid">
      ${cardBlock}
      ${verdictHtml(verdict)}
      <div class="result-card span-all">
        ${cardH4("TODAY'S KI", "今日の気流")}
        ${metersHtml(daily.scores)}
        <div style="margin-top:20px">${todayLogicHtml(daily)}</div>
      </div>
      <div class="result-card span-all">
        ${cardH4("LUCKY GUIDE", "今日の開運キー")}
        ${luckyHtml(daily)}
      </div>
      <div class="result-card span-all mind-card">
        ${cardH4("TODAY'S MIND", "きょうのマインド")}
        <p class="mind-word">「${mind.word}」</p>
        ${mind.points.map((pt) => `<p class="mind-point"><span class="mp-k">${pt.k}</span>${pt.v}</p>`).join("")}
        <p class="mind-sendoff">— いってらっしゃい。良い一日を。</p>
      </div>
    </div>
    <div class="share-block">
      <div class="share-preview-slot" data-share-preview="today"></div>
    </div>
    <div class="crosslinks">
      <span class="crosslinks-label">─ もっと観測する</span>
      <button data-nav="tarot">スプレッドで深く占う</button>
      <button data-nav="western">ホロスコープをみる</button>
      <button data-nav="mypage">マイページ</button>
    </div>`);

  renderSharePreview("today");
}

/* ---------- 今日の結論(総合判定) ---------- */
function verdictHtml(v) {
  const rows = v.factors.map((f) => `
    <div class="vf-row">
      <span class="vf-vote ${f.score > 0 ? "up" : f.score < 0 ? "down" : "flat"}">${f.score > 0 ? "▲" : f.score < 0 ? "▼" : "―"}</span>
      <span class="vf-body"><span class="vf-method">${f.method}</span><strong>${f.label}</strong> — ${f.note}</span>
    </div>`).join("");
  const rare = v.rank === "大吉"
    ? "独立した複数の暦がここまで同時に揃う日は、年に数えるほどしかありません。"
    : v.rank === "休"
      ? "ここまで揃って「休め」と出る日もめったにありません。堂々と充電してください。"
      : "";
  return `
    <div class="result-card span-all verdict-card">
      ${cardH4("VERDICT", "今日の結論")}
      <div class="verdict-main">
        <span class="verdict-rank">${v.rank}</span>
        <div class="verdict-text">
          <p class="verdict-word">今日は「${v.word}」</p>
          <p class="verdict-advice">${v.advice}</p>
          ${rare ? `<p class="verdict-rare">✦ ${rare}</p>` : ""}
        </div>
      </div>
      <div class="vf-list">${rows}</div>
      ${explainHtml("この結論はどう出している?", "四柱推命の日運・月運、干支の巡り(三合・支合・冲)、月の満ち欠け——それぞれ独立した暦の手法が今日をどう見ているかを「票」として集計し、総合の結論を出しています。すべてが同じ方向を向く日は、それだけ強い日です。")}
    </div>`;
}

/* ---------- マイページ(簡易会員) ---------- */
function compassSvg(kichi) {
  const cx = 140, cy = 140, r = 96;
  let marks = "";
  for (const dir of DIRECTIONS) {
    const rad = (dir.angle - 90) * Math.PI / 180;
    const lx = cx + Math.cos(rad) * (r + 26);
    const ly = cy + Math.sin(rad) * (r + 26);
    const dx = cx + Math.cos(rad) * r;
    const dy = cy + Math.sin(rad) * r;
    const good = kichi.good.find((g) => g.dir === dir.name);
    const bad = kichi.bad[dir.name];
    const color = good ? (good.grade === "大吉" ? "#8F6C38" : "#A8844E") : bad ? "#a25a4d" : "rgba(28,35,51,.22)";
    const size = good ? 7 : 4;
    marks += `
      <circle cx="${dx}" cy="${dy}" r="${size}" fill="${color}" />
      <text x="${lx}" y="${ly + 5}" text-anchor="middle" font-size="14" fill="${good ? "#8F6C38" : bad ? "#a25a4d" : "#5D6270"}" font-weight="${good ? 700 : 400}">${dir.name}</text>`;
  }
  return `<svg viewBox="0 0 280 280" class="compass" role="img" aria-label="今月の方位盤">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(28,35,51,.16)" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r - 22}" fill="none" stroke="rgba(28,35,51,.07)" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="3" fill="#A8844E" />
    ${marks}
  </svg>`;
}

function renderMypage() {
  const root = document.getElementById("mypage-root");
  const p = loadProfile();

  if (!p?.birthdate) {
    root.innerHTML = `
      <div class="view-head">
        <p class="view-eyebrow">MEMBERSHIP</p>
        <h2>マイページ</h2>
        <p class="view-sub">登録すると、あなた専用の観測室が開きます。</p>
      </div>
      <form class="panel form" id="register-form">
        <div class="form-row">
          <label class="field">
            <span class="field-label">名前(任意)</span>
            <input type="text" name="name" placeholder="例:ヒナタ" maxlength="20" />
          </label>
          <label class="field">
            <span class="field-label">生年月日 <em>必須</em></span>
            <div class="bd-select" data-bd="birthdate"></div>
          </label>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">登録する</button>
        <p class="form-note">データはこの端末にのみ保存されます。</p>
      </form>`;
    setupBirthdateSelects();
    document.getElementById("register-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (!fd.get("birthdate")) return;
      saveProfile({ name: fd.get("name")?.trim(), birthdate: fd.get("birthdate"), theme: "total" });
      prefillForms(loadProfile());
      renderHomeDaily();
      renderMypage();
    });
    return;
  }

  const visits = updateStreak() || {};
  const who = p.name ? `${esc(p.name)}さん` : "あなた";
  const flow = kiFlow(p.birthdate);
  const week = weekFlow(p.birthdate);
  const daily = dailyFortune(p.birthdate);
  const [by, bm, bd] = p.birthdate.split("-").map(Number);
  const kyusei = getKyusei(by, bm, bd);
  const honmeiIdx = KYUSEI.indexOf(kyusei) + 1;
  const now = new Date();
  const kichi = kichiHoi(honmeiIdx, now.getFullYear(), now.getMonth() + 1, now.getDate());
  const themes = themeDirections(kichi);
  const phase = moonPhaseToday();

  const verdict = dailyVerdict(p.birthdate);
  const best = [...week].sort((a, b) => b.power - a.power)[0];
  const weekHtml = week.map((w) => `
    <div class="week-day ${w.today ? "is-today" : ""} ${w === best ? "is-best" : ""}">
      <span class="wd-date">${w.label}<small>(${w.wd})</small></span>
      <span class="wd-kanshi">${w.kanshi}</span>
      <span class="wd-star">${w.star.name}</span>
      ${w === best ? '<span class="wd-badge">◎ 好機</span>' : ""}
    </div>`).join("");

  const goodList = kichi.good.length
    ? kichi.good.map((g) => `<span class="chip"><strong>${g.dir}</strong> ${g.grade}(${g.star})</span>`).join("")
    : '<span class="chip">今月は無理に動かないのが吉</span>';

  const themeLine = (label, dir, fallback) => {
    if (!dir) return `<p class="theme-dir"><span>${label}</span>今月は方位にこだわらず、${fallback}</p>`;
    const dd = DIRECTIONS.find((x) => x.name === dir);
    return `<p class="theme-dir"><span>${label}</span><strong>${dir}</strong> — ${dd.tip}</p>`;
  };

  root.innerHTML = `
    <div class="result-hero mypage-hero">
      <span class="result-symbol">${flow.myKan}</span>
      <p class="result-eyebrow">MY PAGE — ${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} <span class="nw">${phase.emoji} ${phase.name}</span></p>
      <h3 class="result-title"><span class="nw">おかえりなさい、</span><span class="nw">${who}。</span></h3>
      <p class="result-keyword">「${fortuneTitle(p.birthdate).title}」— 連続 ${visits.streak || 1} 日目${(visits.streak || 1) >= 7 ? " 🔥" : ""}</p>
      ${streakMilestone(visits.streak || 1) ? `<p class="milestone">${streakMilestone(visits.streak || 1)}</p>` : ""}
      <div class="chip-row">
        <span class="chip">日主 <strong>${flow.myKan}(${flow.nikkan.symbol})</strong></span>
        <span class="chip">本命星 <strong>${kyusei.name}</strong></span>
        <span class="chip">今日の運気 <strong>${daily.score100} /100</strong></span>
      </div>
    </div>

    <div class="result-grid">
      ${verdictHtml(verdict)}
      <div class="result-card span-all">
        ${cardH4("TODAY'S KI", "今日の気流")}
        ${todayLogicHtml(daily)}
        <div style="margin-top:18px">${metersHtml(daily.scores)}</div>
        <p style="margin-top:16px"><strong style="color:var(--gold-bright)">今日の開運アクション</strong> — ${daily.action}</p>
      </div>

      <div class="result-card span-all">
        ${cardH4("7 DAYS", "一週間の気流")}
        <div class="week-strip">${weekHtml}</div>
        <p class="sub" style="margin-top:12px">◎は今週いちばん追い風が吹く日。大事な予定はこの日に。日付の下は「その日の干支」と、あなたから見た「通変星」です。</p>
      </div>

      <div class="result-card">
        ${cardH4("THIS MONTH", "今月の立ち回り")}
        ${logicFlowHtml([
          { tag: "あなたの日主", main: flow.myKan, sub: flow.nikkan.symbol },
          "×",
          { tag: "今月の干支", main: flow.month.pillar.kan + flow.month.pillar.shi, sub: `${now.getMonth() + 1}月` },
          "=",
          { tag: "今月の気流", main: flow.month.star.name, sub: "", result: true },
        ])}
        <p style="margin-top:8px">${flow.month.star.month}</p>
        <p class="sub" style="margin-top:12px">今年は「${flow.year.star.name}」の年 — ${flow.year.star.month.replace(/^「.+?」の月 — /, "").replace(/月/g, "年")}</p>
      </div>

      <div class="result-card">
        ${cardH4("DIRECTIONS", "今月の吉方位")}
        <div class="compass-wrap">${compassSvg(kichi)}</div>
        <div class="legend">
          <span><i class="dot-good"></i>吉方位</span>
          <span><i class="dot-bad"></i>凶方位(五黄殺など)</span>
          <span><i class="dot-flat"></i>平運</span>
        </div>
        <div class="chip-row" style="justify-content:center">${goodList}</div>
        <div style="margin-top:16px">
          ${themeLine("恋愛", themes.love, "心が安らぐ場所で会うのが吉。")}
          ${themeLine("仕事", themes.work, "いつもの場所で足元を固めて。")}
          ${themeLine("金運", themes.money, "散財を避けて守りの月に。")}
          ${themeLine("健康", themes.health, "近所の散歩と早寝がいちばんの薬。")}
        </div>
        ${explainHtml("吉方位はどう決まる?", "九星気学では、9つの星が毎月方位盤の上を巡ります。あなたの本命星(" + kyusei.name + ")と相性の良い星が巡る方角が吉方位。誰にとっても凶となる五黄殺・暗剣殺と、あなた固有の本命殺・本命的殺は除いています。自宅から見た方角で使ってください。")}
      </div>
    </div>

    <div class="mypage-divider" role="separator"><span class="md-en">ARCHIVE</span><span class="md-ja">ここから下は、あなたの記録</span></div>

    <div class="result-grid archive-grid">
      <div class="result-card archive-card span-all">
        ${cardH4("COLLECTION", "称号図鑑")}
        ${(() => {
          addToCollection(fortuneTitle(p.birthdate).title, p.name || "あなた");
          const col = loadCollection();
          const bar = Math.min(100, col.length / 1080 * 100 * 20); // 視覚用に20倍で進捗を見せる
          return `
            <p class="col-count"><strong>${col.length}</strong> / 1080 種の称号を発見</p>
            <div class="meter" style="margin:10px 0 16px">
              <span class="meter-label">発見率</span>
              <div class="meter-track"><div class="meter-fill mid" data-w="${bar.toFixed(1)}"></div></div>
              <span class="meter-value">${(col.length / 1080 * 100).toFixed(1)}%</span>
            </div>
            <div class="col-grid">${col.slice(0, 24).map((c) => `
              <div class="col-item">
                <span class="col-title">「${esc(c.title)}」</span>
                <span class="col-meta">${esc(c.owner)} ・ ${c.d.slice(5).replace("-", "/")}</span>
              </div>`).join("")}</div>
            <p class="sub" style="margin-top:12px">統合鑑定・相性診断・友達からの招待リンクで、新しい称号が図鑑に加わります。</p>`;
        })()}
      </div>

      <div class="result-card archive-card span-all app-card">
        ${cardH4("APP", "ホーム画面に追加")}
        <p>MYOURISCOPEをホーム画面に追加すると、毎朝ワンタップで「今日の流れ」が開きます。</p>
        <div class="result-actions" style="margin-top:14px">
          <button class="btn btn-primary" id="install-app">アプリとして追加する</button>
        </div>
        <p class="sub app-ios-hint" style="margin-top:10px">iPhoneの方: Safariの共有ボタン → 「ホーム画面に追加」でインストールできます。</p>
        <div class="result-actions" style="margin-top:18px">
          <button class="btn btn-ghost" id="backup-export">引き継ぎコードをコピー</button>
          <button class="btn btn-ghost" id="backup-import">コードを入力して復元</button>
        </div>
        <p class="sub" style="margin-top:8px">機種変更や新しいドメインへの移行時に、称号図鑑・履歴・連続日数をそのまま持ち越せます。</p>
      </div>

      <div class="result-card archive-card span-all">
        ${cardH4("HISTORY", "鑑定の記録")}
        ${(() => {
          const hist = loadHistory();
          if (!hist.length) return '<p class="sub">まだ記録がありません。鑑定を受けると、ここに自動で残っていきます。</p>';
          return hist.slice(0, 20).map((h) => `
            <details class="explain history-item">
              <summary><span class="hi-date">${h.d.slice(5).replace("-", "/")}</span><span class="hi-kind">${h.k}</span><span class="hi-title">${h.t}</span></summary>
              <p>${h.x}</p>
            </details>`).join("");
        })()}
      </div>
    </div>

    <div class="crosslinks">
      <span class="crosslinks-label">─ 旅はつづく</span>
      <button data-nav="integrated">統合鑑定を受ける</button>
      <button data-nav="tarot">今日の一枚を引く</button>
      <button id="edit-profile">プロフィール編集</button>
      <button id="logout">登録情報を削除</button>
    </div>`;

  [...root.querySelectorAll(".result-hero, .result-card, .crosslinks")].forEach((n, i) => {
    n.style.animationDelay = `${i * 90}ms`;
    n.classList.add("reveal-item");
  });
  requestAnimationFrame(() => {
    root.querySelectorAll(".meter-fill").forEach((m) => {
      requestAnimationFrame(() => { m.style.width = `${m.dataset.w}%`; });
    });
  });

  const installBtn = document.getElementById("install-app");
  if (installBtn) {
    if (!deferredInstall) installBtn.style.display = "none";
    installBtn.addEventListener("click", async () => {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      installBtn.style.display = "none";
    });
  }

  document.getElementById("backup-export")?.addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText(exportBackupCode());
      e.target.textContent = "コピーしました ✓";
    } catch {
      prompt("このコードを控えてください:", exportBackupCode());
    }
    setTimeout(() => { e.target.textContent = "引き継ぎコードをコピー"; }, 1800);
  });
  document.getElementById("backup-import")?.addEventListener("click", () => {
    const code = prompt("引き継ぎコード(FTN1.〜)を貼り付けてください:");
    if (!code) return;
    if (importBackupCode(code.trim())) {
      alert("復元しました。マイページを更新します。");
      prefillForms(loadProfile());
      renderHomeDaily();
      renderMypage();
    } else {
      alert("コードを読み取れませんでした。全文がコピーされているか確認してください。");
    }
  });

  document.getElementById("logout").addEventListener("click", () => {
    if (!confirm("この端末に保存された登録情報と来訪記録を削除します。よろしいですか?")) return;
    try { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(VISIT_KEY); } catch { /* noop */ }
    renderHomeDaily();
    renderMypage();
  });
  document.getElementById("edit-profile").addEventListener("click", () => {
    try { localStorage.removeItem(PROFILE_KEY); } catch { /* noop */ }
    renderMypage();
  });
}

/* ---------- 結果コピー ---------- */
function buildShareText(r) {
  const ori = r.card.reversed ? "逆位置" : "正位置";
  return [
    `【MYOURISCOPE 統合鑑定】${r.name ? r.name + "さん" : ""}`,
    `運命の称号:「${fortuneTitle(r.birthdateStr).title}」(1080タイプにひとつ)`,
    `太陽 ${r.zodiac.name} × 月 ${r.moon.name} × ${r.kyusei.name}`,
    `日主: ${r.pillars.day.kan}(${r.pillars.nikkan.symbol}) / 干支: ${r.jikkan}${r.eto.name}`,
    `今日の運気: ${r.daily.total.toFixed(1)} / 5.0`,
    `導きの一枚: ${r.card.name}(${ori}) — ${r.card.advice}`,
    `ラッキーカラー: ${r.daily.luckyColor} / ラッキーアイテム: ${r.daily.luckyItem}`,
    `あなたの称号は? → ${buildInviteUrl(r.name, fortuneTitle(r.birthdateStr).title)}`,
  ].join("\n");
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    const orig = btn.textContent;
    btn.textContent = "コピーしました ✓";
    setTimeout(() => { btn.textContent = orig; }, 1600);
  } catch {
    btn.textContent = "コピーできませんでした";
  }
});

/* ---------- シェア画像(1200x630)とXシェア・鑑定履歴 ---------- */
const SITE_URL = "https://myouriscope.com/";
const lastShare = {}; // kind -> {eyebrow,title,sub,keywords,score,scoreLabel,x}

function buildInviteUrl(name, title) {
  const q = new URLSearchParams();
  if (name) q.set("in", name);
  q.set("it", title);
  return `${SITE_URL}?${q.toString()}`;
}

function shareRowHtml(kind) {
  return `
    <div class="share-block">
      <div class="share-preview-slot" data-share-preview="${kind}"></div>
    </div>`;
}

async function renderSharePreview(kind) {
  const slot = document.querySelector(`[data-share-preview="${kind}"]`);
  if (!slot || !lastShare[kind]) return;
  try {
    const blob = await makeShareCard(lastShare[kind]);
    const url = URL.createObjectURL(blob);
    slot.innerHTML = `<img class="share-preview" src="${url}" alt="シェア画像プレビュー" loading="lazy" />`;
  } catch { /* プレビュー失敗時はボタンのみ */ }
}

async function makeShareCard(p) {
  /* Instagramストーリーズ最適化(1080x1920・9:16)
     夜の「儀式の間」の世界観で、カードのアートを主役に */
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  try {
    await document.fonts.load('700 80px "Zen Old Mincho"');
    await document.fonts.load('600 40px "Cormorant Garamond"');
  } catch { /* fallback */ }
  const serif = '"Zen Old Mincho", "Hiragino Mincho ProN", serif';
  const latin = '"Cormorant Garamond", "Zen Old Mincho", serif';

  // 深い紺の間
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0A1026"); bg.addColorStop(0.5, "#141B38"); bg.addColorStop(1, "#0A1026");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // 静かな星粒(シードで固定)
  const rng = seededRng(p.title || "myouriscope");
  for (let i = 0; i < 110; i++) {
    ctx.globalAlpha = 0.15 + rng() * 0.55;
    ctx.fillStyle = rng() < 0.4 ? "#D9C08A" : "#EFE9DC";
    ctx.beginPath();
    ctx.arc(rng() * W, rng() * H, rng() * 2 + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 軌道のアーク
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(184,154,90,${0.22 - i * 0.04})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, 380 + i * 130, 1.0 + i * 0.9, 2.6 + i * 0.9);
    ctx.stroke();
  }

  // 金の枠
  ctx.strokeStyle = "rgba(184,154,90,.75)"; ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.strokeStyle = "rgba(184,154,90,.3)"; ctx.lineWidth = 1;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  // ヘッダー
  ctx.textAlign = "center";
  ctx.fillStyle = "#B89A5A";
  ctx.font = `600 42px ${latin}`;
  ctx.fillText("M Y O U R I S C O P E", W / 2, 158);
  ctx.fillStyle = "#9AA0B8";
  ctx.font = `500 30px ${latin}`;
  ctx.fillText(p.eyebrow || "", W / 2, 214);

  // ビジュアル(タロットは絵札そのもの、西洋はチャート、他は観測盤モチーフ)
  const loadImg = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
  const visTop = 280, visH = 830;

  if (p.cards?.length) {
    const shown = p.cards.slice(0, 3);
    const imgs = (await Promise.all(shown.map((c) => loadImg(tarotImg(c.n))))).map((im, i) => ({ im, c: shown[i] }));
    const ok = imgs.filter((x) => x.im);
    if (ok.length) {
      const cw = ok.length === 1 ? 470 : 330;
      const ch = cw * 244 / 152;
      const cy = visTop + visH / 2;
      const fan = ok.length === 1 ? [[0, 0]] : ok.length === 2 ? [[-0.09, 10], [0.09, 10]] : [[-0.14, 34], [0, 0], [0.14, 34]];
      ok.forEach(({ im, c }, i) => {
        const [rot, dy] = fan[i];
        const cx = W / 2 + (i - (ok.length - 1) / 2) * (ok.length === 1 ? 0 : 245);
        ctx.save();
        ctx.translate(cx, cy + dy);
        ctx.rotate(rot + (c.reversed ? Math.PI : 0));
        ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
        ctx.drawImage(im, -cw / 2, -ch / 2, cw, ch);
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(217,192,138,.85)"; ctx.lineWidth = 3;
        ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
        ctx.restore();
      });
      if (p.cards.length > 3) {
        ctx.fillStyle = "#9AA0B8";
        ctx.font = `500 30px ${serif}`;
        ctx.fillText(`ほか ${p.cards.length - 3} 枚`, W / 2, visTop + visH + 8);
      }
    }
  } else if (p.svg) {
    const im = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(p.svg));
    if (im) {
      const sz = 720;
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, visTop + visH / 2, sz / 2, 0, Math.PI * 2);
      ctx.shadowColor = "rgba(217,192,138,.35)"; ctx.shadowBlur = 70;
      ctx.fillStyle = "#FDFBF6"; ctx.fill();
      ctx.restore();
      ctx.drawImage(im, W / 2 - sz / 2, visTop + visH / 2 - sz / 2, sz, sz);
    }
  } else if (p.duo) {
    // 相性: 交わるふたつの円(縁)+ 中央にスコア
    const cy = visTop + visH / 2 - 30;
    const R = 300, off = 160;
    for (const [dx, name] of [[-off, p.duo.nameA], [off, p.duo.nameB]]) {
      ctx.strokeStyle = "rgba(217,192,138,.75)"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(217,192,138,.4)"; ctx.shadowBlur = 26;
      ctx.beginPath(); ctx.arc(W / 2 + dx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#D9C08A";
      ctx.font = `600 44px ${serif}`;
      ctx.fillText(name, W / 2 + dx * 2.2, cy - R - 46);
    }
    // 交差部分をほんのり満たす
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2 - off, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath(); ctx.arc(W / 2 + off, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(217,192,138,.10)"; ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#EFE9DC";
    ctx.font = `700 190px ${latin}`;
    ctx.fillText(String(p.score), W / 2, cy + 62);
    ctx.fillStyle = "#9AA0B8";
    ctx.font = `500 38px ${serif}`;
    ctx.fillText(p.scoreLabel || "", W / 2, cy + 138);
    // 非対称の見え方(話のタネ)
    ctx.font = `500 38px ${serif}`;
    ctx.fillStyle = "#C9CEE0";
    ctx.fillText(`${p.duo.nameA}から見ると「${p.duo.labelA}」`, W / 2, cy + R + 96);
    ctx.fillText(`${p.duo.nameB}から見ると「${p.duo.labelB}」`, W / 2, cy + R + 158);
  } else {
    // 観測盤モチーフ
    const cy = visTop + visH / 2;
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(217,192,138,${0.5 - i * 0.09})`;
      ctx.lineWidth = i === 0 ? 2 : 1.2;
      ctx.beginPath(); ctx.arc(W / 2, cy, 90 + i * 78, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(217,192,138,.8)";
      const ang = 0.8 + i * 1.4;
      ctx.beginPath(); ctx.arc(W / 2 + Math.cos(ang) * (90 + i * 78), cy + Math.sin(ang) * (90 + i * 78), 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#D9C08A";
    ctx.beginPath(); ctx.arc(W / 2, cy, 8, 0, Math.PI * 2); ctx.fill();
    if (p.score != null) {
      ctx.fillStyle = "#EFE9DC";
      ctx.font = `700 210px ${latin}`;
      ctx.fillText(String(p.score), W / 2, cy + 70);
      ctx.fillStyle = "#9AA0B8";
      ctx.font = `500 40px ${serif}`;
      ctx.fillText(p.scoreLabel || "", W / 2, cy + 150);
    }
  }

  // 見出し(2行まで自動折返し)
  const titleY = 1290;
  ctx.fillStyle = "#EFE9DC";
  ctx.font = `700 76px ${serif}`;
  const words = String(p.title || "");
  if (ctx.measureText(words).width > W - 200) {
    const half = Math.ceil(words.length / 2);
    let cut = half;
    for (const sep of ["、", "。", "は", "の", "と"]) {
      const idx = words.indexOf(sep, Math.max(2, half - 5));
      if (idx > 1 && idx < words.length - 2) { cut = idx + 1; break; }
    }
    ctx.fillText(words.slice(0, cut), W / 2, titleY);
    ctx.fillText(words.slice(cut), W / 2, titleY + 104);
  } else {
    ctx.fillText(words, W / 2, titleY + 50);
  }

  // キーワード
  if (p.keywords?.length) {
    ctx.fillStyle = "#D9C08A";
    ctx.font = `600 40px ${serif}`;
    ctx.fillText(p.keywords.join("  ◉  "), W / 2, 1478);
  }
  // ひとこと or スコア
  if (p.sub) {
    ctx.fillStyle = "#9AA0B8";
    ctx.font = `500 36px ${serif}`;
    ctx.fillText(p.sub, W / 2, 1560);
  } else if (p.score != null && p.cards?.length) {
    ctx.fillStyle = "#D9C08A";
    ctx.font = `700 56px ${latin}`;
    ctx.fillText(`${p.score}${p.scoreSuffix || "/100"}`, W / 2, 1560);
  }

  // 仕切りとフッター
  ctx.strokeStyle = "rgba(184,154,90,.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 130, 1650); ctx.lineTo(W / 2 + 130, 1650); ctx.stroke();
  const d = new Date();
  ctx.fillStyle = "#B89A5A";
  ctx.font = `500 32px ${latin}`;
  ctx.fillText(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`, W / 2, 1716);
  ctx.fillStyle = "#9AA0B8";
  ctx.font = `500 28px ${latin}`;
  ctx.fillText("myouriscope.com", W / 2, 1772);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}


/* ---------- 鑑定履歴(localStorage) ---------- */
const HISTORY_KEY = "fortuna:history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}

function recordHistory(kind, title, text) {
  try {
    const list = loadHistory();
    list.unshift({ d: todayKey(), k: kind, t: title, x: text });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch { /* noop */ }
}

/* ---------- 統合鑑定 ---------- *//* ---------- 統合鑑定 ---------- */
document.getElementById("integrated-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = integratedReading({
    name: fd.get("name")?.trim(),
    birthdate: fd.get("birthdate"),
    theme: fd.get("theme"),
  });

  saveProfile({ name: r.name, birthdate: fd.get("birthdate"), theme: r.theme });
  prefillForms(loadProfile());
  renderHomeDaily();

  const who = r.name ? `${esc(r.name)}さん` : "あなた";
  const ori = r.card.reversed ? "逆位置" : "正位置";
  const cardMeaning = r.card.reversed ? r.card.rev : r.card.up;

  const shogo = fortuneTitle(fd.get("birthdate"));
  addToCollection(shogo.title, r.name || "あなた");
  lastShare.integrated = {
    cards: [{ n: r.card.n, reversed: r.card.reversed }],
    eyebrow: "MY FORTUNE IDENTITY",
    title: `「${shogo.title}」`,
    keywords: [`${r.zodiac.name} × 日主${r.pillars.day.kan} × ${r.kyusei.name}`, "1080タイプにひとつの称号"],
    score: r.daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    x: `私の運命の称号は「${shogo.title}」— 1080タイプにひとつ。今日の運気は${r.daily.score100}/100 ✦ あなたの称号は?`,
    url: buildInviteUrl(r.name, shogo.title),
  };
  recordHistory("統合鑑定", `「${shogo.title}」— 運気${r.daily.score100}/100`, `${r.zodiac.name}×${r.kyusei.name}。導きの一枚「${r.card.name}(${ori})」。${r.themeComment}`);

  document.getElementById("integrated-form").classList.add("form-quiet");
  observeThen("integrated", () => showResult(document.getElementById("integrated-result"), `
    <div class="result-hero">
      <span class="result-symbol">${r.zodiac.symbol}︎</span>
      <p class="result-eyebrow">INTEGRATED REPORT</p>
      <h3 class="result-title">${who}の統合鑑定書</h3>
      <div class="shogo">
        <p class="shogo-label">あなたの運命の称号</p>
        <p class="shogo-title">「${shogo.title}」</p>
        <p class="shogo-rarity">日主 × 太陽星座 × 本命星が織りなす、<strong>1080タイプ</strong>にひとつのあなた</p>
        <div class="shogo-origin">
          ${shogo.origin.map((o) => `<span class="sg-part"><strong>${o.word}</strong><small>${o.from}<br>${o.why}</small></span>`).join('<span class="sg-x">×</span>')}
        </div>
      </div>
      <div class="chip-row">
        <span class="chip">太陽 <strong>${r.zodiac.name}</strong></span>
        <span class="chip">月 <strong>${r.moon.name}</strong></span>
        <span class="chip">日主 <strong>${r.pillars.day.kan}(${r.pillars.nikkan.symbol})</strong></span>
        <span class="chip">干支 <strong>${r.jikkan}${r.eto.name}</strong></span>
        <span class="chip">本命星 <strong>${r.kyusei.name}</strong></span>
      </div>
      <p class="result-lead">${r.elementNote}</p>
      <div class="share-block">
        <div class="share-preview-slot" data-share-preview="integrated"></div>
        <div class="result-actions" style="justify-content:center">
          <button class="btn btn-ghost" data-copy="${esc(buildShareText(r))}">結果をコピー</button>
        </div>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-card span-all">
        ${cardH4("WEST × EAST", "西の星 × 東の暦の重ね読み")}
        <p>西洋の星はあなたを<strong style="color:var(--gold-bright)">${r.zodiac.name}(${r.zodiac.element}のサイン)</strong>、東洋の暦は<strong style="color:var(--gold-bright)">「${r.pillars.nikkan.symbol}」(${r.pillars.nikkan.yinyang}の${r.pillars.nikkan.element})</strong>と観ています。${ELEMENT_STYLE[r.zodiac.element]}外向きのエンジンに、${r.pillars.nikkan.symbol}の器 — この掛け合わせは1080通りの中であなたの称号だけのもの。どちらか一方ではなく、両方を使い分けられるのがあなたの強みです。</p>
      </div>
      <div class="result-card">
        ${cardH4("SUN & MOON", "星がしめす二つの顔")}
        <p><strong style="color:var(--gold-bright)">☉︎ ${r.zodiac.name}</strong> — ${r.zodiac.trait}</p>
        <p class="sub" style="margin-top:12px"><strong>☾︎ ${r.moon.name}の月</strong> — ${r.moon.desc}</p>
      </div>
      <div class="result-card">
        ${cardH4("DAY MASTER", "暦がしめす器")}
        <p><strong style="color:var(--gold-bright)">${r.pillars.day.kan} — ${r.pillars.nikkan.yinyang}の${r.pillars.nikkan.element}「${r.pillars.nikkan.symbol}」</strong></p>
        <p style="margin-top:8px">${r.pillars.nikkan.text}</p>
        <p class="sub" style="margin-top:12px">${r.kyusei.trait}</p>
      </div>
      <div class="result-card">
        ${cardH4("TAROT", "導きの一枚")}
        <p><strong style="color:var(--gold-bright)">${r.card.name}(${ori})</strong> — ${cardMeaning}</p>
        <p class="sub" style="margin-top:12px">${r.card.advice}</p>
        <p style="margin-top:14px">${THEME_LABEL[r.theme]} ${starsHtml(r.themeScore)}<br /><span class="sub">${r.themeComment}</span></p>
      </div>
    </div>
    ${crossLinksHtml("integrated")}
  `), () => renderSharePreview("integrated"));
});

/* ---------- ホロスコープ(太陽 × 月 × 10天体) ---------- */
/* テーマ(人生/仕事/恋愛) */
let westernTheme = "life";
const WESTERN_THEMES = [["life", "人生"], ["work", "仕事"], ["love", "恋愛"]];
const WESTERN_THEME_LABEL = { life: "人生", work: "仕事", love: "恋愛" };

/* ホロスコープの円環図(出生図ホイール) */
function horoscopeWheelSvg(h) {
  const size = 340, cx = 170, cy = 170;
  const rOuter = 160, rSignIn = 134, rPlanet = 106, rAspect = 84;
  // 牡羊座0度を左(9時方向)に、反時計回り(占星術の慣習)
  const pt = (lon, r) => {
    const a = (180 - lon) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  };
  let out = `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="#FDFBF6" stroke="rgba(28,35,51,.28)" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="${rSignIn}" fill="none" stroke="rgba(28,35,51,.2)"/>
    <circle cx="${cx}" cy="${cy}" r="${rAspect}" fill="none" stroke="rgba(28,35,51,.1)"/>
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="#A8844E"/>`;
  // 12サインの仕切りとグリフ
  const SIGN_GLYPHS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  for (let i = 0; i < 12; i++) {
    const [x1, y1] = pt(i * 30, rSignIn), [x2, y2] = pt(i * 30, rOuter);
    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(28,35,51,.2)"/>`;
    const [gx, gy] = pt(i * 30 + 15, (rOuter + rSignIn) / 2);
    out += `<text x="${gx}" y="${gy + 5}" text-anchor="middle" font-size="15" fill="#8F6C38">${SIGN_GLYPHS[i]}\uFE0E</text>`;
  }
  // アスペクト線(天体の内側)
  for (const asp of h.aspects) {
    const [x1, y1] = pt(asp.a.lon, rAspect), [x2, y2] = pt(asp.b.lon, rAspect);
    const color = asp.type.tone === "soft" ? "rgba(46,140,126,.55)" : asp.type.tone === "hard" ? "rgba(192,92,130,.5)" : "rgba(168,132,78,.6)";
    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.3"/>`;
  }
  // 天体グリフ(近接時は半径を互い違いに)
  const sorted = [...h.planets].sort((a, b) => a.lon - b.lon);
  let prevLon = -99, flip = false;
  for (const pl of sorted) {
    flip = pl.lon - prevLon < 12 ? !flip : false;
    prevLon = pl.lon;
    const [px, py] = pt(pl.lon, rPlanet - (flip ? 22 : 0));
    const [tx, ty] = pt(pl.lon, rAspect);
    out += `<line x1="${px}" y1="${py}" x2="${tx}" y2="${ty}" stroke="rgba(28,35,51,.15)"/>
      <circle cx="${px}" cy="${py}" r="11" fill="#FDFBF6" stroke="rgba(168,132,78,.5)"/>
      <text x="${px}" y="${py + 4.5}" text-anchor="middle" font-size="13" fill="#1C2333">${pl.glyph}\uFE0E</text>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" class="horo-svg" role="img" aria-label="出生図">${out}</svg>`;
}

document.querySelectorAll("#western-theme [data-wtheme]").forEach((b) => {
  b.addEventListener("click", () => {
    westernTheme = b.dataset.wtheme;
    document.querySelectorAll("#western-theme [data-wtheme]").forEach((x) => x.classList.toggle("active", x === b));
  });
});

/* 出生地セレクトに47都道府県を流し込む */
(function fillPlaceSelect() {
  const sel = document.getElementById("western-place");
  if (!sel) return;
  PREF_GEO.forEach(([name], i) => {
    const o = document.createElement("option");
    o.value = i; o.textContent = name;
    sel.appendChild(o);
  });
  try {
    const saved = localStorage.getItem("fortuna:bp");
    if (saved !== null && saved !== "") sel.value = saved;
  } catch { /* noop */ }
})();

document.getElementById("western-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const birthdate = fd.get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const z = getZodiac(m, d);
  const moon = moonSign(y, m, d);
  const daily = dailyFortune(birthdate);
  const hasTime = fd.get("bh") !== "" && fd.get("bh") !== null;
  const birthHour = hasTime ? Number(fd.get("bh")) + Number(fd.get("bm") || 0) / 60 : 12;
  const horo = horoscope(y, m, d, birthHour, hasTime);
  const horoMoonSign = horo.planets.find((p) => p.key === "moon").sign;
  const flow = horoscopeFlow(y, m, d, westernTheme);
  const themeReading = horoscopeTheme(horo, westernTheme);
  const themeLabel = WESTERN_THEME_LABEL[westernTheme];
  const yearly = horoscopeYear(y, m, d);

  // 出生地 × 出生時刻 → アセンダント(上昇星座)
  const bp = fd.get("bp");
  try { localStorage.setItem("fortuna:bp", bp ?? ""); } catch { /* noop */ }
  const place = bp !== null && bp !== "" ? PREF_GEO[Number(bp)] : null;
  const asc = hasTime && place ? ascendantSign(y, m, d, birthHour, place[1], place[2]) : null;

  // 今日の空(トランジット)— ここは毎日変わる
  const sky = skyToday(Object.fromEntries(horo.planets.map((pl) => [pl.key, pl.lon])));
  const now = new Date();
  const planetJa = (k) => PLANET_BODIES.find((b) => b.key === k);
  const toneText = { soft: "やさしい追い風を送っています。この組み合わせの事柄が、するすると進む日", hard: "少し緊張を生んでいます。ここを扱うときはひと呼吸おいて。丁寧に越えれば力になる日", hard0: "ぴたりと重なり、このテーマを強く照らしています。意識がそこへ向かう日" };
  const skyHits = sky.hits.length
    ? sky.hits.map((h) => {
        const tp = planetJa(h.t), np = planetJa(h.n);
        return `<p class="theme-point">${tp.glyph}︎ <strong>今日の${tp.ja}</strong> × あなたの${np.glyph}︎ ${np.ja}(${np.role}) — ${toneText[h.type.tone]}です。</p>`;
      }).join("")
    : '<p class="theme-point">今日はあなたの出生図に強く触れる角度のない、静かな空。ニュートラルに過ごせる日です。</p>';

  const moonName = hasTime ? horoMoonSign.name : moon.name;
  lastShare.western = {
    svg: horoscopeWheelSvg(horo),
    eyebrow: "WESTERN ASTROLOGY",
    title: `太陽は${z.name}、月は${moonName}`,
    keywords: [z.keyword],
    score: daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    x: `【MYOURISCOPE ホロスコープ】太陽星座は${z.name}、月星座は${moonName}。 ✦`,
  };
  recordHistory("ホロスコープ", `太陽${z.name} × 月${moonName}(${themeLabel})`, `${z.keyword}。${flow.blocks[2].title}へ向かう流れ。10天体のホロスコープ鑑定。`);

  document.getElementById("western-form").classList.add("form-quiet");
  observeThen("western", () => showResult(document.getElementById("western-result"), `
    <div class="result-hero">
      <span class="result-symbol">${z.symbol}︎</span>
      <p class="result-eyebrow">WESTERN ASTROLOGY</p>
      <h3 class="result-title">太陽は${z.name}、月は${moonName}。</h3>
      <p class="result-keyword">${z.keyword}</p>
      <div class="chip-row">
        <span class="chip">エレメント <strong>${z.element}</strong></span>
        <span class="chip">守護星 <strong>${z.planet}</strong></span>
        <span class="chip">月星座 <strong>${moonName}</strong></span>
        ${asc ? `<span class="chip">上昇星座 <strong>${asc.sign}</strong></span>` : ""}
      </div>
      ${shareRowHtml("western")}
    </div>
    <div class="result-grid">
      <div class="result-card span-all">
        ${cardH4("TODAY'S SKY", `今日の空 — ${now.getMonth() + 1}月${now.getDate()}日`)}
        <p><strong style="color:var(--gold-bright)">☽︎ 月は${sky.moonSign}に</strong> — ${sky.moonNote}。</p>
        <div style="margin-top:8px">${skyHits}</div>
        <p class="sub" style="margin-top:12px">${sky.moonTomorrow !== sky.moonSign ? `月は明日、${sky.moonTomorrow}へ移ります。空の気分もそこで切り替わります。` : `月はもうしばらく${sky.moonSign}に滞在します。`}空は毎日動いているので、この欄は来るたびに変わります。</p>
      </div>
      <div class="result-card">
        ${cardH4("SUN SIGN", "外に向かうあなた")}
        <p>${z.trait}</p>
      </div>
      <div class="result-card">
        ${cardH4("MOON SIGN", "心の素顔")}
        <p><strong style="color:var(--gold-bright)">☾︎ ${moonName}</strong> — ${MOONSIGN_DESC[moonName]}</p>
        <p style="margin-top:12px">${sunMoonBlend(z, ZODIAC.find((zz) => zz.name === moonName))}</p>
        <p class="sub" style="margin-top:12px">${hasTime ? "※ 出生時刻をもとに計算しています。" : "※ 月は約2.5日で星座を移動します。出生時刻を入れると精度が上がります。"}</p>
      </div>
      ${asc ? `
      <div class="result-card">
        ${cardH4("RISING", "纏う雰囲気(上昇星座)")}
        <p><strong style="color:var(--gold-bright)">↑ ${asc.sign}(${asc.deg}°)</strong> — ${ASCENDANT_DESC[asc.sign]}。</p>
        <p class="sub" style="margin-top:12px">上昇星座(アセンダント)は、生まれた瞬間に東の地平線から昇っていた星座。出生時刻と出生地(${place[0]})から計算した、あなたの「第一印象」と「人生の入り口」です。</p>
      </div>` : `
      <div class="result-card">
        ${cardH4("RISING", "纏う雰囲気(上昇星座)")}
        <p class="sub">出生時刻と出生地の両方を入れると、ここに「上昇星座(アセンダント)」— あなたが人に与える第一印象と人生の入り口 — が表示されます。母子手帳に出生時刻が載っていることが多いですよ。</p>
      </div>`}
      <div class="result-card span-all flow-card">
        ${cardH4("YOUR FLOW", `${themeLabel}の流れ — 5年周期で読む`)}
        <div class="flow-line">
          ${flow.blocks.map((b) => `
            <div class="flow-block ${b.now ? "flow-now" : ""}">
              <span class="fb-era">${b.label} ・ ${b.era}</span>
              <span class="fb-title">${b.title}</span>
              <p class="fb-text">${b.text}</p>
              <p class="fb-jup">${b.jupText}</p>
            </div>`).join("")}
        </div>
        <p class="fb-personal">${flow.personal}</p>
        ${flow.nextShift ? `<p class="fb-shift">いまの章は <strong>${flow.chapterSpan}年</strong>。次の章替わりは <strong>${flow.nextShift}年ごろ</strong> — 土星のリズム(約7年ごと)が変わり目を示しています。</p>` : ""}
        ${explainHtml("この「流れ」はどう読んでいる?", "約29.5年で空を一周する土星は、生まれた位置から約7年ごとに「種まき→鍛錬→収穫→手放し」の節目を刻みます。約12年で一周する木星は幸運の巡りを示します。あなたの出生図と現在の星の位置(トランジット)の角度から、過去5年・いま・これから5年の章を読んでいます。可能性の読みとして、答え合わせしながら使ってください。")}
      </div>
      <div class="result-card span-all">
        ${cardH4("THIS YEAR", `${yearly.year}年の星模様`)}
        <p class="theme-point" style="border-top:none;padding-top:0"><strong>♃︎ 幸運の木星は「${yearly.jupiter.theme}」の部屋に</strong>(第${yearly.jupiter.house}ハウス・${yearly.jupiter.sign}) — 今年いちばん膨らみやすい領域です。この方面の誘いには乗るが吉。</p>
        <p class="theme-point"><strong>♄︎ 成長の土星は「${yearly.saturn.theme}」の部屋に</strong>(第${yearly.saturn.house}ハウス・${yearly.saturn.sign}) — 今年みっちり鍛えられる領域。ここでの粘りは章をまたいで効いてきます。</p>
        ${explainHtml("「部屋」って何?", "太陽サインを起点に空を12の部屋(ソーラーハウス)に分け、幸運の星・木星と、成長の星・土星がいまどの部屋を通過中かを見る、伝統的な年運の読み方です。木星は約1年で、土星は約2年半で次の部屋へ移ります。")}
      </div>
      <div class="result-card span-all">
        ${cardH4("READING", themeReading.title)}
        <p class="theme-lead">${themeReading.lead}</p>
        ${themeReading.points.map((pt) => `<p class="theme-point">${pt}</p>`).join("")}
      </div>
      <div class="result-card span-all">
        ${cardH4("BIRTH CHART", "ホロスコープ(出生図)")}
        <div class="horo-wheel">${horoscopeWheelSvg(horo)}</div>
        <p class="sub" style="text-align:center;margin-top:10px">生まれた日の空で、10天体がどの星座にいたか。${horo.hasTime ? "出生時刻をもとに計算しています。" : "出生時刻が不明のため正午で計算しています(月は前後の星座になる場合があります)。"}</p>
        <div class="legend" style="margin-top:8px">
          <span><i style="background:#2E8C7E"></i>調和の角度</span>
          <span><i style="background:#C05C82"></i>緊張の角度</span>
          <span><i style="background:#A8844E"></i>重なり</span>
        </div>
      </div>
      <div class="result-card span-all">
        ${cardH4("DETAILS", "もっと深く読む")}
        <details class="explain">
          <summary>10天体の配置(あなたの設計図)</summary>
          <div class="planet-list" style="padding:0 16px 14px">
            ${horo.planets.map((pl) => `
              <div class="planet-row">
                <span class="pr-glyph">${pl.glyph}</span>
                <span class="pr-name">${pl.ja}<small>${pl.role}</small></span>
                <span class="pr-sign">${pl.sign.symbol}︎ ${pl.sign.name}<small>${pl.deg}°${pl.gen ? " ・世代" : ""}</small></span>
                <span class="pr-note">${ELEMENT_STYLE[pl.sign.element]}、${pl.sign.element}のサイン</span>
              </div>`).join("")}
          </div>
        </details>
        ${horo.aspects.length ? `
        <details class="explain">
          <summary>天体同士の会話(アスペクト ${horo.aspects.length}件)</summary>
          <div style="padding:0 16px 14px">
            ${horo.aspects.map((x) => `
              <div class="aspect-row">
                <p class="ar-pair"><strong>${x.a.glyph}︎ ${x.a.ja} × ${x.b.glyph}︎ ${x.b.ja}</strong><span class="ar-type ${x.type.tone}">${x.type.ja}</span></p>
                <p class="ar-note">「${x.a.role}」と「${x.b.role}」— ${x.type.note}</p>
              </div>`).join("")}
          </div>
        </details>
        ` : ""}
      </div>
      <div class="result-card span-all mind-card">
        ${cardH4("THIS YEAR'S MOVE", "今年の一手")}
        <p class="mind-point" style="border-top:none;padding-top:0"><span class="mp-k">流れ</span>いまは「${flow.blocks[1].title}」の章(${flow.chapterSpan}年)。${flow.blocks[1].jupText}</p>
        <p class="mind-point"><span class="mp-k">広げる</span>今年の幸運は「${yearly.jupiter.theme}」の部屋に。この方面の誘いには、乗ってください。</p>
        <p class="mind-point"><span class="mp-k">鍛える</span>「${yearly.saturn.theme}」は今年しっかり試される場所。ここでの粘りが${flow.nextShift}年からの次の章の土台になります。</p>
      </div>
    </div>
    ${crossLinksHtml("western")}
  `), () => renderSharePreview("western"));
});

/* ---------- 四柱推命(× 九星気学) ---------- */
document.getElementById("eastern-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const eto = getEto(y, m, d);
  const kyusei = getKyusei(y, m, d);
  const pillars = fourPillars(y, m, d);
  const daily = dailyFortune(birthdate);
  const flow = kiFlow(birthdate);
  const week = weekFlow(birthdate);
  const mf = monthFlow12(birthdate);
  const now = new Date();
  const best = [...week].sort((a, b) => b.power - a.power)[0];
  const weekHtml = week.map((w) => `
    <div class="week-day ${w.today ? "is-today" : ""} ${w === best ? "is-best" : ""}">
      <span class="wd-date">${w.label}<small>(${w.wd})</small></span>
      <span class="wd-kanshi">${w.kanshi}</span>
      <span class="wd-star">${w.star.name}</span>
      ${w === best ? '<span class="wd-badge">◎ 好機</span>' : ""}
    </div>`).join("");
  const mfHtml = mf.months.map((mo) => {
    const pct = Math.round(((mo.power + 2) / 4.2) * 100);
    const badges = [
      mo === mf.bestWork ? "仕事◎" : "", mo === mf.bestLove ? "恋愛◎" : "", mo === mf.bestMoney ? "金運◎" : "",
    ].filter(Boolean);
    return `
    <div class="mf-row ${mo.current ? "mf-now" : ""}">
      <span class="mf-m">${mo.m}<small>月</small></span>
      <span class="mf-star">${mo.star.name}</span>
      <span class="mf-track"><i style="width:${Math.max(8, Math.min(100, pct))}%"></i></span>
      <span class="mf-badges">${badges.map((b) => `<em>${b}</em>`).join("")}${mo.current ? "<em class='mf-cur'>いま</em>" : ""}</span>
    </div>`;
  }).join("");

  lastShare.eastern = {
    eyebrow: "FOUR PILLARS & NINE STARS",
    title: `日主「${pillars.day.kan}」— ${pillars.nikkan.symbol}の人`,
    keywords: [kyusei.name, `${pillars.year.kan}${pillars.year.shi}年生まれ`],
    sub: `${pillars.nikkan.yinyang}の${pillars.nikkan.element}。${kyusei.name}。`,
    x: `【MYOURISCOPE 四柱推命】わたしの日主は「${pillars.day.kan}(${pillars.nikkan.symbol})」、本命星は${kyusei.name}でした ✦`,
  };
  recordHistory("四柱推命", `日主「${pillars.day.kan}」(${pillars.nikkan.symbol})`, `${kyusei.name}・${eto.animal}年。三柱: ${pillars.year.kan}${pillars.year.shi}/${pillars.month.kan}${pillars.month.shi}/${pillars.day.kan}${pillars.day.shi}。`);

  document.getElementById("eastern-form").classList.add("form-quiet");
  observeThen("eastern", () => showResult(document.getElementById("eastern-result"), `
    <div class="result-hero">
      <span class="result-symbol">${pillars.day.kan}</span>
      <p class="result-eyebrow">FOUR PILLARS & NINE STARS</p>
      <h3 class="result-title">日主「${pillars.day.kan}」— ${pillars.nikkan.yinyang}の${pillars.nikkan.element}、${pillars.nikkan.symbol}の人。</h3>
      <p class="result-keyword">${kyusei.name} ・ ${eto.animal}年生まれ</p>
      <div class="pillars" style="max-width:420px;margin-top:22px">
        <div class="pillar"><span class="p-label">年柱</span><span class="p-kanji">${pillars.year.kan}${pillars.year.shi}</span></div>
        <div class="pillar"><span class="p-label">月柱</span><span class="p-kanji">${pillars.month.kan}${pillars.month.shi}</span></div>
        <div class="pillar is-day"><span class="p-label">日柱</span><span class="p-kanji">${pillars.day.kan}${pillars.day.shi}</span></div>
      </div>
      <p class="result-lead">※ 四柱推命は日柱の干(日主)があなた自身を表します。節入りは簡易日付で計算しています。</p>
      ${shareRowHtml("eastern")}
    </div>
    <div class="result-grid">
      <div class="result-card">
        ${cardH4("DAY MASTER", "日主がしめす本質")}
        <p>${pillars.nikkan.text}</p>
        <p class="sub" style="margin-top:12px">干支の${eto.animal}は — ${eto.trait}</p>
      </div>
      <div class="result-card">
        ${cardH4("NINE STARS", "本命星の気質")}
        <p><strong style="color:var(--gold-bright)">${kyusei.name}(五行は${kyusei.element})</strong></p>
        <p style="margin-top:8px">${kyusei.trait}</p>
      </div>
      <div class="result-card span-all">
        ${cardH4("TODAY", `今日の気流 — ${now.getMonth() + 1}月${now.getDate()}日`)}
        ${logicFlowHtml([
          { tag: "あなたの日主", main: flow.myKan, sub: flow.nikkan.symbol },
          "×",
          { tag: "今日の干支", main: flow.day.pillar.kan + flow.day.pillar.shi, sub: "日替わり" },
          "=",
          { tag: "今日の気流", main: flow.day.star.name, sub: "", result: true },
        ])}
        <p style="margin-top:10px">「${flow.day.star.name}」は${flow.day.star.gloss}。今日は${flow.day.star.day}</p>
        <p class="sub" style="margin-top:12px">日運は毎日変わります。ここは来るたびに違う風が吹く場所 — 朝いちばんの羅針盤にどうぞ。</p>
      </div>
      <div class="result-card span-all">
        ${cardH4("THIS MONTH", "今月と今年の気流")}
        ${logicFlowHtml([
          { tag: "あなたの日主", main: flow.myKan, sub: flow.nikkan.symbol },
          "×",
          { tag: "今月の干支", main: flow.month.pillar.kan + flow.month.pillar.shi, sub: `${now.getMonth() + 1}月` },
          "=",
          { tag: "今月の気流", main: flow.month.star.name, sub: "", result: true },
        ])}
        <p style="margin-top:10px">${flow.month.star.month}</p>
        <p class="sub" style="margin-top:12px">今年は「${flow.year.star.name}」の年 — ${flow.year.star.month.replace(/^「.+?」の月 — /, "").replace(/月/g, "年")}</p>
      </div>
      <div class="result-card span-all">
        ${cardH4("7 DAYS", "一週間の気流")}
        <div class="week-strip">${weekHtml}</div>
        <p class="sub" style="margin-top:12px">◎は今週いちばん追い風の日。大事な予定はこの日に。</p>
      </div>
      <div class="result-card span-all">
        ${cardH4("12 MONTHS", "これから12ヶ月の流れ")}
        <div class="mf-list">${mfHtml}</div>
        <div class="mf-summary">
          <p class="theme-point" style="border-top:none;padding-top:4px"><strong>仕事の勝負月は ${mf.bestWork.m}月</strong> —「${mf.bestWork.star.name}」の気流。攻めの計画はここに。</p>
          <p class="theme-point"><strong>恋愛の好機は ${mf.bestLove.m}月</strong> —「${mf.bestLove.star.name}」の気流。出会いも告白もこの月が追い風。</p>
          <p class="theme-point"><strong>金運の山は ${mf.bestMoney.m}月</strong> —「${mf.bestMoney.star.name}」の気流。大きな買い物・投資の判断はここで。</p>
        </div>
        ${explainHtml("この流れはどう出している?", "あなたの日主(生まれた日の十干)と、月ごとにめぐる干支の関係を「通変星」で読み、テーマ別の追い風を点数化しています。同じ月でも人によって吹く風が違う——それが四柱推命の月運です。")}
      </div>
    </div>
    ${crossLinksHtml("eastern")}
  `), () => renderSharePreview("eastern"));
});

/* ---------- タロット ---------- */
/* 儀式フロー: 問いかけ -> シャッフル(長押し) -> カット(3山) -> ドロー(扇) -> リビール
   シード = 指を離した時刻 + カット選択 + 引いた位置。ユーザーの手が結果を決める。 */
const tarotStage = document.getElementById("tarot-stage");
const tarotSummary = document.getElementById("tarot-summary");

/* 儀式の間:明るい観測所から、扉一枚で深い紺の間へ。
   シャッフル以降はフルスクリーンで没入させ、リビールは「カードだけ→言葉が浮かぶ」の順で見せる */
const ritualOverlay = document.getElementById("ritual-overlay");

function openChamber() {
  ritualOverlay.hidden = false;
  document.body.classList.add("ritual-open");
}

function closeChamber() {
  ritualOverlay.hidden = true;
  ritualOverlay.innerHTML = "";
  document.body.classList.remove("ritual-open");
}

function chamberScreen(html) {
  ritualOverlay.innerHTML = `
    <button class="ritual-close" id="ritual-close" aria-label="儀式を中断する">×</button>
    <div class="ritual-screen">${html}</div>`;
  document.getElementById("ritual-close").addEventListener("click", () => {
    const fromToday = ritual.returnTo === "today";
    ritual.returnTo = null;
    closeChamber();
    if (fromToday) navigate("home");
    else renderAsk();
  });
  ritualOverlay.scrollTop = 0;
}

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const TAROT_ICONS = ["🃏","🎩","📖","👑","🏛","🔑","💞","🏇","🦁","🏮","🎡","⚖️","🙃","🦋","🏺","⛓","🗼","⭐","🌙","☀️","🎺","🌍"];
const TAROT_BACK_IMG = "images/tarot/tarot_back.webp";

/* フルデッキ:大アルカナ22枚+小アルカナ56枚=78枚 */
const FULL_DECK = TAROT.concat(TAROT_MINOR);
const DRAW_FAN_COUNT = FULL_DECK.length;
const cardByN = (n) => FULL_DECK.find((t) => t.n === n);
const cardNo = (c) => (c.n < 22 ? ROMAN[c.n] : c.no);
const cardIcon = (c) => (c.n < 22 ? TAROT_ICONS[c.n] : MINOR_SUITS[c.suit].icon);
const tarotImg = (n) => {
  if (n < 22) return `images/tarot/tarot_${String(n).padStart(2, "0")}_${TAROT_SLUGS[n]}.webp`;
  const c = cardByN(n);
  return `images/tarot/tarot_${c.suit}_${c.rank}.webp`;
};

// 裏面画像があればCSSデザインから差し替え(後日画像を置くだけで切り替わる)
(() => {
  const im = new Image();
  im.onload = () => document.documentElement.classList.add("tarot-back-art");
  im.src = TAROT_BACK_IMG;
})();

const vibrate = (ms) => { try { navigator.vibrate?.(ms); } catch { /* 非対応 */ } };

const DAILY_CARD_KEY = "fortuna:dailycard";
const QUESTION_KEY = "fortuna:question";

function loadDailyCard() {
  try {
    const v = JSON.parse(localStorage.getItem(DAILY_CARD_KEY));
    return v?.date === todayKey() ? v : null;
  } catch { return null; }
}
function saveDailyCard(c) {
  try { localStorage.setItem(DAILY_CARD_KEY, JSON.stringify({ date: todayKey(), n: c.n, reversed: c.reversed })); } catch { /* noop */ }
}

const TAROT_GENRES = [["total", "総合"], ["love", "恋愛"], ["work", "仕事"], ["money", "金運"]];

const ritual = { spread: "daily", genre: "total", question: "", releaseT: 0, cutIdx: 0, positions: [], cards: [] };

function genreMeaning(card) {
  const t = TAROT_THEMES[card.n]?.[ritual.genre];
  if (ritual.genre === "total" || !t) return card.reversed ? card.rev : card.up;
  return card.reversed ? t.rev : t.up;
}

function tbackHtml(cls = "", attrs = "") {
  return `<div class="tback ${cls}" ${attrs}><span>✦</span></div>`;
}

function slotsHtml(revealUpTo = -1) {
  const conf = RITUAL_SPREADS[ritual.spread];
  return `<div class="tarot-slots">${conf.positions.map((p, i) => `
    <div class="tarot-slot">
      <div class="tarot-slot-label">${p.en}<small>${p.ja}</small></div>
      <div class="tarot-slot-body" data-slot="${i}">
        ${i <= revealUpTo ? revealedCardHtml(ritual.cards[i])
          : i < ritual.cards.length ? tbackHtml("slot-back")
          : '<div class="tarot-slot-empty">✦</div>'}
      </div>
    </div>`).join("")}</div>`;
}

function revealedCardHtml(c) {
  return `
    <div class="tarot-reveal ${c.reversed ? "is-rev" : ""}">
      <img class="tarot-art" src="${tarotImg(c.n)}" alt="${c.name}" loading="lazy"
        onerror="this.parentElement.classList.add('no-art')" />
      <div class="tface">
        <span class="no">${cardNo(c)}</span>
        <span class="sym">${cardIcon(c)}</span>
        <span class="nm">${c.name}</span>
        <span class="en">${c.en}</span>
        <span class="ori ${c.reversed ? "rev" : "up"}">${c.reversed ? "逆位置" : "正位置"}</span>
      </div>
    </div>`;
}

/* 今日の一枚・クイックドロー:場から一枚取るだけの1工程 */
function renderQuickDraw() {
  ritual.spread = "daily"; ritual.genre = "total"; ritual.question = "";
  ritual.positions = []; ritual.cards = []; ritual.cutIdx = 0;
  ritual.returnTo = "today";
  ritual.releaseT = performance.now(); // シード成分1: 場が開かれた時刻
  openChamber();
  chamberScreen(`
    <div class="ritual-step">
      <p class="ritual-eyebrow emerge">TODAY'S CARD</p>
      <p class="ritual-inst emerge" style="--ed:.15s">呼ばれた気がする一枚を、<strong>そのまま引いて</strong>ください</p>
      <div class="draw-strip" id="draw-strip">
        ${Array.from({ length: DRAW_FAN_COUNT }, (_, k) => tbackHtml("draw-card", `data-k="${k}" role="button" tabindex="0" style="--k:${k % 7}"`)).join("")}
      </div>
    </div>`);
  const strip = document.getElementById("draw-strip");
  strip.scrollLeft = Math.max(0, (strip.scrollWidth - strip.clientWidth) / 2); // 真ん中から
  strip.addEventListener("click", (e) => {
    const el = e.target.closest(".draw-card");
    if (!el || ritual.cards.length) return;
    el.classList.add("taken");
    const k = Number(el.dataset.k);
    ritual.positions.push(k); // シード成分2: 引いた位置
    const rng = seededRng(`${performance.now().toFixed(3)}|${ritual.releaseT.toFixed(3)}|${k}`);
    const base = FULL_DECK[Math.floor(rng() * FULL_DECK.length)];
    const card = { ...base, reversed: rng() < 0.5 };
    ritual.cards.push(card);
    saveDailyCard(card);
    new Image().src = tarotImg(card.n);
    vibrate(25);
    strip.classList.add("fan-done");
    setTimeout(renderReveal, 500);
  });
}

/* --- 1. 問いかけ画面 --- */
function renderAsk() {
  tarotSummary.hidden = true;
  tarotStage.innerHTML = `
    <div class="ritual-step panel" style="max-width:760px">
      <p class="ritual-eyebrow">STEP 1 — QUESTION</p>
      <h3 class="ritual-title">なにを知りたいですか?</h3>
      <div class="genre-row">
        <span class="genre-label">問いのジャンル</span>
        <div class="seg">${TAROT_GENRES.map(([k, l]) => `<button class="seg-btn ${k === ritual.genre ? "active" : ""}" data-genre="${k}">${l}</button>`).join("")}</div>
      </div>
      <input type="text" id="tarot-question" class="ritual-question" maxlength="60"
        placeholder="問いを言葉に(任意)" value="" />
      <p class="ritual-hint" style="margin:14px 0 12px">知りたいことを選ぶと、そのまま儀式がはじまります</p>
      <div class="spread-picker">
        ${Object.entries(RITUAL_SPREADS).filter(([key]) => key !== "daily").map(([key, s]) => {
          const pips = Array.from({ length: s.count }, () => "<i></i>").join("");
          return `
          <button class="spread-opt ${s.deep ? "spread-deep" : ""}" data-spread="${key}">
            <span class="so-purpose">${s.purpose}</span>
            <span class="so-meta">
              <em class="so-name">${s.label}</em>
              <span class="so-pips" aria-hidden="true">${pips}</span>
              <em class="so-count">${s.count}枚</em>
              ${s.deep ? '<span class="so-tag">DEEP</span>' : ""}
            </span>
            ${s.deep ? `<span class="so-desc">${s.desc}</span>` : ""}
          </button>`;
        }).join("")}
      </div>
      <p class="form-note">78枚のフルデッキで占います。問いはこの端末にのみ保存されます。今日の一枚は<button class="linklike" data-nav="today">「今日の占い」</button>からどうぞ。</p>
    </div>`;

  /* カードをタップ = 選択して、そのまま儀式へ(1工程) */
  tarotStage.querySelectorAll(".spread-opt").forEach((b) => {
    b.addEventListener("click", () => {
      ritual.spread = b.dataset.spread;
      tarotStage.querySelectorAll(".spread-opt").forEach((x) => x.classList.toggle("active", x === b));
      ritual.question = document.getElementById("tarot-question").value.trim();
      try { localStorage.setItem(QUESTION_KEY, ritual.question); } catch { /* noop */ }
      ritual.positions = []; ritual.cards = []; ritual.cutIdx = 0;
      vibrate(15);
      setTimeout(() => { openChamber(); renderShuffle(); }, 200); // 選択の発光を見せてから扉を開く
    });
  });
  tarotStage.querySelectorAll("[data-genre]").forEach((b) => {
    b.addEventListener("click", () => {
      ritual.genre = b.dataset.genre;
      tarotStage.querySelectorAll("[data-genre]").forEach((x) => x.classList.toggle("active", x === b));
    });
  });
}

/* --- 2. シャッフル ---
   2つの混ぜ方: 「散らして選ぶ」(全画面に散らばるカードを指でかき混ぜて選ぶ)と
   「重ねて混ぜる」(長押しシャッフル -> カット -> ドロー)。好みは端末に保存 */
const SHUF_MODE_KEY = "fortuna:shufmode";

function shuffleModeSwitchHtml(cur) {
  return `
    <div class="shuf-modes emerge" style="--ed:.5s">
      <button class="shuf-mode ${cur === "field" ? "active" : ""}" data-shufmode="field">散らして選ぶ</button>
      <button class="shuf-mode ${cur === "stack" ? "active" : ""}" data-shufmode="stack">重ねて混ぜる</button>
    </div>`;
}

function bindShuffleModeSwitch() {
  ritualOverlay.querySelectorAll("[data-shufmode]").forEach((b) => {
    b.addEventListener("click", () => {
      try { localStorage.setItem(SHUF_MODE_KEY, b.dataset.shufmode); } catch { /* noop */ }
      renderShuffle();
    });
  });
}

function renderShuffle() {
  let mode = "field";
  try { mode = localStorage.getItem(SHUF_MODE_KEY) || "field"; } catch { /* noop */ }
  if (mode === "stack") renderShuffleStack();
  else renderShuffleField();
}

/* --- 2a. 散らして選ぶ: カードの海を指でかき混ぜ、ピンときた札に触れる --- */
function renderShuffleField() {
  const conf = RITUAL_SPREADS[ritual.spread];
  ritual.releaseT = performance.now();
  chamberScreen(`
    <div class="ritual-step field-step">
      <p class="ritual-eyebrow emerge">SHUFFLE & DRAW</p>
      <p class="ritual-inst emerge" style="--ed:.15s" id="field-inst">指で<strong>かき混ぜて</strong>、ピンときた${conf.count > 1 ? `<strong>${conf.count}枚</strong>` : "<strong>一枚</strong>"}に触れてください</p>
      <div class="card-field" id="card-field" aria-label="散らばったカード"></div>
      ${shuffleModeSwitchHtml("field")}
    </div>`);
  bindShuffleModeSwitch();

  const field = document.getElementById("card-field");
  const inst = document.getElementById("field-inst");
  const N = 34;
  const cards = [];
  let entropy = 0;
  let finished = false;

  const spawn = () => {
    const W = field.clientWidth, H = field.clientHeight;
    for (let i = 0; i < N; i++) {
      const el = document.createElement("div");
      el.className = "fc";
      el.innerHTML = '<div class="tback fc-back"><span>✦</span></div>';
      field.appendChild(el);
      cards.push({
        el, k: i,
        x: 30 + Math.random() * (W - 60),
        y: 34 + Math.random() * (H - 88),
        vx: (Math.random() - 0.5) * 3.5, vy: (Math.random() - 0.5) * 3.5,
        rot: Math.random() * 360, vr: (Math.random() - 0.5) * 3,
        fs: 0.4 + Math.random() * 0.7, ph: Math.random() * Math.PI * 2,
        picked: false,
      });
    }
  };
  spawn();

  /* 物理: 指の動きが近くの札を押し流す。慣性+摩擦でぬるっと漂う */
  let lastP = null;
  const stir = (e) => {
    if (finished) return;
    const r = field.getBoundingClientRect();
    const nx = e.clientX - r.left, ny = e.clientY - r.top;
    let pvx = 0, pvy = 0;
    if (lastP) { pvx = nx - lastP.x; pvy = ny - lastP.y; }
    lastP = { x: nx, y: ny };
    const sp = Math.hypot(pvx, pvy);
    if (sp < 1) return;
    entropy = (entropy + sp + (e.timeStamp % 97)) % 99991;
    const R = 150;
    for (const c of cards) {
      if (c.picked) continue;
      const dx = c.x - nx, dy = c.y - ny;
      const d2 = dx * dx + dy * dy;
      if (d2 > R * R) continue;
      const d = Math.sqrt(d2) || 1;
      const f = (1 - d / R);
      c.vx += pvx * f * 0.5 + (dx / d) * f * sp * 0.16;
      c.vy += pvy * f * 0.5 + (dy / d) * f * sp * 0.16;
      c.vr += (pvx * dy - pvy * dx) / (d * 18);
    }
    if (sp > 26) vibrate(4);
  };
  field.addEventListener("pointermove", stir);
  field.addEventListener("pointerdown", (e) => { lastP = null; stir(e); });

  const tick = (t) => {
    if (!field.isConnected) return; // 画面が変わったら停止
    const W = field.clientWidth, H = field.clientHeight;
    // カード同士のやわらかい反発: 固まらず、押し合ってぬるっと広がる
    for (let i = 0; i < cards.length; i++) {
      const a = cards[i];
      if (a.picked) continue;
      for (let j = i + 1; j < cards.length; j++) {
        const b = cards[j];
        if (b.picked) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 2704 || d2 === 0) continue; // 52px以内だけ
        const d = Math.sqrt(d2);
        const f = (1 - d / 52) * 0.32;
        const ux = dx / d, uy = dy / d;
        a.vx += ux * f; a.vy += uy * f;
        b.vx -= ux * f; b.vy -= uy * f;
      }
    }
    for (const c of cards) {
      if (c.picked) continue;
      // 慣性+摩擦+ゆらぎ(常にかすかに漂う)
      c.vx *= 0.94; c.vy *= 0.94; c.vr *= 0.93;
      c.x += c.vx + Math.sin(t / 1000 * c.fs + c.ph) * 0.12;
      c.y += c.vy + Math.cos(t / 1200 * c.fs + c.ph) * 0.1;
      c.rot += c.vr;
      // 柔らかい壁
      if (c.x < 26) { c.x = 26; c.vx = Math.abs(c.vx) * 0.6; }
      if (c.x > W - 26) { c.x = W - 26; c.vx = -Math.abs(c.vx) * 0.6; }
      if (c.y < 40) { c.y = 40; c.vy = Math.abs(c.vy) * 0.6; }
      if (c.y > H - 44) { c.y = H - 44; c.vy = -Math.abs(c.vy) * 0.6; }
      c.el.style.transform = `translate(${(c.x - 26).toFixed(1)}px, ${(c.y - 42).toFixed(1)}px) rotate(${c.rot.toFixed(1)}deg)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* タップ(ほぼ動かさず短く触れる)で1枚選ぶ */
  let downAt = null;
  field.addEventListener("pointerdown", (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  field.addEventListener("pointerup", (e) => {
    if (finished || !downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    const heldMs = performance.now() - downAt.t;
    downAt = null;
    if (moved > 14 || heldMs > 450) return; // かき混ぜ操作はタップ扱いにしない
    const r = field.getBoundingClientRect();
    const nx = e.clientX - r.left, ny = e.clientY - r.top;
    let best = null, bestD = 46 * 46;
    for (const c of cards) {
      if (c.picked) continue;
      const d2 = (c.x - nx) ** 2 + (c.y - ny) ** 2;
      if (d2 < bestD) { bestD = d2; best = c; }
    }
    if (!best) return;
    pick(best);
  });

  const pick = (c) => {
    c.picked = true;
    const idx = ritual.cards.length;
    // シード: 選んだ札・タップ時刻・場が開かれた時刻・かき混ぜの軌跡
    const rng = seededRng(`${performance.now().toFixed(3)}|${ritual.releaseT.toFixed(3)}|${c.k}|${entropy.toFixed(2)}`);
    const base = FULL_DECK[Math.floor(rng() * FULL_DECK.length)];
    const card = { ...base, reversed: rng() < 0.5 };
    ritual.cards.push(card);
    ritual.positions.push(c.k);
    if (RITUAL_SPREADS[ritual.spread].once) saveDailyCard(card);
    new Image().src = tarotImg(card.n);
    vibrate(22);
    // 選ばれた札は光って浮かび上がる
    const W = field.clientWidth;
    c.el.classList.add("fc-picked");
    c.el.style.transform = `translate(${(W / 2 - 26 - (RITUAL_SPREADS[ritual.spread].count - 1) * 30 + idx * 60).toFixed(1)}px, 6px) rotate(0deg) scale(1.14)`;
    const left = RITUAL_SPREADS[ritual.spread].count - ritual.cards.length;
    if (left > 0) {
      inst.innerHTML = `いいですね。あと<strong>${left}枚</strong>、ピンときた札に触れてください`;
    } else {
      finished = true;
      inst.textContent = "そろいました";
      field.classList.add("field-done");
      setTimeout(renderReveal, 750);
    }
  };
}

/* --- 2b. 重ねて混ぜる(長押しシャッフル) --- */
function renderShuffleStack() {
  const short = RITUAL_SPREADS[ritual.spread].short;
  chamberScreen(`
    <div class="ritual-step">
      <p class="ritual-eyebrow emerge">STEP 2 — SHUFFLE</p>
      <p class="ritual-inst emerge" style="--ed:.2s"><strong>長押し</strong>でシャッフル。いいところで、指を離して</p>
      <div class="shuffle-stack" id="shuffle-stack">
        ${Array.from({ length: 7 }, (_, i) => tbackHtml("sc", `style="--i:${i}"`)).join("")}
      </div>
      <p class="ritual-hint" id="shuffle-hint">束に触れると、速く混ざります</p>
      ${shuffleModeSwitchHtml("stack")}
    </div>`);
  bindShuffleModeSwitch();

  const stack = document.getElementById("shuffle-stack");
  const hint = document.getElementById("shuffle-hint");
  let pressed = false, done = false;
  let holdT0 = 0, lastMove = null, vel = 0, raf = 0;

  /* 混ざる速さはユーザーの手が決める:
     長押しの経過でゆっくり加速し、指でこする速さで即座に反応する */
  const tick = () => {
    if (!pressed || done) return;
    const held = (performance.now() - holdT0) / 1000;
    const ramp = Math.min(1, held / 7);        // 7秒かけてじわじわ加速
    vel *= 0.93;                                // こすりの勢いは自然減衰
    const boost = Math.min(1, vel / 0.9);       // 速くこするほど速く混ざる
    const dur = 3.4 - 2.0 * Math.max(ramp, boost); // 3.4s(静) -> 1.4s(最速)
    stack.style.setProperty("--shuf-dur", dur.toFixed(2) + "s");
    raf = requestAnimationFrame(tick);
  };

  const down = (e) => {
    e.preventDefault();
    pressed = true;
    holdT0 = performance.now();
    lastMove = null; vel = 0;
    hint.textContent = "……こするとよく混ざります";
    tick();
  };
  const move = (e) => {
    if (!pressed || done) return;
    const now = performance.now();
    if (lastMove) {
      const dt = Math.max(1, now - lastMove.t);
      vel = Math.min(3, vel + Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / dt);
    }
    lastMove = { x: e.clientX, y: e.clientY, t: now };
  };
  const up = () => {
    if (!pressed || done) return;
    done = true;
    cancelAnimationFrame(raf);
    ritual.releaseT = performance.now(); // シード成分1: 指を離した時刻
    vibrate(20);
    stack.classList.add("stopped");
    hint.textContent = "止まりました";
    setTimeout(() => (short ? renderDraw() : renderCut()), 420);
  };
  stack.addEventListener("pointerdown", down);
  stack.addEventListener("pointermove", move);
  stack.addEventListener("pointerup", up);
  stack.addEventListener("pointercancel", up);
}

/* --- 3. カット画面(3つの山) --- */
function renderCut() {
  chamberScreen(`
    <div class="ritual-step">
      <p class="ritual-eyebrow emerge">STEP 3 — CUT</p>
      <p class="ritual-inst emerge" style="--ed:.2s"><strong>直感で</strong>、ひとつ</p>
      <div class="cut-piles">
        ${[0, 1, 2].map((k) => `
          <button class="cut-pile" data-k="${k}">
            ${tbackHtml("cp cp1")}${tbackHtml("cp cp2")}${tbackHtml("cp cp3")}
            <span class="cut-label">${["ひとつ目", "ふたつ目", "みっつ目"][k]}</span>
          </button>`).join("")}
      </div>
    </div>`);
  ritualOverlay.querySelectorAll(".cut-pile").forEach((b) => {
    b.addEventListener("click", () => {
      ritual.cutIdx = Number(b.dataset.k); // シード成分2: カット選択
      vibrate(15);
      b.classList.add("chosen");
      ritualOverlay.querySelectorAll(".cut-pile").forEach((x) => { if (x !== b) x.classList.add("faded"); });
      setTimeout(renderDraw, 450);
    });
  });
}

/* --- 4. ドロー画面(扇から引く) --- */
function renderDraw() {
  const conf = RITUAL_SPREADS[ritual.spread];
  const compact = conf.count > 3; // ケルト十字などはスロットを畳んで扇を主役に
  chamberScreen(`
    <div class="ritual-step">
      <p class="ritual-eyebrow emerge">STEP ${conf.short ? "3" : "4"} — DRAW</p>
      ${compact
        ? `<div class="draw-progress" id="draw-progress">${Array.from({ length: conf.count }, () => '<span class="dp"></span>').join("")}</div>`
        : slotsHtml(-1)}
      <p class="ritual-inst">呼ばれた気がするカードを、<strong>あと <span id="draw-left">${conf.count}</span> 枚</strong></p>
      <div class="draw-strip" id="draw-strip">
        ${Array.from({ length: DRAW_FAN_COUNT }, (_, k) => tbackHtml("draw-card", `data-k="${k}" role="button" tabindex="0" style="--k:${k % 7}"`)).join("")}
      </div>
    </div>`);

  const strip = document.getElementById("draw-strip");
  strip.addEventListener("click", (e) => {
    const el = e.target.closest(".draw-card");
    if (!el || el.classList.contains("taken")) return;
    el.classList.add("taken");
    const k = Number(el.dataset.k);
    ritual.positions.push(k); // シード成分3: 引いた位置

    // ユーザー操作の合成シードからカードを決定(Math.random非使用)
    const seedStr = `${ritual.releaseT.toFixed(3)}|${ritual.cutIdx}|${ritual.positions.join("-")}`;
    const rng = seededRng(seedStr);
    const remaining = FULL_DECK.filter((t) => !ritual.cards.some((c) => c.n === t.n));
    const base = remaining[Math.floor(rng() * remaining.length)];
    const card = { ...base, reversed: rng() < 0.5 }; // 逆位置は50%
    ritual.cards.push(card);
    new Image().src = tarotImg(card.n); // リビール直前の先読み
    vibrate(25);

    const slotBody = ritualOverlay.querySelector(`[data-slot="${ritual.cards.length - 1}"]`);
    if (slotBody) slotBody.innerHTML = tbackHtml("slot-back");
    const dp = ritualOverlay.querySelectorAll("#draw-progress .dp:not(.done)")[0];
    if (dp) dp.classList.add("done");
    const left = document.getElementById("draw-left");
    if (left) left.textContent = conf.count - ritual.cards.length;

    if (ritual.cards.length === conf.count) {
      if (RITUAL_SPREADS[ritual.spread].once) saveDailyCard(card);
      strip.classList.add("fan-done");
      setTimeout(renderReveal, 600);
    }
  });
}

/* フリップの瞬間の光:広がる環+舞い散る火花(演出のみなのでMath.randomでよい) */
function revealFxHtml() {
  const sparks = Array.from({ length: 16 }, () => {
    const a = Math.floor(Math.random() * 360);
    const r = 110 + Math.floor(Math.random() * 130);
    const d = (Math.random() * 0.28).toFixed(2);
    return `<span class="rv-spark" style="--sa:${a}deg;--sr:${r}px;--sd:${d}s"></span>`;
  }).join("");
  return `<div class="rv-fx"><span class="rv-ring"></span>${sparks}</div>`;
}

/* --- 5. リビール:一枚ずつ全画面でカードと向き合う ---
   まずカードだけ(テキストなし)を大きく見せ、フリップの後に言葉が浮かび上がる */
function renderReveal() {
  const conf = RITUAL_SPREADS[ritual.spread];
  let i = 0;

  function showCard() {
    const card = ritual.cards[i];
    const pos = conf.positions[i];
    chamberScreen(`
      <div class="rv-stage" id="rv-stage">
        <p class="rv-count emerge">${i + 1} / ${conf.count}</p>
        <p class="rv-label emerge" style="--ed:.15s">${pos.en}</p>
        <p class="rv-label-ja emerge" style="--ed:.3s">${pos.ja}</p>
        <div class="rv-card" id="rv-card">${tbackHtml("slot-back")}</div>
        <div class="rv-text" id="rv-text"></div>
        ${conf.count > 1 ? `<button class="rv-skip" id="rv-skip" aria-label="すべて開いて結果へ">SKIP »</button>` : ""}
      </div>`);
    const rvCard = document.getElementById("rv-card");
    const rvText = document.getElementById("rv-text");

    /* 段階: 0=溜め 1=フリップ済み 2=言葉まで出た(次へ進める)
       タップするたびに次の段階へ先送りできる。連打でサクサク、待てばフル演出 */
    let phase = 0;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

    const doFlip = () => {
      if (phase >= 1) return;
      phase = 1;
      rvCard.innerHTML = revealedCardHtml(card) + revealFxHtml(); // まずカードだけ
      ritualOverlay.classList.add("flash");
      later(() => ritualOverlay.classList.remove("flash"), 800);
      vibrate([15, 60, 30]);
      later(doText, 900); // 待つ人には、言葉がゆっくり浮かぶ
    };
    const doText = () => {
      if (phase >= 2) return;
      phase = 2;
      rvText.innerHTML = `
        <span class="rv-no emerge">${cardNo(card)}</span>
        <span class="rv-name emerge" style="--ed:.2s">${card.name}</span>
        <span class="rv-en emerge" style="--ed:.4s">${card.en}</span>
        <span class="rv-ori ${card.reversed ? "rev" : "up"} emerge" style="--ed:.65s">${card.reversed ? "逆位置" : "正位置"}</span>
        <span class="rv-hint emerge" style="--ed:1.2s">${i + 1 < conf.count ? "─ タップでつぎへ ─" : "─ タップで読み解きへ ─"}</span>`;
    };

    const chargeAt = i === 0 ? 800 : 400; // 2枚目以降はテンポよく
    later(() => rvCard.querySelector(".tback")?.classList.add("charging"), chargeAt);
    later(doFlip, chargeAt + 800);

    document.getElementById("rv-stage").addEventListener("click", (e) => {
      if (e.target.closest("#rv-skip")) return;
      vibrate(10);
      if (phase === 0) { clearTimers(); doFlip(); return; } // 溜めをスキップして即オープン
      if (phase === 1) { clearTimers(); doText(); return; } // 言葉も即表示
      clearTimers();
      i += 1;
      if (i < conf.count) showCard();
      else finish();
    });
    document.getElementById("rv-skip")?.addEventListener("click", () => {
      clearTimers();
      vibrate(10);
      finish(); // 結果だけ見たい人はここから一気に
    });
  }

  function finish() {
    closeChamber();
    if (ritual.returnTo === "today") {
      ritual.returnTo = null;
      navigate("today");
      return;
    }
    tarotStage.innerHTML = `
      <div class="ritual-step">
        <p class="ritual-eyebrow">YOUR CARDS</p>
        ${slotsHtml(ritual.cards.length - 1)}
      </div>`;
    showTarotSummary(false);
  }

  showCard();
}

/* 今日の一枚: 引き直し不可、当日分を復元 */
function restoreDaily() {
  const saved = loadDailyCard();
  const base = cardByN(saved.n);
  ritual.cards = [{ ...base, reversed: saved.reversed }];
  ritual.question = (() => { try { return localStorage.getItem(QUESTION_KEY) || ""; } catch { return ""; } })();
  tarotStage.innerHTML = `
    <div class="ritual-step">
      <p class="ritual-eyebrow">TODAY'S CARD</p>
      ${slotsHtml(0)}
    </div>`;
  showTarotSummary(true);
}

/* --- 結果 --- */
function yesNoVerdictHtml(card) {
  const yes = !card.reversed;
  return `
    <div class="result-card span-all yn-card">
      ${cardH4("VERDICT", "カードの答え")}
      <p class="yn-answer ${yes ? "yes" : "no"}">${yes ? "YES" : "NO"}</p>
      <p>${yes
        ? "カードは正位置 — 追い風のサインです。進めて大丈夫。ただし答えを確かなものにする鍵は、カードの言葉の中にあります。"
        : "カードは逆位置 — いまは見送りのサイン。ただし「永遠のNO」ではありません。カードが示す課題を整えれば、答えは変わります。"}</p>
    </div>`;
}

function choiceVerdictHtml() {
  const [a, b] = ritual.cards;
  const scoreA = a.reversed ? 0 : 1, scoreB = b.reversed ? 0 : 1;
  const msg = scoreA > scoreB
    ? "カードは<strong>選択肢A</strong>に追い風を見ています。Bを選ぶ場合は、逆位置が示す課題を先に片付けて。"
    : scoreB > scoreA
      ? "カードは<strong>選択肢B</strong>に追い風を見ています。Aを選ぶ場合は、逆位置が示す課題を先に片付けて。"
      : "AとBは互角。決め手は3枚目の「助言」のカードです。あなたの直感が最初に引いた方にも、心の答えが出ています。";
  return `
    <div class="result-card span-all">
      ${cardH4("VERDICT", "どちらを選ぶ?")}
      <p>${msg}</p>
    </div>`;
}

/* 結論:「タロットの結果がこうだから、こうです」(カード+シェア画像で共用) */
function tarotConclusion() {
  const c = ritual.cards;
  if (!c.length) return null;
  const ori = (k) => (k.reversed ? "逆位置" : "正位置");
  const first = (t) => t.split("。")[0] + "。";
  let word, reason, action;

  if (ritual.spread === "daily") {
    const k = c[0];
    word = k.reversed ? "今日は「攻める」より「整える」日" : "今日は、迷わず進んでいい日";
    reason = `今日の一枚は「${k.name}」の${ori(k)}。${first(genreMeaning(k))}`;
    action = k.advice;
  } else if (ritual.spread === "one") {
    const k = c[0];
    word = k.reversed ? "いったん立ち止まるが正解 — 角度を変えれば通ります" : "その件、動いて大丈夫";
    reason = `答えの位置に「${k.name}」の${ori(k)}。${first(genreMeaning(k))}`;
    action = k.advice;
  } else if (ritual.spread === "yesno") {
    const k = c[0];
    word = k.reversed ? "答えは「いまはまだ」— 条件がひとつ残っています" : "答えは「YES」— 進めて大丈夫";
    reason = `答えの位置に「${k.name}」が${ori(k)}で出ました。${first(genreMeaning(k))}`;
    action = k.advice;
  } else if (ritual.spread === "three") {
    const [pa, pr, fu] = c;
    word = fu.reversed ? "焦らず、足元を整えてから進む流れ" : "このまま進めば、流れは開けていく";
    reason = `過去「${pa.name}」→ 現在「${pr.name}」ときて、未来の位置に「${fu.name}」の${ori(fu)}。${first(genreMeaning(fu))}`;
    action = fu.advice;
  } else if (ritual.spread === "choice") {
    const [a, b, adv] = c;
    word = !a.reversed && b.reversed ? "カードが推すのは、選択肢A"
      : a.reversed && !b.reversed ? "カードが推すのは、選択肢B"
      : "AとBは互角 — 決め手は「助言」の一枚";
    reason = `A「${a.name}(${ori(a)})」、B「${b.name}(${ori(b)})」。助言の位置には「${adv.name}」。${first(genreMeaning(adv))}`;
    action = adv.advice;
  } else if (ritual.spread === "celtic") {
    const challenge = c[1], outcome = c[9];
    word = outcome.reversed ? "結末はまだ書き換えられる — 鍵は「課題」の一枚" : "ゆきつく先は、良い流れ";
    reason = `10枚の結末の位置に「${outcome.name}」の${ori(outcome)}。向き合う課題は「${challenge.name}」が示しています。${first(genreMeaning(outcome))}`;
    action = outcome.advice;
  } else {
    return null;
  }
  return { word, reason, action };
}

function tarotConclusionHtml() {
  const conc = tarotConclusion();
  if (!conc) return "";
  return `
    <div class="result-card span-all tarot-verdict">
      ${cardH4("CONCLUSION", "つまり、こういうこと")}
      <p class="tv-word">「${conc.word}」</p>
      <p class="tv-reason">${conc.reason}</p>
      <p class="tv-action">きょうの一手 — <strong>${conc.action}</strong></p>
    </div>`;
}

/* 78枚デッキならではの深読み:大アルカナ比・スートの偏り・正逆バランス */
function deckReadingHtml() {
  const total = ritual.cards.length;
  if (total < 3) return "";
  const majors = ritual.cards.filter((c) => c.n < 22).length;
  const revs = ritual.cards.filter((c) => c.reversed).length;
  const suitCount = {};
  ritual.cards.forEach((c) => { if (c.suit) suitCount[c.suit] = (suitCount[c.suit] || 0) + 1; });
  const sorted = Object.entries(suitCount).sort((a, b) => b[1] - a[1]);
  const domTie = sorted.length > 1 && sorted[1][1] === sorted[0][1];

  const majorNote = majors >= Math.ceil(total / 2)
    ? `大アルカナが${majors}枚 — 運命の歯車が大きく回っている局面です。流れそのものが強く、いまの選択が長く効いていきます。`
    : majors === 0
      ? "すべて小アルカナ — 答えは日常の中にあります。大きな運命よりも、毎日の行動と習慣で流れを自由に変えられる時期です。"
      : `大アルカナ${majors}枚・小アルカナ${total - majors}枚 — 大きな流れと日々の行動、その両方が答えに関わっています。`;

  const SUIT_NOTE = {
    wands: "ワンド(火)が目立ちます。テーマの中心は情熱と行動。考えるより、まず動くことが答えに近づく鍵です。",
    cups: "カップ(水)が目立ちます。テーマの中心は感情と関係。気持ちを言葉にして、人とのつながりを丁寧に扱うのが鍵です。",
    swords: "ソード(風)が目立ちます。テーマの中心は思考と決断。情報を整理して、はっきり決めることが鍵です。",
    pentacles: "ペンタクル(地)が目立ちます。テーマの中心は実りと現実。焦らず着実に、目に見える形にしていくのが鍵です。",
  };
  const suitNote = sorted.length && sorted[0][1] >= 2 && !domTie ? SUIT_NOTE[sorted[0][0]] : "";

  /* 組み合わせの読み:枚数が増えたからこそ見える「札同士の会話」 */
  const combos = [];
  const cs = ritual.cards;
  const courts = cs.filter((x) => ["page", "knight", "queen", "king"].includes(x.rank)).length;
  if (courts >= 2) combos.push(`人物札(コートカード)が${courts}枚 — 鍵を握るのは「人」。あなたの立ち居振る舞いの変化や、周囲の人物が状況を動かします。`);
  const aces = cs.filter((x) => x.rank === "ace").length;
  if (aces >= 2) combos.push(`エースが${aces}枚 — 複数の「はじまり」が同時に訪れています。優先順位だけ決めれば、全部始めてしまって大丈夫。`);
  const NUM_MEANING = { "02": "選択と均衡", "03": "成長と協調", "04": "安定と土台", "05": "揺らぎと挑戦", "06": "調和とめぐり", "07": "見極めと試行", "08": "力の使いどころ", "09": "成熟の一歩手前", "10": "ひと区切りと次" };
  const numCount = {};
  cs.forEach((x) => { if (x.rank && NUM_MEANING[x.rank]) numCount[x.rank] = (numCount[x.rank] || 0) + 1; });
  for (const [r, n] of Object.entries(numCount)) {
    if (n >= 2) combos.push(`「${Number(r)}」の札が${n}枚 — 数字の${Number(r)}が示すのは「${NUM_MEANING[r]}」。スートを越えて、このテーマが強調されています。`);
  }
  const has = (n) => cs.some((x) => x.n === n);
  if ((has(13) || has(16)) && (has(17) || has(19))) combos.push("「死神/塔」と「星/太陽」の共演 — 一度手放して、より良く開ける配置。終わりの札は悪い知らせではありません。");
  if (has(6) && has(15)) combos.push("「恋人」と「悪魔」の共演 — 強い引力の暗示。心地よさと執着の線引きが、今回の隠れたテーマです。");
  if (has(0) && has(21)) combos.push("「愚者」と「世界」の共演 — ひとつの章の完成と、次の旅の始まりが同時に来ています。");
  if (has(18) && has(19)) combos.push("「月」と「太陽」の共演 — 不安の霧はやがて晴れる並び。夜の後に朝が約束されています。");

  const revNote = revs === 0
    ? "すべて正位置 — エネルギーが素直に巡っています。出た答えを、そのまま受け取って大丈夫。"
    : revs >= Math.ceil(total / 2)
      ? `逆位置が${revs}枚 — 外の状況より、内側を整えることが先の時期。逆位置は「禁止」ではなく、伸びる前の準備を示すサインです。`
      : `逆位置は${revs}枚 — おおむね素直な流れの中に、調整ポイントがいくつかあります。`;

  return `
    <div class="result-card span-all">
      ${cardH4("DECK READING", "出たカードの構成から")}
      <div class="chip-row" style="margin-top:0">
        <span class="chip">大アルカナ <strong>${majors}</strong>/${total}</span>
        ${sorted.map(([k, v]) => `<span class="chip">${MINOR_SUITS[k].ja} <strong>${v}</strong></span>`).join("")}
        <span class="chip">逆位置 <strong>${revs}</strong>/${total}</span>
      </div>
      <p style="margin-top:14px">${majorNote}</p>
      ${suitNote ? `<p style="margin-top:8px">${suitNote}</p>` : ""}
      <p class="sub" style="margin-top:10px">${revNote}</p>
      ${combos.length ? `<div class="combo-list">${combos.map((x) => `<p class="combo">✦ ${x}</p>`).join("")}</div>` : ""}
      ${explainHtml("構成読みって何?", "本格的なタロットでは1枚ずつの意味に加えて「出たカード全体の構成」を読みます。大アルカナは人生の大きな流れ、小アルカナは日々の具体的な出来事。スート(ワンド=火・カップ=水・ソード=風・ペンタクル=地)の偏りは、いまのテーマがどの領域にあるかを教えてくれます。78枚のフルデッキだからできる読み方です。")}
    </div>`;
}

function tarotOverallHtml() {
  if (ritual.spread !== "three") return "";
  const revCount = ritual.cards.filter((c) => c.reversed).length;
  const tone = [
    "三枚とも正位置。強い追い風が吹いています。迷いを手放して、そのまま進んで大丈夫。",
    "おおむね順調な流れです。逆位置のカードが示す一点だけ整えれば、道はまっすぐ開けます。",
    "行きつ戻りつの時期。焦って進めるより、逆位置のカードが示す課題から順に片付けるのが近道です。",
    "三枚とも逆位置。いまは動くより整える時。この時期を丁寧に過ごした人から、流れは変わりはじめます。",
  ][revCount];
  return `<div class="result-card span-all">${cardH4("OVERALL", "全体の流れ")}<p>${tone}</p></div>`;
}

function showTarotSummary(restored) {
  const conf = RITUAL_SPREADS[ritual.spread];
  const genreLabel = Object.fromEntries(TAROT_GENRES)[ritual.genre];
  const cardsLabel = ritual.cards.map((c) => `${c.name}(${c.reversed ? "逆" : "正"})`);

  const kwShare = cardsLabel.length <= 3 ? cardsLabel : [...cardsLabel.slice(0, 2), `ほか${cardsLabel.length - 2}枚`];
  const conc = tarotConclusion();
  lastShare.tarot = {
    cards: ritual.cards.map((c) => ({ n: c.n, reversed: c.reversed })),
    eyebrow: `TAROT — ${conf.label}`,
    title: conc ? conc.word : `${conf.label}の答え`,
    keywords: kwShare,
    sub: null,
    x: `【MYOURISCOPE タロット・${conf.label}】${conc ? `「${conc.word}」— ` : ""}${cardsLabel.slice(0, 3).join("、")}${cardsLabel.length > 3 ? ` ほか${cardsLabel.length - 3}枚` : ""} ✦`,
  };
  if (!restored) {
    recordHistory(`タロット(${conf.label})`, cardsLabel.join(" / "),
      ritual.cards.map((c, i) => `${conf.positions[i].ja}: ${c.name}(${c.reversed ? "逆位置" : "正位置"}) — ${genreMeaning(c)}`).join(" "));
  }

  const items = ritual.cards.map((c, i) => {
    const t = TAROT_THEMES[c.n]?.[ritual.genre];
    const mean = ritual.genre !== "total" && t ? t : { up: c.up, rev: c.rev };
    const meta = c.n < 22
      ? `<span class="tc-chip">大アルカナ ${cardNo(c)}</span>`
      : `<span class="tc-chip">${MINOR_SUITS[c.suit].ja}の${cardNo(c)}</span><span class="tc-chip">${MINOR_SUITS[c.suit].el}の元素 — ${MINOR_SUITS[c.suit].theme}</span>`;
    return `
    <div class="result-card tarot-pos">
      ${cardH4(conf.positions[i].en, conf.positions[i].ja)}
      <div class="tp-body">
        <img class="tp-thumb ${c.reversed ? "is-rev" : ""}" src="${tarotImg(c.n)}" alt="${c.name}" loading="lazy" onerror="this.remove()" />
        <div class="tp-head">
          <p class="tp-name">${c.name}</p>
          <p class="tp-ori-line"><span class="tc-ori ${c.reversed ? "rev" : "up"}">${c.reversed ? "逆位置" : "正位置"}</span></p>
          <div class="tc-meta">${meta}</div>
        </div>
        <div class="tp-detail">
          <div class="tc-meanings">
            <p class="${c.reversed ? "tc-dim" : ""}"><span class="tc-ori up">正位置</span>${mean.up}</p>
            <p class="${c.reversed ? "" : "tc-dim"}"><span class="tc-ori rev">逆位置</span>${mean.rev}</p>
          </div>
          <p class="tc-advice">このカードの助言 — <strong>${c.advice}</strong></p>
        </div>
      </div>
    </div>`;
  }).join("");

  const NEW_NOTES = [
    "これが、今日のあなたの一枚。もう一回引きたい顔をしていますね?でも、こういうのは1日1回にしときましょう。おかわりすると効き目が薄まるので — <strong>また明日、新しい一枚を。</strong>",
    "本日の一枚、これにて確定です。引き直しボタンは、探してもありません。カードも一発勝負、あなたも一発勝負 — <strong>続きはまた明日。</strong>",
    "今日の一枚はこれで決まり。おかわりは明日の朝、デッキが混ざり直ってからどうぞ。今日のところは、この札と仲良くやってください — <strong>また明日。</strong>",
  ];
  const RESTORED_NOTES = [
    "今日の一枚は、もう引いてあります。何度ひらいても同じ札が出るのが占いというものです。往生際よくいきましょう — <strong>新しい一枚は、また明日。</strong>",
    "はい、本日のぶんはこちらでした。2枚目はありません。星も「1日1枚まで」と決めているようです — <strong>続きはまた明日。</strong>",
  ];
  const notePool = restored ? RESTORED_NOTES : NEW_NOTES;
  const dailyNote = conf.once ? `
    <div class="result-card span-all daily-note">
      <p>${notePool[Math.floor(seededRng(todayKey() + "|note")() * notePool.length)]}</p>
    </div>` : "";

  showResult(tarotSummary, `
    <div class="result-hero" style="text-align:center">
      <span class="result-symbol">☾</span>
      <p class="result-eyebrow">TAROT — ${conf.label} ・ ${genreLabel}</p>
      ${ritual.question ? `<p class="tarot-q">あなたの問い:「${esc(ritual.question)}」</p>` : ""}
      <h3 class="result-title">${ritual.spread === "daily" ? "今日のあなたへの一枚" : "カードの答え"}</h3>
      <p class="result-lead" style="margin-inline:auto">正位置は素直に巡る力。逆位置は、内にこもる力。</p>
      ${shareRowHtml("tarot")}
    </div>
    <div class="result-grid">
      ${tarotConclusionHtml()}
      ${items}
      ${deckReadingHtml()}
      ${dailyNote}
    </div>
    <div class="crosslinks">
      <span class="crosslinks-label">─ 旅はつづく</span>
      <button id="tarot-again">別のスプレッドで引く</button>
      <button data-nav="integrated">生年月日から統合鑑定</button>
      <button data-nav="aisho">気になる人との相性をみる</button>
    </div>
  `);
  renderSharePreview("tarot");
  document.getElementById("tarot-again")?.addEventListener("click", () => {
    renderAsk();
    tarotStage.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth" });
  });
}

renderAsk();

/* ---------- 相性診断 ---------- */
document.getElementById("aisho-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = compatibilityReading(
    { name: fd.get("name1")?.trim(), birthdate: fd.get("birthdate1") },
    { name: fd.get("name2")?.trim(), birthdate: fd.get("birthdate2") },
  );
  const nameA = r.a.name ? esc(r.a.name) : "あなた";
  const nameB = r.b.name ? esc(r.b.name) : "お相手";
  const keyword = aishoKeyword(r);
  const fromA = perspectiveCompat(r.a, r.b, nameA, nameB);
  const fromB = perspectiveCompat(r.b, r.a, nameB, nameA);
  const topics = aishoTopics(r);
  const shogoA = fortuneTitle(fd.get("birthdate1"));
  const shogoB = fortuneTitle(fd.get("birthdate2"));
  addToCollection(shogoA.title, r.a.name || "あなた");
  addToCollection(shogoB.title, r.b.name || "お相手");

  lastShare.aisho = {
    eyebrow: "COMPATIBILITY",
    title: `「${keyword}」`,
    keywords: [`${shogoA.title} × ${shogoB.title}`],
    score: r.total, scoreLabel: "ふたりの相性", scoreSuffix: "/100",
    duo: { nameA, nameB, labelA: fromA.label, labelB: fromB.label },
    x: `「${shogoA.title}」と「${shogoB.title}」の相性は ${r.total}/100 —「${keyword}」でした ✦ あなたたちは?`,
    url: buildInviteUrl(r.a.name, shogoA.title),
  };
  recordHistory("相性診断", `${nameA} × ${nameB} — ${r.total}/100`, `「${keyword}」(${r.band})。${r.advice}`);

  const breakdown = [
    { en: "ZODIAC", ja: "星座エレメント", pair: `${r.a.zodiac.name}(${r.a.zodiac.element}) × ${r.b.zodiac.name}(${r.b.zodiac.element})`, ...r.zodiac },
    { en: "GOGYO", ja: "九星の五行", pair: `${r.a.kyusei.name} × ${r.b.kyusei.name}`, ...r.gogyo },
    { en: "ETO", ja: "干支の配置", pair: `${r.a.eto.name}(${r.a.eto.animal}) × ${r.b.eto.name}(${r.b.eto.animal})`, ...r.eto },
    { en: "BOND", ja: "絆の質(日主の対話)", pair: `${r.a.kan} × ${r.b.kan}`, score: r.bond.score, note: `生まれた「日」の気同士の相性です。${nameA}にとって${nameB}は「${r.bond.ab.label}」(${r.bond.ab.star}) — ${r.bond.ab.note} 逆に${nameB}から見た${nameA}は「${r.bond.ba.label}」(${r.bond.ba.star})です。` },
  ].map((x) => `
    <div class="result-card">
      ${cardH4(x.en, x.ja)}
      <p><strong>${x.pair}</strong></p>
      <div class="meter" style="margin-top:12px">
        <span class="meter-label">相性度</span>
        <div class="meter-track"><div class="meter-fill" data-w="${x.score}"></div></div>
        <span class="meter-value">${x.score}</span>
      </div>
      <p class="sub" style="margin-top:12px">${x.note}</p>
    </div>`).join("");

  document.getElementById("aisho-form").classList.add("form-quiet");
  observeThen("aisho", () => showResult(document.getElementById("aisho-result"), `
    <div class="result-hero" style="text-align:center">
      <span class="result-symbol">縁</span>
      <p class="result-eyebrow">COMPATIBILITY REPORT</p>
      <h3 class="result-title">${nameA} × ${nameB}</h3>
      <p class="result-keyword">ふたりの関係を一言でいうと —「${keyword}」</p>
      <p class="shogo-vs">「${shogoA.title}」<span>×</span>「${shogoB.title}」</p>
      <div class="total-score" style="margin-top:14px"><span class="num" data-count="${r.total}">0</span><span class="denom"> / 100</span></div>
      <p class="result-lead" style="margin-inline:auto">${r.band}。${r.advice}</p>
      ${shareRowHtml("aisho")}
    </div>
    <div class="result-grid" style="margin-bottom:18px">
      <div class="result-card">
        ${cardH4("FOR YOU", `${nameA}から見ると`)}
        <p><strong style="color:var(--gold-bright)">「${fromA.label}」</strong></p>
        <div class="meter" style="margin-top:12px">
          <span class="meter-label">安心度</span>
          <div class="meter-track"><div class="meter-fill ${fromA.score >= 80 ? "hi" : fromA.score >= 68 ? "mid" : "lo"}" data-w="${fromA.score}"></div></div>
          <span class="meter-value">${fromA.score}</span>
        </div>
        <p class="sub" style="margin-top:12px">${fromA.note}</p>
      </div>
      <div class="result-card">
        ${cardH4("FOR PARTNER", `${nameB}から見ると`)}
        <p><strong style="color:var(--gold-bright)">「${fromB.label}」</strong></p>
        <div class="meter" style="margin-top:12px">
          <span class="meter-label">安心度</span>
          <div class="meter-track"><div class="meter-fill ${fromB.score >= 80 ? "hi" : fromB.score >= 68 ? "mid" : "lo"}" data-w="${fromB.score}"></div></div>
          <span class="meter-value">${fromB.score}</span>
        </div>
        <p class="sub" style="margin-top:12px">${fromB.note}</p>
      </div>
    </div>
    <div class="result-card span-all" style="margin-bottom:18px">
      ${cardH4("HANDBOOK", "ふたりの取扱説明書")}
      <p class="theme-point" style="border-top:none;padding-top:0"><strong>◎ ふたりの遊び方</strong> — ${topics.play}</p>
      <p class="theme-point"><strong>⚠ ケンカの火種はここ</strong> — ${topics.friction}</p>
      <p class="theme-point"><strong>✦ ふたりの吉日は ${topics.lucky.m}月${topics.lucky.d}日</strong> — ${topics.lucky.note}遊びの予定・大事な話はこの日に。</p>
    </div>
    <div class="result-card span-all" style="margin-bottom:18px">
      ${cardH4("HOW IT WORKS", "総合スコアの計算式")}
      <p class="sub" style="margin-bottom:10px">上の「見え方」は九星の五行だけで見た二人の景色。総合スコアは星座・五行・干支・日主の四つの手法を合算するため、見え方と点が違うことがあります。</p>
      ${logicFlowHtml([
        { tag: "星座エレメント", main: String(r.zodiac.score), sub: "× 30%" },
        "+",
        { tag: "九星の五行", main: String(r.gogyo.score), sub: "× 25%" },
        "+",
        { tag: "干支の配置", main: String(r.eto.score), sub: "× 25%" },
        "+",
        { tag: "日主の対話", main: String(r.bond.score), sub: "× 20%" },
        "=",
        { tag: "総合", main: String(r.total), sub: "/ 100", result: true },
      ])}
    </div>
    <div class="result-grid">${breakdown}</div>
    ${crossLinksHtml("aisho")}
  `), () => renderSharePreview("aisho"));
});

/* ---------- PWA: Service Worker とインストール ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { /* 非対応環境は無視 */ });
  });
}
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
});

/* ---------- 称号図鑑(localStorage) ---------- */
const COLLECTION_KEY = "fortuna:collection";

function loadCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) || []; } catch { return []; }
}

function addToCollection(title, owner) {
  if (!title) return;
  try {
    const list = loadCollection();
    if (list.some((c) => c.title === title)) return;
    list.unshift({ title, owner: owner || "", d: todayKey() });
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(list.slice(0, 200)));
  } catch { /* noop */ }
}

/* ---------- 引き継ぎコード(機種変更・ドメイン移行対応) ---------- */
const BACKUP_KEYS = ["fortuna:profile", "fortuna:visits", "fortuna:collection", "fortuna:history", "fortuna:dailycard"];

function exportBackupCode() {
  const data = {};
  for (const k of BACKUP_KEYS) {
    const v = localStorage.getItem(k);
    if (v) data[k] = v;
  }
  return "FTN1." + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function importBackupCode(code) {
  if (!code?.startsWith("FTN1.")) return false;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.slice(5)))));
    for (const k of BACKUP_KEYS) {
      if (typeof data[k] === "string") localStorage.setItem(k, data[k]);
    }
    return true;
  } catch { return false; }
}

/* ---------- 招待状(シェアURLから来た人へ) ---------- */
function renderInviteBanner() {
  const el = document.getElementById("invite-banner");
  if (!el) return;
  const q = new URLSearchParams(location.search);
  const title = q.get("it");
  if (!title || title.length > 40) return;
  const inviter = (q.get("in") || "").slice(0, 20);
  addToCollection(title, inviter || "友人");
  const who = inviter ? `${esc(inviter)}さん` : "友人";
  el.innerHTML = `
    <div class="invite-card">
      <p class="invite-seal">✦ 招待状 ✦</p>
      <p class="invite-line">${who}の運命の称号は</p>
      <p class="invite-title">「${esc(title)}」</p>
      <p class="invite-line">でした。1080タイプにひとつ — <strong>あなたの称号は?</strong></p>
      <button class="btn btn-primary" data-nav="integrated">自分の称号を知る</button>
    </div>`;
}

/* ---------- 読みもの(占いの手引き) ---------- */
const GUIDE_ARTICLES = {
  tarot: { img: "images/tarot/tarot_17_star.webp", title: "タロットとは", lead: "引いた1枚で「いまの空気」がわかる。78枚の意味と、迷わない引き方。", mins: 4 },
  western: { img: "assets/site/icon_western.webp", title: "ホロスコープとは", lead: "生年月日で「自分の設計図」がわかる。星座占いのその先へ。", mins: 4 },
  eastern: { img: "assets/site/icon_eastern.webp", title: "<span class=\"nw\">四柱推命と</span><span class=\"nw\">九星気学とは</span>", lead: "生年月日だけで「自分の性質と今日の風向き」がわかる。東洋占い、最初の一歩。", mins: 4 },
  aisho: { img: "assets/site/icon_aisho.webp", title: "相性診断のしくみ", lead: "なぜ「あなたから」と「相手から」で答えが違うのか。点数の中身、ぜんぶ見せます。", mins: 3 },
  about: { img: "assets/site/icon_integrated.webp", title: "MYOURISCOPEの思想", lead: "占いは、決定ではなく観測。このサイトが大切にしていることと、鑑定のロジック。", mins: 3 },
};

function guideCardImg(n, cap) {
  return `<figure class="ga-fig"><img src="${tarotImg(n)}" alt="${cap}" loading="lazy" /><figcaption>${cap}</figcaption></figure>`;
}

/* アスペクトの小さな図解(円+2天体+角度線) */
function aspectFig(deg, label, color, note) {
  const rad = (deg - 90) * Math.PI / 180;
  const x2 = 40 + 30 * Math.cos(rad), y2 = 40 + 30 * Math.sin(rad);
  const line = deg === 0 ? "" : `<line x1="40" y1="10" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.6" />`;
  const second = deg === 0
    ? '<circle cx="46" cy="12" r="4.5" fill="#1C2333" />'
    : `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.5" fill="#1C2333" />`;
  return `
    <figure class="ga-asp">
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="30" fill="none" stroke="#D7CFC2" stroke-width="1" />
        ${line}
        <circle cx="40" cy="10" r="4.5" fill="#A8844E" />
        ${second}
      </svg>
      <figcaption><strong>${label}</strong><br>${note}</figcaption>
    </figure>`;
}

function guideArticleHtml(key) {
  if (key === "tarot") {
    const suits = Object.entries(MINOR_SUITS).map(([k, s]) => `
      <figure class="ga-fig"><img src="images/tarot/tarot_${k}_ace.webp" alt="${s.ja}のエース" loading="lazy" />
      <figcaption><strong>${s.ja}</strong><br>${s.theme}</figcaption></figure>`).join("");
    return `
      <h3>タロットは、78枚でひとつの世界</h3>
      <p>タロットの起源は15世紀イタリアの札遊びに遡り、18世紀以降に占いの道具として体系化されました。1組は<strong>大アルカナ22枚</strong>と<strong>小アルカナ56枚</strong>、あわせて78枚。「アルカナ」はラテン語で「秘密」という意味です。</p>
      <h3>大アルカナ — 人生の大きな節目</h3>
      <p>0「愚者」から21「世界」までの22枚は、旅立ちから完成までの人生の物語になっています。鑑定でこの札が出るときは、日常より一段大きなテーマが動いているサイン。</p>
      <div class="ga-cards">
        ${guideCardImg(0, "0 愚者<br>はじまりの一歩")}
        ${guideCardImg(6, "VI 恋人<br>選択と愛")}
        ${guideCardImg(10, "X 運命の輪<br>転機")}
        ${guideCardImg(16, "XVI 塔<br>崩壊と再生")}
        ${guideCardImg(17, "XVII 星<br>希望")}
        ${guideCardImg(21, "XXI 世界<br>完成")}
      </div>
      <h3>小アルカナ — 日常の機微</h3>
      <p>残りの56枚は4つのスート(組)に分かれ、それぞれが暮らしのひとつの領域を映します。各スートはエース〜10の数札と、ペイジ・ナイト・クイーン・キングの人物札で構成されます。</p>
      <div class="ga-cards">${suits}</div>
      <h3>正位置と逆位置</h3>
      <p>引いたカードが上向きなら<strong>正位置</strong>、逆さまなら<strong>逆位置</strong>。逆位置は「悪い意味」ではなく、そのカードの力が<em>過剰・不足・内向き</em>になっている状態を示します。たとえば「太陽」の逆位置は、輝きが消えたのではなく「曇りがかかっている」と読みます。</p>
      <h3>スプレッド — 並べ方が問いを決める</h3>
      <p>カードを何枚・どの配置で引くかを「スプレッド」と呼びます。MYOURISCOPEでは、知りたいことに合わせて選べます。</p>
      <ul class="ga-list">
        <li><strong>今日の一枚</strong> — 今日という日の空気をひとことで。1日1回だけ、トップページから。</li>
        <li><strong>ワンオラクル(1枚)</strong> — 目の前の迷いをひとつ、カードに即答してもらう引き方。</li>
        <li><strong>3枚引き</strong> — 過去・現在・未来。流れの中のいまを知りたいときに。</li>
        <li><strong>ケルト十字(10枚)</strong> — 根本原因・現状・無意識・周囲・未来の可能性まで、ひとつのテーマを多角的に。100年以上使われてきた、もっとも有名な本格スプレッドです。</li>
      </ul>
      <p class="ga-mid"><button class="linklike" data-nav="today">→ まずは「今日の一枚」を引いてみる(30秒で終わります)</button></p>
      <h3>このサイトの引き方 — 結果を決めるのは、あなたの手</h3>
      <p>MYOURISCOPEのタロットは、乱数を機械任せにしません。<strong>シャッフルで指を離した瞬間、カットで選んだ山、帯から引いた位置</strong>——あなたの手の動きそのものが混ざって1枚が決まります。同じ問いでも、同じ手つきは二度とない。だから、その1枚はあなたのものです。</p>
      <p class="ga-cta"><button class="btn btn-primary" data-nav="tarot">タロットを引いてみる</button></p>`;
  }
  if (key === "western") {
    const planets = PLANET_BODIES.map((b) => `<li><strong>${b.glyph}︎ ${b.ja}</strong><small>${b.role}${b.gen ? "(世代のテーマ)" : ""}</small></li>`).join("");
    return `
      <h3>ホロスコープは「生まれた瞬間の空の写真」</h3>
      <p>あなたが生まれたその時刻、太陽・月・惑星が空のどこにいたか——それを一枚の円に描いたものが<strong>出生図(ネイタルチャート)</strong>です。星占いでおなじみの「◯◯座」は、このうち太陽の位置だけを見たもの。実際の空にはあと9つの天体があり、それぞれが人生の別の領域を担当しています。</p>
      <h3>10天体 — それぞれの担当</h3>
      <ul class="ga-planets">${planets}</ul>
      <h3>12星座と4つのエレメント</h3>
      <p>12星座は4つの気質(エレメント)に分かれます。<strong>火</strong>(牡羊・獅子・射手)は直感と情熱、<strong>地</strong>(牡牛・乙女・山羊)は現実と着実さ、<strong>風</strong>(双子・天秤・水瓶)は知性と言葉、<strong>水</strong>(蟹・蠍・魚)は感情と共感。たとえば「月が水のサイン」なら、素の感情は共感型——という具合に、天体×星座の掛け算で読みます。</p>
      <h3>アスペクト — 天体同士の会話</h3>
      <p>チャートの中で天体同士が特定の角度を結ぶと、互いに影響し合います。出生図のアスペクトは、あなたの中で「よく起きる化学反応」の一覧です。</p>
      <div class="ga-asps">
        ${aspectFig(0, "0° 重なり", "#A8844E", "性質を強め合う")}
        ${aspectFig(120, "120° トライン", "#2E8C7E", "生まれつきの才能")}
        ${aspectFig(90, "90° スクエア", "#C05C82", "越えるたび力になる")}
      </div>
      <p class="ga-mid"><button class="linklike" data-nav="western">→ 自分の10天体とアスペクトを見てみる</button></p>
      <h3>アセンダント — 出生時刻と出生地でわかること</h3>
      <p>生まれた瞬間に東の地平線から昇っていた星座を<strong>アセンダント(上昇星座)</strong>と呼びます。これは「人に与える第一印象」と「人生の入り口」。地平線は場所によって違うため、<em>出生時刻と出生地の両方</em>があってはじめて計算できます。母子手帳に出生時刻が載っていることが多いですよ。</p>
      <h3>動き続ける空 — トランジット</h3>
      <p>出生図が「生まれ持った設計図」なら、いまの空(トランジット)は「今日の天気」。月は約2.5日でつぎの星座へ移り、木星は約12年、土星は約29.5年で空を一周します。ホロスコープ鑑定の「今日の空」は、今日の天体とあなたの出生図の対話を毎日読んでいます。</p>
      <p>そしてゆっくり動く土星は、約7年ごとに人生の節目を刻みます。鑑定結果の<strong>「5年周期で読む流れ」</strong>はこの土星のリズムから"人生のいまの章"を読むもの。転職や引っ越しなど、大きな流れを知りたいときに向いています。</p>
      <p class="ga-cta"><button class="btn btn-primary" data-nav="western">自分の星を調べる</button></p>`;
  }
  if (key === "eastern") {
    const stars = Object.entries(TSUHENSEI).map(([name, t]) => `<li><strong>${name}</strong><small>${t.gloss}</small></li>`).join("");
    return `
      <h3>生年月日は、4本の柱でできている</h3>
      <p>四柱推命は、生まれた<strong>年・月・日・時</strong>それぞれに干支(十干×十二支)を割り当て、4本の柱として読む東洋占術の王様です。この4本の柱を一覧にした"あなたの取扱説明書"を<strong>命式(めいしき)</strong>と呼びます。なかでも重要なのが<strong>日柱の干=日主(にっしゅ)</strong>で、これがあなた自身を表します。</p>
      <h3>十干 — あなたは自然界のなにか</h3>
      <p>日主は10種類。それぞれ自然のものにたとえられます。大樹(甲)・草花(乙)・太陽(丙)・灯火(丁)・山岳(戊)・田畑(己)・鋼鉄(庚)・宝石(辛)・大河(壬)・雨露(癸)。「太陽の人」と「灯火の人」では、同じ火でも輝き方がまるで違う——そんな解像度で人を観る道具です。</p>
      <h3>通変星 — 巡ってくる10種類の風</h3>
      <p>あなたの日主と、その日・その月にめぐる干支の関係を読んだものが<strong>通変星(つうへんせい)</strong>です。同じ日でも、日主が違えば吹く風が違う——これが「今日の気流」の正体です。</p>
      <p>10種類ありますが、<strong>全部覚える必要はありません。あなたの結果に出た星だけ読めばOK</strong>です。ざっくり4タイプ——<strong>自分を貫く風</strong>(比肩・劫財)、<strong>楽しみと表現の風</strong>(食神・傷官)、<strong>お金とご縁の風</strong>(偏財・正財)、<strong>試練と学びの風</strong>(偏官・正官・偏印・印綬)。</p>
      <details class="explain"><summary>10種類ぜんぶ見る</summary>
        <ul class="ga-stars">${stars}</ul>
      </details>
      <p class="ga-mid"><button class="linklike" data-nav="eastern">→ 自分の日主と今日の風を見てみる</button></p>
      <h3>日運・月運・年運の重なり</h3>
      <p>日ごとの風(日運)は、月全体の気流(月運)の上に吹き、さらにその下には年の地形(年運)があります。MYOURISCOPEの「今日の結論」は、この重なりに干支の巡り(三合・支合・冲)と月の満ち欠けを加えて、複数の暦の「票」として集計しています。</p>
      <h3>九星気学 — もうひとつの東洋の羅針盤</h3>
      <p>生まれ年から定まる<strong>本命星</strong>(一白水星〜九紫火星の9種)で気質と巡りを読むのが九星気学。9つの星は五行(木火土金水)に対応し、毎月方位盤の上を巡るため「吉方位」が出せるのが特徴です。マイページの方位盤はこの仕組みで動いています。</p>
      <p class="ga-cta"><button class="btn btn-primary" data-nav="eastern">生年月日から、自分の命式を出してみる</button></p>`;
  }
  if (key === "aisho") {
    return `
      <h3>相性は、ひとつの物差しでは測れない</h3>
      <p>MYOURISCOPEの相性診断は、独立した4つの手法を重ねて総合スコアを出します。ひとつの占術だけだと「たまたま良い/悪い」が出やすい——複数の物差しで測って、それでも揃うところにふたりの本質が現れる、という設計です。</p>
      <div class="ga-weightbar" aria-hidden="true">
        <i style="flex-basis:30%" class="wb1"><b>30%</b></i><i style="flex-basis:25%" class="wb2"><b>25%</b></i><i style="flex-basis:25%" class="wb3"><b>25%</b></i><i style="flex-basis:20%" class="wb4"><b>20%</b></i>
      </div>
      <ul class="ga-list">
        <li><strong>ノリとテンポの相性(30%)</strong> — 星座のエレメント(火・地・風・水)。日々の会話や遊びの噛み合わせを見ます。</li>
        <li><strong>エネルギーの流れ(25%)</strong> — 九星の五行。どちらがどちらを元気にする関係かを見ます(専門的には相生・相剋)。</li>
        <li><strong>生まれ年の巡り(25%)</strong> — 十二支の組み合わせ。自然と引き合う組か、正反対の組か(専門的には三合・支合・冲)。</li>
        <li><strong>絆の質(20%)</strong> — 生まれた「日」同士の対話。同学年でも生まれ日で変わる、いちばん個人的な層です。</li>
      </ul>
      <h3>なぜ「あなたから」と「相手から」で答えが違うのか</h3>
      <p>五行の気は<em>向き</em>を持って流れます。水は木を育てますが、木が水を育てるわけではない——だから「あなたにとって相手は充電させてくれる人」なのに「相手にとってあなたは頑張らせてくる人」という非対称が生まれます。この見え方は5つの関係×10の星で<strong>50通り</strong>。ふたりで見せ合うと、たいてい会話が始まります。</p>
      <p class="ga-mid"><button class="linklike" data-nav="aisho">→ 気になるあの人と、さっそく診断してみる</button></p>
      <h3>ふたりの吉日</h3>
      <p>向こう30日の暦を実際にめくり、その日の十二支がふたりの生まれ年と良い角度を結ぶ日を探しています。占いを「いつ会うか」の実用に落とすための機能です。</p>
      <h3>ケンカの火種</h3>
      <p>4つの層のうち<em>いちばん点が低かった層</em>から、起こりやすいすれ違いと回避策を出しています。良いところだけでなく弱点も言う——それが信用できる相性診断だと考えています。</p>
      <p class="ga-cta"><button class="btn btn-primary" data-nav="aisho">誰かと診断してみる</button></p>`;
  }
  return `
    <h3>MYOURISCOPE — 妙なる理(ことわり)を観る場所</h3>
    <p>名前は「妙理(みょうり)」と「scope(観測器)」から。言葉にしがたい、ものごとの奥にあるかすかな理を、望遠鏡を覗くように静かに観る——そんな場所でありたいと思っています。</p>
    <h3>占いは、決定ではなく観測</h3>
    <p>占いはあなたの未来を決めるものではありません。空の配置や暦の巡りという「いまの風向き」を観測して、今日をどう歩くかの参考にする——それだけのものです。だからこのサイトは、断定しません。脅しません。買わせません。かわりに、毎朝そっと背中を押します。</p>
    <h3>大切にしていること</h3>
    <ul class="ga-list">
      <li><strong>1日1回の楽しみを守る</strong> — 今日の一枚は1日1回だけ。何度も引き直せたら、その1枚の意味が薄れてしまうから。</li>
      <li><strong>結果のネタバレをしない</strong> — その日まだ観測していないあなたに、先に答えを見せません。</li>
      <li><strong>根拠を見せる</strong> — スコアにも結論にも、必ず「どう計算したか」を添えます。ブラックボックスの神託より、仕組みごと楽しめる占いを。</li>
      <li><strong>データは、あなたの端末の中だけ</strong> — 生年月日も履歴も、お使いの端末(ブラウザ)の中にだけ保存され、私たちのサーバーには一切送られません。</li>
    </ul>
    <h3>統合鑑定のロジック</h3>
    <p>西洋占星術(太陽星座・月星座)、四柱推命(日主)、九星気学(本命星)、タロット——それぞれ別の文明が磨いてきた物差しをひとりに重ねると、一面的でない立体的な輪郭が浮かびます。<strong>運命の称号</strong>はその要約で、日主(10)×太陽星座(12)×本命星(9)=<strong>1080通り</strong>。称号の下には、どの言葉がどの占術から来たかの由来も添えています。</p>
    <h3>今日の結論のロジック</h3>
    <p>四柱推命の日運・月運、干支の巡り、月相——独立した暦の手法それぞれに今日を採点してもらい、「票」として集計して大吉〜休の結論を出しています。すべてが同じ方向を向く日は年に数回。その日は、ちゃんとそう言います。</p>
    <p class="ga-cta"><button class="btn btn-primary" data-nav="integrated">統合鑑定を受けてみる</button></p>`;
}

function renderGuide(articleKey) {
  const root = document.getElementById("guide-root");
  const head = document.querySelector("#view-guide .view-head");
  if (head) head.hidden = !!articleKey; // 記事ページではヒーローの重複を避ける
  if (!articleKey) {
    root.innerHTML = `
      <div class="guide-grid">
        ${Object.entries(GUIDE_ARTICLES).map(([k, a]) => `
          <button class="guide-card" data-guide="${k}">
            <span class="gc-icon"><img src="${a.img}" alt="" loading="lazy" /></span>
            <span class="gc-body"><strong>${a.title}</strong><small>${a.lead}</small><em class="gc-meta">読了 約${a.mins}分</em></span>
            <span class="gc-arrow">→</span>
          </button>`).join("")}
      </div>
      <p class="ga-cta" style="margin-top:30px"><button class="btn btn-primary" data-nav="today">読む前に、まず今日の一枚から</button></p>`;
  } else {
    const a = GUIDE_ARTICLES[articleKey];
    root.innerHTML = `
      <article class="guide-article panel">
        <button class="ga-back" data-guide-back>← 手引きにもどる</button>
        <p class="ritual-eyebrow" style="margin-top:14px">GUIDE</p>
        <h2 class="ga-title">${a.title}</h2>
        ${guideArticleHtml(articleKey)}
      </article>`;
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
  }
  root.querySelectorAll("[data-guide]").forEach((b) => b.addEventListener("click", () => renderGuide(b.dataset.guide)));
  root.querySelector("[data-guide-back]")?.addEventListener("click", () => renderGuide());
}

/* ---------- トップのタロットコピー(毎回ランダム) ---------- */
(function rotateTarotCopy() {
  const el = document.getElementById("tarot-bento-copy");
  if (!el) return;
  const copies = [
    "カードはもう、答えを決めています。シャッフルも、引くのも、あなたの手で。",
    "言葉にできない迷いは、カードに聞く。あなたの手で引いた1枚だから、意味があります。",
    "決められない夜に、深呼吸して1枚。78枚のフルデッキが、いまの答えをくれます。",
    "シャッフルするその指先が、運命の1枚を選びます。答えは、もう78枚の中に。",
  ];
  el.textContent = copies[Math.floor(Math.random() * copies.length)];
})();

/* ---------- 初期化 ---------- */
prefillForms(loadProfile());
renderHomeDaily();
renderInviteBanner();
updateStreak();
if (location.hash.length > 1) navigate(location.hash.slice(1), false);

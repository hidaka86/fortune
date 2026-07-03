/* Fortuna — UIロジック */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- ナビゲーション ---------- */
const views = document.querySelectorAll(".view");
const navBtns = document.querySelectorAll(".nav-btn");

function navigate(target) {
  if (target === "mypage") renderMypage();
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${target}`));
  navBtns.forEach((b) => b.classList.toggle("active", b.dataset.nav === target));
  window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-nav]");
  if (el) {
    e.preventDefault();
    navigate(el.dataset.nav);
  }
});

/* ---------- ステータスバー(今日の暦) ---------- */
(function renderStatusBar() {
  const d = new Date();
  const week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
  const phase = moonPhaseToday();
  document.getElementById("status-bar").innerHTML = `
    <span class="status-item">${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${week}</span>
    <span class="status-item"><span class="moon">${phase.emoji}</span>${phase.name} — ${phase.note}</span>
    <span class="status-item status-quote">${dailyQuote()}</span>`;
})();

/* ---------- ヒーローの星空キャンバス ---------- */
(function initSky() {
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let shooting = null;
  let w = 0, h = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.floor((w * h) / 4200) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      tw: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 1.4,
      gold: Math.random() < 0.16,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = REDUCED_MOTION ? 0.7 : 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(s.tw + t * 0.001 * s.sp));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? `rgba(237,217,163,${a})` : `rgba(220,228,255,${a * 0.85})`;
      ctx.fill();
    }
    if (!REDUCED_MOTION) {
      if (!shooting && Math.random() < 0.004) {
        shooting = { x: Math.random() * w * 0.7 + w * 0.15, y: Math.random() * h * 0.35, life: 1 };
      }
      if (shooting) {
        shooting.life -= 0.025;
        shooting.x += 7; shooting.y += 3.2;
        if (shooting.life <= 0) { shooting = null; }
        else {
          const g = ctx.createLinearGradient(shooting.x - 70, shooting.y - 32, shooting.x, shooting.y);
          g.addColorStop(0, "rgba(237,217,163,0)");
          g.addColorStop(1, `rgba(237,217,163,${shooting.life * 0.9})`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(shooting.x - 70, shooting.y - 32);
          ctx.lineTo(shooting.x, shooting.y);
          ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }
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

/* 回遊導線:結果の下に「次の扉」を提示 */
const CROSS_SUGGEST = {
  integrated: [["tarot", "3枚スプレッドで深掘りする"], ["aisho", "気になる人との相性をみる"], ["palm", "手相で資質を確かめる"]],
  western: [["integrated", "六占術まとめて統合鑑定"], ["eastern", "東洋の暦ではどう出る?"], ["tarot", "今日の一枚を引く"]],
  eastern: [["western", "月星座で心の素顔をみる"], ["integrated", "統合鑑定で全体をみる"], ["aisho", "大切な人との相性をみる"]],
  tarot: [["integrated", "生年月日から統合鑑定"], ["palm", "手相を診断する"], ["western", "星占いをみる"]],
  palm: [["tarot", "タロットに聞いてみる"], ["integrated", "統合鑑定を受ける"], ["eastern", "四柱推命で器をみる"]],
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
  const box = document.querySelector(`.bd-select[data-bd="${name}"]`);
  if (!box || !value) return;
  const [y, m, d] = value.split("-").map(Number);
  const [ySel, mSel, dSel] = box.querySelectorAll("select");
  ySel.value = y; mSel.value = m;
  box.dispatchEvent(new Event("change")); // 日の選択肢を作る
  dSel.value = d;
  box.dispatchEvent(new Event("change"));
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

function orderNav() {
  const nav = document.getElementById("nav");
  const myBtn = nav?.querySelector('[data-nav="mypage"]');
  if (!myBtn) return;
  if (loadProfile()?.birthdate) nav.insertBefore(myBtn, nav.children[1]);
  else nav.appendChild(myBtn);
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

  const daily = dailyFortune(p.birthdate);
  const visits = updateStreak() || {};
  const phase = moonPhaseToday();
  const d = new Date();
  const who = p.name ? `${esc(p.name)}さん` : "あなた";

  heroEl.classList.add("hero-member");
  heroContentEl.innerHTML = `
    <p class="hero-eyebrow">Today's Compass — ${d.getMonth() + 1}.${d.getDate()} ${phase.emoji}</p>
    <h1 class="hero-title hero-title-member"><span class="nw">おかえりなさい、</span><span class="nw">${who}。</span><br /><span class="nw">今日は<em>「${daily.dayStar.name}」</em>の日。</span></h1>
    <p class="hero-sub">${daily.dayStar.day}</p>
    <div class="hero-score">
      <span><span class="hs-num">${daily.total.toFixed(1)}</span><span class="hs-denom"> / 5.0</span></span>
      ${starsHtml(Math.round(daily.total))}
      <span class="chip">ラッキーカラー <strong>${daily.luckyColor}</strong></span>
      <span class="chip">連続 <strong>${visits.streak || 1}日目</strong></span>
    </div>
    <div class="hero-cta">
      <button class="btn btn-primary btn-lg" data-nav="mypage">今日の羅針盤をひらく</button>
      <button class="btn btn-ghost btn-lg" data-nav="tarot">今日の一枚を引く</button>
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
    const color = good ? (good.grade === "大吉" ? "#edd9a3" : "#d9b36a") : bad ? "#a25a4d" : "rgba(240,237,228,.25)";
    const size = good ? 7 : 4;
    marks += `
      <circle cx="${dx}" cy="${dy}" r="${size}" fill="${color}" />
      <text x="${lx}" y="${ly + 5}" text-anchor="middle" font-size="14" fill="${good ? "#edd9a3" : bad ? "#a25a4d" : "#96a0b9"}" font-weight="${good ? 700 : 400}">${dir.name}</text>`;
  }
  return `<svg viewBox="0 0 280 280" class="compass" role="img" aria-label="今月の方位盤">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(240,237,228,.16)" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r - 22}" fill="none" stroke="rgba(240,237,228,.08)" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="3" fill="#d9b36a" />
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
        <p class="view-sub">登録すると、あなた専用の「気の流れ」ダッシュボードが開きます。毎日ひらくたび、今日の指針がここに。</p>
      </div>
      <form class="panel form" id="register-form">
        <div class="form-row">
          <label class="field">
            <span class="field-label">お名前(ニックネーム可)</span>
            <input type="text" name="name" placeholder="例:ヒナタ" maxlength="20" />
          </label>
          <label class="field">
            <span class="field-label">生年月日 <em>必須</em></span>
            <div class="bd-select" data-bd="birthdate"></div>
          </label>
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">無料で登録する</button>
        <p class="form-note">登録情報はこの端末のブラウザ内(localStorage)にのみ保存され、サーバーには送信されません。</p>
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
      <p class="result-eyebrow">MY PAGE — ${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${phase.emoji} ${phase.name}</p>
      <h3 class="result-title">おかえりなさい、${who}。</h3>
      <p class="result-keyword">連続 ${visits.streak || 1} 日目の羅針盤</p>
      <div class="chip-row">
        <span class="chip">日主 <strong>${flow.myKan}(${flow.nikkan.symbol})</strong></span>
        <span class="chip">本命星 <strong>${kyusei.name}</strong></span>
        <span class="chip">今日の総合 <strong>${daily.total.toFixed(1)} / 5.0</strong></span>
      </div>
    </div>

    <div class="result-grid">
      <div class="result-card span-all">
        ${cardH4("TODAY'S KI", "今日の気流")}
        ${todayLogicHtml(daily)}
        <div style="margin-top:18px">${metersHtml(daily.scores)}</div>
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
    `【Fortuna 統合鑑定】${r.name ? r.name + "さん" : ""}`,
    `太陽 ${r.zodiac.name} × 月 ${r.moon.name} × ${r.kyusei.name}`,
    `日主: ${r.pillars.day.kan}(${r.pillars.nikkan.symbol}) / 干支: ${r.jikkan}${r.eto.name}`,
    `今日の運気: ${r.daily.total.toFixed(1)} / 5.0`,
    `導きの一枚: ${r.card.name}(${ori}) — ${r.card.advice}`,
    `ラッキーカラー: ${r.daily.luckyColor} / ラッキーアイテム: ${r.daily.luckyItem}`,
    `https://hidaka86.github.io/fortune/`,
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

/* ---------- シェア画像生成(Canvas) ---------- */
let lastIntegrated = null;

async function makeShareImage(r) {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  try { await document.fonts.load('700 64px "Zen Old Mincho"'); } catch { /* フォールバックで描画 */ }
  const serif = '"Zen Old Mincho", "Hiragino Mincho ProN", serif';

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0d1d");
  bg.addColorStop(1, "#151a38");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 星
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const rr = Math.random() * 1.8 + 0.4;
    ctx.globalAlpha = 0.25 + Math.random() * 0.6;
    ctx.fillStyle = Math.random() < 0.2 ? "#edd9a3" : "#dce4ff";
    ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 飾り枠
  ctx.strokeStyle = "rgba(217,179,106,.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(217,179,106,.25)";
  ctx.strokeRect(60, 60, W - 120, H - 120);

  const cx = W / 2;
  ctx.textAlign = "center";

  // ブランド
  ctx.fillStyle = "#d9b36a";
  ctx.font = `600 30px ${serif}`;
  ctx.fillText("F O R T U N A", cx, 132);

  // 星座記号
  ctx.fillStyle = "#edd9a3";
  ctx.font = `500 150px ${serif}`;
  ctx.fillText(`${r.zodiac.symbol}︎`, cx, 320);

  // タイトル
  ctx.fillStyle = "#f0ede4";
  ctx.font = `700 52px ${serif}`;
  const who = r.name ? `${r.name}さんの今日` : "今日のわたし";
  ctx.fillText(who, cx, 420);

  ctx.fillStyle = "#96a0b9";
  ctx.font = `500 28px ${serif}`;
  ctx.fillText(`${r.zodiac.name} × ${r.moon.name}の月 × ${r.kyusei.name}`, cx, 472);

  // スコア
  ctx.fillStyle = "#edd9a3";
  ctx.font = `700 170px ${serif}`;
  ctx.fillText(r.daily.total.toFixed(1), cx, 660);
  ctx.fillStyle = "#96a0b9";
  ctx.font = `500 30px ${serif}`;
  ctx.fillText("/ 5.0", cx + 170, 655);

  // 4項目
  const labels = { love: "恋愛", work: "仕事", money: "金運", health: "健康" };
  const entries = Object.entries(r.daily.scores);
  const colW = 210;
  entries.forEach(([k, v], i) => {
    const x = cx + (i - 1.5) * colW;
    ctx.fillStyle = "#96a0b9";
    ctx.font = `500 26px ${serif}`;
    ctx.fillText(labels[k], x, 748);
    ctx.fillStyle = "#d9b36a";
    ctx.font = "26px sans-serif";
    ctx.fillText("★".repeat(v) + "☆".repeat(5 - v), x, 790);
  });

  // カードとラッキー
  ctx.fillStyle = "#f0ede4";
  ctx.font = `600 32px ${serif}`;
  ctx.fillText(`導きの一枚 「${r.card.name}」`, cx, 872);
  ctx.fillStyle = "#96a0b9";
  ctx.font = `500 26px ${serif}`;
  ctx.fillText(`ラッキーカラーは ${r.daily.luckyColor}`, cx, 916);

  // 日付・URL
  const d = new Date();
  ctx.fillStyle = "#d9b36a";
  ctx.font = `500 24px ${serif}`;
  ctx.fillText(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`, cx, 976);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-share-image]");
  if (!btn || !lastIntegrated) return;
  const orig = btn.textContent;
  btn.textContent = "生成中…";
  try {
    const blob = await makeShareImage(lastIntegrated);
    const file = new File([blob], `fortuna-${todayKey()}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Fortuna 今日の運勢" });
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    btn.textContent = "保存しました ✓";
  } catch (err) {
    if (err?.name !== "AbortError") btn.textContent = "生成できませんでした";
    else btn.textContent = orig;
  }
  setTimeout(() => { btn.textContent = orig; }, 1800);
});

/* ---------- 統合鑑定 ---------- */
document.getElementById("integrated-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = integratedReading({
    name: fd.get("name")?.trim(),
    birthdate: fd.get("birthdate"),
    theme: fd.get("theme"),
  });
  lastIntegrated = r;

  saveProfile({ name: r.name, birthdate: fd.get("birthdate"), theme: r.theme });
  renderHomeDaily();

  const who = r.name ? `${esc(r.name)}さん` : "あなた";
  const ori = r.card.reversed ? "逆位置" : "正位置";
  const cardMeaning = r.card.reversed ? r.card.rev : r.card.up;

  showResult(document.getElementById("integrated-result"), `
    <div class="result-hero">
      <span class="result-symbol">${r.zodiac.symbol}︎</span>
      <p class="result-eyebrow">INTEGRATED REPORT</p>
      <h3 class="result-title">${who}の統合鑑定書</h3>
      <p class="result-keyword">${r.zodiac.keyword} × ${r.kyusei.name}</p>
      <div class="chip-row">
        <span class="chip">太陽 <strong>${r.zodiac.name}</strong></span>
        <span class="chip">月 <strong>${r.moon.name}</strong></span>
        <span class="chip">日主 <strong>${r.pillars.day.kan}(${r.pillars.nikkan.symbol})</strong></span>
        <span class="chip">干支 <strong>${r.jikkan}${r.eto.name}</strong></span>
        <span class="chip">本命星 <strong>${r.kyusei.name}</strong></span>
      </div>
      <p class="result-lead">${r.elementNote}</p>
      <div class="result-actions">
        <button class="btn btn-ghost" data-copy="${esc(buildShareText(r))}">結果をコピー</button>
        <button class="btn btn-ghost" data-share-image>画像で保存・シェア</button>
      </div>
    </div>
    <div class="result-grid">
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
        ${cardH4("TODAY", "今日の運気")}
        <div class="total-score"><span class="num" data-count="${r.daily.total.toFixed(1)}">0.0</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(r.daily.scores)}
        <div style="margin-top:18px">${todayLogicHtml(r.daily)}</div>
      </div>
      <div class="result-card">
        ${cardH4("TAROT", "導きの一枚")}
        <p><strong style="color:var(--gold-bright)">${r.card.name}(${ori})</strong> — ${cardMeaning}</p>
        <p class="sub" style="margin-top:12px">${r.card.advice}</p>
        <p style="margin-top:14px">${THEME_LABEL[r.theme]} ${starsHtml(r.themeScore)}<br /><span class="sub">${r.themeComment}</span></p>
      </div>
      <div class="result-card span-all">
        ${cardH4("LUCKY GUIDE", "今日の開運キー")}
        ${luckyHtml(r.daily)}
      </div>
    </div>
    ${crossLinksHtml("integrated")}
  `);
});

/* ---------- 星占い(太陽 × 月) ---------- */
document.getElementById("western-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const z = getZodiac(m, d);
  const moon = moonSign(y, m, d);
  const daily = dailyFortune(birthdate);

  showResult(document.getElementById("western-result"), `
    <div class="result-hero">
      <span class="result-symbol">${z.symbol}︎</span>
      <p class="result-eyebrow">WESTERN ASTROLOGY</p>
      <h3 class="result-title">太陽は${z.name}、月は${moon.name}。</h3>
      <p class="result-keyword">${z.keyword}</p>
      <div class="chip-row">
        <span class="chip">エレメント <strong>${z.element}</strong></span>
        <span class="chip">守護星 <strong>${z.planet}</strong></span>
        <span class="chip">月星座 <strong>${moon.name}</strong></span>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-card">
        ${cardH4("SUN SIGN", "外に向かうあなた")}
        <p>${z.trait}</p>
      </div>
      <div class="result-card">
        ${cardH4("MOON SIGN", "心の素顔")}
        <p><strong style="color:var(--gold-bright)">☾︎ ${moon.name}</strong> — ${moon.desc}</p>
        <p class="sub" style="margin-top:12px">※ 月は約2.5日で星座を移動します。出生時刻によっては前後の星座になる場合があります。</p>
      </div>
      <div class="result-card">
        ${cardH4("TODAY", "今日の運気")}
        <div class="total-score"><span class="num" data-count="${daily.total.toFixed(1)}">0.0</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(daily.scores)}
        <div style="margin-top:18px">${todayLogicHtml(daily)}</div>
      </div>
      <div class="result-card">
        ${cardH4("LUCKY GUIDE", "今日の開運キー")}
        ${luckyHtml(daily)}
      </div>
    </div>
    ${crossLinksHtml("western")}
  `);
});

/* ---------- 東洋占術(四柱推命 × 九星気学) ---------- */
document.getElementById("eastern-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const eto = getEto(y, m, d);
  const kyusei = getKyusei(y, m, d);
  const pillars = fourPillars(y, m, d);
  const daily = dailyFortune(birthdate);

  showResult(document.getElementById("eastern-result"), `
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
        ${cardH4("TODAY", "今日の運気")}
        <div class="total-score"><span class="num" data-count="${daily.total.toFixed(1)}">0.0</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(daily.scores)}
        <div style="margin-top:18px">${todayLogicHtml(daily)}</div>
      </div>
    </div>
    ${crossLinksHtml("eastern")}
  `);
});

/* ---------- タロット ---------- */
const tarotBoard = document.getElementById("tarot-board");
const tarotSummary = document.getElementById("tarot-summary");
let tarotSpread = 1;
let tarotCards = [];
let tarotFlipped = 0;

const SPREAD_LABELS = { 1: ["TODAY"], 3: ["PAST", "PRESENT", "FUTURE"] };
const SPREAD_LABELS_JA = { 1: ["今日のあなたへ"], 3: ["過去", "現在", "未来"] };

function dealTarot() {
  tarotCards = drawTarot(tarotSpread);
  tarotFlipped = 0;
  tarotSummary.hidden = true;
  tarotBoard.innerHTML = tarotCards.map((c, i) => `
    <div class="tarot-slot">
      <div class="tarot-slot-label">${SPREAD_LABELS[tarotSpread][i]}</div>
      <button class="tarot-card" data-i="${i}" aria-label="カードをめくる">
        <div class="tarot-face tarot-back">✦</div>
        <div class="tarot-face tarot-front ${c.reversed ? "is-rev" : ""}">
          <span class="no">${["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"][c.n]}</span>
          <span class="sym">${["🃏","🎩","📖","👑","🏛","🔑","💞","🏇","🦁","🏮","🎡","⚖️","🙃","🦋","🏺","⛓","🗼","⭐","🌙","☀️","🎺","🌍"][c.n]}</span>
          <span class="nm">${c.name}</span>
          <span class="en">${c.en}</span>
          <span class="ori ${c.reversed ? "rev" : "up"}">${c.reversed ? "逆位置" : "正位置"}</span>
        </div>
      </button>
    </div>
  `).join("");
}

tarotBoard.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".tarot-card");
  if (!cardEl || cardEl.classList.contains("flipped")) return;
  cardEl.classList.add("flipped");
  tarotFlipped++;
  if (tarotFlipped === tarotCards.length) {
    setTimeout(showTarotSummary, 800);
  }
});

function showTarotSummary() {
  const items = tarotCards.map((c, i) => {
    const meaning = c.reversed ? c.rev : c.up;
    return `
      <div class="result-card">
        ${cardH4(SPREAD_LABELS[tarotSpread][i], SPREAD_LABELS_JA[tarotSpread][i])}
        <p><strong style="color:var(--gold-bright)">${c.name}(${c.reversed ? "逆位置" : "正位置"})</strong></p>
        <p class="sub" style="margin-top:6px">${meaning}</p>
        <p style="margin-top:12px">${c.advice}</p>
      </div>`;
  }).join("");
  showResult(tarotSummary, `<div class="result-grid">${items}</div>${crossLinksHtml("tarot")}`);
}

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tarotSpread = Number(btn.dataset.spread);
    dealTarot();
  });
});
document.getElementById("tarot-reset").addEventListener("click", dealTarot);
dealTarot();

/* ---------- 手相 ---------- */
const palmQuestionsEl = document.getElementById("palm-questions");

palmQuestionsEl.innerHTML = PALM_QUESTIONS.map((q) => `
  <div class="palm-q" data-line="${q.lineId}">
    <div class="palm-q-title">${q.name}</div>
    <div class="palm-q-desc">${q.desc}</div>
    <div class="palm-opts">
      ${q.options.map((o, i) => `
        <label class="palm-opt">
          <input type="radio" name="${q.id}" value="${o.value}" ${i === 0 ? "required" : ""} />
          <span>${o.label}</span>
        </label>
      `).join("")}
    </div>
  </div>
`).join("");

palmQuestionsEl.addEventListener("change", (e) => {
  const q = e.target.closest(".palm-q");
  if (!q) return;
  document.querySelectorAll(".palm-line").forEach((l) => l.classList.remove("hl"));
  document.getElementById(q.dataset.line)?.classList.add("hl");
  document.getElementById("palm-hint").textContent =
    `${PALM_QUESTIONS.find((p) => p.lineId === q.dataset.line)?.name}をハイライト中`;
});

document.getElementById("palm-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const readings = PALM_QUESTIONS.map((q) => {
    const val = fd.get(q.id);
    const opt = q.options.find((o) => o.value === val);
    return { q, opt };
  });

  if (readings.some((r) => !r.opt)) {
    alert("4つの線すべてについて選択してください。");
    return;
  }

  const cards = readings.map(({ q, opt }) => `
    <div class="result-card">
      ${cardH4("LINE", `${q.name} — ${opt.label}`)}
      <p>${opt.text}</p>
    </div>
  `).join("");

  showResult(document.getElementById("palm-result"), `
    <div class="result-hero">
      <span class="result-symbol">掌</span>
      <p class="result-eyebrow">PALMISTRY REPORT</p>
      <h3 class="result-title">手のひらに刻まれた、あなたの資質。</h3>
      <p class="result-lead">四つの線から読み取れる生まれ持った資質です。手相は生き方とともに変化します——季節がめぐる頃、また確かめてみてください。</p>
    </div>
    <div class="result-grid">${cards}</div>
    ${crossLinksHtml("palm")}
  `);
});

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

  const breakdown = [
    { en: "ZODIAC", ja: "星座エレメント", pair: `${r.a.zodiac.name}(${r.a.zodiac.element}) × ${r.b.zodiac.name}(${r.b.zodiac.element})`, ...r.zodiac },
    { en: "GOGYO", ja: "九星の五行", pair: `${r.a.kyusei.name} × ${r.b.kyusei.name}`, ...r.gogyo },
    { en: "ETO", ja: "干支の配置", pair: `${r.a.eto.name}(${r.a.eto.animal}) × ${r.b.eto.name}(${r.b.eto.animal})`, ...r.eto },
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

  showResult(document.getElementById("aisho-result"), `
    <div class="result-hero" style="text-align:center">
      <span class="result-symbol">縁</span>
      <p class="result-eyebrow">COMPATIBILITY REPORT</p>
      <h3 class="result-title">${nameA} × ${nameB}</h3>
      <p class="result-keyword">${r.band}</p>
      <div class="total-score" style="margin-top:14px"><span class="num" data-count="${r.total}">0</span><span class="denom"> / 100</span></div>
      <p class="result-lead" style="margin-inline:auto">${r.advice}</p>
    </div>
    <div class="result-card span-all" style="margin-bottom:18px">
      ${cardH4("HOW IT WORKS", "総合スコアの計算式")}
      ${logicFlowHtml([
        { tag: "星座エレメント", main: String(r.zodiac.score), sub: "× 40%" },
        "+",
        { tag: "九星の五行", main: String(r.gogyo.score), sub: "× 30%" },
        "+",
        { tag: "干支の配置", main: String(r.eto.score), sub: "× 30%" },
        "=",
        { tag: "総合", main: String(r.total), sub: "/ 100", result: true },
      ])}
    </div>
    <div class="result-grid">${breakdown}</div>
    ${crossLinksHtml("aisho")}
  `);
});

/* ---------- 初期化 ---------- */
prefillForms(loadProfile());
renderHomeDaily();
updateStreak();

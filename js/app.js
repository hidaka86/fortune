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

function orderNav() {
  const nav = document.getElementById("nav");
  const myBtn = nav?.querySelector('[data-nav="mypage"]');
  if (!myBtn) return;
  if (loadProfile()?.birthdate) nav.insertBefore(myBtn, nav.children[1]);
  else nav.appendChild(myBtn);
}

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

  const daily = dailyFortune(p.birthdate);
  const verdict = dailyVerdict(p.birthdate);
  const visits = updateStreak() || {};
  const phase = moonPhaseToday();
  const d = new Date();
  const who = p.name ? `${esc(p.name)}さん` : "あなた";

  heroEl.classList.add("hero-member");
  heroContentEl.innerHTML = `
    <p class="hero-eyebrow">Today's Compass — ${d.getMonth() + 1}.${d.getDate()} ${phase.emoji}</p>
    <h1 class="hero-title hero-title-member"><span class="nw">おかえりなさい、</span><span class="nw">${who}。</span><br /><span class="nw">今日は<em>「${verdict.word}」</em>。</span></h1>
    <p class="hero-sub">${verdict.advice}</p>
    <div class="hero-score">
      <span><span class="hs-num">${daily.score100}</span><span class="hs-denom"> /100</span></span>
      ${starsHtml(Math.round(daily.total))}
      <span class="chip">「${daily.dayStar.name}」の日</span>
      <span class="chip">ラッキーカラー <strong>${daily.luckyColor}</strong></span>
      <span class="chip">連続 <strong>${visits.streak || 1}日目</strong>${(visits.streak || 1) >= 7 ? " 🔥" : ""}</span>
    </div>
    <p class="hero-action">今日の開運アクション — <strong>${daily.action}</strong></p>
    ${streakMilestone(visits.streak || 1) ? `<p class="milestone">${streakMilestone(visits.streak || 1)}</p>` : ""}
    <div class="hero-cta">
      <button class="btn btn-primary btn-lg" data-nav="mypage">今日の羅針盤をひらく</button>
      <button class="btn btn-ghost btn-lg" data-nav="tarot">今日の一枚を引く</button>
    </div>`;
}

/* ---------- 今日の結論(総合判定) ---------- */
function verdictHtml(v) {
  const rows = v.factors.map((f) => `
    <div class="vf-row">
      <span class="vf-vote ${f.score > 0 ? "up" : f.score < 0 ? "down" : "flat"}">${f.score > 0 ? "▲" : f.score < 0 ? "▼" : "―"}</span>
      <span class="vf-body"><span class="vf-method">${f.method}</span><strong>${f.label}</strong> — ${f.note}</span>
    </div>`).join("");
  return `
    <div class="result-card span-all verdict-card">
      ${cardH4("VERDICT", "今日の結論")}
      <div class="verdict-main">
        <span class="verdict-rank">${v.rank}</span>
        <div class="verdict-text">
          <p class="verdict-word">今日は「${v.word}」</p>
          <p class="verdict-advice">${v.advice}</p>
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
      <p class="result-eyebrow">MY PAGE — ${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${phase.emoji} ${phase.name}</p>
      <h3 class="result-title">おかえりなさい、${who}。</h3>
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

      <div class="result-card span-all">
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

      <div class="result-card span-all app-card">
        ${cardH4("APP", "ホーム画面に追加")}
        <p>Fortunaをホーム画面に追加すると、毎朝ワンタップで「今日の羅針盤」が開きます。</p>
        <div class="result-actions" style="margin-top:14px">
          <button class="btn btn-primary" id="install-app">アプリとして追加する</button>
        </div>
        <p class="sub app-ios-hint" style="margin-top:10px">iPhoneの方: Safariの共有ボタン → 「ホーム画面に追加」でインストールできます。</p>
      </div>

      <div class="result-card span-all">
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
const SITE_URL = "https://hidaka86.github.io/fortune/";
const lastShare = {}; // kind -> {eyebrow,title,sub,keywords,score,scoreLabel,x}

function buildInviteUrl(name, title) {
  const q = new URLSearchParams();
  if (name) q.set("in", name);
  q.set("it", title);
  return `${SITE_URL}?${q.toString()}`;
}

function shareButtonsHtml(kind) {
  return `<button class="btn btn-ghost" data-share-image="${kind}">シェア画像を保存</button>
    <button class="btn btn-ghost" data-share-x="${kind}">Xでシェア</button>`;
}

function shareRowHtml(kind) {
  return `
    <div class="share-block">
      <p class="share-label">— この結果、そのまま渡せます —</p>
      <div class="share-preview-slot" data-share-preview="${kind}"></div>
      <div class="result-actions" style="justify-content:center">${shareButtonsHtml(kind)}</div>
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
  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  try { await document.fonts.load('700 60px "Zen Old Mincho"'); } catch { /* fallback */ }
  const serif = '"Zen Old Mincho", "Hiragino Mincho ProN", serif';

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0d1d"); bg.addColorStop(1, "#171b3a");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.2 + Math.random() * 0.6;
    ctx.fillStyle = Math.random() < 0.22 ? "#edd9a3" : "#dce4ff";
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(217,179,106,.6)"; ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.strokeStyle = "rgba(217,179,106,.25)";
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.textAlign = "center";
  ctx.fillStyle = "#d9b36a";
  ctx.font = `600 26px ${serif}`;
  ctx.fillText("F O R T U N A", W / 2, 96);
  ctx.fillStyle = "#96a0b9";
  ctx.font = `500 19px ${serif}`;
  ctx.fillText(p.eyebrow || "", W / 2, 130);

  ctx.fillStyle = "#f0ede4";
  ctx.font = `700 56px ${serif}`;
  ctx.fillText(p.title, W / 2, 218);

  if (p.keywords?.length) {
    ctx.fillStyle = "#edd9a3";
    ctx.font = `600 30px ${serif}`;
    ctx.fillText(p.keywords.join("  ✦  "), W / 2, 282);
  }

  if (p.score != null) {
    ctx.fillStyle = "#96a0b9";
    ctx.font = `500 24px ${serif}`;
    ctx.fillText(p.scoreLabel || "今日の運気", W / 2, 348);
    ctx.fillStyle = "#edd9a3";
    ctx.font = `700 120px ${serif}`;
    ctx.fillText(String(p.score), W / 2, 462);
    ctx.fillStyle = "#96a0b9";
    ctx.font = `500 28px ${serif}`;
    ctx.fillText(p.scoreSuffix || "/100", W / 2 + 130, 456);
  } else if (p.sub) {
    ctx.fillStyle = "#c9cfe0";
    ctx.font = `500 28px ${serif}`;
    ctx.fillText(p.sub, W / 2, 400);
  }

  const d = new Date();
  ctx.fillStyle = "#d9b36a";
  ctx.font = `500 22px ${serif}`;
  ctx.fillText(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}  —  hidaka86.github.io/fortune`, W / 2, 556);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

document.addEventListener("click", async (e) => {
  const imgBtn = e.target.closest("[data-share-image]");
  if (imgBtn) {
    const p = lastShare[imgBtn.dataset.shareImage];
    if (!p) return;
    const orig = imgBtn.textContent;
    imgBtn.textContent = "生成中…";
    try {
      const blob = await makeShareCard(p);
      const file = new File([blob], `fortuna-${todayKey()}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Fortuna" });
      } else {
        const aEl = document.createElement("a");
        aEl.href = URL.createObjectURL(blob);
        aEl.download = file.name;
        aEl.click();
        setTimeout(() => URL.revokeObjectURL(aEl.href), 4000);
      }
      imgBtn.textContent = "保存しました ✓";
    } catch (err) {
      imgBtn.textContent = err?.name === "AbortError" ? orig : "生成できませんでした";
    }
    setTimeout(() => { imgBtn.textContent = orig; }, 1800);
    return;
  }
  const xBtn = e.target.closest("[data-share-x]");
  if (xBtn) {
    const p = lastShare[xBtn.dataset.shareX];
    if (!p) return;
    const url = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent((p.x || p.title) + "\n") + "&url=" + encodeURIComponent(p.url || SITE_URL);
    window.open(url, "_blank", "noopener");
  }
});

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
    eyebrow: "MY FORTUNE IDENTITY",
    title: `「${shogo.title}」`,
    keywords: [`${r.zodiac.name} × 日主${r.pillars.day.kan} × ${r.kyusei.name}`, "1080タイプにひとつの称号"],
    score: r.daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    x: `私の運命の称号は「${shogo.title}」— 1080タイプにひとつ。今日の運気は${r.daily.score100}/100 ✦ あなたの称号は?`,
    url: buildInviteUrl(r.name, shogo.title),
  };
  recordHistory("統合鑑定", `「${shogo.title}」— 運気${r.daily.score100}/100`, `${r.zodiac.name}×${r.kyusei.name}。導きの一枚「${r.card.name}(${ori})」。${r.themeComment}`);

  showResult(document.getElementById("integrated-result"), `
    <div class="result-hero">
      <span class="result-symbol">${r.zodiac.symbol}︎</span>
      <p class="result-eyebrow">INTEGRATED REPORT</p>
      <h3 class="result-title">${who}の統合鑑定書</h3>
      <div class="shogo">
        <p class="shogo-label">あなたの運命の称号</p>
        <p class="shogo-title">「${shogo.title}」</p>
        <p class="shogo-rarity">日主 × 太陽星座 × 本命星が織りなす、<strong>1080タイプ</strong>にひとつのあなた</p>
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
        <p class="share-label">— あなたの称号カード、そのまま渡せます —</p>
        <div class="share-preview-slot" data-share-preview="integrated"></div>
        <div class="result-actions">
          <button class="btn btn-ghost" data-copy="${esc(buildShareText(r))}">結果をコピー</button>
          ${shareButtonsHtml("integrated")}
        </div>
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
  renderSharePreview("integrated");
});

/* ---------- 星占い(太陽 × 月) ---------- */
document.getElementById("western-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const z = getZodiac(m, d);
  const moon = moonSign(y, m, d);
  const daily = dailyFortune(birthdate);

  lastShare.western = {
    eyebrow: "WESTERN ASTROLOGY",
    title: `太陽は${z.name}、月は${moon.name}`,
    keywords: [z.keyword],
    score: daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    x: `【Fortuna 星占い】太陽星座は${z.name}、月星座は${moon.name}。今日の運気は${daily.score100}/100 ✦`,
  };
  recordHistory("星占い", `太陽${z.name} × 月${moon.name}`, `${z.keyword}。今日の運気${daily.score100}/100。`);

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
      ${shareRowHtml("western")}
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
  renderSharePreview("western");
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

  lastShare.eastern = {
    eyebrow: "FOUR PILLARS & NINE STARS",
    title: `日主「${pillars.day.kan}」— ${pillars.nikkan.symbol}の人`,
    keywords: [kyusei.name, `${pillars.year.kan}${pillars.year.shi}年生まれ`],
    score: daily.score100, scoreLabel: "今日の運気", scoreSuffix: "/100",
    x: `【Fortuna 東洋占術】わたしの日主は「${pillars.day.kan}(${pillars.nikkan.symbol})」、本命星は${kyusei.name}でした ✦`,
  };
  recordHistory("東洋占術", `日主「${pillars.day.kan}」(${pillars.nikkan.symbol})`, `${kyusei.name}・${eto.animal}年。三柱: ${pillars.year.kan}${pillars.year.shi}/${pillars.month.kan}${pillars.month.shi}/${pillars.day.kan}${pillars.day.shi}。`);

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
        ${cardH4("TODAY", "今日の運気")}
        <div class="total-score"><span class="num" data-count="${daily.total.toFixed(1)}">0.0</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(daily.scores)}
        <div style="margin-top:18px">${todayLogicHtml(daily)}</div>
      </div>
    </div>
    ${crossLinksHtml("eastern")}
  `);
  renderSharePreview("eastern");
});

/* ---------- タロット ---------- */
const tarotBoard = document.getElementById("tarot-board");
const tarotSummary = document.getElementById("tarot-summary");
const tarotThemeSeg = document.getElementById("tarot-theme-seg");
const tarotSpreadSeg = document.getElementById("tarot-spread-seg");
const tarotGuide = document.getElementById("tarot-guide");
const tarotReset = document.getElementById("tarot-reset");

let tarotTheme = "daily";
let tarotSpread = 1;
let tarotCards = [];
let tarotPicked = 0;

const DAILY_CARD_KEY = "fortuna:dailycard";
const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const TAROT_ICONS = ["🃏","🎩","📖","👑","🏛","🔑","💞","🏇","🦁","🏮","🎡","⚖️","🙃","🦋","🏺","⛓","🗼","⭐","🌙","☀️","🎺","🌍"];

function themeMeaning(card) {
  const t = TAROT_THEMES[card.n]?.[tarotTheme];
  if (tarotTheme === "daily" || !t) return card.reversed ? card.rev : card.up;
  return card.reversed ? t.rev : t.up;
}

function loadDailyCard() {
  try {
    const v = JSON.parse(localStorage.getItem(DAILY_CARD_KEY));
    return v?.date === todayKey() ? v : null;
  } catch { return null; }
}

function saveDailyCard(c) {
  try { localStorage.setItem(DAILY_CARD_KEY, JSON.stringify({ date: todayKey(), n: c.n, reversed: c.reversed })); } catch { /* noop */ }
}

function revealedCardHtml(c) {
  return `
    <div class="tarot-reveal ${c.reversed ? "is-rev" : ""}">
      <span class="no">${ROMAN[c.n]}</span>
      <span class="sym">${TAROT_ICONS[c.n]}</span>
      <span class="nm">${c.name}</span>
      <span class="en">${c.en}</span>
      <span class="ori ${c.reversed ? "rev" : "up"}">${c.reversed ? "逆位置" : "正位置"}</span>
    </div>`;
}

function currentSpreadConf() {
  return TAROT_SPREADS[tarotTheme].spreads[tarotSpread];
}

function renderTarotBoard(allRevealed) {
  const conf = currentSpreadConf();
  const slots = tarotCards.map((c, i) => `
    <div class="tarot-slot">
      <div class="tarot-slot-label">${conf.en[i]}<small>${conf.ja[i]}</small></div>
      <div class="tarot-slot-body" data-slot="${i}">
        ${(allRevealed || i < tarotPicked) ? revealedCardHtml(c) : '<div class="tarot-slot-empty">✦</div>'}
      </div>
    </div>`).join("");

  const remaining = tarotCards.length - tarotPicked;
  const fan = (!allRevealed && remaining > 0) ? `
    <p class="fan-instruction">カードが呼んでいます — 直感で <strong>${remaining}</strong> 枚選んでください</p>
    <div class="deck-fan">${Array.from({ length: 16 }, (_, k) => {
      const r = (k - 7.5) * 3.2;
      const y = Math.abs(k - 7.5) * 5;
      return `<button class="fan-card" data-k="${k}" style="--r:${r}deg;--y:${y}px;--d:${(k * 0.19).toFixed(2)}s" aria-label="カードを選ぶ">✦</button>`;
    }).join("")}</div>` : "";

  tarotBoard.innerHTML = `<div class="tarot-slots">${slots}</div>${fan}`;
}

function dealTarot() {
  const theme = TAROT_SPREADS[tarotTheme];
  const spreads = Object.keys(theme.spreads).map(Number);
  if (!spreads.includes(tarotSpread)) tarotSpread = spreads[0];

  tarotSpreadSeg.style.visibility = spreads.length > 1 ? "visible" : "hidden";
  tarotSpreadSeg.querySelectorAll(".seg-btn").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.spread) === tarotSpread);
  });
  tarotGuide.textContent = theme.guide;
  tarotSummary.hidden = true;

  if (theme.once) {
    const saved = loadDailyCard();
    if (saved) {
      const base = TAROT.find((t) => t.n === saved.n);
      tarotCards = [{ ...base, reversed: saved.reversed }];
      tarotPicked = 1;
      renderTarotBoard(true);
      showTarotSummary(true);
      tarotReset.disabled = true;
      tarotReset.textContent = "また明日、新しい一枚を";
      return;
    }
    tarotReset.disabled = true;
    tarotReset.textContent = "今日の一枚は1日1回";
  } else {
    tarotReset.disabled = false;
    tarotReset.textContent = "カードを引き直す";
  }

  tarotCards = drawTarot(tarotSpread);
  tarotPicked = 0;
  renderTarotBoard(false);
}

tarotBoard.addEventListener("click", (e) => {
  const fanCard = e.target.closest(".fan-card");
  if (!fanCard || fanCard.classList.contains("fan-taken")) return;
  fanCard.classList.add("fan-taken");

  const card = tarotCards[tarotPicked];
  const slotBody = tarotBoard.querySelector(`[data-slot="${tarotPicked}"]`);
  tarotPicked++;

  setTimeout(() => {
    if (slotBody) slotBody.innerHTML = revealedCardHtml(card);
    const inst = tarotBoard.querySelector(".fan-instruction strong");
    if (inst) inst.textContent = tarotCards.length - tarotPicked;

    if (tarotPicked === tarotCards.length) {
      if (TAROT_SPREADS[tarotTheme].once) saveDailyCard(card);
      const fanEl = tarotBoard.querySelector(".deck-fan");
      const instEl = tarotBoard.querySelector(".fan-instruction");
      fanEl?.classList.add("fan-done");
      if (instEl) instEl.textContent = "カードが出そろいました…";
      setTimeout(() => showTarotSummary(false), 1100);
    }
  }, 240);
});

function tarotOverallHtml() {
  if (tarotCards.length < 3) return "";
  const revCount = tarotCards.filter((c) => c.reversed).length;
  const tone = [
    "三枚とも正位置。強い追い風が吹いています。迷いを手放して、そのまま進んで大丈夫。",
    "おおむね順調な流れです。逆位置のカードが示す一点だけ整えれば、道はまっすぐ開けます。",
    "行きつ戻りつの時期。焦って進めるより、逆位置のカードが示す課題から順に片付けるのが近道です。",
    "三枚とも逆位置。いまは動くより整える時。この時期を丁寧に過ごした人から、流れは変わりはじめます。",
  ][revCount];
  return `
    <div class="result-card span-all">
      ${cardH4("OVERALL", "全体の流れ")}
      <p>${tone}</p>
    </div>`;
}

function showTarotSummary(restored) {
  const conf = currentSpreadConf();
  const themeLabel = TAROT_SPREADS[tarotTheme].label;

  const cardsLabel = tarotCards.map((c) => `${c.name}(${c.reversed ? "逆" : "正"})`);
  lastShare.tarot = {
    eyebrow: `TAROT — ${themeLabel}`,
    title: tarotTheme === "daily" ? "今日のわたしへの一枚" : `「${themeLabel}」の答え`,
    keywords: cardsLabel,
    sub: (tarotCards[0].reversed ? tarotCards[0].rev : tarotCards[0].up).split("・")[0],
    x: `【Fortuna タロット・${themeLabel}】引いたのは ${cardsLabel.join("、")} ✦`,
  };
  if (!restored) {
    recordHistory(`タロット(${themeLabel})`, cardsLabel.join(" / "),
      tarotCards.map((c, i) => `${conf.ja[i]}: ${c.name}(${c.reversed ? "逆位置" : "正位置"}) — ${themeMeaning(c)}`).join(" "));
  }
  const items = tarotCards.map((c, i) => `
    <div class="result-card">
      ${cardH4(conf.en[i], conf.ja[i])}
      <p><strong style="color:var(--gold-bright)">${c.name}(${c.reversed ? "逆位置" : "正位置"})</strong></p>
      <p style="margin-top:8px">${themeMeaning(c)}</p>
      <p class="sub" style="margin-top:12px">${c.advice}</p>
    </div>`).join("");

  const dailyNote = TAROT_SPREADS[tarotTheme].once ? `
    <div class="result-card span-all daily-note">
      <p>${restored ? "今日の一枚は、すでにあなたのそばにあります。" : "これが、今日のあなたの一枚。"}カードの言葉を一日の中で確かめてみてください。引き直しはできません — <strong>また明日、新しい一枚を。</strong></p>
    </div>` : "";

  showResult(tarotSummary, `
    <div class="result-hero" style="text-align:center">
      <span class="result-symbol">☾</span>
      <p class="result-eyebrow">TAROT — ${themeLabel}</p>
      <h3 class="result-title">${tarotTheme === "daily" ? "今日のあなたへの一枚" : `「${themeLabel}」の答え`}</h3>
      <p class="result-lead" style="margin-inline:auto">正位置はエネルギーが素直に巡っている状態、逆位置は不安やエゴが混ざっている状態を表します。</p>
      ${shareRowHtml("tarot")}
    </div>
    <div class="result-grid">${items}${tarotOverallHtml()}${dailyNote}</div>
    ${crossLinksHtml("tarot")}
  `);
  renderSharePreview("tarot");
}

tarotThemeSeg.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    tarotThemeSeg.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tarotTheme = btn.dataset.theme;
    tarotSpread = tarotTheme === "daily" ? 1 : 3;
    dealTarot();
  });
});
tarotSpreadSeg.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    tarotSpread = Number(btn.dataset.spread);
    dealTarot();
  });
});
tarotReset.addEventListener("click", dealTarot);
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

  lastShare.palm = {
    eyebrow: "PALMISTRY",
    title: "手のひらに刻まれた資質",
    keywords: readings.map(({ q, opt }) => `${q.name}:${opt.label}`).slice(0, 2),
    sub: readings[0].opt.text.split("。")[0] + "。",
    x: `【Fortuna 手相】${readings.map(({ q, opt }) => q.name + "は「" + opt.label + "」").join("、")}でした ✦`,
  };
  recordHistory("手相", readings.map(({ q, opt }) => `${q.name}:${opt.label}`).join(" / "), readings.map(({ opt }) => opt.text).join(" "));

  showResult(document.getElementById("palm-result"), `
    <div class="result-hero">
      <span class="result-symbol">掌</span>
      <p class="result-eyebrow">PALMISTRY REPORT</p>
      <h3 class="result-title">手のひらに刻まれた、あなたの資質。</h3>
      <p class="result-lead">四つの線から読み取れる生まれ持った資質です。手相は生き方とともに変化します——季節がめぐる頃、また確かめてみてください。</p>
      ${shareRowHtml("palm")}
    </div>
    <div class="result-grid">${cards}</div>
    ${crossLinksHtml("palm")}
  `);
  renderSharePreview("palm");
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
  const keyword = aishoKeyword(r);
  const fromA = perspectiveCompat(r.a, r.b, nameA, nameB);
  const fromB = perspectiveCompat(r.b, r.a, nameB, nameA);
  const shogoA = fortuneTitle(fd.get("birthdate1"));
  const shogoB = fortuneTitle(fd.get("birthdate2"));
  addToCollection(shogoA.title, r.a.name || "あなた");
  addToCollection(shogoB.title, r.b.name || "お相手");

  lastShare.aisho = {
    eyebrow: "COMPATIBILITY",
    title: `「${keyword}」`,
    keywords: [`${shogoA.title} × ${shogoB.title}`],
    score: r.total, scoreLabel: "ふたりの相性", scoreSuffix: "/100",
    x: `「${shogoA.title}」と「${shogoB.title}」の相性は ${r.total}/100 —「${keyword}」でした ✦ あなたたちは?`,
    url: buildInviteUrl(r.a.name, shogoA.title),
  };
  recordHistory("相性診断", `${nameA} × ${nameB} — ${r.total}/100`, `「${keyword}」(${r.band})。${r.advice}`);

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
  renderSharePreview("aisho");
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
      <button class="btn btn-primary" data-nav="integrated">30秒で自分の称号を知る</button>
    </div>`;
}

/* ---------- 初期化 ---------- */
prefillForms(loadProfile());
renderHomeDaily();
renderInviteBanner();
updateStreak();

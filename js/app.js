/* Fortuna — UIロジック */

/* ---------- ナビゲーション ---------- */
const views = document.querySelectorAll(".view");
const navBtns = document.querySelectorAll(".nav-btn");

function navigate(target) {
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${target}`));
  navBtns.forEach((b) => b.classList.toggle("active", b.dataset.nav === target));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-nav]");
  if (el) {
    e.preventDefault();
    navigate(el.dataset.nav);
  }
});

/* ---------- 今日の日付バナー ---------- */
(function renderToday() {
  const d = new Date();
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  document.getElementById("today-banner").textContent =
    `✦ ${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week}) の運勢をお届けしています ✦`;
})();

/* ---------- 共通レンダリング部品 ---------- */
function starsHtml(score) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= score ? "" : "off"}">★</span>`;
  }
  return `<span class="stars">${html}</span>`;
}

function metersHtml(scores) {
  const labels = { love: "恋愛運", work: "仕事運", money: "金運", health: "健康運" };
  return `<div class="meter-list">${Object.entries(scores).map(([k, v]) => `
    <div class="meter">
      <span class="meter-label">${labels[k]}</span>
      <div class="meter-track"><div class="meter-fill" data-w="${v * 20}"></div></div>
      <span class="meter-value">${v}.0</span>
    </div>`).join("")}</div>`;
}

function luckyHtml(daily) {
  return `<div class="lucky-grid">
    <div class="lucky-item"><span class="k">LUCKY COLOR</span><span class="v">${daily.luckyColor}</span></div>
    <div class="lucky-item"><span class="k">LUCKY ITEM</span><span class="v">${daily.luckyItem}</span></div>
    <div class="lucky-item"><span class="k">LUCKY PLACE</span><span class="v">${daily.luckyPlace}</span></div>
    <div class="lucky-item"><span class="k">LUCKY NUMBER</span><span class="v">${daily.luckyNumber}</span></div>
  </div>`;
}

function animateMeters(container) {
  requestAnimationFrame(() => {
    container.querySelectorAll(".meter-fill").forEach((el) => {
      requestAnimationFrame(() => { el.style.width = `${el.dataset.w}%`; });
    });
  });
}

function showResult(el, html) {
  el.innerHTML = html;
  el.hidden = false;
  animateMeters(el);
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- プロフィール記憶(localStorage) ---------- */
const PROFILE_KEY = "fortuna:profile";

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; }
  catch { return null; }
}

function saveProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* private mode等は無視 */ }
}

function prefillForms(p) {
  if (!p?.birthdate) return;
  document.querySelectorAll('input[name="birthdate"]').forEach((el) => { el.value = p.birthdate; });
  const aisho1 = document.querySelector('#aisho-form input[name="birthdate1"]');
  if (aisho1) aisho1.value = p.birthdate;
  const nameInput = document.querySelector('#integrated-form input[name="name"]');
  if (nameInput && p.name) nameInput.value = p.name;
  const aishoName = document.querySelector('#aisho-form input[name="name1"]');
  if (aishoName && p.name) aishoName.value = p.name;
  if (p.theme) {
    const themeSel = document.querySelector('#integrated-form select[name="theme"]');
    if (themeSel) themeSel.value = p.theme;
  }
}

/* ---------- ホーム「今日のあなた」ミニカード ---------- */
function renderHomeDaily() {
  const el = document.getElementById("home-daily");
  const p = loadProfile();
  if (!p?.birthdate) { el.innerHTML = ""; return; }
  const [, m, d] = p.birthdate.split("-").map(Number);
  const z = getZodiac(m, d);
  const daily = dailyFortune(p.birthdate);
  const who = p.name ? `${esc(p.name)}さん` : "あなた";
  el.innerHTML = `
    <div class="home-daily-card">
      <div class="home-daily-left">
        <span class="home-daily-symbol">${z.symbol}︎</span>
        <div>
          <p class="home-daily-title">${who}の今日の運気</p>
          <p class="home-daily-sub">${z.name} ・ ラッキーカラーは${daily.luckyColor}</p>
        </div>
      </div>
      <div class="home-daily-right">
        <span class="home-daily-score">${daily.total.toFixed(1)}<small> / 5.0</small></span>
        <button class="btn btn-ghost" data-nav="integrated">詳しく見る</button>
      </div>
    </div>`;
}

/* ---------- 結果コピー ---------- */
function buildShareText(r) {
  const ori = r.card.reversed ? "逆位置" : "正位置";
  return [
    `【Fortuna 統合鑑定】${r.name ? r.name + "さん" : ""}`,
    `☉ ${r.zodiac.name}(${r.zodiac.keyword}) × ☯ ${r.kyusei.name}`,
    `干支: ${r.jikkan}${r.eto.name}(${r.eto.animal})`,
    `今日の運気: ${r.daily.total.toFixed(1)} / 5.0`,
    `導きの一枚: ${r.card.name}(${ori}) — ${r.card.advice}`,
    `ラッキーカラー: ${r.daily.luckyColor} / ラッキーアイテム: ${r.daily.luckyItem}`,
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

/* ---------- 統合鑑定 ---------- */
document.getElementById("integrated-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const r = integratedReading({
    name: fd.get("name")?.trim(),
    birthdate: fd.get("birthdate"),
    theme: fd.get("theme"),
  });

  saveProfile({ name: r.name, birthdate: fd.get("birthdate"), theme: r.theme });
  renderHomeDaily();

  const who = r.name ? `${esc(r.name)}さん` : "あなた";
  const ori = r.card.reversed ? "逆位置" : "正位置";
  const cardMeaning = r.card.reversed ? r.card.rev : r.card.up;

  showResult(document.getElementById("integrated-result"), `
    <div class="result-hero">
      <div class="result-symbol">${r.zodiac.symbol}︎</div>
      <h3 class="result-title">${who}の統合鑑定レポート</h3>
      <p class="result-keyword">${r.zodiac.keyword} × ${r.kyusei.name}</p>
      <div class="chip-row">
        <span class="chip">☉ ${r.zodiac.name}(${r.zodiac.element})</span>
        <span class="chip">☯ ${r.jikkan}${r.eto.name}年・${r.eto.animal}</span>
        <span class="chip">★ ${r.kyusei.name}</span>
      </div>
      <p class="result-lead">${r.elementNote}</p>
      <div class="chip-row" style="margin-top:18px">
        <button class="btn btn-ghost" data-copy="${esc(buildShareText(r))}">結果をコピーして共有</button>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-card">
        <h4>PERSONALITY — 西洋 × 東洋が示す本質</h4>
        <p>${r.zodiac.trait}</p>
        <p class="sub" style="margin-top:10px">${r.kyusei.trait}</p>
      </div>
      <div class="result-card">
        <h4>TODAY'S SCORE — 今日の運気</h4>
        <div class="total-score"><span class="num">${r.daily.total.toFixed(1)}</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(r.daily.scores)}
      </div>
      <div class="result-card">
        <h4>TAROT MESSAGE — 導きの一枚</h4>
        <p><strong>${r.card.name}(${ori})</strong> — ${cardMeaning}</p>
        <p class="sub" style="margin-top:10px">${r.card.advice}</p>
      </div>
      <div class="result-card">
        <h4>FOCUS — ${THEME_LABEL[r.theme]}のアドバイス</h4>
        <p>${THEME_LABEL[r.theme]} ${starsHtml(r.themeScore)}</p>
        <p class="sub" style="margin-top:10px">${r.themeComment}</p>
      </div>
      <div class="result-card" style="grid-column: 1 / -1">
        <h4>LUCKY GUIDE — 今日の開運キー</h4>
        ${luckyHtml(r.daily)}
      </div>
    </div>
  `);
});

/* ---------- 西洋占星術 ---------- */
document.getElementById("western-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [, m, d] = birthdate.split("-").map(Number);
  const z = getZodiac(m, d);
  const daily = dailyFortune(birthdate);

  showResult(document.getElementById("western-result"), `
    <div class="result-hero">
      <div class="result-symbol">${z.symbol}︎</div>
      <h3 class="result-title">${z.name} <span style="font-size:.55em;color:var(--muted)">${z.en}</span></h3>
      <p class="result-keyword">${z.keyword}</p>
      <div class="chip-row">
        <span class="chip">エレメント <strong>${z.element}</strong></span>
        <span class="chip">守護星 <strong>${z.planet}</strong></span>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-card">
        <h4>PERSONALITY — 星が示す本質</h4>
        <p>${z.trait}</p>
      </div>
      <div class="result-card">
        <h4>TODAY'S SCORE — 今日の運気</h4>
        <div class="total-score"><span class="num">${daily.total.toFixed(1)}</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(daily.scores)}
      </div>
      <div class="result-card" style="grid-column: 1 / -1">
        <h4>LUCKY GUIDE — 今日の開運キー</h4>
        ${luckyHtml(daily)}
      </div>
    </div>
  `);
});

/* ---------- 東洋占術 ---------- */
document.getElementById("eastern-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdate = new FormData(e.target).get("birthdate");
  const [y, m, d] = birthdate.split("-").map(Number);
  const eto = getEto(y, m, d);
  const jikkan = getJikkan(y, m, d);
  const kyusei = getKyusei(y, m, d);
  const daily = dailyFortune(`${birthdate}::east`);

  showResult(document.getElementById("eastern-result"), `
    <div class="result-hero">
      <div class="result-symbol" style="color:${kyusei.color}">☯</div>
      <h3 class="result-title">${kyusei.name}</h3>
      <p class="result-keyword">${jikkan}${eto.name}年生まれ(${eto.animal}年)</p>
      <div class="chip-row">
        <span class="chip">五行 <strong>${kyusei.element}</strong></span>
        <span class="chip">干支 <strong>${jikkan}${eto.name}</strong></span>
      </div>
      <p class="result-lead" style="text-align:center">※ 立春(2月4日頃)より前の生まれは前年の干支・九星で鑑定しています。</p>
    </div>
    <div class="result-grid">
      <div class="result-card">
        <h4>HONMEI — 本命星が示す気質</h4>
        <p>${kyusei.trait}</p>
      </div>
      <div class="result-card">
        <h4>ETO — 干支が示す性格</h4>
        <p>${eto.trait}</p>
      </div>
      <div class="result-card" style="grid-column: 1 / -1">
        <h4>TODAY'S SCORE — 今日の運気</h4>
        <div class="total-score"><span class="num">${daily.total.toFixed(1)}</span><span class="denom"> / 5.0</span></div>
        ${metersHtml(daily.scores)}
      </div>
    </div>
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
    setTimeout(showTarotSummary, 750);
  }
});

function showTarotSummary() {
  const items = tarotCards.map((c, i) => {
    const meaning = c.reversed ? c.rev : c.up;
    return `
      <div class="result-card">
        <h4>${SPREAD_LABELS[tarotSpread][i]} — ${SPREAD_LABELS_JA[tarotSpread][i]}</h4>
        <p><strong>${c.name}(${c.reversed ? "逆位置" : "正位置"})</strong></p>
        <p class="sub" style="margin-top:6px">${meaning}</p>
        <p style="margin-top:10px">${c.advice}</p>
      </div>`;
  }).join("");
  tarotSummary.innerHTML = `<div class="result-grid">${items}</div>`;
  tarotSummary.hidden = false;
  tarotSummary.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

// 質問に触れたら該当の線をハイライト
palmQuestionsEl.addEventListener("change", (e) => {
  const q = e.target.closest(".palm-q");
  if (!q) return;
  document.querySelectorAll(".palm-line").forEach((l) => l.classList.remove("hl"));
  document.getElementById(q.dataset.line)?.classList.add("hl");
  document.getElementById("palm-hint").textContent =
    `${PALM_QUESTIONS.find((p) => p.lineId === q.dataset.line)?.name}をハイライト中`;
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
    { title: "ZODIAC — 星座エレメント", pair: `${r.a.zodiac.name}(${r.a.zodiac.element}) × ${r.b.zodiac.name}(${r.b.zodiac.element})`, ...r.zodiac },
    { title: "GOGYO — 九星の五行", pair: `${r.a.kyusei.name} × ${r.b.kyusei.name}`, ...r.gogyo },
    { title: "ETO — 干支の配置", pair: `${r.a.eto.name}(${r.a.eto.animal}) × ${r.b.eto.name}(${r.b.eto.animal})`, ...r.eto },
  ].map((x) => `
    <div class="result-card">
      <h4>${x.title}</h4>
      <p><strong>${x.pair}</strong></p>
      <div class="meter" style="margin-top:10px">
        <span class="meter-label">相性度</span>
        <div class="meter-track"><div class="meter-fill" data-w="${x.score}"></div></div>
        <span class="meter-value">${x.score}</span>
      </div>
      <p class="sub" style="margin-top:10px">${x.note}</p>
    </div>`).join("");

  showResult(document.getElementById("aisho-result"), `
    <div class="result-hero">
      <div class="result-symbol">♥</div>
      <h3 class="result-title">${nameA} × ${nameB}</h3>
      <p class="result-keyword">${r.band}</p>
      <div class="total-score" style="margin-top:10px"><span class="num">${r.total}</span><span class="denom"> / 100</span></div>
      <p class="result-lead" style="text-align:center">${r.advice}</p>
    </div>
    <div class="result-grid">${breakdown}</div>
  `);
});

/* ---------- 初期化:保存済みプロフィールの反映 ---------- */
prefillForms(loadProfile());
renderHomeDaily();

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
      <h4>${q.name} — ${opt.label}</h4>
      <p>${opt.text}</p>
    </div>
  `).join("");

  showResult(document.getElementById("palm-result"), `
    <div class="result-hero">
      <div class="result-symbol">✋</div>
      <h3 class="result-title">手相診断レポート</h3>
      <p class="result-lead" style="text-align:center">4つの線から読み取れる、あなたの生まれ持った資質です。手相は変化するもの——定期的にチェックしてみてください。</p>
    </div>
    <div class="result-grid">${cards}</div>
  `);
});

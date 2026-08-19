/* MYOURISCOPE — LPの入口に生年月日フォームを置く(導線の短縮)
 *
 * これまで: LPを読む → CTA →(遷移)→ アプリのフォームを見る → 生年月日を入れる → 結果
 *           = 検索から来た人が結果に着くまでに「離脱できる箇所」が3つあった。
 * これから: LPで生年月日を入れる →(遷移)→ そのまま結果。
 *
 * - JSが動かない環境では既存のリンクCTAがそのまま残る(プログレッシブエンハンスメント)。
 * - 生年月日は localStorage の fortuna:profile に入るだけ。サーバーには送らない。
 * - 計測は analytics.js の ms.track に寄せる。
 */
(function () {
  "use strict";

  /* 生年月日が要る行き先だけ。#tarot(不要)と #aisho(ふたり分)は対象外 */
  const NEEDS_BIRTH = {
    "#today": { label: "今日の占いをみる", note: "生年月日だけ。結果はすぐに開きます。" },
    "#western": { label: "ホロスコープを観る", note: "生年月日だけ。出生時刻は結果画面で足せます。" },
    "#eastern": { label: "命式を観る", note: "生年月日だけ。命式と今日の気流が出ます。" },
    "#integrated": { label: "運命の称号を観る", note: "生年月日だけ。1080通りからあなたの二つ名を。" },
  };

  const cta = document.querySelector(".lp-cta");
  const link = cta && cta.querySelector("a.btn-observe");
  if (!cta || !link) return;

  const href = link.getAttribute("href") || "";
  const hash = href.slice(href.indexOf("#"));
  const conf = NEEDS_BIRTH[hash];
  if (!conf) return;

  const PROFILE_KEY = "fortuna:profile";
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; } catch { return null; }
  }
  function saveProfile(p) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* private mode */ }
  }
  function track(name, params) {
    if (window.ms && window.ms.track) window.ms.track(name, params);
  }
  function go(from) {
    track("lp_form_submit", { to: hash, from: from });
    location.href = "/?ms=go" + hash;
  }

  const saved = loadProfile();

  /* --- 既に生年月日がある人には、入力させずに1タップで --- */
  if (saved && saved.birthdate) {
    const [y, m, d] = saved.birthdate.split("-").map(Number);
    const box = document.createElement("div");
    box.className = "lp-form lp-form-resume";
    box.innerHTML =
      '<p class="lp-form-known">記憶している生年月日 <strong>' + y + "年" + m + "月" + d + "日</strong></p>" +
      '<button class="btn-observe" type="button" data-lp-go><span class="bo-mark" aria-hidden="true">◉</span>' + conf.label + "</button>" +
      '<button class="lp-form-edit" type="button" data-lp-edit>生年月日を変更する</button>';
    cta.insertBefore(box, link);
    link.hidden = true;
    box.querySelector("[data-lp-go]").addEventListener("click", function () { go("resume"); });
    box.querySelector("[data-lp-edit]").addEventListener("click", function () { box.remove(); buildForm(saved); });
    track("lp_form_view", { to: hash, state: "resume" });
    return;
  }

  buildForm(null);

  function buildForm(prev) {
    const thisYear = new Date().getFullYear();
    let yopts = '<option value="">年</option>';
    for (let y = thisYear; y >= 1920; y--) yopts += '<option value="' + y + '">' + y + "</option>";
    let mopts = '<option value="">月</option>';
    for (let m = 1; m <= 12; m++) mopts += '<option value="' + m + '">' + m + "</option>";

    const form = document.createElement("form");
    form.className = "lp-form";
    form.innerHTML =
      '<p class="lp-form-title">生年月日を入れると、このまま結果まで進みます</p>' +
      '<div class="bd-select">' +
      '<select class="bd-y" aria-label="生まれた年" required>' + yopts + "</select>" +
      '<select class="bd-m" aria-label="生まれた月" required>' + mopts + "</select>" +
      '<select class="bd-d" aria-label="生まれた日" required><option value="">日</option></select>' +
      "</div>" +
      '<button class="btn-observe" type="submit"><span class="bo-mark" aria-hidden="true">◉</span>' + conf.label + "</button>" +
      '<p class="lp-form-note">' + conf.note + " 入力は端末の中だけに保存され、サーバーには送られません。</p>";
    cta.insertBefore(form, link);
    link.hidden = true;

    const ySel = form.querySelector(".bd-y");
    const mSel = form.querySelector(".bd-m");
    const dSel = form.querySelector(".bd-d");

    function rebuildDays() {
      const y = Number(ySel.value) || 2000;
      const m = Number(mSel.value) || 1;
      const days = new Date(y, m, 0).getDate();
      const cur = dSel.value;
      let dopts = '<option value="">日</option>';
      for (let d = 1; d <= days; d++) dopts += '<option value="' + d + '">' + d + "</option>";
      dSel.innerHTML = dopts;
      if (cur && Number(cur) <= days) dSel.value = cur;
    }
    rebuildDays();

    let touched = false;
    form.addEventListener("change", function () {
      rebuildDays();
      if (!touched) { touched = true; track("lp_form_start", { to: hash }); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const y = ySel.value, m = mSel.value, d = dSel.value;
      if (!y || !m || !d) {
        form.querySelector(".bd-select").classList.add("bd-invalid");
        track("lp_form_error", { to: hash, reason: "incomplete" });
        return;
      }
      const birthdate = y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      saveProfile({ name: (prev && prev.name) || "", birthdate: birthdate, theme: (prev && prev.theme) || "total" });
      go(prev ? "edit" : "new");
    });

    track("lp_form_view", { to: hash, state: prev ? "edit" : "empty" });
  }
})();

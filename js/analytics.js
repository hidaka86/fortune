/* MYOURISCOPE — 計測レイヤー(GA4共通)
 *
 * 目的: 「どのページから入って、どこで止まったのか」をGA4だけで追えるようにする。
 * SPA本体(index.html)と検索流入用の静的LPの両方から読み込む。
 * gtag自体の読み込みは各ページのhead(既存)が担当。ここはイベントの語彙を揃える層。
 *
 * 送るもの
 *   - 共通パラメータ: page_kind / entry_page / entry_kind / visitor / has_profile
 *   - 自動イベント: scroll_depth / dwell / cta_click / internal_link_click / faq_open
 *   - 手動イベント: ms.track(name, params) を app.js から呼ぶ
 *
 * 個人情報(生年月日・名前)は絶対に送らない。送るのは「入力済みか否か」まで。
 */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  /* ---------- ページの種別(検索流入の面ごとに分けて見るため) ---------- */
  function pageKind(path) {
    if (/^\/(index\.html)?$/.test(path)) return "app";
    if (/^\/tarot\/cards\/[^/]+\/$/.test(path)) return "lp_tarot_card";
    if (/^\/tarot\/cards\/$/.test(path)) return "hub_tarot_cards";
    if (/^\/seiza\/[^/]+\/$/.test(path)) return "lp_sign";
    if (/^\/seiza\/$/.test(path)) return "hub_seiza";
    if (/^\/aisho\/seiza\/[^/]+\/$/.test(path)) return "lp_aisho_pair";
    if (/^\/aisho\/seiza\/$/.test(path)) return "hub_aisho_seiza";
    if (/^\/kyusei\/[^/]+\/$/.test(path)) return "lp_kyusei";
    if (/^\/kyusei\/$/.test(path)) return "hub_kyusei";
    if (/^\/(today|tarot|horoscope|shichusuimei|aisho|shogo)\/$/.test(path)) return "lp_divination";
    return "other";
  }

  /* ページを表す短いID(GA4のレポートで並べやすいように) */
  function pageId(path) {
    const p = path.replace(/^\/|\/$/g, "");
    return p === "" || p === "index.html" ? "app_home" : p.replace(/\//g, "_");
  }

  const PATH = location.pathname;
  const KIND = pageKind(PATH);
  const ID = pageId(PATH);

  /* ---------- セッション最初の入口を覚える(LP→アプリの越境を追う) ---------- */
  const ENTRY_KEY = "ms:entry";
  let entry = null;
  try { entry = JSON.parse(sessionStorage.getItem(ENTRY_KEY)); } catch { entry = null; }
  if (!entry || !entry.id) {
    entry = { id: ID, kind: KIND, q: (new URLSearchParams(location.search)).get("utm_source") || "" };
    try { sessionStorage.setItem(ENTRY_KEY, JSON.stringify(entry)); } catch { /* private mode */ }
  }

  /* ---------- 訪問者の状態(個人情報は含めない) ---------- */
  function hasProfile() {
    try { return !!(JSON.parse(localStorage.getItem("fortuna:profile")) || {}).birthdate; }
    catch { return false; }
  }
  function streakBucket() {
    let v = null;
    try { v = JSON.parse(localStorage.getItem("fortuna:visits")); } catch { /* noop */ }
    const n = (v && v.streak) || 0;
    return n === 0 ? "0" : n === 1 ? "1" : n <= 3 ? "2-3" : n <= 6 ? "4-6" : n <= 13 ? "7-13" : "14+";
  }
  const RETURNING_KEY = "ms:seen";
  let visitor = "new";
  try {
    visitor = localStorage.getItem(RETURNING_KEY) ? "returning" : "new";
    localStorage.setItem(RETURNING_KEY, "1");
  } catch { /* noop */ }

  /* ---------- 送信 ---------- */
  function common() {
    return {
      page_kind: KIND,
      page_id: ID,
      entry_page: entry.id,
      entry_kind: entry.kind,
      visitor: visitor,
      has_profile: hasProfile() ? "yes" : "no",
    };
  }

  function track(name, params) {
    const p = Object.assign(common(), params || {});
    if (typeof window.gtag === "function") window.gtag("event", name, p);
    if (window.MS_DEBUG) console.log("[ms]", name, p);
  }

  gtag("set", "user_properties", { visitor_type: visitor, profile_saved: hasProfile() ? "yes" : "no", streak_bucket: streakBucket() });

  /* ---------- スクロール深度(記事が読まれたかどうか) ---------- */
  const marks = [25, 50, 75, 90];
  let hit = 0;
  function onScroll() {
    const h = document.documentElement;
    const max = Math.max(1, h.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.round(((window.scrollY || h.scrollTop) / max) * 100));
    while (hit < marks.length && pct >= marks[hit]) {
      track("scroll_depth", { percent: marks[hit] });
      hit++;
    }
    if (hit >= marks.length) window.removeEventListener("scroll", onScroll);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 滞在(離脱前に一度だけ、秒数のバケットで) ---------- */
  const t0 = Date.now();
  let dwellSent = false;
  function sendDwell() {
    if (dwellSent) return;
    dwellSent = true;
    const s = Math.round((Date.now() - t0) / 1000);
    const bucket = s < 5 ? "0-4s" : s < 15 ? "5-14s" : s < 30 ? "15-29s" : s < 60 ? "30-59s" : s < 180 ? "60-179s" : "180s+";
    track("dwell", { seconds: s, bucket: bucket, max_scroll: marks[Math.max(0, hit - 1)] || 0 });
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") sendDwell(); });
  window.addEventListener("pagehide", sendDwell);

  /* ---------- クリック(委譲・LPもアプリも同じ語彙で) ---------- */
  function linkGroup(el) {
    if (el.closest(".lp-cta") || el.classList.contains("btn-observe")) return "cta";
    if (el.closest(".lp-related-grid")) return "related";
    if (el.closest(".footer-nav")) return "footer";
    if (el.closest(".lp-nav")) return "header_nav";
    if (el.closest(".lp-breadcrumb")) return "breadcrumb";
    if (el.closest(".tc-nav")) return "card_nav";
    if (el.closest(".guide-article")) return "in_article";
    return "other";
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("javascript:")) return;
    if (/^https?:/.test(href) && a.hostname !== location.hostname) {
      track("outbound_click", { link_url: href });
      return;
    }
    const group = linkGroup(a);
    // 「/」「/#today」「#tarot」= アプリ本体へ渡る = 検索流入がプロダクトに触れた瞬間
    const goesToApp = href === "/" || href.indexOf("/#") === 0 || href.charAt(0) === "#";
    track(goesToApp ? "cta_click" : "internal_link_click", {
      link_group: group,
      link_url: href,
      link_text: (a.textContent || "").trim().slice(0, 60),
      cta_id: a.dataset.msCta || "",
    });
  }, true);

  /* ---------- FAQの開閉(検索意図が満たせているかの手がかり) ---------- */
  document.addEventListener("toggle", function (e) {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.open) return;
    const q = d.querySelector("summary");
    track("faq_open", { question: (q ? q.textContent : "").trim().slice(0, 80) });
  }, true);

  /* ---------- 公開API ---------- */
  window.ms = {
    track: track,
    common: common,
    entry: entry,
    pageKind: KIND,
    pageId: ID,
  };

  /* LPは自動page_viewを使うので、ここでは共通パラメータだけを後乗せする */
  if (KIND !== "app") gtag("event", "lp_view", { lp_id: ID, lp_kind: KIND, entry_page: entry.id, visitor: visitor, has_profile: hasProfile() ? "yes" : "no" });
})();

#!/usr/bin/env node
/**
 * 新しいページ群(/aisho/seiza/ ・ /kyusei/)への内部リンクを既存ページに足す。
 *
 *   node scripts/link-clusters.mjs
 *
 * クローラは実際のアンカーしか辿れない。sitemapに載せただけでは弱いので、
 * 既存のフッターと関連グリッドから必ず1本以上つながるようにする。冪等。
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "images", "assets", "icons", "css", "js", "docs", "scripts"]);

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) { if (!SKIP_DIRS.has(n)) walk(f, out); }
    else if (n.endsWith(".html")) out.push(f);
  }
  return out;
}

const SIGN_SLUG = {
  aries: "牡羊座", taurus: "牡牛座", gemini: "双子座", cancer: "蟹座", leo: "獅子座", virgo: "乙女座",
  libra: "天秤座", scorpio: "蠍座", sagittarius: "射手座", capricorn: "山羊座", aquarius: "水瓶座", pisces: "魚座",
};
const ORDER = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

let touched = 0;
for (const f of walk(ROOT)) {
  const rel = "/" + relative(ROOT, f);
  if (rel === "/404.html" || rel === "/tarot-debug.html") continue;
  let html = readFileSync(f, "utf8");
  const before = html;

  /* 1. フッターに2本(footer-navの中だけを触る。パンくずにも同じアンカーがあるので範囲を限る) */
  html = html.replace(/<nav class="footer-nav">([\s\S]*?)<\/nav>/, (whole, inner) => {
    if (inner.includes('href="/aisho/seiza/"')) return whole;
    if (!inner.includes('<a href="/seiza/">12星座</a>')) return whole;
    return whole.replace('<a href="/seiza/">12星座</a>',
      '<a href="/aisho/seiza/">星座の相性</a>\n        <a href="/kyusei/">九星気学</a>\n        <a href="/seiza/">12星座</a>');
  });

  /* 2. 星座ページ → その星座の相性12本(検索意図がいちばん近い導線) */
  const m = rel.match(/^\/seiza\/([a-z]+)\/index\.html$/);
  if (m && SIGN_SLUG[m[1]] && !/\/aisho\/seiza\/[a-z]+-[a-z]+\//.test(html)) {
    const me = m[1], jaMe = SIGN_SLUG[me];
    const links = ORDER.map((o) => {
      const [x, y] = ORDER.indexOf(me) <= ORDER.indexOf(o) ? [me, o] : [o, me];
      return `          <a href="/aisho/seiza/${x}-${y}/">${jaMe} × ${SIGN_SLUG[o]}<small>相性を読む</small></a>`;
    }).join("\n");
    const block = `      <section class="lp-related">
        <p class="lp-related-title">${jaMe}の相性</p>
        <div class="lp-related-grid lp-related-signs">
${links}
        </div>
      </section>

`;
    html = html.replace('      <section class="lp-related">\n        <p class="lp-related-title">Twelve Signs</p>', block + '      <section class="lp-related">\n        <p class="lp-related-title">Twelve Signs</p>');
  }

  /* 3. 相性LP → 星座相性ハブ / 四柱推命LP → 九星ハブ */
  if (rel === "/aisho/index.html" && !html.includes('href="/aisho/seiza/"><strong>')) {
    html = html.replace('<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>',
      '<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>\n          <a href="/aisho/seiza/"><strong>星座の相性 一覧</strong><small>12星座 × 12星座の全78通り</small></a>');
  }
  if (rel === "/shichusuimei/index.html" && !html.includes('href="/kyusei/"><strong>')) {
    html = html.replace('<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>',
      '<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>\n          <a href="/kyusei/"><strong>九星気学 一覧</strong><small>九つの本命星と吉方位</small></a>');
  }
  if (rel === "/seiza/index.html" && !html.includes('href="/aisho/seiza/"><strong>')) {
    html = html.replace('<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>',
      '<a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>\n          <a href="/aisho/seiza/"><strong>星座の相性 一覧</strong><small>12星座 × 12星座の全78通り</small></a>');
  }

  if (html !== before) { writeFileSync(f, html); touched++; }
}
console.log(`内部リンクを追加: ${touched} ページ`);

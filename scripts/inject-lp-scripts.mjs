#!/usr/bin/env node
/**
 * LP(検索流入用の静的HTML)に共通スクリプトを差し込む。
 *
 *   node scripts/inject-lp-scripts.mjs
 *
 * - /js/analytics.js  … GA4の共通計測(体験フローの可視化)
 * - /js/lp-form.js    … LPの入口に生年月日フォームを置いて導線を1手減らす
 *
 * 何度実行しても結果は同じ(冪等)。index.html / 404.html / tarot-debug.html は対象外。
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "images", "assets", "icons", "css", "js", "docs", "scripts"]);
const SKIP_FILES = new Set(["index.html", "404.html", "tarot-debug.html"]);

const TAGS = [
  '  <script defer src="/js/analytics.js?v=dev"></script>',
  '  <script defer src="/js/lp-form.js?v=dev"></script>',
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT).filter((f) => {
  const rel = relative(ROOT, f);
  return !(rel.indexOf("/") === -1 && SKIP_FILES.has(rel));
});

let changed = 0;
for (const f of files) {
  let html = readFileSync(f, "utf8");
  const before = html;
  for (const tag of TAGS) {
    const src = tag.match(/src="([^?"]+)/)[1];
    if (html.includes(src)) continue;
    html = html.replace("</body>", tag + "\n</body>");
  }
  if (html !== before) { writeFileSync(f, html); changed++; }
}
console.log(`対象 ${files.length} ページ / 追記 ${changed} ページ`);

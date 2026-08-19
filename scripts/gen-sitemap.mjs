#!/usr/bin/env node
/**
 * sitemap.xml をファイルシステムから作り直す。
 *
 *   node scripts/gen-sitemap.mjs [YYYY-MM-DD]
 *
 * ページを足したら、これを実行すればsitemapへの追記漏れが起きない。
 * noindexのページ(404.html / tarot-debug.html)は自動で除外する。
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SITE = "https://myouriscope.com";
const LASTMOD = process.argv[2] || new Date().toISOString().slice(0, 10);
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "images", "assets", "icons", "css", "js", "docs", "scripts"]);

/* パスごとの優先度と更新頻度(検索でどれを主役にしたいかの表明) */
const RULES = [
  [/^\/$/, "daily", "1.0"],
  [/^\/(today|tarot|horoscope|shichusuimei|aisho|shogo)\/$/, "weekly", "0.9"],
  [/^\/(seiza|kyusei)\/$/, "weekly", "0.8"],
  [/^\/aisho\/seiza\/$/, "weekly", "0.8"],
  [/^\/tarot\/cards\/$/, "weekly", "0.8"],
  [/^\/(seiza|kyusei)\/[^/]+\/$/, "monthly", "0.7"],
  [/^\/aisho\/seiza\/[^/]+\/$/, "monthly", "0.6"],
  [/^\/tarot\/cards\/[^/]+\/$/, "monthly", "0.6"],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (name === "index.html") {
      out.push(full);
    }
  }
  return out;
}

const urls = walk(ROOT)
  .map((f) => "/" + relative(ROOT, f).replace(/index\.html$/, ""))
  .filter((u) => !readFileSync(join(ROOT, u, "index.html"), "utf8").includes('name="robots" content="noindex'))
  .sort((a, b) => a.length - b.length || a.localeCompare(b));

function rule(u) {
  for (const [re, freq, pri] of RULES) if (re.test(u)) return [freq, pri];
  return ["monthly", "0.5"];
}

const body = urls.map((u) => {
  const [freq, pri] = rule(u);
  return `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}).join("\n");

writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`);
console.log(`sitemap.xml: ${urls.length} URL`);

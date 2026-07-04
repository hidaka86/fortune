#!/usr/bin/env node
/**
 * 小アルカナ56枚の取り込み・最適化スクリプト
 *
 * 使い方: node scripts/ingest-minor.mjs <画像フォルダ>
 *
 * - 入力命名: tarot_{suit}_{rank}.png  (suit: wands/cups/swords/pentacles,
 *   rank: ace, 02..10, page, knight, queen, king)
 * - 幅800pxにリサイズし webp 品質80で再圧縮(Chromiumのcanvasを利用)
 * - 元画像は images/tarot/original/ にバックアップ
 * - 56枚の揃い・欠けをチェックしてレポート
 */
import { readdirSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { join, basename } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_DIR || "/opt/node22/lib/node_modules/playwright"));
}

const SUITS = ["wands", "cups", "swords", "pentacles"];
const RANKS = ["ace", "02", "03", "04", "05", "06", "07", "08", "09", "10", "page", "knight", "queen", "king"];

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/ingest-minor.mjs <sourceDir>"); process.exit(1); }

const destDir = new URL("../images/tarot/", import.meta.url).pathname;
const origDir = join(destDir, "original");
mkdirSync(origDir, { recursive: true });

const files = new Set(readdirSync(src).filter((f) => /\.(webp|png|jpe?g)$/i.test(f)));
const missing = [];
const plan = []; // {srcFile, destName}
for (const suit of SUITS) {
  for (const rank of RANKS) {
    const cand = ["png", "webp", "jpg", "jpeg"].map((e) => `tarot_${suit}_${rank}.${e}`).find((f) => files.has(f));
    if (!cand) { missing.push(`${suit}_${rank}`); continue; }
    plan.push({ srcFile: cand, destName: `tarot_${suit}_${rank}.webp` });
  }
}
if (missing.length) {
  console.error("!! 欠け: " + missing.join(", ") + " — 解決してから再実行してください");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();

console.log("=== 取り込み(56枚) ===");
for (const { srcFile, destName } of plan) {
  const srcPath = join(src, srcFile);
  copyFileSync(srcPath, join(origDir, basename(srcFile)));
  await page.goto("file://" + srcPath);
  const dataUrl = await page.evaluate(async () => {
    const img = document.querySelector("img");
    await img.decode();
    const scale = Math.min(1, 800 / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/webp", 0.8);
  });
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  writeFileSync(join(destDir, destName), buf);
  console.log(`  ${destName}  ${(buf.length / 1024).toFixed(0)}KB`);
}

await browser.close();
console.log("\n完了: images/tarot/ に小アルカナ56枚を配置しました。");

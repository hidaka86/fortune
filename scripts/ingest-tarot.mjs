#!/usr/bin/env node
/**
 * タロット画像の取り込み・検品・最適化スクリプト
 *
 * 使い方: NODE_PATH=<playwrightのパス> node scripts/ingest-tarot.mjs <画像フォルダ>
 *
 * - 元画像を images/tarot/original/ にバックアップ
 * - 命名を tarot_00_fool.webp 〜 tarot_21_world.webp / tarot_back.webp に正規化
 *   (ファイル名の番号・キーワード・"tarrot"等のスペル揺れを吸収)
 * - 500KB超は幅800pxにリサイズし webp 品質80で再圧縮(Chromiumのcanvasを利用)
 * - 23枚の揃い・欠けをチェックしてレポート
 */
import { readdirSync, mkdirSync, copyFileSync, statSync, writeFileSync } from "fs";
import { join, basename } from "path";
import { createRequire } from "module";

// playwright はグローバル/任意パスから解決(ESMはNODE_PATHを見ないため)
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_DIR || "/opt/node22/lib/node_modules/playwright"));
}

const SLUGS = [
  "fool", "magician", "high_priestess", "empress", "emperor", "hierophant",
  "lovers", "chariot", "strength", "hermit", "wheel_of_fortune", "justice",
  "hanged_man", "death", "temperance", "devil", "tower", "star", "moon",
  "sun", "judgement", "world",
];
const KEYWORDS = {
  fool: 0, magician: 1, priestess: 2, empress: 3, emperor: 4,
  hierophant: 5, pope: 5, lovers: 6, chariot: 7, strength: 8, hermit: 9,
  wheel: 10, fortune: 10, justice: 11, hanged: 12, death: 13,
  temperance: 14, devil: 15, tower: 16, star: 17, moon: 18, sun: 19,
  judgement: 20, judgment: 20, world: 21,
};

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/ingest-tarot.mjs <sourceDir>"); process.exit(1); }

const destDir = new URL("../images/tarot/", import.meta.url).pathname;
const origDir = join(destDir, "original");
mkdirSync(origDir, { recursive: true });

const files = readdirSync(src).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
const mapping = {}; // id(0-21|'back') -> srcFile
const leftovers = [];

for (const f of files) {
  const lower = f.toLowerCase();
  if (/back|ura|裏/.test(lower)) { mapping.back = f; continue; } // "tarrot_back"等の揺れも拾う
  const numMatch = lower.match(/(?:^|[^0-9])(\d{1,2})(?:[^0-9]|$)/);
  const num = numMatch ? Number(numMatch[1]) : null;
  if (num !== null && num >= 0 && num <= 21 && mapping[num] === undefined) { mapping[num] = f; continue; }
  const kw = Object.keys(KEYWORDS).find((k) => lower.includes(k));
  if (kw !== undefined && mapping[KEYWORDS[kw]] === undefined) { mapping[KEYWORDS[kw]] = f; continue; }
  leftovers.push(f);
}

// ---- レポート ----
const missing = [];
for (let i = 0; i <= 21; i++) if (mapping[i] === undefined) missing.push(i);
if (mapping.back === undefined) missing.push("back");

console.log("=== マッピング結果 ===");
for (let i = 0; i <= 21; i++) {
  console.log(`  ${String(i).padStart(2, "0")} ${SLUGS[i].padEnd(16)} <- ${mapping[i] ?? "(欠け!)"}`);
}
console.log(`  back                 <- ${mapping.back ?? "(欠け!)"}`);
if (leftovers.length) console.log("対応不明のファイル:", leftovers.join(", "));
if (missing.length) {
  console.error("\n!! 欠け・命名不明: " + missing.join(", ") + " — 解決してから再実行してください");
  process.exit(2);
}

// ---- コピー(バックアップ)+最適化 ----
const browser = await chromium.launch();
const page = await browser.newPage();

async function optimize(srcPath, destPath) {
  const size = statSync(srcPath).size;
  copyFileSync(srcPath, join(origDir, basename(srcPath))); // 元画像を保全
  if (size <= 500 * 1024 && /\.webp$/i.test(srcPath)) {
    copyFileSync(srcPath, destPath);
    return `${(size / 1024).toFixed(0)}KB (そのまま)`;
  }
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
  writeFileSync(destPath, buf);
  return `${(size / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB (800px/q80)`;
}

console.log("\n=== 取り込み ===");
for (let i = 0; i <= 21; i++) {
  const dest = join(destDir, `tarot_${String(i).padStart(2, "0")}_${SLUGS[i]}.webp`);
  const info = await optimize(join(src, mapping[i]), dest);
  console.log(`  ${basename(dest)}  ${info}`);
}
const backInfo = await optimize(join(src, mapping.back), join(destDir, "tarot_back.webp"));
console.log(`  tarot_back.webp  ${backInfo}`);

await browser.close();
console.log("\n完了: images/tarot/ に23枚、images/tarot/original/ にバックアップを配置しました。");

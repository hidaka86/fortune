// js/icons.js の定義から assets/ 配下に単体SVGファイルを書き出す
//   node scripts/build-icons.mjs
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { CATALOG } = require("../js/icons.js");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;
for (const [key, def] of Object.entries(CATALOG)) {
  const dir = join(root, def.dir);
  mkdirSync(dir, { recursive: true });
  // 単体ファイルでは currentColor の既定色を月光シルバーに(インライン時は親の color が優先)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.vb}" role="img" aria-label="${def.label}" style="color:#c8d4e8">${def.body.trim().replace(/^\s+/gm, "")}</svg>\n`;
  writeFileSync(join(dir, `${key}.svg`), svg);
  n++;
}
console.log(`${n} svg files written`);

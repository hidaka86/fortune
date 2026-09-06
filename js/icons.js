/* MYOURISCOPE — Mystic Icons(単一ソースのSVG定義)
   五行5 / 月相8 / 天体10 / 星座12 / 装飾(コーナー4・ディバイダー3・フレーム2)
   - すべて stroke/fill は currentColor(親要素の color で制御)
   - 画面へは mysticIcon(type, opts) でインライン描画、
     scripts/build-icons.mjs が同じ定義から assets/ 配下の .svg ファイルを生成する */
(function (root) {
  "use strict";

  const S = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

  /* ---------- 五行(viewBox 100) ---------- */
  const ELEMENTS = {
    wood: { label: "木", en: "Wood", body: `
      <g ${S}>
        <path d="M50 90V30"/>
        <path d="M50 50c-8-2-16-8-20-18M50 50c8-2 16-8 20-18M50 66c-6-2-12-6-16-12M50 66c6-2 12-6 16-12"/>
        <path d="M30 32c-4-6 0-12 6-10s4 10-6 10zM70 32c4-6 0-12-6-10s-4 10 6 10zM34 54c-3-5 0-9 5-8s3 8-5 8zM66 54c3-5 0-9-5-8s-3 8 5 8zM50 30c-5-6-2-14 4-16s8 8-4 16z"/>
        <path d="M36 92c6-4 22-4 28 0"/>
      </g>` },
    fire: { label: "火", en: "Fire", body: `
      <g ${S}>
        <path d="M50 88C30 88 22 70 30 54c3 8 9 9 10 3-1-12 6-20 10-40 4 18 12 24 12 36 1 6 5 6 7-2 10 14 2 37-19 37z"/>
        <path d="M50 78c-8 0-11-9-5-16 2 6 7 5 7-3 4 6 8 8 8 12 0 4-4 7-10 7z"/>
      </g>` },
    earth: { label: "土", en: "Earth", body: `
      <g ${S}>
        <path d="M8 74L30 38l10 16 12-30 12 24 8-12 12 38z"/>
        <path d="M52 24l-4 10 4 3 4-3M30 38l-3 7 3 2 3-2M72 36l-2 5 2 2 2-2"/>
        <path d="M14 84c6-6 12-6 18 0s12 6 18 0M56 86c5-5 10-5 15 0s10 5 15 0" stroke-opacity=".7"/>
      </g>` },
    metal: { label: "金", en: "Metal", body: `
      <g ${S}>
        <path d="M50 10L80 28v40L50 90 20 68V28z"/>
        <path d="M50 10v80M20 28l30 18 30-18M50 46L20 68M50 46l30 22"/>
        <path d="M66 22v12M60 28h12" stroke-width="1"/>
      </g>` },
    water: { label: "水", en: "Water", body: `
      <g ${S}>
        <path d="M12 34c9-9 19-9 28 0s19 9 28 0 14-6 20 0"/>
        <path d="M12 48c9-9 19-9 28 0s19 9 28 0 14-6 20 0"/>
        <path d="M12 62c9-9 19-9 28 0s19 9 28 0 14-6 20 0"/>
        <path d="M50 72c-6 8-8 12-8 16a8 8 0 0 0 16 0c0-4-2-8-8-16z"/>
      </g>` },
  };

  /* ---------- 月相(viewBox 64、中心32・半径24) ---------- */
  const MOON_ORDER = ["new-moon", "waxing-crescent", "first-quarter", "waxing-gibbous", "full-moon", "waning-gibbous", "last-quarter", "waning-crescent"];
  const MOON_JA = ["新月", "三日月", "上弦の月", "十三夜月", "満月", "更待月", "下弦の月", "有明月"];
  function moonLitPath(phase) { // phase 0..1(0=新月, .5=満月)。北半球の見え方(右から満ちる)
    const p = ((phase % 1) + 1) % 1, r = 24, cx = 32, cy = 32;
    if (p < 0.02 || p > 0.98) return "";
    if (Math.abs(p - 0.5) < 0.02) return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
    const k = Math.cos(p * Math.PI * 2), rx = Math.abs(k) * r, waxing = p < 0.5;
    const outer = `M${cx},${cy - r}A${r},${r} 0 0,${waxing ? 1 : 0} ${cx},${cy + r}`;
    const sweep = (k > 0) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
    return `${outer}A${rx},${r} 0 0,${sweep} ${cx},${cy - r}Z`;
  }
  function moonBody(i) {
    const lit = moonLitPath(i / 8);
    const id = `mp${i}`;
    return `
      <defs>
        <filter id="${id}g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
        <clipPath id="${id}c">${lit ? `<path d="${lit}"/>` : `<circle cx="32" cy="32" r="0"/>`}</clipPath>
      </defs>
      <circle cx="32" cy="32" r="24" fill="var(--midnight-navy, #0a0e27)" stroke="currentColor" stroke-opacity=".45" stroke-width="1"/>
      ${lit ? `<path d="${lit}" fill="currentColor" opacity=".35" filter="url(#${id}g)"/><path d="${lit}" fill="var(--moonlight-silver, currentColor)"/>` : ""}
      <g clip-path="url(#${id}c)" fill="var(--midnight-navy, #0a0e27)" opacity=".22">
        <circle cx="24" cy="26" r="3.2"/><circle cx="38" cy="22" r="2.2"/><circle cx="34" cy="40" r="4"/><circle cx="22" cy="40" r="1.8"/>
      </g>`;
  }
  const MOONS = {};
  MOON_ORDER.forEach((k, i) => { MOONS[k] = { label: MOON_JA[i], en: k.replace(/-/g, " "), body: moonBody(i), phase: i / 8 }; });

  /* ---------- 天体(viewBox 48) ---------- */
  const PLANETS = {
    sun: { label: "太陽", body: `<g ${S}><circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/></g>` },
    moon: { label: "月", body: `<g ${S}><path d="M29 8a17 17 0 1 0 0 32 20 20 0 0 1 0-32z"/></g>` },
    mercury: { label: "水星", body: `<g ${S}><path d="M16 8a8 8 0 0 0 16 0"/><circle cx="24" cy="22" r="8"/><path d="M24 30v12M18 36h12"/></g>` },
    venus: { label: "金星", body: `<g ${S}><circle cx="24" cy="18" r="9"/><path d="M24 27v15M17 35h14"/></g>` },
    mars: { label: "火星", body: `<g ${S}><circle cx="21" cy="27" r="9"/><path d="M27.5 20.5L38 10M30 10h8v8"/></g>` },
    jupiter: { label: "木星", body: `<g ${S}><path d="M12 15c0-7 12-8 12 0 0 6-6 10-12 15h24M30 9v32"/></g>` },
    saturn: { label: "土星", body: `<g ${S}><path d="M18 8v14M12 14h12M18 22c0-8 14-8 14 2 0 8-8 12-10 16 2 2 5 1 6-1"/></g>` },
    uranus: { label: "天王星", body: `<g ${S}><path d="M15 8v18M33 8v18M15 17h18M24 17v13"/><circle cx="24" cy="35" r="5"/><circle cx="24" cy="35" r="1" fill="currentColor"/></g>` },
    neptune: { label: "海王星", body: `<g ${S}><path d="M14 10c0 12 6 16 10 16s10-4 10-16M24 8v34M17 36h14M11 13l3-4 3 4M31 13l3-4 3 4M21 11l3-4 3 4"/></g>` },
    pluto: { label: "冥王星", body: `<g ${S}><circle cx="24" cy="14" r="5"/><path d="M14 20c0 10 20 10 20 0M24 30v12M17 36h14"/></g>` },
  };

  /* ---------- 星座(viewBox 48) ---------- */
  const ZODIAC = {
    aries: { label: "牡羊座", body: `<g ${S}><path d="M24 40c0-20-4-32-12-32-6 0-6 10 0 10M24 40c0-20 4-32 12-32 6 0 6 10 0 10"/></g>` },
    taurus: { label: "牡牛座", body: `<g ${S}><circle cx="24" cy="30" r="10"/><path d="M10 8c0 8 6 12 14 12s14-4 14-12"/></g>` },
    gemini: { label: "双子座", body: `<g ${S}><path d="M10 10c8 3 20 3 28 0M10 38c8-3 20-3 28 0M17 12v24M31 12v24"/></g>` },
    cancer: { label: "蟹座", body: `<g ${S}><circle cx="16" cy="19" r="5"/><circle cx="32" cy="29" r="5"/><path d="M11 19c0-11 19-13 27-5M37 29c0 11-19 13-27 5"/></g>` },
    leo: { label: "獅子座", body: `<g ${S}><circle cx="14" cy="30" r="5"/><path d="M19 30c0-10 2-20 10-20 6 0 8 6 6 12-2 6-8 10-8 16 0 4 4 6 8 4"/></g>` },
    virgo: { label: "乙女座", body: `<g ${S}><path d="M8 14c0-6 6-6 6 0v18M14 14c0-6 6-6 6 0v18M20 14c0-6 6-6 6 0v16c0 6 6 8 10 4M26 22c8 0 12 8 8 14-2 4-6 6-10 4"/></g>` },
    libra: { label: "天秤座", body: `<g ${S}><path d="M8 38h32M8 30h8a8 8 0 1 1 16 0h8"/></g>` },
    scorpio: { label: "蠍座", body: `<g ${S}><path d="M8 14c0-6 6-6 6 0v18M14 14c0-6 6-6 6 0v18M20 14c0-6 6-6 6 0v18c0 6 6 8 12 4M35 32l4 5-5 3"/></g>` },
    sagittarius: { label: "射手座", body: `<g ${S}><path d="M10 38L38 10M26 10h12v12M16 24l8 8"/></g>` },
    capricorn: { label: "山羊座", body: `<g ${S}><path d="M8 12c2 10 4 18 6 26M14 12c2 10 6 10 10 8 4-2 6 10 6 16 0 6-8 6-8 0 0-6 8-6 10-2"/></g>` },
    aquarius: { label: "水瓶座", body: `<g ${S}><path d="M6 19c4-8 8-8 12 0s8 8 12 0 8-8 12 0M6 31c4-8 8-8 12 0s8 8 12 0 8-8 12 0"/></g>` },
    pisces: { label: "魚座", body: `<g ${S}><path d="M13 7c10 7 10 27 0 34M35 7c-10 7-10 27 0 34M10 24h28"/></g>` },
  };

  /* ---------- 装飾(コーナー80 / ディバイダー400x40 / フレーム) ---------- */
  const O = 'fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"';
  const cornerTL = `
      <g ${O}>
        <path d="M2 78V22C2 10 10 2 22 2h56"/>
        <path d="M8 78V24c0-9 7-16 16-16h54" stroke-opacity=".55"/>
        <path d="M14 40c-6 0-8-8-2-10 6-2 8 6 2 8M40 14c0-6-8-8-10-2-2 6 6 8 8 2"/>
        <path d="M22 60v-8M18 56h8M62 22h-8M58 18v8" stroke-opacity=".7"/>
        <circle cx="30" cy="30" r="9" stroke-opacity=".5"/>
      </g>
      <path d="M30 22l1.8 6.2L38 30l-6.2 1.8L30 38l-1.8-6.2L22 30l6.2-1.8z" fill="currentColor"/>
      <path d="M14 14a6 6 0 1 0 8 8 7 7 0 0 1-8-8z" fill="currentColor" opacity=".8"/>`;
  const CORNERS = {
    "corner-top-left": { label: "角飾り(左上)", vb: "0 0 80 80", body: cornerTL },
    "corner-top-right": { label: "角飾り(右上)", vb: "0 0 80 80", body: `<g transform="matrix(-1 0 0 1 80 0)">${cornerTL}</g>` },
    "corner-bottom-left": { label: "角飾り(左下)", vb: "0 0 80 80", body: `<g transform="matrix(1 0 0 -1 0 80)">${cornerTL}</g>` },
    "corner-bottom-right": { label: "角飾り(右下)", vb: "0 0 80 80", body: `<g transform="matrix(-1 0 0 -1 80 80)">${cornerTL}</g>` },
  };
  const dividerLines = `
      <g ${O}>
        <path d="M12 20h150" stroke-opacity=".8"/><path d="M238 20h150" stroke-opacity=".8"/>
        <path d="M6 20l6-3v6zM394 20l-6-3v6z" fill="currentColor"/>
        <path d="M168 20l6-5 6 5-6 5zM226 20l-6-5-6 5 6 5z" fill="currentColor" fill-opacity=".85"/>
        <path d="M90 20l3-2 3 2-3 2zM304 20l3-2 3 2-3 2z" fill="currentColor" fill-opacity=".6"/>
      </g>`;
  const DIVIDERS = {
    "divider-star": { label: "区切り(星)", vb: "0 0 400 40", body: `${dividerLines}
      <defs><filter id="dvg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <path d="M200 6l3 11 11 3-11 3-3 11-3-11-11-3 11-3z" fill="currentColor" opacity=".5" filter="url(#dvg)"/>
      <path d="M200 6l3 11 11 3-11 3-3 11-3-11-11-3 11-3z" fill="currentColor"/>
      <g ${O}><path d="M184 20c4-8 28-8 32 0M184 20c4 8 28 8 32 0" stroke-opacity=".6"/></g>` },
    "divider-moon": { label: "区切り(月)", vb: "0 0 400 40", body: `${dividerLines}
      <defs><filter id="dvm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <path d="M203 8a12 12 0 1 0 0 24 14 14 0 0 1 0-24z" fill="currentColor" opacity=".5" filter="url(#dvm)"/>
      <path d="M203 8a12 12 0 1 0 0 24 14 14 0 0 1 0-24z" fill="currentColor"/>
      <circle cx="186" cy="14" r="1.2" fill="currentColor"/><circle cx="218" cy="26" r="1.2" fill="currentColor"/>` },
    "divider-dots": { label: "区切り(点)", vb: "0 0 400 40", body: `${dividerLines}
      <circle cx="188" cy="20" r="2" fill="currentColor" opacity=".7"/><circle cx="200" cy="20" r="3" fill="currentColor"/><circle cx="212" cy="20" r="2" fill="currentColor" opacity=".7"/>` },
  };
  function frameBody(w, h, inner) {
    const c = (x, y, t) => `<g transform="translate(${x} ${y}) ${t}">${cornerTL}</g>`;
    return `
      <g ${O}><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="4" stroke-opacity=".9"/><rect x="7" y="7" width="${w - 14}" height="${h - 14}" rx="2" stroke-opacity=".45"/></g>
      ${c(0, 0, "")}${c(w, 0, "scale(-1 1)")}${c(0, h, "scale(1 -1)")}${c(w, h, "scale(-1 -1)")}
      ${inner}`;
  }
  const FRAMES = {
    "frame-card": { label: "カード用フレーム", vb: "0 0 400 260", body: frameBody(400, 260, `
      <g ${O}><path d="M120 1h160M120 259h160" stroke-opacity=".2"/></g>
      <path d="M200 1l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor"/>`) },
    "frame-modal": { label: "モーダル用フレーム", vb: "0 0 400 300", body: frameBody(400, 300, `
      <g ${O}>
        <path d="M14 150l6-6 6 6-6 6zM374 150l6-6 6 6-6 6z" fill="currentColor" fill-opacity=".8"/>
        <path d="M20 120v24M20 156v24M380 120v24M380 156v24" stroke-opacity=".6" stroke-dasharray="1 4"/>
      </g>
      <path d="M200 4l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="currentColor"/>
      <path d="M200 296l2.5-6 6-2.5-6-2.5-2.5-6-2.5 6-6 2.5 6 2.5z" fill="currentColor"/>`) },
  };

  /* ---------- カタログ ---------- */
  const CATALOG = {};
  const add = (group, dict, vb, dir) => Object.entries(dict).forEach(([k, v]) => { CATALOG[k] = { group, vb: v.vb || vb, dir, ...v }; });
  add("elements", ELEMENTS, "0 0 100 100", "assets/divination/06-five-elements");
  add("moon", MOONS, "0 0 64 64", "assets/icons/07-moon-phases");
  add("planets", PLANETS, "0 0 48 48", "assets/icons/08-astro-glyphs/planets");
  add("zodiac", ZODIAC, "0 0 48 48", "assets/icons/08-astro-glyphs/zodiac");
  add("corners", CORNERS, "0 0 80 80", "assets/ornaments/09-decorative-frames/corners");
  add("dividers", DIVIDERS, "0 0 400 40", "assets/ornaments/09-decorative-frames/dividers");
  add("frames", FRAMES, null, "assets/ornaments/09-decorative-frames/frames");

  const ZODIAC_EN = { "牡羊座": "aries", "牡牛座": "taurus", "双子座": "gemini", "蟹座": "cancer", "獅子座": "leo", "乙女座": "virgo", "天秤座": "libra", "蠍座": "scorpio", "射手座": "sagittarius", "山羊座": "capricorn", "水瓶座": "aquarius", "魚座": "pisces" };
  const ELEMENT_KEY = { "木": "wood", "火": "fire", "土": "earth", "金": "metal", "水": "water" };

  /* インライン描画。size は px(数値)か CSS 値。glow で発光、animate で脈動。 */
  function mysticIcon(type, opts = {}) {
    const def = CATALOG[type];
    if (!def) return "";
    const { size = 24, width, height, glow = false, animate = false, className = "", label, color } = opts;
    const [, , vw, vh] = def.vb.split(" ").map(Number);
    const w = width ?? size;
    const h = height ?? (typeof w === "number" ? Math.round(w * vh / vw) : w);
    const cls = ["mystic-icon", `mi-${def.group}`, `mi-${type}`, glow ? "mi-glow" : "", animate ? "mi-animate" : "", className].filter(Boolean).join(" ");
    const aria = label === "" ? 'aria-hidden="true"' : `role="img" aria-label="${label || def.label}"`;
    const style = color ? ` style="color:${color}"` : "";
    // 同一ページに同じアイコンが複数あっても id が衝突しないよう接尾辞を付ける
    const body = def.body.replace(/id="([a-z0-9]+)"/gi, (m, id) => `id="${id}-${type}-${uid++}"`)
      .replace(/url\(#([a-z0-9]+)\)/gi, (m, id) => `url(#${id}-${type}-${uid - 1})`);
    return `<svg class="${cls}" viewBox="${def.vb}" width="${w}" height="${h}" ${aria}${style} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }
  let uid = 0;

  /* 月相 0..1 に最も近い8相のキー */
  function moonPhaseKey(phase) { return MOON_ORDER[Math.round(((phase % 1) + 1) % 1 * 8) % 8]; }
  /* 生年月日 → 星座キー(fortune.js の getZodiac と同じ境界日) */
  function zodiacKey(monthOrDate, day) {
    let m = monthOrDate, d = day;
    if (monthOrDate instanceof Date) { m = monthOrDate.getMonth() + 1; d = monthOrDate.getDate(); }
    const md = m * 100 + d;
    if (md >= 321 && md <= 419) return "aries"; if (md >= 420 && md <= 520) return "taurus";
    if (md >= 521 && md <= 621) return "gemini"; if (md >= 622 && md <= 722) return "cancer";
    if (md >= 723 && md <= 822) return "leo"; if (md >= 823 && md <= 922) return "virgo";
    if (md >= 923 && md <= 1023) return "libra"; if (md >= 1024 && md <= 1122) return "scorpio";
    if (md >= 1123 && md <= 1221) return "sagittarius"; if (md >= 120 && md <= 218) return "aquarius";
    if (md >= 219 && md <= 320) return "pisces"; return "capricorn";
  }

  const api = { CATALOG, MOON_ORDER, ZODIAC_EN, ELEMENT_KEY, mysticIcon, moonPhaseKey, zodiacKey, moonLitPath };
  root.MysticIcons = api;
  root.mysticIcon = mysticIcon;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

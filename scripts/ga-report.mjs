#!/usr/bin/env node
/* MYOURISCOPE — GA4 行動データレポート
   GA4 Data API (v1beta) からサイトの行動データを取得し、Markdownレポートを出力する。
   依存パッケージなし(Node 18+ の標準機能のみ)。

   必要な環境変数:
     GA4_PROPERTY_ID  … GA4のプロパティID(数字。管理→プロパティ設定に表示)
     GA4_SA_KEY       … サービスアカウントのJSONキー(そのまま or base64)
   セットアップ手順は docs/ANALYTICS.md 参照。

   使い方:
     node scripts/ga-report.mjs           # 直近7日 vs その前7日のレポート
     node scripts/ga-report.mjs --days 28 # 期間を変える
     node scripts/ga-report.mjs --json    # 生データをJSONで出力(分析エージェント用)
*/

import { createSign } from "node:crypto";

const args = process.argv.slice(2);
const DAYS = Number(args[args.indexOf("--days") + 1]) || 7;
const AS_JSON = args.includes("--json");

function fail(msg) {
  console.error(`エラー: ${msg}`);
  process.exit(1);
}

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
let SA_KEY_RAW = process.env.GA4_SA_KEY;
if (!PROPERTY_ID || !SA_KEY_RAW) {
  fail("環境変数 GA4_PROPERTY_ID / GA4_SA_KEY が未設定です。docs/ANALYTICS.md のセットアップ手順を参照してください。");
}
if (!SA_KEY_RAW.trim().startsWith("{")) {
  SA_KEY_RAW = Buffer.from(SA_KEY_RAW, "base64").toString("utf8");
}
let SA;
try { SA = JSON.parse(SA_KEY_RAW); } catch { fail("GA4_SA_KEY をJSONとして解釈できません(JSON文字列かそのbase64を設定)"); }

/* ---------- サービスアカウント認証(JWT → アクセストークン) ---------- */
const b64url = (buf) => Buffer.from(buf).toString("base64url");

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: SA.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: SA.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${signer.sign(SA.private_key, "base64url")}`;

  const res = await fetch(SA.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) fail(`トークン取得に失敗 (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

/* ---------- GA4 Data API ---------- */
let TOKEN;
async function runReport(body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) fail(`runReport失敗 (${res.status}): ${await res.text()}`);
  return res.json();
}

const rows = (r) => (r.rows || []).map((row) => ({
  dims: (row.dimensionValues || []).map((v) => v.value),
  mets: (row.metricValues || []).map((v) => Number(v.value)),
}));

/* ---------- レポート本体 ---------- */
const CUR = { startDate: `${DAYS}daysAgo`, endDate: "yesterday" };
const PREV = { startDate: `${DAYS * 2}daysAgo`, endDate: `${DAYS + 1}daysAgo` };

TOKEN = await getAccessToken();

const [summary, trend, screens, events, hours] = await Promise.all([
  // 全体サマリー(今期間 vs 前期間)
  runReport({
    dateRanges: [CUR, PREV],
    metrics: [
      { name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" },
      { name: "screenPageViews" }, { name: "averageSessionDuration" },
      { name: "dauPerWau" },
    ],
  }),
  // 日別トレンド
  runReport({
    dateRanges: [{ startDate: `${DAYS * 2}daysAgo`, endDate: "yesterday" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
    limit: "100",
  }),
  // 画面別(page_titleを画面ごとに変えているのでpageTitleで切れる)
  runReport({
    dateRanges: [CUR, PREV],
    dimensions: [{ name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: "30",
  }),
  // イベント別(今期間 vs 前期間)
  runReport({
    dateRanges: [CUR, PREV],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: "50",
  }),
  // 時間帯別(通知やコンテンツの「朝の背中押し」設計の検証用)
  runReport({
    dateRanges: [CUR],
    dimensions: [{ name: "hour" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ dimension: { dimensionName: "hour" } }],
    limit: "24",
  }),
]);

if (AS_JSON) {
  console.log(JSON.stringify({ days: DAYS, summary, trend, screens, events, hours }, null, 2));
  process.exit(0);
}

/* ---------- Markdown整形 ---------- */
const pct = (cur, prev) => (prev > 0 ? `${cur >= prev ? "+" : ""}${Math.round(((cur - prev) / prev) * 100)}%` : "—");

// summaryは dateRange ディメンションが自動付与される(date_range_0=今期, date_range_1=前期)
const sRows = rows(summary);
const curRow = sRows.find((r) => r.dims[0] === "date_range_0")?.mets || [0, 0, 0, 0, 0, 0];
const prevRow = sRows.find((r) => r.dims[0] === "date_range_1")?.mets || [0, 0, 0, 0, 0, 0];
const [aU, nU, sess, pv, dur, stick] = curRow;

const lines = [];
lines.push(`# MYOURISCOPE 行動データレポート(直近${DAYS}日 vs その前${DAYS}日)`);
lines.push("");
lines.push(`| 指標 | 今期間 | 前期間比 |`);
lines.push(`|---|---|---|`);
lines.push(`| アクティブユーザー | ${aU} | ${pct(aU, prevRow[0])} |`);
lines.push(`| 新規ユーザー | ${nU} | ${pct(nU, prevRow[1])} |`);
lines.push(`| セッション | ${sess} | ${pct(sess, prevRow[2])} |`);
lines.push(`| 画面ビュー | ${pv} | ${pct(pv, prevRow[3])} |`);
lines.push(`| 平均セッション時間 | ${Math.round(dur)}秒 | ${pct(dur, prevRow[4])} |`);
lines.push(`| DAU/WAU(粘着度) | ${(stick * 100).toFixed(1)}% | — |`);

lines.push("", `## 日別ユーザー数(${DAYS * 2}日)`);
for (const r of rows(trend)) {
  const bar = "█".repeat(Math.min(60, r.mets[0]));
  lines.push(`- ${r.dims[0]}: ${String(r.mets[0]).padStart(4)} (新規${r.mets[1]}) ${bar}`);
}

lines.push("", "## 画面別ビュー(今期間/前期間)");
const scr = new Map();
for (const r of rows(screens)) {
  const key = r.dims[0].replace("MYOURISCOPE — ", "");
  const e = scr.get(key) || { cur: 0, prev: 0, users: 0 };
  if (r.dims[1] === "date_range_0") { e.cur = r.mets[0]; e.users = r.mets[1]; }
  else e.prev = r.mets[0];
  scr.set(key, e);
}
for (const [name, e] of [...scr.entries()].sort((a, b) => b[1].cur - a[1].cur)) {
  lines.push(`- ${name}: ${e.cur}ビュー / ${e.users}人 (${pct(e.cur, e.prev)})`);
}

lines.push("", "## イベント(今期間/前期間)");
const ev = new Map();
for (const r of rows(events)) {
  const e = ev.get(r.dims[0]) || { cur: 0, prev: 0, users: 0 };
  if (r.dims[1] === "date_range_0") { e.cur = r.mets[0]; e.users = r.mets[1]; }
  else e.prev = r.mets[0];
  ev.set(r.dims[0], e);
}
for (const [name, e] of [...ev.entries()].sort((a, b) => b[1].cur - a[1].cur)) {
  lines.push(`- ${name}: ${e.cur}回 / ${e.users}人 (${pct(e.cur, e.prev)})`);
}

// 簡易ファネル(登録 → 今日の観測 → 深い行動)
const g = (n) => ev.get(n)?.cur || 0;
const gu = (n) => ev.get(n)?.users || 0;
lines.push("", "## 継続ファネル(今期間)");
lines.push(`- 今日の観測完了(today_observed): ${g("today_observed")}回 / ${gu("today_observed")}人`);
lines.push(`- → アクティブユーザーに対する観測率: ${aU ? Math.round((gu("today_observed") / aU) * 100) : 0}%`);
lines.push(`- タロット儀式完了: ${g("tarot_reading")}回 / 登録: ${g("register")}件 / シェアコピー: ${g("share_copy")}回`);
lines.push(`- ジャーナル定着(memo): ${g("journal_memo")}回 / 振り返り: ${g("journal_reflection")}回`);

lines.push("", "## 時間帯別アクティブユーザー(今期間)");
for (const r of rows(hours)) {
  lines.push(`- ${r.dims[0].padStart(2, "0")}時: ${"▇".repeat(Math.min(50, r.mets[0]))} ${r.mets[0]}`);
}

console.log(lines.join("\n"));

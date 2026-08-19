#!/usr/bin/env node
/**
 * 検索流入ページの生成
 *
 *   node scripts/gen-pages.mjs
 *
 * 生成するもの
 *   /aisho/seiza/                  星座相性の一覧ハブ
 *   /aisho/seiza/{a}-{b}/          星座 × 星座の相性 78ページ(順不同の組み合わせ)
 *   /kyusei/                       九星気学の一覧ハブ
 *   /kyusei/{slug}/                本命星 9ページ
 *
 * 本文の素材(星座の気質・九星の気質・エレメント相性・遊び方・ケンカの火種)は
 * js/data.js と js/fortune.js を評価して取り出す。手打ちしない = 本体との文言ずれゼロ。
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SITE = "https://myouriscope.com";

/* ---------- 本体のデータを読み込む ---------- */
const src = ["js/data.js", "js/fortune.js"].map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n");
const D = new Function(`${src}; return { ZODIAC, KYUSEI, AISHO_PLAY, BOND_FRICTION, GOGYO_RELATION, zodiacCompatScore, gogyoCompatScore };`)();
const { ZODIAC, KYUSEI, AISHO_PLAY, zodiacCompatScore } = D;

/* ---------- 星座のメタ(slugと読み・検索語になる情報) ---------- */
const SIGN_META = {
  "牡羊座": { slug: "aries", kana: "おひつじ座" },
  "牡牛座": { slug: "taurus", kana: "おうし座" },
  "双子座": { slug: "gemini", kana: "ふたご座" },
  "蟹座": { slug: "cancer", kana: "かに座" },
  "獅子座": { slug: "leo", kana: "しし座" },
  "乙女座": { slug: "virgo", kana: "おとめ座" },
  "天秤座": { slug: "libra", kana: "てんびん座" },
  "蠍座": { slug: "scorpio", kana: "さそり座" },
  "射手座": { slug: "sagittarius", kana: "いて座" },
  "山羊座": { slug: "capricorn", kana: "やぎ座" },
  "水瓶座": { slug: "aquarius", kana: "みずがめ座" },
  "魚座": { slug: "pisces", kana: "うお座" },
};

/* 関係のなかでその星座がいちばん大事にすること(12) */
const SIGN_NEED = {
  "牡羊座": "まっすぐさ。腹の探り合いより、その場で言い合えることを何より信頼の証だと感じます",
  "牡牛座": "安定と心地よさ。急かされない時間の中で、少しずつ距離を縮めていきたい星座です",
  "双子座": "会話の量。何を話したかより、話し続けられることそのものが安心につながります",
  "蟹座": "安心。ここにいていいと感じられる場所であることが、何よりの条件になります",
  "獅子座": "まっすぐな肯定。取り繕った褒め言葉より、堂々と誇りに思われることを求めます",
  "乙女座": "誠実さ。約束と時間を守ってもらえることが、そのまま愛情の実感になります",
  "天秤座": "対等さ。どちらかが我慢する関係になった瞬間、この星座は静かに冷めていきます",
  "蠍座": "深さ。浅く広くより、ひとりの相手ととことん深く結ばれることを望みます",
  "射手座": "自由と、共に伸びていく感覚。閉じ込められると、愛情ごと窮屈になってしまいます",
  "山羊座": "積み上がっていく実感。時間をかけて築いたものが残ることに、この星座は安心します",
  "水瓶座": "個としての尊重。ふたりでいても、それぞれが別の人間であることを守りたい星座です",
  "魚座": "気持ちが通っている感覚。理屈で正しくても、心が離れていたら意味がありません",
};

/* つまずきどころ(12) */
const SIGN_WEAK = {
  "牡羊座": "勢いのまま言い切ってしまい、あとから言いすぎたと気づく",
  "牡牛座": "動き出すまでが遅く、相手を待たせていることに気づきにくい",
  "双子座": "話題が移るのが早く、相手の話を最後まで聞ききらないことがある",
  "蟹座": "身内とそれ以外の線引きが強く、相手が壁を感じることがある",
  "獅子座": "自分の見え方を優先してしまい、相手の面目に気が回らなくなる",
  "乙女座": "気づきすぎて指摘が増え、相手には否定に聞こえてしまう",
  "天秤座": "波風を立てまいとして本音を飲み込み、あとで一気に噴き出す",
  "蠍座": "察してほしさが強く、言葉にしないまま距離を測ってしまう",
  "射手座": "正直すぎる一言が、相手の一番痛いところに当たってしまう",
  "山羊座": "感情より段取りを先に立ててしまい、冷たいと受け取られる",
  "水瓶座": "距離を取って冷静になろうとする姿が、突き放しに見えてしまう",
  "魚座": "断れずに引き受けて、抱えきれなくなってから崩れてしまう",
};

/* エレメントが関係に差し出すもの(4) */
const ELEMENT_GIVE = {
  "火": "熱と初速。停滞した空気を「とりあえずやってみよう」で押し出す力",
  "地": "地面。約束・お金・時間といった、続けるために必要な現実の足場",
  "風": "風通し。煮詰まった話を、言葉にして外に出してくれる軽さ",
  "水": "情。理屈の手前にある気持ちを、汲み取ってそのまま受け止める深さ",
};

const ELEMENT_LONG = { "火": "直感とエネルギーの火", "地": "現実と継続の地", "風": "言葉と関係の風", "水": "感情と共感の水" };

/* 支配星の一言(相性ページで「なぜそうなるか」を支える) */
const PLANET_NOTE = {
  "火星": "行動と闘志の星",
  "金星": "美と愛情の星",
  "水星": "言葉と知性の星",
  "月": "感情と記憶の星",
  "太陽": "自己と輝きの星",
  "冥王星": "深層と再生の星",
  "木星": "拡大と幸運の星",
  "土星": "責任と時間の星",
  "天王星": "変革と自由の星",
  "海王星": "夢と境界のない星",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- 共通のHTMLシェル ---------- */
function shell({ path, title, description, eyebrow, h1, sub, breadcrumb, jsonld, body }) {
  const url = SITE + path;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <meta name="theme-color" content="#F3EEE5" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/ogp.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE}/ogp.png" />
  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PQC4DKWZ78"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-PQC4DKWZ78");
  </script>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/icons/icon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@500;700;900&family=Cormorant+Garamond:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=dev" />
  <link rel="stylesheet" href="/css/lp.css?v=dev" />
</head>
<body>
  <div class="bg-wash" aria-hidden="true"></div>

  <header class="header">
    <div class="header-inner">
      <a class="brand" href="/">
        <img class="brand-logo" src="/assets/brand/logo_header.png" alt="MYOURISCOPE" />
      </a>
      <nav class="nav lp-nav">
        <a href="/today/">今日の運勢</a>
        <a href="/tarot/">タロット</a>
        <a href="/horoscope/">ホロスコープ</a>
        <a href="/shichusuimei/">四柱推命</a>
        <a href="/aisho/">相性占い</a>
        <a href="/shogo/">運命の称号</a>
      </nav>
    </div>
  </header>

  <main class="main">
    <div class="view active">
      <nav class="lp-breadcrumb" aria-label="パンくず">${breadcrumb}</nav>
      <div class="view-head">
        <p class="view-eyebrow">${eyebrow}</p>
        <h1>${h1}</h1>
        <p class="view-sub">${sub}</p>
      </div>
${body}
    </div>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img class="footer-logo" src="/assets/brand/wordmark_footer.png" alt="MYOURISCOPE" />
        <p class="footer-tagline">この世の理と、あなたの流れを観る。</p>
      </div>
      <nav class="footer-nav">
        <a href="/">ホーム</a>
        <a href="/today/">今日の運勢</a>
        <a href="/tarot/">タロット</a>
        <a href="/horoscope/">ホロスコープ</a>
        <a href="/shichusuimei/">四柱推命</a>
        <a href="/aisho/">相性占い</a>
        <a href="/aisho/seiza/">星座の相性</a>
        <a href="/kyusei/">九星気学</a>
        <a href="/seiza/">12星座</a>
      </nav>
    </div>
    <p class="footer-note">占い結果はエンターテインメントとしてお楽しみください。 © 2026 MYOURISCOPE</p>
  </footer>
  <script defer src="/js/analytics.js?v=dev"></script>
  <script defer src="/js/lp-form.js?v=dev"></script>
</body>
</html>
`;
}

function faqSection(faqs) {
  return `      <section class="panel guide-article lp-article lp-faq">
        <h2>よくある質問</h2>
${faqs.map((f) => `        <details>
          <summary>${f.q}</summary>
          <p>${f.a}</p>
        </details>`).join("\n")}
      </section>
`;
}

function faqJsonLd(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q.replace(/<[^>]+>/g, ""),
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
    })),
  };
}

function write(path, html) {
  const dir = join(ROOT, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

/* ============================================================
   1. 星座 × 星座の相性(78ページ・順不同)
   ============================================================ */

/* 一般的な12星座の並び(牡羊座はじまり)にそろえる */
const ORDER = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
const byName = Object.fromEntries(ZODIAC.map((z) => [z.name, z]));
const SIGNS = ORDER.map((n) => ({ ...byName[n], ...SIGN_META[n] }));

function pairSlug(a, b) { return `${a.slug}-${b.slug}`; }

function bandLabel(score) {
  return score >= 88 ? "響き合う" : score >= 70 ? "噛み合う" : score >= 60 ? "違いが効く" : "惹かれ合う";
}

function pairPage(a, b) {
  const same = a.name === b.name;
  const rel = zodiacCompatScore(a.element, b.element);
  const play = AISHO_PLAY[[a.element, b.element].sort().join("")] || AISHO_PLAY[a.element + b.element] || "";
  const elemKey = [a.element, b.element].sort().join("");
  const playText = AISHO_PLAY[elemKey] || AISHO_PLAY[[b.element, a.element].join("")] || play;
  const path = `/aisho/seiza/${pairSlug(a, b)}/`;
  const title = same
    ? `${a.name}同士の相性 — ${a.kana}カップル・友達はどうなる? | MYOURISCOPE`
    : `${a.name}と${b.name}の相性 — ${a.kana}×${b.kana}を4層で読む | MYOURISCOPE`;
  const description = same
    ? `${a.name}(${a.kana})同士の相性を、エレメント・気質・つまずきどころから読み解きます。${rel.note} 生年月日まで入れると、九星の五行・干支・日主まで4層で診断できます。`
    : `${a.name}(${a.kana})と${b.name}(${b.kana})の相性。${rel.note} 相性は太陽星座だけでは決まりません。生年月日を入れると九星の五行・干支・生まれた日の十干まで4層で読みます。`;

  const faqs = same
    ? [
        { q: `${a.name}同士の相性はいいですか?`, a: `エレメントで見ると同じ${ELEMENT_LONG[a.element]}どうし。${rel.note}似ている分、噛み合うときは驚くほど速く、こじれるときは同じ弱点を同時に踏みます。${a.name}がつまずきやすいのは「${SIGN_WEAK[a.name]}」ところ。それがふたり分そろって出てくる、と覚えておくと対処しやすくなります。` },
        { q: `${a.name}同士がうまくいくコツは?`, a: `${a.name}が関係に求めるのは${SIGN_NEED[a.name]}。同じものを求め合う相手なので、期待は説明しなくても伝わります。逆に「言わなくても分かるはず」が積もると一気に崩れるので、当たり前のことほど言葉にするのがこの組み合わせの鍵です。` },
        { q: "星座が同じなら性格も同じですか?", a: "いいえ。太陽星座は10天体のうちのひとつです。月の星座・アセンダント、さらに東洋側の九星や生まれた日の十干まで見ると、同じ星座どうしでもまったく別の相性が出ます。MYOURISCOPEの相性診断は、この4層を重ねて読みます。" },
      ]
    : [
        { q: `${a.name}と${b.name}の相性はいいですか?`, a: `エレメントで見ると${a.name}は${ELEMENT_LONG[a.element]}、${b.name}は${ELEMENT_LONG[b.element]}。${rel.note}ただしこれは相性の1層目です。同じ${a.name}と${b.name}の組み合わせでも、生まれた日が違えば読みは変わります。` },
        { q: `${a.name}と${b.name}がうまくいかないときは?`, a: `${a.name}がつまずきやすいのは「${SIGN_WEAK[a.name]}」ところ、${b.name}は「${SIGN_WEAK[b.name]}」ところ。どちらも悪意ではなく、その星座の得意が裏返っただけです。先に相手の"裏返り方"を知っておくと、同じ場面でも受け取り方が変わります。` },
        { q: "星座だけで相性は決まりますか?", a: "決まりません。太陽星座は相性の入口です。MYOURISCOPEの相性診断では、星座のエレメント(30%)・九星の五行(25%)・干支の巡り(25%)・生まれた日の十干どうしの対話(20%)の4層を重ねて読みます。生年月日だけで、登録は要りません。" },
        { q: `${b.name}から見た${a.name}はどう映りますか?`, a: `${b.name}が関係に求めるのは${SIGN_NEED[b.name]}。そこに${a.name}は${ELEMENT_GIVE[a.element]}を差し出します。噛み合えば強い補完になり、噛み合わないとお互いに「なぜ伝わらないのか」が分からなくなる — その差を先に見ておくのが、この組み合わせのコツです。` },
      ];

  const body = `      <article class="panel guide-article lp-article">
        <h2>${same ? `${a.name}同士` : `${a.name}と${b.name}`}の基本データ</h2>
        <ul class="ga-list">
          <li><strong>${a.name}(${a.kana})</strong>: ${ELEMENT_LONG[a.element]} / 支配星 ${a.planet}(${PLANET_NOTE[a.planet]}) / ${a.keyword}</li>
          <li><strong>${b.name}(${b.kana})</strong>: ${ELEMENT_LONG[b.element]} / 支配星 ${b.planet}(${PLANET_NOTE[b.planet]}) / ${b.keyword}</li>
          <li><strong>エレメントの関係</strong>: ${a.element}と${b.element} — ${bandLabel(rel.score)}関係</li>
        </ul>

        <h2>ふたりの空気 — ${a.element}と${b.element}が出会うと</h2>
        <p>${rel.note}</p>
        <p>${a.name}は${a.trait}${b.name}は${b.trait}</p>
        <p>${same
          ? `同じ星座どうしは、説明のいらない楽さがあります。テンポも、大事にしている順番も、はじめから揃っている。そのかわり、苦手なところも同じ方向に倒れます。ふたりとも${ELEMENT_GIVE[a.element]}を持ち寄る組み合わせなので、${a.element === "火" ? "止まる係" : a.element === "地" ? "動き出す係" : a.element === "風" ? "決める係" : "現実に戻す係"}が誰もいなくなりがち。そこだけ意識して役割を作ると、この相性は一気に強くなります。`
          : `${a.name}が関係に求めるのは${SIGN_NEED[a.name]}。いっぽう${b.name}が求めるのは${SIGN_NEED[b.name]}。ここが違うこと自体は問題ではありません。問題になるのは、相手も自分と同じものを求めているはずだと思い込んだときです。${a.name}は${ELEMENT_GIVE[a.element]}を、${b.name}は${ELEMENT_GIVE[b.element]}を差し出せる相手 — 求めるものではなく、差し出せるものを見ると、この組み合わせは急に読みやすくなります。`}</p>

        <h2>いっしょに何をすると楽しいか</h2>
        <p>${playText}</p>

        <h2>こじれるときの、こじれ方</h2>
        <p>${same
          ? `${a.name}のつまずきどころは「${SIGN_WEAK[a.name]}」こと。同じ星座どうしだと、これが同時に起きます。片方が引くのを待っていると、ふたりとも引かないまま時間だけが過ぎる — この組み合わせでいちばん多い詰まり方です。`
          : `${a.name}は「${SIGN_WEAK[a.name]}」ことがあり、${b.name}は「${SIGN_WEAK[b.name]}」ことがあります。どちらもその星座の得意が裏返った姿です。相手を責める前に「いま裏返っているだけだ」と分かっていると、同じ場面がまったく違って見えます。`}</p>
        <p>ケンカの火種は、じつは星座よりも<strong>生まれた日の十干どうしの関係</strong>にはっきり出ます。同じ${a.name}と${b.name}でも、生まれた日が違えば揉め方が変わる — <a href="/aisho/">4層の相性診断</a>では、そこまで見て「ふたりの取扱説明書」を出します。</p>

        <h2>星座の相性は、ぜんぶで4層のうちの1層</h2>
        <p>ここまではエレメント、つまり太陽星座の層の話です。MYOURISCOPEの相性診断は、これに<strong>九星の五行</strong>(25%)、<strong>干支の巡り</strong>(25%)、<strong>生まれた日の十干どうしの対話</strong>(20%)を重ねます。だから同じ${a.name}×${b.name}でも、生まれた日が違えばスコアも、関係のキーワードも変わります。</p>
        <p>さらに「${a.name}から見た${b.name}」と「${b.name}から見た${a.name}」は同じではありません。相性診断では、この<em>見え方の非対称</em>を50通りのラベルで別々に出します。片思いの側と、思われている側の温度差は、たいていここに出ます。</p>
      </article>

      <div class="lp-cta">
        <a class="btn-observe" href="/#aisho"><span class="bo-mark" aria-hidden="true">◉</span>ふたりの生年月日で観る</a>
        <p class="lp-cta-note">登録不要・生年月日だけ。入力した情報は端末の中だけに保存されます。</p>
      </div>

${faqSection(faqs)}
      <section class="lp-related">
        <p class="lp-related-title">${a.kana}の相性</p>
        <div class="lp-related-grid lp-related-signs">
${SIGNS.filter((s) => s.name !== a.name).map((s) => {
  const [x, y] = ORDER.indexOf(a.name) <= ORDER.indexOf(s.name) ? [a, s] : [s, a];
  return `          <a href="/aisho/seiza/${pairSlug(x, y)}/">${a.name} × ${s.name}<small>${a.element}と${s.element}</small></a>`;
}).join("\n")}
        </div>
      </section>

      <section class="lp-related">
        <p class="lp-related-title">Divinations</p>
        <div class="lp-related-grid">
          <a href="/aisho/seiza/"><strong>星座の相性 一覧</strong><small>12星座 × 12星座の全組み合わせ</small></a>
          <a href="/aisho/">相性占い<small>生年月日だけ・4層スコア</small></a>
          <a href="/seiza/${a.slug}/">${a.name}のページ<small>期間・エレメント・支配星</small></a>
          <a href="/seiza/${b.slug}/">${b.name}のページ<small>期間・エレメント・支配星</small></a>
          <a href="/kyusei/">九星気学<small>本命星の気質と吉方位</small></a>
        </div>
      </section>
`;

  return shell({
    path,
    title,
    description,
    eyebrow: `${a.en.toUpperCase()} × ${b.en.toUpperCase()}`,
    h1: same ? `${a.name}同士の相性` : `${a.name}と${b.name}の相性`,
    sub: `${a.kana}と${b.kana} — ${rel.note}`,
    breadcrumb: `<a href="/">MYOURISCOPE</a> › <a href="/aisho/">相性占い</a> › <a href="/aisho/seiza/">星座の相性</a> › ${same ? `${a.name}同士` : `${a.name}と${b.name}`}`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": SITE + path + "#webpage", url: SITE + path, name: title, description, inLanguage: "ja", isPartOf: { "@id": SITE + "/#website" } },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MYOURISCOPE", item: SITE + "/" },
            { "@type": "ListItem", position: 2, name: "相性占い", item: SITE + "/aisho/" },
            { "@type": "ListItem", position: 3, name: "星座の相性", item: SITE + "/aisho/seiza/" },
            { "@type": "ListItem", position: 4, name: same ? `${a.name}同士の相性` : `${a.name}と${b.name}の相性`, item: SITE + path },
          ],
        },
        faqJsonLd(faqs),
      ],
    },
    body,
  });
}

const pairs = [];
for (let i = 0; i < SIGNS.length; i++) {
  for (let j = i; j < SIGNS.length; j++) pairs.push([SIGNS[i], SIGNS[j]]);
}
for (const [a, b] of pairs) write(`/aisho/seiza/${pairSlug(a, b)}/`, pairPage(a, b));

/* --- 星座相性のハブ --- */
{
  const path = "/aisho/seiza/";
  const rows = SIGNS.map((a) => `        <h3 class="lp-sec-h">${a.name}(${a.kana})の相性</h3>
        <div class="lp-related-grid lp-related-signs">
${SIGNS.map((s) => {
    const [x, y] = ORDER.indexOf(a.name) <= ORDER.indexOf(s.name) ? [a, s] : [s, a];
    return `          <a href="/aisho/seiza/${pairSlug(x, y)}/">${a.name} × ${s.name}<small>${a.element}と${s.element}</small></a>`;
  }).join("\n")}
        </div>`).join("\n");

  const faqs = [
    { q: "星座の相性はどう決まりますか?", a: "西洋占星術では、12星座を火・地・風・水の4つのエレメントに分けて読みます。火と風は互いを高め合い、地と水は育み合う。同じエレメントどうしはテンポが揃う。まずはこの関係が相性の骨格になります。" },
    { q: "相性が悪いと出たら、諦めたほうがいいですか?", a: "いいえ。エレメントが遠い組み合わせは「噛み合わない」のではなく「持っているものが違う」だけです。違うからこそ補い合える関係でもあります。MYOURISCOPEでは低いスコアの層を『ケンカの火種』として、対処法とセットで出します。" },
    { q: "星座だけでは足りませんか?", a: "太陽星座は相性の1層目です。MYOURISCOPEの相性診断は、星座のエレメント・九星の五行・干支の巡り・生まれた日の十干どうしの対話という4層を重ねます。生年月日だけで、登録は要りません。" },
  ];

  write(path, shell({
    path,
    title: "星座の相性 一覧 — 12星座 × 12星座の全78組み合わせ | MYOURISCOPE",
    description: "おひつじ座からうお座まで、12星座どうしの相性を全78組み合わせぶん。エレメントの関係、ふたりの楽しみ方、こじれ方までを組み合わせごとに読みます。生年月日を入れれば、九星・干支・日主まで4層で診断。",
    eyebrow: "COMPATIBILITY BY SIGN",
    h1: "星座の相性 一覧",
    sub: "12星座 × 12星座、全78通り。まずはエレメントから、ふたりの噛み合い方を。",
    breadcrumb: `<a href="/">MYOURISCOPE</a> › <a href="/aisho/">相性占い</a> › 星座の相性`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": SITE + path + "#webpage", url: SITE + path, name: "星座の相性 一覧 — 12星座 × 12星座の全78組み合わせ | MYOURISCOPE", inLanguage: "ja", isPartOf: { "@id": SITE + "/#website" } },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MYOURISCOPE", item: SITE + "/" },
            { "@type": "ListItem", position: 2, name: "相性占い", item: SITE + "/aisho/" },
            { "@type": "ListItem", position: 3, name: "星座の相性", item: SITE + path },
          ],
        },
        {
          "@type": "ItemList",
          itemListElement: pairs.map(([a, b], i) => ({
            "@type": "ListItem", position: i + 1,
            name: a.name === b.name ? `${a.name}同士の相性` : `${a.name}と${b.name}の相性`,
            url: `${SITE}/aisho/seiza/${pairSlug(a, b)}/`,
          })),
        },
        faqJsonLd(faqs),
      ],
    },
    body: `      <article class="panel guide-article lp-article">
        <h2>相性は、エレメントから読みはじめる</h2>
        <p>12星座は、火(牡羊・獅子・射手)、地(牡牛・乙女・山羊)、風(双子・天秤・水瓶)、水(蟹・蠍・魚)の4つのエレメントに分かれます。火と風は互いを高め合い、地と水は育み合う。同じエレメントどうしはテンポが揃う — このエレメントの関係が、相性のいちばん外側の骨格です。</p>
        <p>ただし太陽星座は、あなたを形づくる10天体のうちのひとつでしかありません。だからこの一覧のページは「入口」です。もう少し先まで観たくなったら、生年月日を入れて<a href="/aisho/">4層の相性診断</a>へ。九星の五行、干支の巡り、生まれた日の十干どうしの対話まで重ねると、同じ星座の組み合わせでも答えが変わります。</p>
      </article>

      <div class="lp-cta">
        <a class="btn-observe" href="/#aisho"><span class="bo-mark" aria-hidden="true">◉</span>ふたりの生年月日で観る</a>
        <p class="lp-cta-note">登録不要・生年月日だけ。入力した情報は端末の中だけに保存されます。</p>
      </div>

      <section class="lp-related">
        <p class="lp-related-title">All Combinations</p>
${rows}
      </section>

${faqSection(faqs)}
      <section class="lp-related">
        <p class="lp-related-title">Divinations</p>
        <div class="lp-related-grid">
          <a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>
          <a href="/aisho/">相性占い<small>生年月日だけ・4層スコア</small></a>
          <a href="/seiza/">12星座の一覧<small>期間・エレメント・支配星</small></a>
          <a href="/kyusei/">九星気学<small>本命星の気質と吉方位</small></a>
        </div>
      </section>
`,
  }));
}

/* ============================================================
   2. 九星気学の本命星(9ページ + ハブ)
   ============================================================ */
const KYUSEI_META = [
  { slug: "ippaku-suisei", kana: "いっぱくすいせい", dir: "北", en: "IPPAKU SUISEI" },
  { slug: "jikoku-dosei", kana: "じこくどせい", dir: "南西", en: "JIKOKU DOSEI" },
  { slug: "sanpeki-mokusei", kana: "さんぺきもくせい", dir: "東", en: "SANPEKI MOKUSEI" },
  { slug: "shiroku-mokusei", kana: "しろくもくせい", dir: "南東", en: "SHIROKU MOKUSEI" },
  { slug: "goou-dosei", kana: "ごおうどせい", dir: "中央", en: "GOOU DOSEI" },
  { slug: "roppaku-kinsei", kana: "ろっぱくきんせい", dir: "北西", en: "ROPPAKU KINSEI" },
  { slug: "shichiseki-kinsei", kana: "しちせききんせい", dir: "西", en: "SHICHISEKI KINSEI" },
  { slug: "happaku-dosei", kana: "はっぱくどせい", dir: "北東", en: "HAPPAKU DOSEI" },
  { slug: "kyushi-kasei", kana: "きゅうしかせい", dir: "南", en: "KYUSHI KASEI" },
];

const GOGYO_LONG = { "水": "水(すい)", "土": "土(ど)", "木": "木(もく)", "金": "金(ごん)", "火": "火(か)" };
const REL = D.GOGYO_RELATION;

function kyuseiRelation(a, b) {
  if (a.element === b.element) return { label: "比和", note: `同じ「${a.element}」の気を持つ比和(ひわ)の関係。似た者どうしで、居心地の良さがそのまま長続きにつながります。` };
  if (REL[a.element]?.boosts === b.element) return { label: "相生(生じる側)", note: `${a.name}が${b.name}を育てる相生(そうじょう)の関係。${a.name}が与える側になると、ふたりの流れが自然に回りはじめます。` };
  if (REL[b.element]?.boosts === a.element) return { label: "相生(生じられる側)", note: `${b.name}が${a.name}を育てる相生(そうじょう)の関係。${a.name}にとっては、頼っていい相手です。` };
  return { label: "相剋", note: `${a.name}と${b.name}は相剋(そうこく)の関係。ぶつかりやすい代わりに、この緊張感が互いを鍛えることもあります。` };
}

const KSTARS = KYUSEI.map((k, i) => ({ ...k, ...KYUSEI_META[i] }));

for (const k of KSTARS) {
  const path = `/kyusei/${k.slug}/`;
  const partners = KSTARS.map((o) => ({ o, r: kyuseiRelation(k, o) }));
  const good = partners.filter((p) => p.r.label.startsWith("相生") || p.r.label === "比和");
  const faqs = [
    { q: `${k.name}はどんな性格ですか?`, a: `${k.trait}五行では${GOGYO_LONG[k.element]}の気を持ち、九星の定位盤では${k.dir}に座る星です。` },
    { q: "自分の本命星はどうやって調べますか?", a: "生年月日から計算します。九星は立春(2月4日ごろ)を年の変わり目とするため、1月1日〜2月3日ごろ生まれの方は前の年の星になります。MYOURISCOPEでは生年月日を入れるだけで、この切り替わりも含めて自動で判定します。" },
    { q: `${k.name}と相性のいい星は?`, a: `五行の相生・比和で見ると、${good.map((p) => p.o.name).join("・")}が噛み合いやすい顔ぶれです。ただし相性は九星だけでは決まりません。MYOURISCOPEの相性診断は、星座のエレメント・九星の五行・干支の巡り・生まれた日の十干という4層を重ねて読みます。` },
    { q: "吉方位はどう使いますか?", a: "九星気学では、月ごとに変わる盤(月盤)から、その人にとって凶となる方位(五黄殺・暗剣殺・本命殺・本命的殺)を除いた方位を吉方位とします。旅行・引っ越し・大事な用事の方角を選ぶときの目安です。MYOURISCOPEのマイページでは、今月の吉方位をコンパスで表示します。" },
  ];

  write(path, shell({
    path,
    title: `${k.name}(${k.kana})の性格・相性・吉方位 — 九星気学 | MYOURISCOPE`,
    description: `${k.name}の気質と、五行「${k.element}」から読む九星どうしの相性、吉方位の考え方。${k.trait.slice(0, 46)} 生年月日を入れると本命星の判定と今月の吉方位まで自動で出ます。`,
    eyebrow: k.en,
    h1: `${k.name}(${k.kana})`,
    sub: `五行は${GOGYO_LONG[k.element]}、定位は${k.dir}。九星気学が読む、この星の気質と流れ。`,
    breadcrumb: `<a href="/">MYOURISCOPE</a> › <a href="/kyusei/">九星気学</a> › ${k.name}`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": SITE + path + "#webpage", url: SITE + path, name: `${k.name}(${k.kana})の性格・相性・吉方位 — 九星気学 | MYOURISCOPE`, inLanguage: "ja", isPartOf: { "@id": SITE + "/#website" } },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MYOURISCOPE", item: SITE + "/" },
            { "@type": "ListItem", position: 2, name: "九星気学", item: SITE + "/kyusei/" },
            { "@type": "ListItem", position: 3, name: k.name, item: SITE + path },
          ],
        },
        faqJsonLd(faqs),
      ],
    },
    body: `      <article class="panel guide-article lp-article">
        <h2>${k.name}の基本データ</h2>
        <ul class="ga-list">
          <li><strong>読み</strong>: ${k.kana}</li>
          <li><strong>五行</strong>: ${GOGYO_LONG[k.element]}</li>
          <li><strong>定位(本来の座)</strong>: ${k.dir}</li>
          <li><strong>年の変わり目</strong>: 立春(2月4日ごろ)。1月〜2月上旬生まれは前年の星になります</li>
        </ul>

        <h2>${k.name}は、どんな星か</h2>
        <p>${k.trait}</p>
        <p>九星気学では、生まれた年の気を「本命星」と呼びます。これは性格そのものというより、<em>その人がいちばん自然に力を出せる流れの向き</em>です。${k.name}の場合、${GOGYO_LONG[k.element]}の気が滞りなく回っているときに調子が出ます。逆に無理に他の星のやり方を真似ると、うまくいっていても疲れが残ります。</p>

        <h2>${k.name}と九星の相性(五行で読む)</h2>
        <ul class="ga-list">
${KSTARS.map((o) => `          <li><strong>${o.name}</strong> — ${kyuseiRelation(k, o).label}: ${kyuseiRelation(k, o).note}</li>`).join("\n")}
        </ul>
        <p>ただし、これは相性の1層にすぎません。MYOURISCOPEの<a href="/aisho/">相性診断</a>は、この九星の五行(25%)に加えて、<a href="/seiza/">星座のエレメント</a>(30%)、干支の巡り(25%)、生まれた日の十干どうしの対話(20%)を重ねて読みます。同じ${k.name}どうしでも、生まれた日が違えば答えは変わります。</p>

        <h2>吉方位という考え方</h2>
        <p>九星気学には、月ごとに九つの星が盤の上を巡るという考え方があります。その月の盤から、<strong>五黄殺・暗剣殺・本命殺・本命的殺</strong>という凶方位を取り除いた残りが、その人にとっての吉方位です。旅行・引っ越し・大事な用件の方角を決めるときの目安になります。</p>
        <p>吉方位は毎月変わり、本命星ごとに違います。MYOURISCOPEでは生年月日を入れると本命星を自動で判定し、マイページに<strong>今月の吉方位</strong>をコンパスで表示します。</p>

        <h2>本命星は、東洋側の一枚目</h2>
        <p>九星は、東洋の占術のなかでは「年の気」を見る道具です。もっと細かく個人を見るなら、<a href="/shichusuimei/">四柱推命</a>の命式 — 年・月・日の柱と、生まれた日の十干(日主) — まで降りていきます。MYOURISCOPEは九星と四柱推命を同じ画面で扱い、さらに西洋の<a href="/horoscope/">ホロスコープ</a>と重ねて<a href="/shogo/">運命の称号</a>という一つの言葉にまとめます。</p>
      </article>

      <div class="lp-cta">
        <a class="btn-observe" href="/#eastern"><span class="bo-mark" aria-hidden="true">◉</span>自分の本命星と吉方位を観る</a>
        <p class="lp-cta-note">登録不要・生年月日だけ。立春の切り替わりも自動で判定します。</p>
      </div>

${faqSection(faqs)}
      <section class="lp-related">
        <p class="lp-related-title">Nine Stars</p>
        <div class="lp-related-grid lp-related-signs">
${KSTARS.filter((o) => o.name !== k.name).map((o) => `          <a href="/kyusei/${o.slug}/">${o.name}<small>${GOGYO_LONG[o.element]}・${o.dir}</small></a>`).join("\n")}
        </div>
      </section>

      <section class="lp-related">
        <p class="lp-related-title">Divinations</p>
        <div class="lp-related-grid">
          <a href="/kyusei/"><strong>九星気学 一覧</strong><small>九つの本命星と吉方位</small></a>
          <a href="/shichusuimei/">四柱推命<small>命式・通変星・日主</small></a>
          <a href="/aisho/">相性占い<small>生年月日だけ・4層スコア</small></a>
          <a href="/today/">今日の運勢<small>四柱推命×干支×月相の合議</small></a>
        </div>
      </section>
`,
  }));
}

/* --- 九星のハブ --- */
{
  const path = "/kyusei/";
  const faqs = [
    { q: "本命星はどうやって調べますか?", a: "生まれた年から計算します。ただし九星は立春(2月4日ごろ)を年の変わり目とするため、1月1日〜2月3日ごろ生まれの方は前の年の星になります。MYOURISCOPEでは生年月日を入れるだけで、この切り替わりも含めて自動で判定します。" },
    { q: "九星気学と四柱推命はどう違いますか?", a: "九星気学は「年の気」を九つに分けて、方位と結びつけて読む占術です。四柱推命は生まれた年・月・日を干支に置き換えて、より細かく個人の傾向と時期を読みます。MYOURISCOPEは両方を同じ画面で扱い、九星からは吉方位を、四柱推命からは日々の気流を出します。" },
    { q: "吉方位はどう使えばいいですか?", a: "その月の盤から凶方位(五黄殺・暗剣殺・本命殺・本命的殺)を除いた方角が吉方位です。旅行・引っ越し・大事な用件の方角を決めるときの目安として使います。毎月変わり、本命星ごとに違います。" },
  ];
  write(path, shell({
    path,
    title: "九星気学 — 九つの本命星の性格・相性・吉方位 | MYOURISCOPE",
    description: "一白水星から九紫火星まで、九星気学の本命星それぞれの気質と、五行で読む星どうしの相性、吉方位の考え方。生年月日を入れると立春の切り替わりも含めて本命星を自動判定し、今月の吉方位を出します。",
    eyebrow: "NINE STARS",
    h1: "九星気学",
    sub: "生まれた年の気を九つに分けて、気質と方位を読む。東洋の占術の、いちばん外側の地図。",
    breadcrumb: `<a href="/">MYOURISCOPE</a> › 九星気学`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": SITE + path + "#webpage", url: SITE + path, name: "九星気学 — 九つの本命星の性格・相性・吉方位 | MYOURISCOPE", inLanguage: "ja", isPartOf: { "@id": SITE + "/#website" } },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MYOURISCOPE", item: SITE + "/" },
            { "@type": "ListItem", position: 2, name: "九星気学", item: SITE + path },
          ],
        },
        {
          "@type": "ItemList",
          itemListElement: KSTARS.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.name, url: `${SITE}/kyusei/${k.slug}/` })),
        },
        faqJsonLd(faqs),
      ],
    },
    body: `      <article class="panel guide-article lp-article">
        <h2>九星気学とは</h2>
        <p>生まれた年の気を九つに分けて、その人の気質と、動くのに良い方角を読む占術です。九つの星はそれぞれ五行(木・火・土・金・水)と結びついていて、盤の上を毎年・毎月めぐります。<strong>本命星</strong>は、その人が生まれた年に中央にあった星のこと — いちばん自然に力を出せる流れの向きだと考えます。</p>
        <p>注意したいのは年の変わり目です。九星の一年は1月1日ではなく<strong>立春(2月4日ごろ)</strong>から始まります。1月生まれ・2月上旬生まれの方は、前の年の星になります。</p>
      </article>

      <section class="lp-related">
        <p class="lp-related-title">Nine Stars</p>
        <div class="lp-related-grid lp-related-signs">
${KSTARS.map((k) => `          <a href="/kyusei/${k.slug}/">${k.name}<small>${GOGYO_LONG[k.element]}・${k.dir}</small></a>`).join("\n")}
        </div>
      </section>

      <div class="lp-cta">
        <a class="btn-observe" href="/#eastern"><span class="bo-mark" aria-hidden="true">◉</span>自分の本命星と吉方位を観る</a>
        <p class="lp-cta-note">登録不要・生年月日だけ。立春の切り替わりも自動で判定します。</p>
      </div>

      <article class="panel guide-article lp-article">
        <h2>五行で読む、星どうしの相性</h2>
        <p>九星の相性は、それぞれの星が持つ五行の関係で読みます。木は火を生み、火は土を生み、土は金を生み、金は水を生み、水は木を生む — これが<strong>相生(そうじょう)</strong>。育てる側と育てられる側の関係です。同じ五行どうしは<strong>比和(ひわ)</strong>で、似た者どうしの気楽さがあります。そのどちらでもない組み合わせが<strong>相剋(そうこく)</strong>で、ぶつかりやすい代わりに互いを鍛えます。</p>
        <p>ただし九星は相性の1層です。MYOURISCOPEの<a href="/aisho/">相性診断</a>では、星座のエレメント(30%)・九星の五行(25%)・干支の巡り(25%)・生まれた日の十干どうしの対話(20%)の4層を重ねて読みます。</p>

        <h2>吉方位という考え方</h2>
        <p>その月の盤から、<strong>五黄殺・暗剣殺・本命殺・本命的殺</strong>という凶方位を取り除いた残りが吉方位です。旅行・引っ越し・大事な用件の方角を選ぶときの目安になります。毎月変わり、本命星ごとに違うので、そのつど確かめるものです。MYOURISCOPEのマイページでは、今月の吉方位をコンパスで表示します。</p>
      </article>

${faqSection(faqs)}
      <section class="lp-related">
        <p class="lp-related-title">Divinations</p>
        <div class="lp-related-grid">
          <a href="/"><strong>MYOURISCOPE トップ</strong><small>五つの観測の入口へ</small></a>
          <a href="/shichusuimei/">四柱推命<small>命式・通変星・日主</small></a>
          <a href="/aisho/">相性占い<small>生年月日だけ・4層スコア</small></a>
          <a href="/seiza/">12星座の一覧<small>期間・エレメント・支配星</small></a>
        </div>
      </section>
`,
  }));
}

console.log(`星座相性 ${pairs.length} ページ + ハブ1 / 九星 ${KSTARS.length} ページ + ハブ1 を生成しました`);

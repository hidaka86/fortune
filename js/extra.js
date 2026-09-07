/* MYOURISCOPE — 追加占術:アストロダイス / マヤ暦(ツォルキン)
   app.js の共通部品(navigate / observeThen / showResult / cardH4 / recordHistory / lastShare / shareRowHtml)を使う。
   読み込み順: data → fortune → icons → mystic → app → extra */
(function () {
  "use strict";

  /* ============================================================
     1. アストロダイス — 天体・星座・ハウスの三つの12面体
        ページ上の小さな卓 → 全画面「ダイスの間」で押さえて・振って・はなす
        → 転がって止まる → 三つの目を順に読み解く → 鑑定
     ============================================================ */
  const DICE_PLANETS = [
    { key: "sun", ja: "太陽", glyph: "☉", theme: "意志と目的", what: "あなたの中心にある「こうありたい」という意志。主役として前に出ること。", advice: "遠慮せず、自分の名前で決めてください。", ask: "本当は、どうしたいのですか?" },
    { key: "moon", ja: "月", glyph: "☽", theme: "感情と安心", what: "理屈より先に動く気持ち。安心できる場所や、素の自分。", advice: "気持ちの声を、正直に聞くのが近道です。", ask: "いちばん安心できる選択は、どれですか?" },
    { key: "mercury", ja: "水星", glyph: "☿", theme: "言葉と情報", what: "言葉・会話・情報のやりとり。考えを整理し、伝えること。", advice: "まず言葉にして、誰かに話してみてください。", ask: "まだ言葉にしていないことは、何ですか?" },
    { key: "venus", ja: "金星", glyph: "♀", theme: "愛と価値", what: "好きなもの、心地よさ、人との調和。何に価値を置くか。", advice: "「好き」を基準に選んで大丈夫です。", ask: "それは、あなたが本当に好きなものですか?" },
    { key: "mars", ja: "火星", glyph: "♂", theme: "行動と情熱", what: "踏み出す力、競う力、怒りも含めたエネルギー。", advice: "考えすぎる前に、最初の一歩を。", ask: "いま踏み出せる、最初の一歩は何ですか?" },
    { key: "jupiter", ja: "木星", glyph: "♃", theme: "拡大と幸運", what: "広がり、寛容さ、チャンス。楽観と学び。", advice: "少し大きめに構えて、受け取る準備を。", ask: "もう一段大きく考えたら、何が見えますか?" },
    { key: "saturn", ja: "土星", glyph: "♄", theme: "責任と鍛錬", what: "時間をかけて築くもの。制限、責任、成熟。", advice: "急がず、土台から。続けた分だけ残ります。", ask: "十年後も残っているものは、どれですか?" },
    { key: "uranus", ja: "天王星", glyph: "♅", theme: "変革と自由", what: "突然の変化、常識からの解放、独自性。", advice: "型を破っていい合図です。予定外を歓迎して。", ask: "「普通はこうする」を外したら、どうなりますか?" },
    { key: "neptune", ja: "海王星", glyph: "♆", theme: "夢と直感", what: "境界が溶けるような感覚、想像力、癒し、あいまいさ。", advice: "はっきりさせるより、感じ取る時間を。", ask: "理屈を外したとき、何を感じていますか?" },
    { key: "pluto", ja: "冥王星", glyph: "♇", theme: "変容と再生", what: "根本から作り変える力。手放して、生まれ変わること。", advice: "終わらせることを恐れないで。そこから始まります。", ask: "手放すと決めたら、何が軽くなりますか?" },
    { key: "north-node", ja: "ノースノード", glyph: "☊", theme: "これから向かう方向", what: "魂が伸びていく方向。慣れないけれど成長できる場所。", advice: "不慣れなほうを選ぶと、伸びます。", ask: "少し怖いけれど惹かれている道は、どちらですか?" },
    { key: "south-node", ja: "サウスノード", glyph: "☋", theme: "積み重ねてきたもの", what: "すでに持っている資質、慣れ親しんだやり方。", advice: "得意を頼りつつ、そこに留まりすぎないこと。", ask: "これまで何度も、あなたを助けてきたものは何ですか?" },
  ];
  const DICE_SIGNS = [
    { key: "aries", name: "牡羊座", glyph: "♈", el: "fire", how: "まっすぐ、勢いよく", mode: "考えるより先に飛び込む", tip: "勢いは武器ですが、走りながら周りの声も聞いてください。" },
    { key: "taurus", name: "牡牛座", glyph: "♉", el: "earth", how: "じっくり、確かめながら", mode: "五感で味わい、着実に", tip: "急かされても、自分のペースを守っていい場面です。" },
    { key: "gemini", name: "双子座", glyph: "♊", el: "air", how: "軽やかに、いくつも並行して", mode: "情報を集め、言葉にしながら", tip: "選択肢を並べたら、ひとつは実際に試してみてください。" },
    { key: "cancer", name: "蟹座", glyph: "♋", el: "water", how: "寄り添い、守りながら", mode: "気持ちを大切に、身近な人と", tip: "守ることと、閉じこもることは違います。信頼できる人には開いて。" },
    { key: "leo", name: "獅子座", glyph: "♌", el: "fire", how: "堂々と、楽しみながら", mode: "主役として表現する", tip: "見られることを恐れないで。楽しんでいる姿が、人を動かします。" },
    { key: "virgo", name: "乙女座", glyph: "♍", el: "earth", how: "丁寧に、細部まで", mode: "整えて、役に立つかたちで", tip: "完璧を待たず、八割で一度かたちにしてみてください。" },
    { key: "libra", name: "天秤座", glyph: "♎", el: "air", how: "バランスをとりながら", mode: "相手と釣り合いを見て", tip: "迷ったら、相手の立場に一度立ってから決めるとぶれません。" },
    { key: "scorpio", name: "蠍座", glyph: "♏", el: "water", how: "深く、一点集中で", mode: "本質だけを見つめて", tip: "表面のやりとりに付き合わず、本当に大事な一点に絞ってください。" },
    { key: "sagittarius", name: "射手座", glyph: "♐", el: "fire", how: "遠くを見て、大胆に", mode: "意味と可能性を信じて", tip: "細部より方向。「どこへ行きたいか」を先に決めてください。" },
    { key: "capricorn", name: "山羊座", glyph: "♑", el: "earth", how: "計画的に、現実的に", mode: "目標を決めて、段階を踏んで", tip: "遠回りに見える手順が、いちばんの近道です。" },
    { key: "aquarius", name: "水瓶座", glyph: "♒", el: "air", how: "自由に、少し距離をとって", mode: "常識から離れ、独自のやり方で", tip: "みんなと同じでなくていい。ただし、説明する言葉は用意して。" },
    { key: "pisces", name: "魚座", glyph: "♓", el: "water", how: "やわらかく、流れにまかせて", mode: "感じるままに、境界をゆるめて", tip: "抗わず、流れに乗ってみる。ただし目印はひとつ持って。" },
  ];
  const ELEMENT_PACE = {
    fire: { ja: "火", pace: "テンポは速め。動きながら形が見えてくるタイプの進み方です。" },
    earth: { ja: "地", pace: "テンポはゆっくり。手で触れて確かめながら、着実に積み上げる進み方です。" },
    air: { ja: "風", pace: "テンポは軽やか。人と話し、情報を交わしながら整っていく進み方です。" },
    water: { ja: "水", pace: "テンポは気持ち次第。感じ取り、なじませながら浸透していく進み方です。" },
  };
  const DICE_HOUSES = [
    { n: 1, ja: "自分自身", field: "あなた自身・第一印象・体", where: "自分のあり方や見せ方に関すること。", action: "鏡を見て、今日の自分の見せ方を一か所だけ変えてみる。" },
    { n: 2, ja: "所有と価値", field: "お金・才能・自分の価値", where: "収入や持ち物、自分の価値の感じ方。", action: "自分の持っているもの(お金・才能・時間)を書き出して、値付けし直してみる。" },
    { n: 3, ja: "言葉と学び", field: "会話・学習・身近な人", where: "日常の会話、勉強、兄弟や近所づきあい。", action: "身近な人とひとつ会話を増やす。調べたかったことを十分だけ学ぶ。" },
    { n: 4, ja: "家と基盤", field: "家庭・住まい・心の土台", where: "家族、住まい、安心の根っこ。", action: "部屋の一角を整える。家族や「帰る場所」に短く連絡する。" },
    { n: 5, ja: "創造と恋", field: "恋愛・遊び・創作・子ども", where: "楽しみ、表現、恋のときめき。", action: "理由のない楽しみに時間を使う。作りかけのものに手を伸ばす。" },
    { n: 6, ja: "仕事と健康", field: "日々の仕事・習慣・体調", where: "毎日のルーティンと健康管理。", action: "毎日の手順をひとつ見直す。体のメンテナンスを予定に入れる。" },
    { n: 7, ja: "パートナー", field: "結婚・契約・一対一の関係", where: "大切な相手との対等な関係。", action: "大切な相手に、いま考えていることを対等な言葉で伝える。" },
    { n: 8, ja: "深い結びつき", field: "共有財産・親密さ・変容", where: "深く関わることで起きる変化。", action: "うやむやにしている深い話題を、ひとつだけ正面から扱う。" },
    { n: 9, ja: "遠くと哲学", field: "旅・学問・信念・海外", where: "視野を広げる経験や信じるもの。", action: "遠くの予定を立てる。普段読まない分野の本を開く。" },
    { n: 10, ja: "キャリア", field: "社会的な役割・目標・評価", where: "仕事での到達点、社会的な顔。", action: "自分の肩書きや目標を、一行で書き直してみる。" },
    { n: 11, ja: "仲間と未来", field: "友人・コミュニティ・願い", where: "仲間、ネットワーク、未来への願い。", action: "久しぶりの友人に連絡する。願いを人に話して仲間を増やす。" },
    { n: 12, ja: "内なる世界", field: "無意識・癒し・ひとりの時間", where: "目に見えない領域、休息と手放し。", action: "予定を空けて、ひとりで静かに過ごす時間を確保する。" },
  ];

  /* 12面体の各面の向き(0=上面, 1-5=上段, 6-10=下段, 11=下面) */
  const PHI_UP = 63.435, PHI_DOWN = 116.565;
  const FACES = [
    { az: 0, phi: 0, rot: 0 },
    ...[0, 1, 2, 3, 4].map((k) => ({ az: k * 72, phi: PHI_UP, rot: 180 })),
    ...[0, 1, 2, 3, 4].map((k) => ({ az: 36 + k * 72, phi: PHI_DOWN, rot: 0 })),
    { az: 0, phi: 180, rot: 0 },
  ];
  const FACE_K = 0.8507;    // 面(五角形)の外接円半径 / 辺
  const IN_K = 1.1135;      // 中心から面までの距離 / 辺
  const DIE_R_K = 1.4;      // 当たり判定の半径 / 辺(外接球より少し小さめ)

  /* 辺の長さは CSS 変数 --edge で与え、面の配置は calc で追従させる(卓上・ダイスの間でサイズが変わる) */
  function dieHtml(kind, labels) {
    const faces = FACES.map((f, i) => {
      const shade = f.phi === 0 ? 1 : f.phi === PHI_UP ? 0.82 : f.phi === PHI_DOWN ? 0.6 : 0.45;
      return `<div class="die-face" style="--shade:${shade};transform:rotateY(${f.az}deg) rotateX(${90 - f.phi}deg) translateZ(calc(var(--edge) * ${IN_K})) rotate(${f.rot}deg)">
        <span class="die-label" style="transform:rotate(${-f.rot}deg)">${labels[i]}</span></div>`;
    }).join("");
    return `<div class="die-wrap" data-die="${kind}"><div class="die">${faces}</div><span class="die-shadow"></span></div>`;
  }

  function rand(n) {
    const a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] % n;
  }
  const iconFor = (key, fallback, size) => {
    const MI = window.MysticIcons;
    return (MI && MI.CATALOG[key]) ? MI.mysticIcon(key, { size, label: "" }) : `<span class="die-glyph">${fallback}</span>`;
  };
  const diceLabels = () => ({
    planet: DICE_PLANETS.map((p) => iconFor(p.key, p.glyph, 30)),
    sign: DICE_SIGNS.map((s) => iconFor(s.key, s.glyph, 30)),
    house: DICE_HOUSES.map((h) => `<span class="die-num">${h.n}</span>`),
  });
  const DIE_KINDS = ["planet", "sign", "house"];
  const DIE_ASK = { planet: "なにが", sign: "どのように", house: "どこで" };

  /* ---------- ページ上の卓:静かに回る三つのダイス+入口 ---------- */
  function renderDiceStage() {
    const stage = document.getElementById("dice-stage");
    if (!stage) return;
    const L = diceLabels();
    stage.innerHTML = `
      <div class="dice-table dice-idle" id="dice-table" role="button" tabindex="0" aria-label="ダイスの間へ入る">
        ${DIE_KINDS.map((k) => dieHtml(k, L[k])).join("")}
        <span class="dice-table-hint">触れて、ダイスの間へ</span>
      </div>
      <p class="dice-caption"><span>天体</span><span>星座</span><span>ハウス</span></p>
      <div class="dice-cta">
        <button class="btn btn-primary btn-lg" id="dice-enter" type="button">ダイスの間へ</button>
        <p class="ritual-hint">問いを胸に置いて、扉をひらいてください。全画面の間で、あなたの手でダイスを振ります。</p>
      </div>`;
    const enter = () => openDiceChamber();
    document.getElementById("dice-enter").addEventListener("click", enter);
    const table = document.getElementById("dice-table");
    table.addEventListener("click", enter);
    table.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enter(); } });
  }

  /* ---------- ダイスの間(全画面) ---------- */
  const chamber = {
    open: false, phase: "idle", dice: [], picks: null, q: "",
    raf: 0, lastT: 0, pointer: null, hand: null, energy: 0, revealTimer: 0, revealIdx: -1,
  };

  function overlayEl() { return document.getElementById("ritual-overlay"); }

  function openDiceChamber() {
    const ov = overlayEl();
    if (!ov || chamber.open) return;
    chamber.q = (document.getElementById("dice-question")?.value || "").trim();
    chamber.open = true;
    chamber.phase = "idle";
    chamber.picks = null;
    chamber.revealIdx = -1;
    const L = diceLabels();
    ov.hidden = false;
    ov.classList.add("dice-chamber");
    document.body.classList.add("ritual-open");
    ov.innerHTML = `
      <button class="ritual-close" id="dice-close" aria-label="ダイスの間を出る">×</button>
      <div class="dice-room">
        <div class="dice-room-head">
          <p class="ritual-eyebrow emerge">ASTRO DICE</p>
          ${chamber.q ? `<p class="dice-room-q emerge" style="--ed:.1s">「${esc(chamber.q)}」</p>` : ""}
          <p class="ritual-inst emerge" style="--ed:.2s" id="dice-inst">卓を<strong>押さえて</strong>、ダイスを手に取ってください</p>
        </div>
        <div class="dice-felt" id="dice-felt" aria-label="ダイスを振る卓">
          <span class="dice-hand" id="dice-hand" hidden></span>
          ${DIE_KINDS.map((k) => dieHtml(k, L[k])).join("")}
          <div class="dice-captions" id="dice-captions">
            ${DIE_KINDS.map((k) => `<div class="dice-cap" data-cap="${k}"><small>${DIE_ASK[k]}</small><b></b><span></span></div>`).join("")}
          </div>
          <div class="dice-verdict" id="dice-verdict" hidden></div>
        </div>
        <div class="dice-room-foot">
          <button class="btn btn-ghost dice-alt" id="dice-throw-btn" type="button">手を使わずに振る</button>
        </div>
      </div>`;
    document.getElementById("dice-close").addEventListener("click", closeDiceChamber);
    document.getElementById("dice-throw-btn").addEventListener("click", () => {
      if (chamber.phase === "idle" || chamber.phase === "hold") autoThrow();
    });
    setupFelt();
    document.dispatchEvent(new CustomEvent("myouriscope:flip"));
  }

  function closeDiceChamber() {
    const ov = overlayEl();
    chamber.open = false;
    cancelAnimationFrame(chamber.raf);
    clearTimeout(chamber.revealTimer);
    window.removeEventListener("resize", layoutFelt);
    if (ov) { ov.hidden = true; ov.innerHTML = ""; ov.classList.remove("dice-chamber", "dice-dim"); }
    document.body.classList.remove("ritual-open");
  }

  /* 卓の寸法・ダイスの大きさ(画面に合わせる) */
  function feltMetrics() {
    const felt = document.getElementById("dice-felt");
    const W = felt.clientWidth, H = felt.clientHeight;
    const edge = Math.max(34, Math.min(58, Math.min(W, H) * 0.085));
    return { felt, W, H, edge, r: edge * DIE_R_K };
  }
  function layoutFelt() {
    if (!chamber.open || !document.getElementById("dice-felt")) return;
    const m = feltMetrics();
    m.felt.style.setProperty("--edge", `${m.edge}px`);
    if (chamber.phase === "idle" || chamber.phase === "hold") restDice(m, true);
    if (chamber.phase === "arranged" || chamber.phase === "reveal" || chamber.phase === "done") {
      slotPositions(m).forEach((s, i) => { chamber.dice[i].x = s.x; chamber.dice[i].y = s.y; });
      chamber.dice.forEach(paintDie);
    }
  }
  function slotPositions(m) {
    const gap = Math.min(m.W / 3, m.r * 3.2);
    const y = m.H * 0.34;
    return [-1, 0, 1].map((k) => ({ x: m.W / 2 + k * gap, y }));
  }
  /* 休んでいる三つ:卓の下のほうにそっと固まっている */
  function restDice(m, snap) {
    const cx = m.W / 2, cy = m.H * 0.7;
    chamber.dice.forEach((d, i) => {
      const tx = cx + (i - 1) * m.r * 2.15, ty = cy + (i === 1 ? -m.r * 0.5 : m.r * 0.15);
      if (snap) { d.x = tx; d.y = ty; }
      d.home = { x: tx, y: ty };
    });
  }

  function setupFelt() {
    const m = feltMetrics();
    m.felt.style.setProperty("--edge", `${m.edge}px`);
    const wraps = [...m.felt.querySelectorAll(".die-wrap")];
    chamber.dice = wraps.map((el, i) => ({
      el, die: el.querySelector(".die"), shadow: el.querySelector(".die-shadow"), kind: DIE_KINDS[i],
      x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
      rx: rand(360), ry: rand(360), rz: 0, wx: 0, wy: 0, wz: 0,
      settled: false, settle: null, home: null, face: 0,
    }));
    restDice(m, true);
    chamber.dice.forEach(paintDie);
    window.addEventListener("resize", layoutFelt);

    const felt = m.felt;
    let samples = [];
    const pos = (e) => { const r = felt.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    felt.addEventListener("pointerdown", (e) => {
      if (chamber.phase === "reveal") { advanceReveal(); return; }
      if (chamber.phase !== "idle") return;
      e.preventDefault();
      felt.setPointerCapture?.(e.pointerId);
      const p = pos(e);
      samples = [p];
      chamber.pointer = p; chamber.hand = { x: p.x, y: p.y }; chamber.energy = 0;
      chamber.phase = "hold";
      const hand = document.getElementById("dice-hand");
      hand.hidden = false; hand.style.transform = `translate(${p.x}px, ${p.y}px)`;
      setInst("そのまま<strong>振って</strong>……ここだ、と思ったら<strong>はなす</strong>");
      vibrate(10);
    });
    felt.addEventListener("pointermove", (e) => {
      if (chamber.phase !== "hold") return;
      const p = pos(e);
      const last = chamber.pointer;
      if (last) {
        const sp = Math.hypot(p.x - last.x, p.y - last.y);
        chamber.energy = Math.min(60, chamber.energy + sp * 0.35);
        if (sp > 30) vibrate(3);
      }
      chamber.pointer = p; chamber.hand = { x: p.x, y: p.y };
      samples.push(p); if (samples.length > 8) samples.shift();
      const hand = document.getElementById("dice-hand");
      if (hand) hand.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
    const release = (e) => {
      if (chamber.phase !== "hold") return;
      const p = pos(e);
      samples.push(p);
      // 直前 ~90ms の指の動きから投げる速さと向きを求める
      const now = p.t;
      const recent = samples.filter((s) => now - s.t <= 90);
      let vx = 0, vy = 0;
      if (recent.length >= 2) {
        const a = recent[0], b = recent[recent.length - 1], dt = Math.max(8, b.t - a.t);
        vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; // px/ms
      }
      throwDice(vx, vy, chamber.energy);
    };
    felt.addEventListener("pointerup", release);
    felt.addEventListener("pointercancel", release);
    felt.addEventListener("lostpointercapture", (e) => { if (chamber.phase === "hold") release(e); });

    chamber.lastT = performance.now();
    chamber.raf = requestAnimationFrame(tick);
  }

  function setInst(html) {
    const el = document.getElementById("dice-inst");
    if (!el) return;
    el.innerHTML = html;
    el.classList.remove("emerge"); void el.offsetWidth; el.classList.add("emerge");
  }

  /* ボタンから振る(キーボード・タップが難しい環境向け):中央から上向きに放る */
  function autoThrow() {
    const m = feltMetrics();
    chamber.hand = { x: m.W / 2, y: m.H * 0.72 };
    chamber.dice.forEach((d) => { d.x = chamber.hand.x + (rand(41) - 20); d.y = chamber.hand.y + (rand(41) - 20); });
    const ang = (-90 + (rand(61) - 30)) * Math.PI / 180;
    const sp = 0.9 + rand(40) / 100;
    throwDice(Math.cos(ang) * sp, Math.sin(ang) * sp, 30);
  }

  function throwDice(vx, vy, energy) {
    const hand = document.getElementById("dice-hand");
    if (hand) hand.hidden = true;
    const m = feltMetrics();
    let sp = Math.hypot(vx, vy);
    if (sp < 0.25) { // ほとんど動かさずに離した:手のひらからこぼす
      const ang = (-90 + (rand(81) - 40)) * Math.PI / 180;
      sp = 0.55 + energy / 120 + rand(20) / 100;
      vx = Math.cos(ang) * sp; vy = Math.sin(ang) * sp;
    }
    sp = Math.min(sp, 2.4); // px/ms 上限
    const ux = vx / Math.hypot(vx, vy), uy = vy / Math.hypot(vx, vy);
    // 出目は手をはなした瞬間の暗号乱数で決まる
    chamber.picks = { planet: rand(12), sign: rand(12), house: rand(12) };
    chamber.phase = "fly";
    setInst("");
    const alt = document.getElementById("dice-throw-btn"); if (alt) alt.hidden = true;
    document.dispatchEvent(new CustomEvent("myouriscope:flip"));
    vibrate(18);
    const kick = 6 + energy / 6; // 振った勢いぶん、よく回る
    chamber.dice.forEach((d, i) => {
      d.face = chamber.picks[d.kind];
      d.settled = false; d.settle = null;
      const spread = (rand(41) - 20) * Math.PI / 180;
      const c = Math.cos(spread), s = Math.sin(spread);
      const v = sp * (0.85 + rand(30) / 100) * 1.35;
      d.vx = (ux * c - uy * s) * v; d.vy = (ux * s + uy * c) * v;
      d.z = 0; d.vz = 0.42 + rand(20) / 100 + Math.min(0.18, energy / 300); // 跳ね上がる(高さは辺の1〜1.5倍ほど)
      d.wx = (rand(200) - 100) / 100 * kick * 0.6 + d.vy * kick * 1.8;
      d.wy = (rand(200) - 100) / 100 * kick * 0.6 + d.vx * kick * 1.8;
      d.wz = (rand(200) - 100) / 100 * kick * 0.4;
      d.el.classList.remove("is-settled");
    });
    if (REDUCED_MOTION) { // 動きを抑える設定:すぐ整列して読み解く
      chamber.dice.forEach((d) => { const f = FACES[d.face]; d.rx = -(90 - f.phi); d.ry = -f.az; d.rz = 0; d.z = 0; d.vx = d.vy = d.vz = 0; d.settled = true; });
      arrangeDice(true);
    }
  }

  const GRAVITY = 0.0032;       // px/ms^2 相当(高さ z はダイスの辺で正規化しない、そのまま px)
  const norm180 = (a) => ((a + 180) % 360 + 360) % 360 - 180;

  function tick(t) {
    if (!chamber.open) return;
    const prevT = chamber.lastT || t - 16;
    const dt = Math.min(34, t - prevT);
    chamber.lastT = t;
    const m = feltMetrics();
    const ds = chamber.dice;
    if (chamber.phase === "idle") {
      // 卓の上で、かすかに息をする
      ds.forEach((d, i) => {
        d.ry += 0.012 * dt * (i % 2 ? 1 : -1);
        d.rx += 0.004 * dt;
        d.z = 0;
        paintDie(d);
      });
    } else if (chamber.phase === "hold") {
      // 手の中で、ころころ:指のまわりに集まって、振った勢いで震える
      const h = chamber.hand, e = chamber.energy;
      chamber.energy = Math.max(0, e - 0.02 * dt);
      ds.forEach((d, i) => {
        const ang = (t / 900 + i * 2.09), rr = m.r * 0.9;
        const tx = h.x + Math.cos(ang) * rr, ty = h.y + Math.sin(ang) * rr * 0.6;
        d.x += (tx - d.x) * Math.min(1, 0.02 * dt);
        d.y += (ty - d.y) * Math.min(1, 0.02 * dt);
        const jit = 0.15 + e * 0.05;
        d.rx += (0.25 + jit) * dt * (i % 2 ? 1 : -1); d.ry += (0.3 + jit) * dt; d.rz += jit * 0.3 * dt;
        d.z = Math.max(0, Math.sin(t / 70 + i) * e * 0.35);
        paintDie(d);
      });
    } else if (chamber.phase === "fly") {
      // 固定ステップで積分(フレームレートが落ちても、転がる速さと時間は同じに)
      let rem = Math.min(120, t - prevT);
      while (rem > 0) { const h = Math.min(16, rem); stepPhysics(ds, m, h); rem -= h; }
      ds.forEach(paintDie);
      if (ds.every((d) => d.settled)) {
        chamber.phase = "settled";
        document.dispatchEvent(new CustomEvent("myouriscope:chime"));
        vibrate([12, 40, 12]);
        setTimeout(() => arrangeDice(false), 650);
      }
    } else if (chamber.phase === "arranging") {
      // 止まった場所から読む順の並びへ、時間ベースでふわりと移動
      const p = Math.min(1, (t - chamber.arrangeT0) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      ds.forEach((d) => {
        d.x = d.sx + (d.tx - d.sx) * e; d.y = d.sy + (d.ty - d.sy) * e;
        d.rz = d.srz * (1 - e); d.z = 0;
        paintDie(d);
      });
      if (p >= 1) {
        ds.forEach((d) => { d.x = d.tx; d.y = d.ty; d.rz = 0; paintDie(d); });
        chamber.phase = "arranged";
        startReveal();
      }
    }
    chamber.raf = requestAnimationFrame(tick);
  }

  function stepPhysics(ds, m, dt) {
    const pad = m.r;
    for (const d of ds) {
      if (d.settled) continue;
      if (d.settle) { // 目を上に向けて止まる(ふんわり収束)
        const p = Math.min(1, (performance.now() - d.settle.t0) / d.settle.dur);
        const e = 1 - Math.pow(1 - p, 3);
        d.rx = d.settle.rx0 + (d.settle.rx1 - d.settle.rx0) * e;
        d.ry = d.settle.ry0 + (d.settle.ry1 - d.settle.ry0) * e;
        d.rz += d.wz * dt; d.wz *= Math.pow(0.9, dt / 16);
        d.x += d.vx * dt; d.y += d.vy * dt;
        d.vx *= Math.pow(0.88, dt / 16); d.vy *= Math.pow(0.88, dt / 16);
        if (p >= 1) { d.settled = true; d.el.classList.add("is-settled"); vibrate(6); }
        continue;
      }
      // 高さ(跳ねる)
      d.vz -= GRAVITY * dt;
      d.z += d.vz * dt;
      if (d.z <= 0) {
        d.z = 0;
        if (d.vz < -0.12) { d.vz = -d.vz * 0.42; vibrate(4); d.wx *= 0.7; d.wy *= 0.7; }
        else d.vz = 0;
      }
      const onTable = d.z === 0 && d.vz === 0;
      const fr = onTable ? Math.pow(0.975, dt / 16) : Math.pow(0.99, dt / 16);
      d.vx *= fr; d.vy *= fr;
      d.x += d.vx * dt; d.y += d.vy * dt;
      const wf = onTable ? Math.pow(0.965, dt / 16) : Math.pow(0.995, dt / 16);
      d.wx *= wf; d.wy *= wf; d.wz *= wf;
      d.rx += d.wx * dt * 0.06; d.ry += d.wy * dt * 0.06; d.rz += d.wz * dt * 0.06;
      // 壁
      if (d.x < pad) { d.x = pad; d.vx = Math.abs(d.vx) * 0.7; d.wy = -d.wy; vibrate(5); }
      if (d.x > m.W - pad) { d.x = m.W - pad; d.vx = -Math.abs(d.vx) * 0.7; d.wy = -d.wy; vibrate(5); }
      if (d.y < pad) { d.y = pad; d.vy = Math.abs(d.vy) * 0.7; d.wx = -d.wx; vibrate(5); }
      if (d.y > m.H - pad) { d.y = m.H - pad; d.vy = -Math.abs(d.vy) * 0.7; d.wx = -d.wx; vibrate(5); }
      // 止まりかけたら、出目に向けて収束を始める
      const sp = Math.hypot(d.vx, d.vy), w = Math.abs(d.wx) + Math.abs(d.wy);
      if (onTable && sp < 0.06 && w < 2.2) {
        const f = FACES[d.face];
        const tx = -(90 - f.phi), ty = -f.az;
        d.settle = { t0: performance.now(), dur: 520 + rand(200), rx0: d.rx, ry0: d.ry, rx1: d.rx + norm180(tx - d.rx), ry1: d.ry + norm180(ty - d.ry) };
      }
    }
    // ダイス同士
    for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) {
      const a = ds[i], b = ds[j];
      if (a.settled && b.settled) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, min = m.r * 1.9;
      if (d2 === 0 || d2 > min * min) continue;
      const dist = Math.sqrt(d2), nx = dx / dist, ny = dy / dist, over = (min - dist) / 2;
      a.x -= nx * over; a.y -= ny * over; b.x += nx * over; b.y += ny * over;
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rel < 0) {
        const imp = -rel * 0.85;
        a.vx -= nx * imp; a.vy -= ny * imp; b.vx += nx * imp; b.vy += ny * imp;
        a.wz += imp * 30; b.wz -= imp * 30;
        if (imp > 0.15) vibrate(4);
      }
    }
  }

  function paintDie(d) {
    const lift = d.z;
    d.el.style.transform = `translate3d(${d.x.toFixed(1)}px, ${(d.y - lift).toFixed(1)}px, 0)`;
    d.die.style.transform = `rotateZ(${d.rz.toFixed(1)}deg) rotateX(${d.rx.toFixed(1)}deg) rotateY(${d.ry.toFixed(1)}deg)`;
    const sc = Math.max(0.35, 1 - lift / 260), op = Math.max(0.25, 1 - lift / 200);
    d.shadow.style.transform = `translate(-50%, ${lift.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    d.shadow.style.opacity = op.toFixed(3);
  }

  /* 止まった三つを、読む順(天体・星座・ハウス)に並べ直す */
  function arrangeDice(instant) {
    const m = feltMetrics();
    const slots = slotPositions(m);
    chamber.dice.forEach((d, i) => { d.tx = slots[i].x; d.ty = slots[i].y; d.sx = d.x; d.sy = d.y; d.srz = norm180(d.rz); });
    chamber.arrangeT0 = performance.now();
    if (instant) {
      chamber.dice.forEach((d) => { d.x = d.tx; d.y = d.ty; d.rz = 0; d.z = 0; paintDie(d); });
      chamber.phase = "arranged";
      startReveal();
    } else {
      chamber.phase = "arranging";
    }
    overlayEl()?.classList.add("dice-dim");
  }

  /* 読み解き:三つの目を順に灯し、最後に一行の答え */
  function startReveal() {
    chamber.phase = "reveal";
    chamber.revealIdx = -1;
    setInst("三つの目が、そろいました");
    const p = DICE_PLANETS[chamber.picks.planet], s = DICE_SIGNS[chamber.picks.sign], h = DICE_HOUSES[chamber.picks.house];
    const caps = { planet: [p.ja, p.theme], sign: [s.name, s.how], house: [`第${h.n}ハウス`, h.ja] };
    const felt = document.getElementById("dice-felt");
    const m = feltMetrics();
    slotPositions(m).forEach((sl, i) => {
      const c = felt.querySelector(`.dice-cap[data-cap="${DIE_KINDS[i]}"]`);
      c.style.left = `${sl.x}px`; c.style.top = `${sl.y + m.r * 1.35}px`;
      c.querySelector("b").textContent = caps[DIE_KINDS[i]][0];
      c.querySelector("span").textContent = caps[DIE_KINDS[i]][1];
    });
    chamber.revealTimer = setTimeout(advanceReveal, REDUCED_MOTION ? 80 : 700);
  }
  function advanceReveal() {
    if (chamber.phase !== "reveal") return;
    clearTimeout(chamber.revealTimer);
    chamber.revealIdx++;
    const felt = document.getElementById("dice-felt");
    if (!felt) return;
    if (chamber.revealIdx < 3) {
      const kind = DIE_KINDS[chamber.revealIdx];
      chamber.dice[chamber.revealIdx].el.classList.add("is-lit");
      felt.querySelector(`.dice-cap[data-cap="${kind}"]`).classList.add("is-on");
      document.dispatchEvent(new CustomEvent("myouriscope:flip"));
      vibrate(8);
      if (window.goldDust) window.goldDust(chamber.dice[chamber.revealIdx].el, 14);
      chamber.revealTimer = setTimeout(advanceReveal, REDUCED_MOTION ? 80 : 1250);
      return;
    }
    // 一行の答え
    chamber.phase = "done";
    const r = diceReading(chamber.picks, chamber.q);
    const v = document.getElementById("dice-verdict");
    const m = feltMetrics();
    const feltTop = m.felt.getBoundingClientRect().top;
    const capBottom = Math.max(...[...m.felt.querySelectorAll(".dice-cap")].map((c) => c.getBoundingClientRect().bottom - feltTop));
    v.style.top = `${Math.round(Math.max(capBottom + 22, slotPositions(m)[0].y + m.r * 1.35 + 96))}px`;
    v.hidden = false;
    v.innerHTML = `
      <p class="dice-verdict-line emerge">${r.verdict}</p>
      <div class="dice-verdict-actions emerge" style="--ed:.5s">
        <button class="btn btn-primary btn-lg" id="dice-read" type="button">鑑定を読む</button>
        <button class="btn btn-ghost" id="dice-again" type="button">もう一度振る</button>
      </div>`;
    document.dispatchEvent(new CustomEvent("myouriscope:chime"));
    document.getElementById("dice-read").addEventListener("click", () => { const picks = chamber.picks, q = chamber.q; closeDiceChamber(); showDiceReading(picks, q); });
    document.getElementById("dice-again").addEventListener("click", () => { closeDiceChamber(); openDiceChamber(); });
    document.getElementById("dice-inst").textContent = "";
  }

  /* ---------- 読み(文章の組み立て) ---------- */
  function diceReading(picks, q) {
    const p = DICE_PLANETS[picks.planet], s = DICE_SIGNS[picks.sign], h = DICE_HOUSES[picks.house];
    const el = ELEMENT_PACE[s.el];
    const variant = (picks.planet + picks.sign * 3 + picks.house * 7) % 4;
    const verdicts = [
      `「${h.field}」の領域で、${p.theme}が動きはじめています。進め方は、${s.how}。`,
      `いま鍵になるのは、${p.theme}。それを${s.mode}かたちで、「${h.ja}」へ向けてください。`,
      `${p.ja}の光が、「${h.ja}」に差しています。${s.how}——それが、この問いへの答え方です。`,
      `答えは、${h.ja}の中にあります。${p.theme}を、${s.how}扱ってください。`,
    ];
    const verdict = verdicts[variant];
    const story = [
      `まず「なにが」。三つのダイスのうち天体は<strong>${p.ja}</strong>を示しました。${p.what}この問いの奥で動いているのは、${p.theme}です。`,
      `つぎに「どのように」。星座は<strong>${s.name}</strong>。${s.mode}のが、この星座のやり方です。${el.pace}`,
      `そして「どこで」。ハウスは<strong>第${h.n}ハウス</strong>。舞台は${h.where}この領域に目を向けると、答えの輪郭がはっきりします。`,
    ];
    const action = `${h.action}そのとき、${s.how}進めること。${p.advice}`;
    return { p, s, h, el, verdict, story, action, ask: p.ask, tip: s.tip, q };
  }

  function showDiceReading(picks, q) {
    const r = diceReading(picks, q);
    const { p, s, h } = r;
    const ic = (key, glyph, size) => iconFor(key, glyph, size);
    lastShare.astrodice = {
      eyebrow: "ASTRO DICE",
      title: `${p.ja} × ${s.name} × 第${h.n}ハウス`,
      keywords: [p.theme, s.how, h.ja],
      sub: r.verdict,
      x: `【MYOURISCOPE アストロダイス】${q ? `「${q}」の答えは、` : ""}${p.ja}・${s.name}・第${h.n}ハウス。${r.verdict} ✦`,
    };
    recordHistory("アストロダイス", `${p.ja} × ${s.name} × 第${h.n}ハウス`, `${q ? `問い「${q}」。` : ""}${r.verdict}`);
    showResult(document.getElementById("astrodice-result"), `
      <div class="result-hero dice-hero">
        <p class="result-eyebrow">ASTRO DICE</p>
        ${q ? `<p class="dice-q">問い —「${esc(q)}」</p>` : ""}
        <h3 class="result-title">${p.ja} × ${s.name} × 第${h.n}ハウス</h3>
        <div class="dice-triplet">
          <div class="dt-cell"><span class="dt-icon">${ic(p.key, p.glyph, 40)}</span><b>${p.ja}</b><small>なにが — ${p.theme}</small></div>
          <span class="dt-x">×</span>
          <div class="dt-cell"><span class="dt-icon">${ic(s.key, s.glyph, 40)}</span><b>${s.name}</b><small>どのように — ${s.how}</small></div>
          <span class="dt-x">×</span>
          <div class="dt-cell"><span class="dt-icon dt-num">${h.n}</span><b>第${h.n}ハウス</b><small>どこで — ${h.ja}</small></div>
        </div>
        <p class="result-lead" style="margin-inline:auto">${r.verdict}</p>
        ${shareRowHtml("astrodice")}
      </div>
      <div class="result-grid">
        <div class="result-card span-all card-night">
          ${cardH4("READING", "三つの目を、順に読む")}
          <ol class="dice-story">
            ${r.story.map((t) => `<li>${t}</li>`).join("")}
          </ol>
        </div>
        <div class="result-card">
          ${cardH4("PLANET", "なにが動いているか")}
          <p><strong style="color:var(--gold-bright)">${p.ja} — ${p.theme}</strong></p>
          <p style="margin-top:8px">${p.what}</p>
          <p class="sub" style="margin-top:10px">${p.advice}</p>
        </div>
        <div class="result-card">
          ${cardH4("SIGN", "どのように進めるか")}
          <p><strong style="color:var(--gold-bright)">${s.name} — ${s.how}</strong></p>
          <p style="margin-top:8px">${s.mode}のが、この星座のやり方です。${r.el.ja}のエレメント。${r.el.pace}</p>
          <p class="sub" style="margin-top:10px">${s.tip}</p>
        </div>
        <div class="result-card">
          ${cardH4("HOUSE", "どこで起きるか")}
          <p><strong style="color:var(--gold-bright)">第${h.n}ハウス — ${h.ja}</strong></p>
          <p style="margin-top:8px">${h.where}</p>
          <p class="sub" style="margin-top:10px">キーワードは「${h.field}」。</p>
        </div>
        <div class="result-card span-all card-night">
          ${cardH4("ANSWER", "つまり、こういうこと")}
          <p class="tv-word">${r.verdict}</p>
          <div class="dice-answer-grid">
            <div><span class="mo-label">今日の一手</span><p>${r.action}</p></div>
            <div><span class="mo-label">自分への問い</span><p>${p.ja}からの問いかけ——「${r.ask}」</p></div>
          </div>
          ${explainHtml("アストロダイスのしくみ", "アストロダイスは、天体(12面)・星座(12面)・ハウス(12面)の三つのサイコロを同時に振り、出た組み合わせを「なにが・どのように・どこで」として読む占いです。天体は動いているテーマ、星座はその進め方、ハウスは人生のどの領域かを示します。出目は、あなたが手をはなした瞬間に端末の暗号乱数(crypto.getRandomValues)で決まります。振るたびに違う答えになります。")}
        </div>
      </div>
      <div class="crosslinks">
        <span class="crosslinks-label">— 旅はつづく</span>
        <button type="button" id="dice-reroll">もう一度、ダイスの間へ</button>
        <button data-nav="tarot">タロットで深掘りする</button>
        <button data-nav="western">自分の出生図を見る</button>
        <button data-nav="maya">マヤ暦のKINを調べる</button>
      </div>`);
    document.getElementById("dice-reroll")?.addEventListener("click", () => openDiceChamber());
  }

  /* ============================================================
     2. マヤ暦(ツォルキン260日暦・ドリームスペル系)
        文章は「紋章の資質」「音の役割」「二つの重なり」「今日の過ごし方」の四層で組み、
        同じ文型の繰り返しを避けるため、音のグループ・紋章の色ごとに言い回しを変える。
     ============================================================ */
  const MAYA_SEALS = [
    { n: 1, name: "赤い竜", en: "Red Dragon", color: "red", kw: "誕生・母性・育む",
      trait: "命を生み、育てる力を持つ人。面倒見がよく、大きなものを背負えます。",
      essence: "何かを「はじめる」場所に立つ人です。人や物事を育てることに喜びを見つけ、頼られると力が湧きます。世話好きで情が深く、身内と思った相手のためなら労を惜しみません。",
      gift: "生み出す力と、包み込む懐の深さ。ゼロから立ち上げる場面や、人を育てる役目で本領を発揮します。",
      shadow: "抱え込みすぎて、自分の疲れに気づくのが遅れがち。「頼まれていないこと」まで背負っていないか、ときどき点検を。",
      today: "新しく何かをはじめる、誰かの面倒を見る、命に関わること(食事・睡眠・体)を整えるのに向く日。" },
    { n: 2, name: "白い風", en: "White Wind", color: "white", kw: "伝える・精神・共感",
      trait: "言葉と呼吸で気持ちを伝える人。繊細で、心の動きに敏感です。",
      essence: "風のように、目に見えないものを運ぶ人です。言葉、音、雰囲気。人の心の揺れを敏感に察し、それを伝える役目を担います。感受性が高く、ひとりで深呼吸する時間が必要なタイプです。",
      gift: "伝える力と、共感の細やかさ。あなたの言葉ひとつで、場の空気が整うことがあります。",
      shadow: "受け取りすぎて、他人の感情に振り回されやすい面があります。境界線を引くことは、冷たさではありません。",
      today: "伝えること・話すこと・書くことに追い風。深呼吸して、言いそびれていた言葉を届ける日。" },
    { n: 3, name: "青い夜", en: "Blue Night", color: "blue", kw: "夢・直感・豊かさ",
      trait: "内側に大きな夢を抱く人。静かな時間から、豊かさを引き出します。",
      essence: "自分の内側に、広い夜空を持っている人です。多くを語らなくても、心の中では大きな夢が育っています。マイペースで、ひとりの時間に力を蓄えるタイプ。安心できる環境があると、豊かさを周囲に分け与えます。",
      gift: "夢を持ち続ける力と、静けさの中で答えを見つける直感。「ためる」ことが自然にできる人です。",
      shadow: "内にこもりすぎて、夢が夢のまま止まることがあります。信頼できる人にひとつだけ話してみると、動きはじめます。",
      today: "夢を描く、ひとりで考える、お金や資源を見直すのに向く日。急がず、内側の声を聞いて。" },
    { n: 4, name: "黄色い種", en: "Yellow Seed", color: "yellow", kw: "気づき・開花・探究",
      trait: "納得するまで掘り下げる人。ひとつの気づきが、時間をかけて大きく花ひらきます。",
      essence: "種のように、時間をかけて花ひらく人です。「なぜ?」を大切にし、納得できるまで掘り下げます。すぐに結果が出なくても、コツコツと育てる粘りがあり、いつか誰よりも大きな実をつけます。",
      gift: "探究心と、気づきを人に分ける力。あなたの「腑に落ちた」は、周囲にとってもヒントになります。",
      shadow: "納得できないと動けず、腰が重くなることがあります。分からなくても一歩出す、を試してみて。",
      today: "学ぶ、調べる、種をまくことに向く日。すぐ芽が出なくても、今日の気づきはあとで花になります。" },
    { n: 5, name: "赤い蛇", en: "Red Serpent", color: "red", kw: "生命力・情熱・本能",
      trait: "体感で生きる、情熱の人。集中すると圧倒的な力を出します。",
      essence: "頭より、体で世界を知る人です。情熱的で、好きなことには一直線。集中したときの熱量は周囲を圧倒します。体調と気分が直結しやすいので、体のサインを大切にすると、生命力がまっすぐ伸びます。",
      gift: "生命力と、本能的な判断の速さ。「なんとなく嫌」「なんとなく良い」が、たいてい当たります。",
      shadow: "感情の熱が高いぶん、怒りや執着として出やすいところがあります。体を動かして、熱を通過させて。",
      today: "体を動かす、情熱を注ぐ、本能に従うのに向く日。頭で考えすぎず、まず動いてみて。" },
    { n: 6, name: "白い世界の橋渡し", en: "White Worldbridger", color: "white", kw: "橋渡し・手放す・機会",
      trait: "人と人、世界と世界をつなぐ人。手放すことで次の扉がひらきます。",
      essence: "異なるものの間に橋をかける人です。人と人、組織と組織、古いものと新しいもの。おおらかで包容力があり、初対面でも自然に場をつなげます。「手放す」ことが次のご縁を呼ぶ、という循環を体で知っています。",
      gift: "橋渡しの力と、こだわらないおおらかさ。あなたが間に立つと、話がまとまります。",
      shadow: "誰にでも合わせられるぶん、自分の意見が置き去りになりがち。「わたしはこう思う」も、橋の一部です。",
      today: "人を紹介する、間に立つ、古いものを手放すのに向く日。終わらせることが、次の扉になります。" },
    { n: 7, name: "青い手", en: "Blue Hand", color: "blue", kw: "癒し・実行・達成",
      trait: "手を動かして形にする人。癒しの手でもあります。",
      essence: "考えるより、手を動かして理解する人です。作る、直す、整える、癒す。手先の器用さと、やり遂げる根気があります。誰かの痛みに触れると、放っておけない優しさも持っています。",
      gift: "実行力と、癒しの手。「やってみる」までが速く、形にした経験が自信になります。",
      shadow: "抱えた仕事を全部自分の手でやろうとして、手一杯になりやすい面があります。人に渡すのも技術です。",
      today: "手を動かす、作る、片づける、誰かの手助けをするのに向く日。ひとつ完成させると流れが変わります。" },
    { n: 8, name: "黄色い星", en: "Yellow Star", color: "yellow", kw: "美・調和・芸術",
      trait: "美しさとバランスの人。センスで場を輝かせます。",
      essence: "美しいものを見分け、整える感性の人です。色、形、言葉のバランスに敏感で、あなたがいる場所は自然と整っていきます。芸術や表現に縁があり、「きれいだな」と感じる時間が心の栄養になります。",
      gift: "審美眼と、調和を生むセンス。あなたの選ぶものは、周囲の基準になります。",
      shadow: "理想が高いぶん、自分にも人にも厳しくなりがち。八割の美しさを許すと、もっと輝きます。",
      today: "美しいものに触れる、身なりや部屋を整える、表現するのに向く日。完璧より、心地よさを。" },
    { n: 9, name: "赤い月", en: "Red Moon", color: "red", kw: "浄化・流れ・使命",
      trait: "流れを清め、整える人。使命感が原動力です。",
      essence: "水のように、滞ったものを洗い流す人です。感受性が強く、場の空気の濁りに気づきやすい。「これをやらなければ」という使命感が動力で、一度火がつくと止まらない集中力があります。",
      gift: "浄化の力と、使命への集中。あなたが動くと、止まっていた流れが動きはじめます。",
      shadow: "使命感が強いぶん、休むことに罪悪感を覚えがち。水は流れも、たまりもします。休む日もまた流れです。",
      today: "整理する、水回りを清める、やり残しを流すのに向く日。気持ちのモヤモヤも、今日は流れます。" },
    { n: 10, name: "白い犬", en: "White Dog", color: "white", kw: "愛・忠実・家族",
      trait: "愛と忠誠の人。信じた相手にはとことん尽くします。",
      essence: "まっすぐな愛情で人とつながる人です。信じた相手には誠実で、とことん尽くします。家族や仲間を大切にし、その絆が生きる力になります。裏切りには敏感で、誠実さを何より重んじます。",
      gift: "愛する力と、揺るがない忠実さ。あなたのそばは、人が安心して素に戻れる場所です。",
      shadow: "情が深いぶん、相手に同じ誠実さを求めて苦しくなることがあります。愛は、見返りの外にあります。",
      today: "大切な人と過ごす、感謝を伝える、仲間を信じるのに向く日。愛情は言葉にすると、届きます。" },
    { n: 11, name: "青い猿", en: "Blue Monkey", color: "blue", kw: "遊び・魔法・ユーモア",
      trait: "遊び心で世界を変える人。楽しむことが最大の魔法です。",
      essence: "遊び心と好奇心で、場を明るくする人です。頭の回転が速く、ユーモアで空気を変えられます。「楽しい」を軸に選ぶと、不思議と物事がうまく回りはじめる、魔法使いのような一面があります。",
      gift: "発想の柔らかさと、人を笑わせる力。深刻な場面ほど、あなたの軽やかさが救いになります。",
      shadow: "楽しくないことを避けすぎて、大事な話を先送りにしがち。遊び心で、面倒ごとにも触れてみて。",
      today: "遊ぶ、笑う、いつもと違うことを試すのに向く日。真面目に悩むより、面白がるほうが答えに近づきます。" },
    { n: 12, name: "黄色い人", en: "Yellow Human", color: "yellow", kw: "自由意志・影響・知恵",
      trait: "自分の意志で道を選ぶ人。周囲に影響を与えます。",
      essence: "「自分で決める」ことを何より大切にする人です。知恵があり、周囲に自然と影響を与えます。誰かの言いなりになることを嫌い、自由を尊びます。そのぶん、自分の選択には責任を持つ潔さがあります。",
      gift: "決断の自由と、人を動かす影響力。あなたの選び方を見て、勇気を得る人がいます。",
      shadow: "束縛を嫌うぶん、指示や制約に反発しすぎることがあります。ルールの中で自由を見つけるのも知恵です。",
      today: "自分で決める、意見を言う、人に影響を与える立ち位置に向く日。流されず、選び直しを。" },
    { n: 13, name: "赤い空歩く人", en: "Red Skywalker", color: "red", kw: "探検・空間・目覚め",
      trait: "天と地をつなぐ探検者。動きながら学びます。",
      essence: "じっとしているより、動きながら学ぶ探検者です。好奇心が強く、未知の場所や人に飛び込んでいきます。人のために場を開き、みんなが安心して過ごせる空間をつくる役目も持っています。",
      gift: "行動力と、場を開く力。あなたが先に踏み込むことで、あとに続く人の道ができます。",
      shadow: "動き続けないと不安になり、休むのが苦手な面があります。立ち止まることも、探検の一部です。",
      today: "出かける、新しい場所へ行く、人のために場を用意するのに向く日。動きの中で気づきが来ます。" },
    { n: 14, name: "白い魔法使い", en: "White Wizard", color: "white", kw: "魅了・永遠・受容",
      trait: "人を惹きつける魅力の人。「いま」を生きることで魔法が起きます。",
      essence: "理屈を超えて、人を惹きつける人です。無理に説得しなくても、その場にいるだけで空気が変わります。「いま、ここ」に集中すると力が増し、受け入れる姿勢そのものが魔法になります。",
      gift: "魅了する力と、ありのままを受け入れる寛容さ。あなたに話すと、人は安心して本音を出します。",
      shadow: "受け入れすぎて、自分が疲れていることに気づきにくい面があります。魔法使いにも、休息は必要です。",
      today: "受け入れる、許す、今この瞬間に集中するのに向く日。コントロールを手放すほど、うまくいきます。" },
    { n: 15, name: "青い鷲", en: "Blue Eagle", color: "blue", kw: "ビジョン・洞察・創造",
      trait: "高いところから全体を見る人。先を読む目と創造の力があります。",
      essence: "鷲のように、高いところから全体を見渡す人です。先を読む洞察力があり、人が気づかない兆しを拾います。ビジョンを描いて人を導く力があり、心の状態がクリアなほど視界が広がります。",
      gift: "先を見る目と、ビジョンを描く創造力。あなたの「こうなる気がする」は、聞く価値があります。",
      shadow: "見えすぎて、悲観的になったり、人の欠点が気になったりすることがあります。心が曇ると、視界も曇ります。",
      today: "全体を見る、計画を立てる、先を見通すのに向く日。細かいことより、大きな絵を眺めて。" },
    { n: 16, name: "黄色い戦士", en: "Yellow Warrior", color: "yellow", kw: "挑戦・知性・問い",
      trait: "問いを立て、恐れなく挑む人。知性で道を切りひらきます。",
      essence: "問いを立て、恐れずに挑む人です。「本当にそうか?」と考える知性と、答えを確かめに行く勇気があります。困難な状況で力を発揮し、挑戦し続けることで輝きが増していきます。",
      gift: "知性と勇気。あなたの問いかけは、場の思考を一段深くします。",
      shadow: "疑う力が強いぶん、人の言葉を素直に受け取れないことがあります。信じるのも、ひとつの挑戦です。",
      today: "挑戦する、問いを立てる、難しい話に踏み込むのに向く日。恐れは、進む方向の目印です。" },
    { n: 17, name: "赤い地球", en: "Red Earth", color: "red", kw: "共時性・舵取り・自然",
      trait: "流れを読み、舵をとる人。シンクロニシティに敏感です。",
      essence: "大地に足をつけ、流れを読む人です。偶然の一致(シンクロニシティ)に敏感で、「いま動くべきか」を肌で感じます。自然や大地とのつながりが力の源で、人の心を導く舵取りの役目を持っています。",
      gift: "流れを読む力と、ぶれない舵取り。あなたが「今だ」と言うとき、たいてい本当に今です。",
      shadow: "自分の感覚を信じすぎて、頑固に見えることがあります。他人の地図も、たまに見てみて。",
      today: "自然に触れる、流れに乗る、偶然の合図に気づくのに向く日。ふと目に入ったものにヒントがあります。" },
    { n: 18, name: "白い鏡", en: "White Mirror", color: "white", kw: "映す・秩序・永遠",
      trait: "ありのままを映す人。潔く、筋を通します。",
      essence: "ありのままを映す、鏡のような人です。ごまかしを嫌い、筋を通す潔さがあります。あなたと向き合った人は、自分の本質を見せられます。秩序と美しさを大切にし、終わりを受け入れる強さを持っています。",
      gift: "正直さと、本質を映す力。あなたの率直な言葉は、遠回りの答えより人を救います。",
      shadow: "正しさを求めすぎて、自分にも人にも厳しくなりやすい面があります。鏡にも、やわらかい光が必要です。",
      today: "本音を見る、筋を通す、区切りをつけるのに向く日。自分を映す時間を持って。" },
    { n: 19, name: "青い嵐", en: "Blue Storm", color: "blue", kw: "変容・エネルギー・再生",
      trait: "嵐のような変化をもたらす人。壊すことで、新しく生まれ変わります。",
      essence: "嵐のように、大きな変化を運ぶ人です。エネルギーが強く、周囲を巻き込んで物事を動かします。壊すことと生み直すことを恐れず、あなたが通ったあとには、新しい景色が広がります。",
      gift: "変化を起こす力と、周囲を動かす熱量。停滞した場面ほど、あなたが必要とされます。",
      shadow: "エネルギーが強いぶん、周りを巻き込みすぎたり、自分が燃え尽きたりしがち。嵐にも、晴れ間を。",
      today: "変える、思い切る、思い込みを壊すのに向く日。荒れても大丈夫、そのあとに新しいものが来ます。" },
    { n: 20, name: "黄色い太陽", en: "Yellow Sun", color: "yellow", kw: "照らす・普遍・生命",
      trait: "無条件に照らす太陽の人。存在そのものが周囲を明るくします。",
      essence: "太陽のように、見返りを求めず照らす人です。そこにいるだけで場が明るくなり、人は自然と集まってきます。どんな人にも公平で、与えるほど自分も満ちていく、循環の中心にいるタイプです。",
      gift: "無条件の温かさと、人を照らす存在感。あなたの「大丈夫」は、周囲の光になります。",
      shadow: "与えることが自然すぎて、受け取るのが苦手な面があります。太陽も、夜には休みます。",
      today: "人を照らす、感謝する、公平に接するのに向く日。与えたぶんは、別の形で返ってきます。" },
  ];
  const MAYA_TONES = [
    { n: 1, name: "磁気", kw: "目的・引き寄せ", trait: "はじまりの音。目的を決め、必要なものを引き寄せます。",
      role: "13日の流れの起点に立つ人です。「何のために」を決めると、必要な人や出来事が自然と集まってきます。", how: "まず目的をはっきりさせること。あとは引き寄せられてきます。", today: "目的を決める日。何をしたいか、一行で言葉にすると引き寄せがはじまります。" },
    { n: 2, name: "月", kw: "挑戦・二極", trait: "ふたつの間で揺れながら、課題を見つけます。",
      role: "ふたつの選択肢の間で揺れ、その揺れの中から本当の課題を見つける人です。迷いは弱さではなく、深く考えられる証です。", how: "迷ったら両方を書き出して、どちらが怖いかを見ること。怖いほうに答えがあります。", today: "迷いが出やすい日。白黒つけず、両方の気持ちを認めると課題が見えてきます。" },
    { n: 3, name: "電気", kw: "奉仕・結ぶ", trait: "動きを生み、人と人を結んで活性化します。",
      role: "止まっていたものに電気を通し、動かす人です。人と人を結び、誰かの役に立つことで自分も活性化します。", how: "ひとりで抱えず、人を巻き込むこと。動きが動きを呼びます。", today: "動きはじめる日。人に声をかけると、止まっていたことが進みます。" },
    { n: 4, name: "自己存在", kw: "形・安定", trait: "かたちを定め、土台をつくります。",
      role: "形にし、土台を固める人です。ふわっとしたものに輪郭を与え、安定させます。段取りと仕組みづくりが得意です。", how: "計画を紙に落とすこと。形が決まると安心して動けます。", today: "土台を固める日。段取りや仕組みを整えると、あとがラクになります。" },
    { n: 5, name: "倍音", kw: "輝き・中心", trait: "中心に立ち、力を集めて輝きます。",
      role: "場の中心に立ち、力を集める人です。まとめ役や指揮役が向いていて、あなたが真ん中にいると全体がまとまります。", how: "遠慮せず、中心に立つこと。力を集めて、一点に注いでください。", today: "中心に立つ日。任されたら引き受けて、力を一点に集めましょう。" },
    { n: 6, name: "律動", kw: "平等・バランス", trait: "リズムを整え、釣り合いをとります。",
      role: "全体のリズムを整え、釣り合いをとる人です。偏りに敏感で、対等な関係を大切にします。周りの調子を自然に合わせられます。", how: "誰かが偏ったら、反対側に少し重さを置くこと。それがあなたの仕事です。", today: "バランスの日。無理をしているところ、偏っているところをならすと整います。" },
    { n: 7, name: "共振", kw: "調律・通す", trait: "響き合い、流れを通す中間点の音。",
      role: "13日のちょうど真ん中、天と地をつなぐ通り道の人です。自分を空っぽにして流れを通す、調律師のような役目があります。", how: "自分の考えを押し出すより、まわりの音を聞いて響かせること。", today: "流れを通す日。判断を急がず、耳を澄ますとちょうどいい答えが響いてきます。" },
    { n: 8, name: "銀河", kw: "調和・誠実", trait: "信じることと行うことを一致させます。",
      role: "言うことと行うことを一致させる人です。誠実さがそのまま調和を生み、あなたの一貫した姿勢が周囲の信頼になります。", how: "自分の信じることと、実際の行動をそろえること。ずれると調子が崩れます。", today: "誠実さの日。口にしたことを実際にやると、信頼が積み上がります。" },
    { n: 9, name: "太陽", kw: "意図・脈動", trait: "意図をはっきりさせ、脈を打つように動きます。",
      role: "強い意図で物事を前に進める人です。エネルギーが大きく、「こうする」と決めた瞬間から脈を打つように動きだします。", how: "意図をはっきり口にすること。曖昧さが消えると、勢いがつきます。", today: "意図を強く持つ日。「こうしたい」を宣言すると、動きが加速します。" },
    { n: 10, name: "惑星", kw: "完成・実現", trait: "かたちにして、現実に落とし込みます。",
      role: "アイデアを現実の形にする人です。「やりたい」で終わらせず、実際に完成させるところまで持っていく力があります。", how: "最後までやり切ること。完成させた数が、あなたの自信になります。", today: "仕上げる日。やりかけを一つ完成させると、次の扉がひらきます。" },
    { n: 11, name: "スペクトル", kw: "解放・溶かす", trait: "固まったものをほどき、解き放ちます。",
      role: "固まったものをほどく人です。古い型やこだわりを溶かし、風通しをよくします。壊すように見えて、実は解放しています。", how: "手放していいものを見つけること。抱えているものを減らすと、軽くなります。", today: "手放す日。こだわり・執着・使っていないものを一つ外すと、流れが戻ります。" },
    { n: 12, name: "水晶", kw: "協力・普遍", trait: "人と協力し、経験を分かち合います。",
      role: "経験を人と分かち合う人です。ひとりの学びを、みんなの知恵に変えていきます。協力の場で、あなたの力は何倍にもなります。", how: "ひとりでやらないこと。学んだことを人に伝えると、さらに深まります。", today: "協力の日。人と組む、経験を共有すると、一人では届かないところに行けます。" },
    { n: 13, name: "宇宙", kw: "超越・存在", trait: "すべてを含み、次のサイクルへ持ち越します。",
      role: "13日の締めくくりに立つ人です。すべてを含んで、次のサイクルに渡す役目。いまいる場所を超えて、大きな流れを見ます。", how: "小さな損得を超えて考えること。「全体として、どうか」で決めてください。", today: "締めくくりの日。やり終えたことを振り返り、次に持っていくものを選びましょう。" },
  ];
  /* 音のグループ:紋章との重なりを語るときの言い回し */
  const TONE_PHASE = (t) => t <= 4 ? "起こす" : t <= 9 ? "育てる" : "実らせて渡す";
  const TONE_PHASE_TEXT = {
    "起こす": (seal, tone) => `音${tone.n}は13日の流れの前半、物事を「起こす」段階の音です。${seal.name}の資質が、はじまりの場面で力を発揮します。新しいことに関わるとき、あなたらしさがいちばん出ます。`,
    "育てる": (seal, tone) => `音${tone.n}は13日の流れの中盤、物事を「育てる」段階の音です。${seal.name}の資質を、すでに動いているものに注ぎ込む役目。続けること、深めることで真価が出ます。`,
    "実らせて渡す": (seal, tone) => `音${tone.n}は13日の流れの後半、物事を「実らせて渡す」段階の音です。${seal.name}の資質を、完成させ、人に手渡すところで使う人。仕上げと共有が、あなたの場面です。`,
  };
  const SEAL_COLOR = { red: { ja: "赤", ec: "#e0785f" }, white: { ja: "白", ec: "#e9eefc" }, blue: { ja: "青", ec: "#7aa7ff" }, yellow: { ja: "黄", ec: "#e6c968" } };
  const COLOR_ROLE = { red: "はじめる(東)", white: "清める(北)", blue: "変える(西)", yellow: "実らせる(南)" };
  const COLOR_TEXT = {
    red: "赤は東の色。物事を「はじめる」役目を持ち、まっすぐ動きだす力を意味します。",
    white: "白は北の色。物事を「清める・洗練させる」役目を持ち、余分をそぎ落として本質を残す力を意味します。",
    blue: "青は西の色。物事を「変える」役目を持ち、いまあるものを別の形に変容させる力を意味します。",
    yellow: "黄は南の色。物事を「実らせる」役目を持ち、育ったものを収穫し、次につなぐ力を意味します。",
  };
  const COLOR_PAIR = {
    same: "同じ色の紋章どうし。世界の見方が似ていて、説明なしで通じる部分が多い組み合わせです。同じ方向を見やすいぶん、弱点も重なりやすいので、お互いの死角を意識すると強くなります。",
    "red-white": "赤(はじめる)と白(清める)。一方が動き、一方が整える関係。赤が勢いよく踏み出し、白がそれを洗練させます。テンポの違いを尊重できると、良い循環が生まれます。",
    "red-blue": "赤(はじめる)と青(変える)。ともに動きの大きい組み合わせで、一緒にいると物事が進みます。勢いが重なると荒れやすいので、どちらかが「いまは見守る」と決める日を作るとうまくいきます。",
    "red-yellow": "赤(はじめる)と黄(実らせる)。はじまりと収穫、サイクルの両端を担う関係です。赤がまいた種を黄が育てて収める。役割を分担すると、一人では届かないところまで行けます。",
    "white-blue": "白(清める)と青(変える)。目に見えないものを扱う二人。白が本質を映し、青がそれを別の形に変えます。感受性が高い組み合わせなので、言葉にして確認する習慣が支えになります。",
    "white-yellow": "白(清める)と黄(実らせる)。整える人と、形にする人。白がそぎ落とし、黄が仕上げる。無駄のない良いチームになりやすい反面、遊びが減りがち。ときどき目的のない時間を。",
    "blue-yellow": "青(変える)と黄(実らせる)。変化を起こす人と、収穫する人。青が壊して生み直し、黄がそれを実らせます。変化のあとに落ち着く時間を取ると、成果が形に残ります。",
  };
  const colorPairText = (a, b) => a === b ? COLOR_PAIR.same : (COLOR_PAIR[`${a}-${b}`] || COLOR_PAIR[`${b}-${a}`]);

  /* KIN番号:ドリームスペル(13の月の暦)系。2012-12-21 = KIN207 を基準に、2月29日は数えない(前日と同じKIN) */
  const ANCHOR_JDN = toJDN(2012, 12, 21), ANCHOR_KIN = 207;
  function leapDaysBetween(y1, m1, d1, y2, m2, d2) { // (date1, date2] に含まれる 2/29 の数(date1 < date2)
    let n = 0;
    for (let y = y1; y <= y2; y++) {
      const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      if (!leap) continue;
      const after1 = y > y1 || (m1 < 2) || (m1 === 2 && d1 < 29);
      const before2 = y < y2 || (m2 > 2) || (m2 === 2 && d2 >= 29);
      if (after1 && before2) n++;
    }
    return n;
  }
  function kinOf(y, m, d) {
    const D = toJDN(y, m, d) - ANCHOR_JDN;
    const L = D >= 0 ? leapDaysBetween(2012, 12, 21, y, m, d) : -leapDaysBetween(y, m, d, 2012, 12, 21);
    return ((((ANCHOR_KIN - 1 + D - L) % 260) + 260) % 260) + 1;
  }
  const sealOf = (kin) => MAYA_SEALS[(kin - 1) % 20];
  const toneOf = (kin) => MAYA_TONES[(kin - 1) % 13];
  const wrap20 = (n) => ((n - 1) % 20 + 20) % 20 + 1;
  function guideSeal(seal, tone) {
    const t = tone.n;
    const shift = [1, 6, 11].includes(t) ? 0 : [2, 7, 12].includes(t) ? 12 : [3, 8, 13].includes(t) ? 4 : [4, 9].includes(t) ? 16 : 8;
    return MAYA_SEALS[wrap20(seal.n + shift) - 1];
  }
  function mayaProfile(y, m, d) {
    const kin = kinOf(y, m, d);
    const seal = sealOf(kin), tone = toneOf(kin);
    const wsKin = kin - (tone.n - 1); // ウェイブスペルの起点(音1)
    const wavespell = sealOf(((wsKin - 1 + 260) % 260) + 1);
    return {
      kin, seal, tone, wavespell,
      guide: guideSeal(seal, tone),
      analog: MAYA_SEALS[wrap20(19 - seal.n) - 1],
      antipode: MAYA_SEALS[wrap20(seal.n + 10) - 1],
      occult: { seal: MAYA_SEALS[wrap20(21 - seal.n) - 1], tone: MAYA_TONES[14 - tone.n - 1] },
      mirror: 261 - kin,
      absOpposite: ((kin + 130 - 1) % 260) + 1,
    };
  }
  /* a から見た b の関係。day=true なら「今日」向けの言い回し */
  function relationOf(a, b, day = false) {
    const who = day ? "今日" : "この人";
    if (a.kin === b.kin) return { name: "同じKIN", note: day ? "自分のKINと同じ日。260日に一度の、自分に立ち返る日です。生まれ持った資質がそのまま追い風になります。" : "同じ紋章と同じ音。世界の見え方がとても近く、言葉にしなくても分かり合える部分が多い相手です。似ているぶん、相手の中に自分の弱点も見えます。" };
    if (b.seal.n === a.seal.n) return { name: "同じ紋章", note: day ? "自分と同じ紋章の日。あなたらしさが素直に出やすく、得意なことがいつもより通ります。" : "根っこの資質が同じ相手。価値観の土台が似ていて安心できます。音の違いが、それぞれの個性と役割の差になります。" };
    if (b.seal.n === a.guide.n) return { name: "ガイドキン", note: day ? `${who}はあなたのガイドキンの日。迷っていることがあれば、今日ふと浮かんだ方向が答えに近いはずです。` : "あなたを導く紋章を持つ相手。迷ったとき、この人のふるまいや選び方がヒントになります。年上のような安心感を覚えることも。" };
    if (b.seal.n === a.analog.n) return { name: "類似キン", note: day ? `${who}はあなたの類似キンの日。自然に力が出て、いつもの調子で進めると流れに乗れます。` : "自然に補い合える相手。無理に合わせなくても波長が合い、安心して背中を預けられます。長く続く縁になりやすい組み合わせです。" };
    if (b.seal.n === a.antipode.n) return { name: "反対キン", note: day ? `${who}はあなたの反対キンの日。いつもと違う視点が入ってくる日で、違和感の中に学びがあります。無理に自分のやり方を通さないのがコツです。` : "正反対の資質を持つ相手。最初はぶつかりやすいのですが、自分にないものを持っているぶん、学びと刺激がいちばん大きい関係です。尊敬が鍵になります。" };
    if (b.seal.n === a.occult.seal.n) return { name: "神秘キン", note: day ? `${who}はあなたの神秘キンの日。理屈で説明できない直感や偶然が働きやすく、ひらめきに従うとよい日です。` : "説明のつかない引力を感じる相手。一緒にいると、自分でも知らなかった力が引き出されます。理由は分からないけれど、惹かれる。そういう縁です。" };
    if (b.kin === a.absOpposite) return { name: "絶対反対キン", note: day ? `${who}はあなたの絶対反対キンの日。260日暦のちょうど反対側に立つ日で、自分を裏側から見直すような気づきが訪れます。` : "260日暦のちょうど反対側に立つ相手。強く惹かれ、強く反発し、強く学び合う関係です。距離感を大切にすると、大きく成長させてくれる相手になります。" };
    if (b.kin === a.mirror) return { name: "鏡の向こうのKIN", note: day ? `${who}はあなたの鏡の向こうのKINの日。自分では見えていなかった面に気づきやすい日です。` : "鏡写しの相手。自分では見えない面を、この人が映してくれます。相手の言葉が刺さるときは、自分の中にそれがあるということです。" };
    if (b.wavespell.n === a.wavespell.n) return { name: "同じウェイブスペル", note: day ? `${who}はあなたと同じウェイブスペルの中の日。人生のテーマと今日のテーマが重なり、大事なことに取り組むのに向いています。` : "同じ13日のテーマを生きる仲間。目指す方向が近く、同じ目標に向かうと力が合わさります。" };
    if (b.tone.n === a.tone.n) return { name: "同じ音", note: day ? `${who}はあなたと同じ音の日。自分のリズムと今日のリズムが一致し、いつも通りのやり方がそのまま通ります。` : "同じリズムで動く相手。役割の取り方が似ていて、チームでは同じポジションを取りたがるかもしれません。役割を分けると強いコンビになります。" };
    return { name: "名前のつく関係はなし", note: day ? "特別な名前のつく関係ではない、ふだんの日。今日の紋章のテーマを、自分の資質で受け止めてみてください。" : "特定の関係名はつきませんが、紋章の色の組み合わせで見え方が変わります。名前がないぶん、先入観なく関係を育てられます。" };
  }

  function oracleHtml(p) {
    const cell = (label, seal, cls, extra = "") => `
      <div class="mo-cell ${cls}" style="--ec:${SEAL_COLOR[seal.color].ec}">
        <span class="mo-label">${label}</span>
        <b>${seal.name}</b>
        <small>${extra || seal.kw}</small>
      </div>`;
    return `
      <div class="maya-oracle" aria-label="運命のオラクル">
        ${cell("ガイドキン", p.guide, "mo-top")}
        ${cell("反対キン", p.antipode, "mo-left")}
        <div class="mo-cell mo-center" style="--ec:${SEAL_COLOR[p.seal.color].ec}">
          <span class="mo-label">あなた</span>
          <b>KIN ${p.kin}</b>
          <small>${p.seal.name}・音${p.tone.n}</small>
        </div>
        ${cell("類似キン", p.analog, "mo-right")}
        ${cell("神秘キン", p.occult.seal, "mo-bottom", `${p.occult.seal.kw} / 音${p.occult.tone.n}`)}
      </div>`;
  }

  /* ヒーローのひとこと:紋章の色と音の段階で言い回しを変える */
  function mayaLead(p) {
    const phase = TONE_PHASE(p.tone.n);
    const open = {
      red: `あなたは、${p.seal.name}の「${p.seal.kw.split("・")[0]}」を持って生まれた人。`,
      white: `あなたは、${p.seal.name}のように、目に見えないものを扱う人。`,
      blue: `あなたは、${p.seal.name}の「${p.seal.kw.split("・")[0]}」で世界を変えていく人。`,
      yellow: `あなたは、${p.seal.name}の「${p.seal.kw.split("・")[0]}」を実らせる人。`,
    }[p.seal.color];
    const close = {
      "起こす": `音${p.tone.n}「${p.tone.name}」のリズムで、物事のはじまりに立ちます。`,
      "育てる": `音${p.tone.n}「${p.tone.name}」のリズムで、動いているものを育てていきます。`,
      "実らせて渡す": `音${p.tone.n}「${p.tone.name}」のリズムで、仕上げて、人に手渡していきます。`,
    }[phase];
    return `${open}${close}`;
  }

  function renderMaya(y, m, d, partner) {
    const p = mayaProfile(y, m, d);
    const now = new Date();
    const today = mayaProfile(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const relToday = relationOf(p, today, true);
    const c = SEAL_COLOR[p.seal.color];
    let partnerHtml = "";
    if (partner) {
      const q = mayaProfile(partner.y, partner.m, partner.d);
      const rel = relationOf(p, q), relBack = relationOf(q, p);
      partnerHtml = `
        <div class="result-card span-all">
          ${cardH4("PARTNER", "お相手との関係")}
          <div class="maya-pair">
            <div class="mp-side" style="--ec:${c.ec}"><span class="mo-label">あなた</span><b>KIN ${p.kin}</b><small>${p.seal.name}・音${p.tone.n}</small></div>
            <span class="pair-x">×</span>
            <div class="mp-side" style="--ec:${SEAL_COLOR[q.seal.color].ec}"><span class="mo-label">お相手</span><b>KIN ${q.kin}</b><small>${q.seal.name}・音${q.tone.n}</small></div>
          </div>
          <p><strong style="color:var(--gold-bright)">あなたから見て「${rel.name}」</strong></p>
          <p style="margin-top:6px">${rel.note}</p>
          ${relBack.name !== rel.name ? `<p style="margin-top:12px"><strong style="color:var(--gold-bright)">お相手から見て「${relBack.name}」</strong></p><p style="margin-top:6px">${relBack.note}</p>` : ""}
          <p class="sub" style="margin-top:12px"><strong>色の組み合わせ</strong> — ${colorPairText(p.seal.color, q.seal.color)}</p>
          <p class="sub" style="margin-top:8px">お相手は${q.seal.name}(${q.seal.kw})の資質を、音${q.tone.n}「${q.tone.name}」のリズムで生きる人。${q.seal.gift}</p>
        </div>`;
    }
    const lead = mayaLead(p);
    lastShare.maya = {
      eyebrow: "MAYAN CALENDAR",
      title: `KIN ${p.kin} — ${p.seal.name}・${p.tone.name}の音`,
      keywords: [p.seal.kw, `音${p.tone.n} ${p.tone.kw}`, `ウェイブスペル:${p.wavespell.name}`],
      sub: p.seal.trait,
      x: `【MYOURISCOPE マヤ暦】わたしのKINは ${p.kin}、${p.seal.name}・${p.tone.name}の音でした ✦`,
    };
    recordHistory("マヤ暦", `KIN ${p.kin}(${p.seal.name}・音${p.tone.n})`, `ウェイブスペル:${p.wavespell.name}。ガイド:${p.guide.name}。${p.seal.kw}。`);
    document.getElementById("maya-form").classList.add("form-quiet");
    observeThen("maya", () => showResult(document.getElementById("maya-result"), `
      <div class="result-hero maya-hero" style="--ec:${c.ec}">
        <span class="result-symbol">${p.kin}</span>
        <p class="result-eyebrow">MAYAN CALENDAR — TZOLK'IN</p>
        <div class="maya-kin"><small>KIN</small><b data-count="${p.kin}">0</b></div>
        <h3 class="result-title">${p.seal.name} × ${p.tone.name}の音</h3>
        <p class="result-keyword">${p.seal.kw} ・ 音${p.tone.n}「${p.tone.kw}」</p>
        <div class="chip-row" style="justify-content:center">
          <span class="chip">太陽の紋章 <strong>${p.seal.name}</strong></span>
          <span class="chip">銀河の音 <strong>${p.tone.n}(${p.tone.name})</strong></span>
          <span class="chip">ウェイブスペル <strong>${p.wavespell.name}</strong></span>
          <span class="chip">色 <strong>${c.ja}=${COLOR_ROLE[p.seal.color]}</strong></span>
        </div>
        <p class="result-lead" style="margin-inline:auto">${lead}</p>
        ${shareRowHtml("maya")}
      </div>
      <div class="result-grid">
        <div class="result-card span-all card-night">
          ${cardH4("PORTRAIT", "あなたという人")}
          <p class="tv-word">${p.seal.trait}</p>
          <p style="margin-top:12px">${p.seal.essence}</p>
          <p style="margin-top:10px">${p.tone.role}${TONE_PHASE_TEXT[TONE_PHASE(p.tone.n)](p.seal, p.tone)}</p>
        </div>
        <div class="result-card">
          ${cardH4("SOLAR SEAL", "太陽の紋章 — 生まれ持った資質")}
          <p><strong style="color:var(--gold-bright)">${p.seal.name}(${p.seal.en})</strong></p>
          <p style="margin-top:8px"><span class="maya-tag">持ち味</span>${p.seal.gift}</p>
          <p style="margin-top:8px"><span class="maya-tag">つまずきやすいところ</span>${p.seal.shadow}</p>
          <p class="sub" style="margin-top:10px">${COLOR_TEXT[p.seal.color]}</p>
        </div>
        <div class="result-card">
          ${cardH4("GALACTIC TONE", "銀河の音 — 果たす役割")}
          <p><strong style="color:var(--gold-bright)">音${p.tone.n}「${p.tone.name}」— ${p.tone.kw}</strong></p>
          <p style="margin-top:8px"><span class="maya-tag">役割</span>${p.tone.role}</p>
          <p style="margin-top:8px"><span class="maya-tag">うまくいくコツ</span>${p.tone.how}</p>
          <p class="sub" style="margin-top:10px">銀河の音は1から13まであり、13日でひとめぐりするリズムの中の位置を表します。あなたは${p.tone.n === 1 ? "その最初の日" : p.tone.n === 13 ? "その最後の日" : `13日のうち${p.tone.n}日目`}に生まれました。</p>
        </div>
        <div class="result-card span-all">
          ${cardH4("WAVESPELL", "ウェイブスペル — 人生を貫くテーマ")}
          <p><strong style="color:var(--gold-bright)">${p.wavespell.name}のウェイブスペル</strong> — ${p.wavespell.kw}</p>
          <p style="margin-top:8px">ウェイブスペルとは、260日の暦を13日ずつに区切った20の「章」のこと。あなたのKINは、${p.wavespell.name}からはじまる13日の章の${p.tone.n}日目にあたります。${p.wavespell.n === p.seal.n ? "紋章とウェイブスペルが同じなので、自分の資質そのものが人生のテーマになる、ぶれない人です。" : `日々の資質は${p.seal.name}ですが、人生を通して繰り返し向き合う大きなテーマは「${p.wavespell.kw}」。${p.wavespell.trait}`}</p>
        </div>
        <div class="result-card span-all">
          ${cardH4("ORACLE", "運命のオラクル — あなたを支える四つの紋章")}
          <p class="sub" style="margin-bottom:12px">太陽の紋章を中心に、上下左右に四つの紋章が配置されます。それぞれ「導く・支える・鍛える・引き出す」役目を持つ、あなたの人生を取り巻く力です。周囲の人の紋章がここに当たると、その関係名になります。</p>
          ${oracleHtml(p)}
          <div class="maya-oracle-notes">
            <p><strong>ガイドキン(上)— ${p.guide.name}</strong><br>迷ったときに進む方向を示す紋章。「${p.guide.kw}」を意識して選ぶと、道が開けます。${p.guide.gift}</p>
            <p><strong>類似キン(右)— ${p.analog.name}</strong><br>自然に補い合う、安心できる力。「${p.analog.kw}」の資質を持つ人がそばにいると、あなたは力を出しやすくなります。</p>
            <p><strong>反対キン(左)— ${p.antipode.name}</strong><br>正反対の資質。「${p.antipode.kw}」はあなたの苦手や死角に当たることが多いのですが、そのぶん、いちばん大きな学びをくれる方向です。</p>
            <p><strong>神秘キン(下)— ${p.occult.seal.name}・音${p.occult.tone.n}</strong><br>説明のつかない引力で、隠れた力を引き出す紋章。「${p.occult.seal.kw}」に触れると、思いがけない才能が目を覚まします。</p>
          </div>
          <p class="sub" style="margin-top:12px">ほかに、絶対反対キンは KIN ${p.absOpposite}(${sealOf(p.absOpposite).name}・音${toneOf(p.absOpposite).n})、鏡の向こうのKINは KIN ${p.mirror}(${sealOf(p.mirror).name}・音${toneOf(p.mirror).n})。この日に生まれた人とは、強く惹かれ合う縁になります。</p>
        </div>
        ${partnerHtml}
        <div class="result-card span-all card-night">
          ${cardH4("TODAY", `今日のKIN — ${now.getMonth() + 1}月${now.getDate()}日`)}
          <p class="tv-word">今日は KIN ${today.kin}、${today.seal.name}・音${today.tone.n}「${today.tone.name}」の日。</p>
          <p style="margin-top:10px"><strong style="color:var(--gold-bright)">あなたから見て「${relToday.name}」の日</strong></p>
          <p style="margin-top:6px">${relToday.note}</p>
          <p class="sub" style="margin-top:10px"><strong>今日の過ごし方</strong> — ${today.seal.today}${today.tone.today}</p>
          ${explainHtml("KINの計算について", "ツォルキンは20の太陽の紋章と13の銀河の音を組み合わせた260日の暦です。ここでは日本で広く使われているドリームスペル(13の月の暦)系の数え方で、2012年12月21日をKIN207として日数を数え、うるう日(2月29日)はKINを進めない(前日と同じKIN)として計算しています。古典マヤの暦(GMT相関)とはKINの数え方が異なります。")}
        </div>
      </div>
      <div class="crosslinks">
        <span class="crosslinks-label">— 旅はつづく</span>
        <button data-nav="integrated">統合鑑定を受ける</button>
        <button data-nav="aisho">気になる人との相性をみる</button>
        <button data-nav="astrodice">アストロダイスを振る</button>
      </div>`));
  }

  /* ---------- 起動 ---------- */
  function boot() {
    if (typeof OBS_STEPS === "object") OBS_STEPS.maya = ["260日の暦を巻き戻しています……", "太陽の紋章と銀河の音を照合しています……", "あなたのウェイブスペルを探しています……"];
    renderDiceStage();
    document.querySelectorAll(".bd-optional select").forEach((sel) => sel.removeAttribute("required"));
    const MI = window.MysticIcons;
    if (MI) {
      const bi = (nav, key) => { const el = document.querySelector(`.bento-card[data-nav="${nav}"] .bento-icon-svg`); if (el) el.innerHTML = MI.mysticIcon(key, { size: 54, label: "" }); };
      bi("astrodice", "sagittarius"); bi("maya", "sun");
    }
    document.getElementById("maya-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const bd = fd.get("birthdate");
      if (!bd) return;
      const [y, m, d] = bd.split("-").map(Number);
      const pd = fd.get("birthdate2");
      const partner = pd ? (([py, pm, pdd]) => ({ y: py, m: pm, d: pdd }))(pd.split("-").map(Number)) : null;
      renderMaya(y, m, d, partner);
    });
    // 戻る操作などでダイスの間が開いたままにならないように
    window.addEventListener("popstate", () => { if (chamber.open) closeDiceChamber(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  window.MyouriExtra = { kinOf, mayaProfile, relationOf, DICE_PLANETS, DICE_SIGNS, DICE_HOUSES, MAYA_SEALS, MAYA_TONES, diceChamber: chamber };
})();

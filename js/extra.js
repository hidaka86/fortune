/* MYOURISCOPE — 追加占術:アストロダイス / マヤ暦(ツォルキン)
   app.js の共通部品(navigate / observeThen / showResult / cardH4 / recordHistory / lastShare / shareRowHtml)を使う。
   読み込み順: data → fortune → icons → mystic → app → extra */
(function () {
  "use strict";

  /* ============================================================
     1. アストロダイス — 天体・星座・ハウスの三つの12面体
     ============================================================ */
  const DICE_PLANETS = [
    { key: "sun", ja: "太陽", glyph: "☉", theme: "意志と目的", what: "あなたの中心にある「こうありたい」という意志。主役として前に出ること。", advice: "遠慮せず、自分の名前で決めてください。" },
    { key: "moon", ja: "月", glyph: "☽", theme: "感情と安心", what: "理屈より先に動く気持ち。安心できる場所や、素の自分。", advice: "気持ちの声を、正直に聞くのが近道です。" },
    { key: "mercury", ja: "水星", glyph: "☿", theme: "言葉と情報", what: "言葉・会話・情報のやりとり。考えを整理し、伝えること。", advice: "まず言葉にして、誰かに話してみてください。" },
    { key: "venus", ja: "金星", glyph: "♀", theme: "愛と価値", what: "好きなもの、心地よさ、人との調和。何に価値を置くか。", advice: "「好き」を基準に選んで大丈夫です。" },
    { key: "mars", ja: "火星", glyph: "♂", theme: "行動と情熱", what: "踏み出す力、競う力、怒りも含めたエネルギー。", advice: "考えすぎる前に、最初の一歩を。" },
    { key: "jupiter", ja: "木星", glyph: "♃", theme: "拡大と幸運", what: "広がり、寛容さ、チャンス。楽観と学び。", advice: "少し大きめに構えて、受け取る準備を。" },
    { key: "saturn", ja: "土星", glyph: "♄", theme: "責任と鍛錬", what: "時間をかけて築くもの。制限、責任、成熟。", advice: "急がず、土台から。続けた分だけ残ります。" },
    { key: "uranus", ja: "天王星", glyph: "♅", theme: "変革と自由", what: "突然の変化、常識からの解放、独自性。", advice: "型を破っていい合図です。予定外を歓迎して。" },
    { key: "neptune", ja: "海王星", glyph: "♆", theme: "夢と直感", what: "境界が溶けるような感覚、想像力、癒し、あいまいさ。", advice: "はっきりさせるより、感じ取る時間を。" },
    { key: "pluto", ja: "冥王星", glyph: "♇", theme: "変容と再生", what: "根本から作り変える力。手放して、生まれ変わること。", advice: "終わらせることを恐れないで。そこから始まります。" },
    { key: "north-node", ja: "ノースノード", glyph: "☊", theme: "これから向かう方向", what: "魂が伸びていく方向。慣れないけれど成長できる場所。", advice: "不慣れなほうを選ぶと、伸びます。" },
    { key: "south-node", ja: "サウスノード", glyph: "☋", theme: "積み重ねてきたもの", what: "すでに持っている資質、慣れ親しんだやり方。", advice: "得意を頼りつつ、そこに留まりすぎないこと。" },
  ];
  const DICE_SIGNS = [
    { key: "aries", name: "牡羊座", glyph: "♈", how: "まっすぐ、勢いよく", mode: "考えるより先に飛び込む" },
    { key: "taurus", name: "牡牛座", glyph: "♉", how: "じっくり、確かめながら", mode: "五感で味わい、着実に" },
    { key: "gemini", name: "双子座", glyph: "♊", how: "軽やかに、いくつも並行して", mode: "情報を集め、言葉にしながら" },
    { key: "cancer", name: "蟹座", glyph: "♋", how: "寄り添い、守りながら", mode: "気持ちを大切に、身近な人と" },
    { key: "leo", name: "獅子座", glyph: "♌", how: "堂々と、楽しみながら", mode: "主役として表現する" },
    { key: "virgo", name: "乙女座", glyph: "♍", how: "丁寧に、細部まで", mode: "整えて、役に立つかたちで" },
    { key: "libra", name: "天秤座", glyph: "♎", how: "バランスをとりながら", mode: "相手と釣り合いを見て" },
    { key: "scorpio", name: "蠍座", glyph: "♏", how: "深く、一点集中で", mode: "本質だけを見つめて" },
    { key: "sagittarius", name: "射手座", glyph: "♐", how: "遠くを見て、大胆に", mode: "意味と可能性を信じて" },
    { key: "capricorn", name: "山羊座", glyph: "♑", how: "計画的に、現実的に", mode: "目標を決めて、段階を踏んで" },
    { key: "aquarius", name: "水瓶座", glyph: "♒", how: "自由に、少し距離をとって", mode: "常識から離れ、独自のやり方で" },
    { key: "pisces", name: "魚座", glyph: "♓", how: "やわらかく、流れにまかせて", mode: "感じるままに、境界をゆるめて" },
  ];
  const DICE_HOUSES = [
    { n: 1, ja: "自分自身", field: "あなた自身・第一印象・体", where: "自分のあり方や見せ方に関すること。" },
    { n: 2, ja: "所有と価値", field: "お金・才能・自分の価値", where: "収入や持ち物、自分の価値の感じ方。" },
    { n: 3, ja: "言葉と学び", field: "会話・学習・身近な人", where: "日常の会話、勉強、兄弟や近所づきあい。" },
    { n: 4, ja: "家と基盤", field: "家庭・住まい・心の土台", where: "家族、住まい、安心の根っこ。" },
    { n: 5, ja: "創造と恋", field: "恋愛・遊び・創作・子ども", where: "楽しみ、表現、恋のときめき。" },
    { n: 6, ja: "仕事と健康", field: "日々の仕事・習慣・体調", where: "毎日のルーティンと健康管理。" },
    { n: 7, ja: "パートナー", field: "結婚・契約・一対一の関係", where: "大切な相手との対等な関係。" },
    { n: 8, ja: "深い結びつき", field: "共有財産・親密さ・変容", where: "深く関わることで起きる変化。" },
    { n: 9, ja: "遠くと哲学", field: "旅・学問・信念・海外", where: "視野を広げる経験や信じるもの。" },
    { n: 10, ja: "キャリア", field: "社会的な役割・目標・評価", where: "仕事での到達点、社会的な顔。" },
    { n: 11, ja: "仲間と未来", field: "友人・コミュニティ・願い", where: "仲間、ネットワーク、未来への願い。" },
    { n: 12, ja: "内なる世界", field: "無意識・癒し・ひとりの時間", where: "目に見えない領域、休息と手放し。" },
  ];

  /* 12面体の各面の向き(0=上面, 1-5=上段, 6-10=下段, 11=下面) */
  const PHI_UP = 63.435, PHI_DOWN = 116.565;
  const FACES = [
    { az: 0, phi: 0, rot: 0 },
    ...[0, 1, 2, 3, 4].map((k) => ({ az: k * 72, phi: PHI_UP, rot: 180 })),
    ...[0, 1, 2, 3, 4].map((k) => ({ az: 36 + k * 72, phi: PHI_DOWN, rot: 0 })),
    { az: 0, phi: 180, rot: 0 },
  ];
  const EDGE = 60;                       // 辺の長さ(px)
  const FACE_R = EDGE * 0.8507;          // 面(五角形)の外接円半径
  const INRADIUS = EDGE * 1.1135;        // 中心から面までの距離

  function dieHtml(kind, labels) {
    const faces = FACES.map((f, i) => {
      const shade = f.phi === 0 ? 1 : f.phi === PHI_UP ? 0.82 : f.phi === PHI_DOWN ? 0.6 : 0.45;
      return `<div class="die-face" style="width:${FACE_R * 2}px;height:${FACE_R * 2}px;margin:${-FACE_R}px 0 0 ${-FACE_R}px;--shade:${shade};transform:rotateY(${f.az}deg) rotateX(${90 - f.phi}deg) translateZ(${INRADIUS}px) rotate(${f.rot}deg)">
        <span class="die-label" style="transform:rotate(${-f.rot}deg)">${labels[i]}</span></div>`;
    }).join("");
    return `<div class="die-wrap" data-die="${kind}"><div class="die" data-rx="0" data-ry="0">${faces}</div><span class="die-shadow"></span></div>`;
  }

  function rand(n) {
    const a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] % n;
  }

  let diceState = { rolled: false, busy: false };

  function renderDiceStage() {
    const stage = document.getElementById("dice-stage");
    if (!stage) return;
    const MI = window.MysticIcons;
    const icon = (key, fallback) => (MI && MI.CATALOG[key]) ? MI.mysticIcon(key, { size: 30, label: "" }) : `<span class="die-glyph">${fallback}</span>`;
    stage.innerHTML = `
      <div class="dice-table">
        ${dieHtml("planet", DICE_PLANETS.map((p) => icon(p.key, p.glyph)))}
        ${dieHtml("sign", DICE_SIGNS.map((s) => icon(s.key, s.glyph)))}
        ${dieHtml("house", DICE_HOUSES.map((h) => `<span class="die-num">${h.n}</span>`))}
      </div>
      <p class="dice-caption"><span>天体</span><span>星座</span><span>ハウス</span></p>
      <div class="dice-cta">
        <button class="btn btn-primary btn-lg" id="dice-roll" type="button">サイコロを振る</button>
        <p class="ritual-hint">問いを胸に置いて、ボタンを押してください。三つのサイコロが、なにを・どのように・どこで、を教えます。</p>
      </div>`;
    document.getElementById("dice-roll").addEventListener("click", rollDice);
    stage.querySelectorAll(".die-wrap").forEach((w) => w.addEventListener("click", () => { if (diceState.rolled) rollDice(); }));
  }

  function rollDice() {
    if (diceState.busy) return;
    diceState.busy = true;
    const q = (document.getElementById("dice-question")?.value || "").trim();
    const picks = { planet: rand(12), sign: rand(12), house: rand(12) };
    const result = document.getElementById("astrodice-result");
    if (result) { result.hidden = true; result.innerHTML = ""; }
    document.getElementById("dice-roll").disabled = true;
    document.dispatchEvent(new CustomEvent("myouriscope:flip"));
    vibrate(12);
    document.querySelectorAll("#dice-stage .die-wrap").forEach((wrap, i) => {
      const die = wrap.querySelector(".die");
      const face = FACES[picks[wrap.dataset.die]];
      // 目的の面を正面(+z)へ:面の回転の逆をかける。さらに数回転ぶん足して、転がり続けてから止まるように
      const rx = Number(die.dataset.rx), ry = Number(die.dataset.ry);
      const turnsX = 2 + rand(2), turnsY = 3 + rand(2);
      const targetX = -(90 - face.phi), targetY = -face.az;
      // 現在の累積角から、同じ剰余になる次の目標角へ
      const nx = targetX + 360 * (Math.ceil((rx - targetX) / 360) + turnsX);
      const ny = targetY + 360 * (Math.ceil((ry - targetY) / 360) + turnsY) * (i % 2 ? 1 : 1);
      die.dataset.rx = nx; die.dataset.ry = ny;
      wrap.classList.remove("is-rolling"); void wrap.offsetWidth; wrap.classList.add("is-rolling");
      wrap.style.setProperty("--delay", `${i * 140}ms`);
      setTimeout(() => {
        die.style.transitionDuration = REDUCED_MOTION ? "0ms" : `${1900 + i * 200}ms`;
        die.style.transform = `rotateX(${nx}deg) rotateY(${ny}deg)`;
      }, i * 140);
    });
    const total = REDUCED_MOTION ? 100 : 3400; // 止まった目をひと呼吸見せてから結果へ
    setTimeout(() => {
      document.querySelectorAll("#dice-stage .die-wrap").forEach((w) => w.classList.remove("is-rolling"));
      diceState = { rolled: true, busy: false };
      document.getElementById("dice-roll").disabled = false;
      document.getElementById("dice-roll").textContent = "もう一度振る";
      document.dispatchEvent(new CustomEvent("myouriscope:chime"));
      showDiceReading(picks, q);
    }, total);
  }

  function showDiceReading(picks, q) {
    const p = DICE_PLANETS[picks.planet], s = DICE_SIGNS[picks.sign], h = DICE_HOUSES[picks.house];
    const MI = window.MysticIcons;
    const ic = (key, glyph, size) => (MI && MI.CATALOG[key]) ? MI.mysticIcon(key, { size, label: "" }) : glyph;
    const verdict = `${p.theme}が、${s.mode}かたちで、「${h.field}」に現れています。`;
    const advice = `${p.advice} ${s.how}進めるのが、この問いへの答え方です。`;
    lastShare.astrodice = {
      eyebrow: "ASTRO DICE",
      title: `${p.ja} × ${s.name} × 第${h.n}ハウス`,
      keywords: [p.theme, s.how, h.ja],
      sub: verdict,
      x: `【MYOURISCOPE アストロダイス】${q ? `「${q}」の答えは、` : ""}${p.ja}・${s.name}・第${h.n}ハウス。${verdict} ✦`,
    };
    recordHistory("アストロダイス", `${p.ja} × ${s.name} × 第${h.n}ハウス`, `${q ? `問い「${q}」。` : ""}${verdict}`);
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
        <p class="result-lead" style="margin-inline:auto">${verdict}</p>
        ${shareRowHtml("astrodice")}
      </div>
      <div class="result-grid">
        <div class="result-card">
          ${cardH4("PLANET", "なにが動いているか")}
          <p><strong style="color:var(--gold-bright)">${p.ja} — ${p.theme}</strong></p>
          <p style="margin-top:8px">${p.what}</p>
        </div>
        <div class="result-card">
          ${cardH4("SIGN", "どのように進めるか")}
          <p><strong style="color:var(--gold-bright)">${s.name} — ${s.how}</strong></p>
          <p style="margin-top:8px">${s.mode}のが、この星座のやり方です。</p>
        </div>
        <div class="result-card">
          ${cardH4("HOUSE", "どこで起きるか")}
          <p><strong style="color:var(--gold-bright)">第${h.n}ハウス — ${h.ja}</strong></p>
          <p style="margin-top:8px">${h.where}</p>
        </div>
        <div class="result-card span-all card-night">
          ${cardH4("ANSWER", "つまり、こういうこと")}
          <p class="tv-word">${verdict}</p>
          <p class="sub" style="margin-top:10px">${advice}</p>
          ${explainHtml("アストロダイスのしくみ", "アストロダイスは、天体(12面)・星座(12面)・ハウス(12面)の三つのサイコロを同時に振り、出た組み合わせを「なにが・どのように・どこで」として読む占いです。天体は動いているテーマ、星座はその進め方、ハウスは人生のどの領域かを示します。乱数は端末の暗号乱数(crypto.getRandomValues)で、振るたびに違う答えになります。")}
        </div>
      </div>
      <div class="crosslinks">
        <span class="crosslinks-label">— 旅はつづく</span>
        <button data-nav="tarot">タロットで深掘りする</button>
        <button data-nav="western">自分の出生図を見る</button>
        <button data-nav="maya">マヤ暦のKINを調べる</button>
      </div>`);
  }

  /* ============================================================
     2. マヤ暦(ツォルキン260日暦・ドリームスペル系)
     ============================================================ */
  const MAYA_SEALS = [
    { n: 1, name: "赤い竜", en: "Red Dragon", color: "red", kw: "誕生・母性・育む", trait: "命を生み、育てる力。面倒見がよく、大きなものを背負える人。始まりの場所に立つ役割。" },
    { n: 2, name: "白い風", en: "White Wind", color: "white", kw: "伝える・精神・共感", trait: "言葉と呼吸で気持ちを伝える人。繊細で、心の動きに敏感。伝えることで場が整う。" },
    { n: 3, name: "青い夜", en: "Blue Night", color: "blue", kw: "夢・直感・豊かさ", trait: "内側に大きな夢を抱く人。静かな時間から、豊かさを引き出す。マイペースが力になる。" },
    { n: 4, name: "黄色い種", en: "Yellow Seed", color: "yellow", kw: "気づき・開花・探究", trait: "納得するまで掘り下げる人。ひとつの気づきが、時間をかけて大きく花ひらく。" },
    { n: 5, name: "赤い蛇", en: "Red Serpent", color: "red", kw: "生命力・情熱・本能", trait: "体感で生きる、情熱の人。集中すると圧倒的な力を出す。体のサインに正直に。" },
    { n: 6, name: "白い世界の橋渡し", en: "White Worldbridger", color: "white", kw: "橋渡し・手放す・機会", trait: "人と人、世界と世界をつなぐ人。手放すことで次の扉がひらく。おおらかな包容力。" },
    { n: 7, name: "青い手", en: "Blue Hand", color: "blue", kw: "癒し・実行・達成", trait: "手を動かして形にする人。癒しの手でもある。やり遂げた経験が自信になる。" },
    { n: 8, name: "黄色い星", en: "Yellow Star", color: "yellow", kw: "美・調和・芸術", trait: "美しさとバランスの人。センスで場を輝かせる。完璧を求めすぎないことが鍵。" },
    { n: 9, name: "赤い月", en: "Red Moon", color: "red", kw: "浄化・流れ・使命", trait: "流れを清め、整える人。感受性が強く、水のように状況を洗い流す。使命感が原動力。" },
    { n: 10, name: "白い犬", en: "White Dog", color: "white", kw: "愛・忠実・家族", trait: "愛と忠誠の人。信じた相手にはとことん尽くす。家族や仲間への思いが力になる。" },
    { n: 11, name: "青い猿", en: "Blue Monkey", color: "blue", kw: "遊び・魔法・ユーモア", trait: "遊び心で世界を変える人。楽しむことが最大の魔法。深刻になりすぎないこと。" },
    { n: 12, name: "黄色い人", en: "Yellow Human", color: "yellow", kw: "自由意志・影響・知恵", trait: "自分の意志で道を選ぶ人。周囲に影響を与える。自由を尊ぶぶん、束縛が苦手。" },
    { n: 13, name: "赤い空歩く人", en: "Red Skywalker", color: "red", kw: "探検・空間・目覚め", trait: "天と地をつなぐ探検者。じっとしているより動きながら学ぶ。人のために場を開く。" },
    { n: 14, name: "白い魔法使い", en: "White Wizard", color: "white", kw: "魅了・永遠・受容", trait: "人を惹きつける魅力の人。「いま」を生きることで魔法が起きる。受け入れる力。" },
    { n: 15, name: "青い鷲", en: "Blue Eagle", color: "blue", kw: "ビジョン・洞察・創造", trait: "高いところから全体を見る人。先を読む目と、創造の力。心の状態が視界を決める。" },
    { n: 16, name: "黄色い戦士", en: "Yellow Warrior", color: "yellow", kw: "挑戦・知性・問い", trait: "問いを立て、恐れなく挑む人。知性で道を切りひらく。挑戦し続けることで輝く。" },
    { n: 17, name: "赤い地球", en: "Red Earth", color: "red", kw: "共時性・舵取り・自然", trait: "流れを読み、舵をとる人。シンクロニシティに敏感。自然や大地とのつながりが力。" },
    { n: 18, name: "白い鏡", en: "White Mirror", color: "white", kw: "映す・秩序・永遠", trait: "ありのままを映す人。潔く、筋を通す。相手の本質を映し出す鏡の役割。" },
    { n: 19, name: "青い嵐", en: "Blue Storm", color: "blue", kw: "変容・エネルギー・再生", trait: "嵐のような変化をもたらす人。周囲を巻き込む力。壊すことで、新しく生まれ変わる。" },
    { n: 20, name: "黄色い太陽", en: "Yellow Sun", color: "yellow", kw: "照らす・普遍・生命", trait: "無条件に照らす太陽の人。存在そのものが周囲を明るくする。与えるほど満ちる。" },
  ];
  const MAYA_TONES = [
    { n: 1, name: "磁気", kw: "目的・引き寄せ", trait: "はじまりの音。目的を決め、必要なものを引き寄せる。" },
    { n: 2, name: "月", kw: "挑戦・二極", trait: "ふたつの間で揺れながら、課題を見つける。" },
    { n: 3, name: "電気", kw: "奉仕・結ぶ", trait: "動きを生み、人と人を結んで活性化する。" },
    { n: 4, name: "自己存在", kw: "形・安定", trait: "かたちを定め、土台をつくる。" },
    { n: 5, name: "倍音", kw: "輝き・中心", trait: "中心に立ち、力を集めて輝く。" },
    { n: 6, name: "律動", kw: "平等・バランス", trait: "リズムを整え、釣り合いをとる。" },
    { n: 7, name: "共振", kw: "調律・通す", trait: "響き合い、流れを通す。中間点の音。" },
    { n: 8, name: "銀河", kw: "調和・誠実", trait: "信じることと行うことを一致させる。" },
    { n: 9, name: "太陽", kw: "意図・脈動", trait: "意図をはっきりさせ、脈を打つように動く。" },
    { n: 10, name: "惑星", kw: "完成・実現", trait: "かたちにして、現実に落とし込む。" },
    { n: 11, name: "スペクトル", kw: "解放・溶かす", trait: "固まったものをほどき、解き放つ。" },
    { n: 12, name: "水晶", kw: "協力・普遍", trait: "人と協力し、経験を分かち合う。" },
    { n: 13, name: "宇宙", kw: "超越・存在", trait: "すべてを含み、次のサイクルへ持ち越す。" },
  ];
  const SEAL_COLOR = { red: { ja: "赤", ec: "#e0785f" }, white: { ja: "白", ec: "#e9eefc" }, blue: { ja: "青", ec: "#7aa7ff" }, yellow: { ja: "黄", ec: "#e6c968" } };
  const COLOR_ROLE = { red: "はじめる(東)", white: "清める(北)", blue: "変える(西)", yellow: "実らせる(南)" };

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
  const kinFrom = (sealN, toneN) => { for (let k = 1; k <= 260; k++) if (sealOf(k).n === sealN && toneOf(k).n === toneN) return k; return 1; };
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
  function relationOf(a, b) { // a から見た b
    if (a.kin === b.kin) return { name: "同じKIN", note: "同じ紋章と音。似た感覚で世界を見ています。" };
    if (b.seal.n === a.seal.n) return { name: "同じ紋章", note: "根っこの資質が同じ。音の違いが、それぞれの個性です。" };
    if (b.seal.n === a.guide.n) return { name: "ガイドキン", note: "あなたを導く紋章。迷ったとき、この人の姿勢がヒントになります。" };
    if (b.seal.n === a.analog.n) return { name: "類似キン", note: "自然に補い合う相手。安心して背中を預けられます。" };
    if (b.seal.n === a.antipode.n) return { name: "反対キン", note: "正反対の資質。ぶつかりやすいぶん、学びも刺激も大きい相手です。" };
    if (b.seal.n === a.occult.seal.n) return { name: "神秘キン", note: "説明のつかない引力。互いに隠れた力を引き出し合います。" };
    if (b.kin === a.absOpposite) return { name: "絶対反対キン", note: "260日暦のちょうど反対側。強く惹かれ、強く学び合う関係。" };
    if (b.kin === a.mirror) return { name: "鏡の向こうのKIN", note: "鏡写しの相手。自分では見えない面を映してくれます。" };
    if (b.wavespell.n === a.wavespell.n) return { name: "同じウェイブスペル", note: "同じ13日のテーマを生きる仲間。目指す方向が近いはず。" };
    if (b.tone.n === a.tone.n) return { name: "同じ音", note: "同じリズムで動く相手。役割の取り方が似ています。" };
    return { name: "特別な関係はなし", note: "特定の関係名はありませんが、紋章の色の組み合わせで見え方が変わります。" };
  }

  function sealChip(seal, size = 14) {
    const c = SEAL_COLOR[seal.color];
    return `<span class="maya-seal" style="--ec:${c.ec}"><i></i>${seal.name}</span>`;
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

  function renderMaya(y, m, d, partner) {
    const p = mayaProfile(y, m, d);
    const now = new Date();
    const today = mayaProfile(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const relToday = relationOf(p, today);
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
          <p><strong style="color:var(--gold-bright)">あなたから見て「${rel.name}」</strong> — ${rel.note}</p>
          ${relBack.name !== rel.name ? `<p style="margin-top:8px"><strong style="color:var(--gold-bright)">お相手から見て「${relBack.name}」</strong> — ${relBack.note}</p>` : ""}
        </div>`;
    }
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
        <p class="result-lead" style="margin-inline:auto">${p.seal.trait}</p>
        ${shareRowHtml("maya")}
      </div>
      <div class="result-grid">
        <div class="result-card">
          ${cardH4("SOLAR SEAL", "太陽の紋章 — あなたの資質")}
          <p><strong style="color:var(--gold-bright)">${p.seal.name}(${p.seal.en})</strong></p>
          <p style="margin-top:8px">${p.seal.trait}</p>
          <p class="sub" style="margin-top:10px">紋章の色は「${c.ja}」。${COLOR_ROLE[p.seal.color]}役割を持つ色です。</p>
        </div>
        <div class="result-card">
          ${cardH4("GALACTIC TONE", "銀河の音 — あなたの役割")}
          <p><strong style="color:var(--gold-bright)">音${p.tone.n}「${p.tone.name}」— ${p.tone.kw}</strong></p>
          <p style="margin-top:8px">${p.tone.trait}</p>
          <p class="sub" style="margin-top:10px">音は13日の流れの中での位置。${p.tone.n === 1 ? "はじまりの位置に立つ人です。" : p.tone.n === 13 ? "サイクルを締めくくり、次へ渡す人です。" : `13日のうち${p.tone.n}日目の役割です。`}</p>
        </div>
        <div class="result-card span-all">
          ${cardH4("WAVESPELL", "ウェイブスペル — 人生のテーマ")}
          <p><strong style="color:var(--gold-bright)">${p.wavespell.name}のウェイブスペル</strong> — ${p.wavespell.kw}</p>
          <p style="margin-top:8px">あなたのKINは、${p.wavespell.name}からはじまる13日の流れの中にあります。この紋章のテーマ「${p.wavespell.kw}」が、人生を通して繰り返し現れる大きな目的です。${p.wavespell.trait}</p>
        </div>
        <div class="result-card span-all">
          ${cardH4("ORACLE", "運命のオラクル — あなたを支える四つの紋章")}
          ${oracleHtml(p)}
          <div class="maya-oracle-notes">
            <p><strong>ガイドキン(上)</strong> ${p.guide.name} — 迷ったときに進む方向を示す紋章。${p.guide.kw}。</p>
            <p><strong>類似キン(右)</strong> ${p.analog.name} — 自然に補い合う相手。${p.analog.kw}。</p>
            <p><strong>反対キン(左)</strong> ${p.antipode.name} — 正反対の資質。学びと刺激をくれる相手。${p.antipode.kw}。</p>
            <p><strong>神秘キン(下)</strong> ${p.occult.seal.name}・音${p.occult.tone.n} — 説明のつかない引力で、隠れた力を引き出す相手。</p>
          </div>
          <p class="sub" style="margin-top:12px">ほかに、絶対反対キンは KIN ${p.absOpposite}(${sealOf(p.absOpposite).name}・音${toneOf(p.absOpposite).n})、鏡の向こうのKINは KIN ${p.mirror}(${sealOf(p.mirror).name}・音${toneOf(p.mirror).n})。</p>
        </div>
        ${partnerHtml}
        <div class="result-card span-all card-night">
          ${cardH4("TODAY", `今日のKIN — ${now.getMonth() + 1}月${now.getDate()}日`)}
          <p class="tv-word">今日は KIN ${today.kin}、${today.seal.name}・音${today.tone.n}「${today.tone.name}」の日。</p>
          <p class="sub" style="margin-top:8px">あなたから見て「${relToday.name}」の日 — ${relToday.note}</p>
          <p class="sub" style="margin-top:8px">今日のテーマは「${today.seal.kw}」。ウェイブスペルは${today.wavespell.name}(${today.wavespell.kw})。</p>
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
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  window.MyouriExtra = { kinOf, mayaProfile, relationOf, DICE_PLANETS, DICE_SIGNS, DICE_HOUSES, MAYA_SEALS, MAYA_TONES };
})();

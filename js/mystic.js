/* MYOURISCOPE — 月光ミスティック演出レイヤー
   金の粒子 / カーソルの光 / スクロール出現 / 視差 / 月相SVG / 観測演出の相 / 音(任意)
   既存の app.js には依存しない(順序: data → fortune → mystic → app) */
(function () {
  "use strict";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH = window.matchMedia("(hover: none)").matches;
  const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

  /* ---------- 月相SVG(8相をSVGで生成:素材07の代替・同じ用途で使える) ---------- */
  // phase: 0=新月 … 0.5=満月 … 1=新月。北半球の見え方(右から満ちる)
  function moonSVG(phase, size = 24, cls = "moon-svg") {
    const p = ((phase % 1) + 1) % 1;
    const r = 10, cx = 12, cy = 12;
    // 明部を「円 − 楕円」で近似
    const k = Math.cos(p * Math.PI * 2);      // 1=新月, -1=満月
    const rx = Math.abs(k) * r;
    const waxing = p < 0.5;
    let path;
    if (p < 0.02 || p > 0.98) path = "";
    else if (Math.abs(p - 0.5) < 0.02) path = `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
    else {
      // 外側の半円(明部側) + 内側の楕円弧
      const sideSign = waxing ? 1 : -1;          // 明部は右(waxing)/左(waning)
      const outer = `M${cx},${cy - r}A${r},${r} 0 0,${waxing ? 1 : 0} ${cx},${cy + r}`;
      const sweep = (k > 0) ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
      const inner = `A${rx},${r} 0 0,${sweep} ${cx},${cy - r}`;
      path = outer + inner + "Z";
      void sideSign;
    }
    return `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(200,212,232,.10)" stroke="rgba(200,212,232,.35)" stroke-width=".8"/>
      ${path ? `<path d="${path}" fill="#e9eefc"/>` : ""}
    </svg>`;
  }
  window.moonSVG = moonSVG;

  /* ---------- 金の粒子(全画面・ゆっくり漂う) ---------- */
  function initParticles() {
    if (REDUCED) return;
    const c = document.createElement("canvas");
    c.id = "particles"; c.setAttribute("aria-hidden", "true");
    document.body.prepend(c);
    const ctx = c.getContext("2d");
    let w = 0, h = 0, dpr = 1, pts = [], scrollY = 0, running = true;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 16000));
      pts = Array.from({ length: n }, () => spawn(true));
    }
    function spawn(anywhere) {
      const gold = Math.random() < 0.6;
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.08, vy: -(0.04 + Math.random() * 0.12),
        a: 0.15 + Math.random() * 0.5, ph: Math.random() * Math.PI * 2,
        col: gold ? "212,175,55" : "200,212,232",
      };
    }
    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx + Math.sin(t / 3000 + p.ph) * 0.05;
        p.y += p.vy;
        if (p.y < -10 || p.x < -10 || p.x > w + 10) pts[i] = spawn(false);
        const tw = 0.6 + 0.4 * Math.sin(t / 900 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.col},${(p.a * tw).toFixed(3)})`;
        ctx.shadowColor = `rgba(${p.col},.8)`; ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y + Math.sin(scrollY / 900 + p.ph) * 2, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden; if (running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  }

  /* ---------- カーソルを追う光 ---------- */
  function initCursorGlow() {
    if (REDUCED || TOUCH) return;
    const g = document.createElement("div");
    g.className = "cursor-glow"; g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
    let tx = -999, ty = -999, x = -999, y = -999, on = false;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; g.classList.add("is-on"); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => { on = false; g.classList.remove("is-on"); });
    (function loop() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      g.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- スクロール出現(動的に生成される結果カードにも効く) ---------- */
  const REVEAL_SEL = ".result-hero, .result-card, .crosslinks, .bento-card, .section-head, .guide-card, .philosophy, .home-daily-card, .home-guide, .invite-card, .panel.form, .j-panel, .ornament-divider";
  function initReveal() {
    if (!("IntersectionObserver" in window) || REDUCED) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    function attach(root) {
      const list = root.matches?.(REVEAL_SEL) ? [root] : [];
      root.querySelectorAll?.(REVEAL_SEL).forEach((n) => list.push(n));
      list.forEach((n, i) => {
        if (n.classList.contains("reveal")) return;
        n.classList.add("reveal");
        n.style.transitionDelay = `${Math.min(i, 8) * 90}ms`;
        io.observe(n);
      });
    }
    attach(document.body);
    new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) attach(n); }));
    }).observe(document.body, { childList: true, subtree: true });
    // 画面切替(display:none→block)の直後にも判定し直す
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-nav]")) setTimeout(() => {
        document.querySelectorAll(".view.active .reveal:not(.in-view)").forEach((n) => io.observe(n));
      }, 60);
    });
  }

  /* ---------- ヒーローの視差 ---------- */
  function initParallax() {
    if (REDUCED) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        hero.style.setProperty("--py", `${Math.min(y * 0.25, 240)}px`);
        const content = hero.querySelector(".hero-content");
        if (content) { content.style.transform = `translateY(${y * 0.18}px)`; content.style.opacity = String(Math.max(0, 1 - y / 600)); }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 月相の装飾(フッター・スクロール誘導) ---------- */
  function initMoons() {
    const rows = [document.getElementById("footer-moons"), document.getElementById("hero-moons")].filter(Boolean);
    for (const row of rows) {
      let today = 0.5;
      try { if (typeof moonPhaseToday === "function") { const mp = moonPhaseToday(); if (typeof mp.age === "number") today = mp.age / 29.53; else if (typeof mp.phase === "number") today = mp.phase; } } catch { /* noop */ }
      const idx = Math.round(today * 8) % 8;
      row.innerHTML = Array.from({ length: 8 }, (_, i) => `<span class="${i === idx ? "is-today" : ""}"><img class="moon-img" src="assets/icons/moon/moon-${i}.png" alt="" onerror="this.outerHTML=window.moonSVG(${i / 8}, 18)" /></span>`).join("");
    }
    const cue = document.getElementById("hero-scroll-moon");
    if (cue) cue.innerHTML = `<img class="moon-img" src="assets/icons/moon/moon-0.png" alt="" onerror="this.outerHTML=window.moonSVG(0, 22)" />`;
  }

  /* ---------- 観測演出の相(app.js の obs-overlay を拡張) ---------- */
  // app.js が作る .obs-overlay を検知し、相ごとの視覚(星の流れ/五行の回転/月光の粒子)を足す
  function initObservationPhases() {
    if (REDUCED) return;
    new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType === 1 && n.classList.contains("obs-overlay")) decorate(n);
      }));
    }).observe(document.body, { childList: true });

    function decorate(ov) {
      const canvas = document.createElement("canvas");
      canvas.className = "obs-canvas";
      ov.prepend(canvas);
      const elements = document.createElement("div");
      elements.className = "obs-elements";
      const EL = [["木", "rgba(111,203,187,.6)"], ["火", "rgba(224,144,111,.6)"], ["土", "rgba(212,175,55,.6)"], ["金", "rgba(200,212,232,.6)"], ["水", "rgba(155,124,196,.6)"]];
      elements.innerHTML = `<div class="oe-ring">${EL.map(([k, c], i) => `<div class="oe-node" style="--a:${i * 72 - 90}deg;--ec:${c}"><span>${k}</span></div>`).join("")}</div>`;
      ov.querySelector(".obs-core")?.appendChild(elements);
      const moon = document.createElement("div");
      moon.className = "obs-moon";
      moon.innerHTML = `<img class="moon-img moon-big" src="assets/icons/moon/moon-4.png" alt="" onerror="this.outerHTML=window.moonSVG(0.5, 120, 'moon-big')" />`;
      ov.querySelector(".obs-core")?.appendChild(moon);
      const sub = document.createElement("p");
      sub.className = "obs-sub";
      ov.querySelector(".obs-core")?.appendChild(sub);

      const ctx = canvas.getContext("2d");
      let w = 0, h = 0, stars = [], dust = [];
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = ov.clientWidth; h = ov.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = Array.from({ length: 140 }, () => ({ x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: Math.random() * 1 + 0.05 }));
        dust = Array.from({ length: 90 }, () => ({ a: Math.random() * Math.PI * 2, d: 80 + Math.random() * Math.max(w, h) * 0.5, s: 0.2 + Math.random() * 0.6, r: 0.8 + Math.random() * 1.6 }));
      }
      resize();
      const SUB = { stars: "Observing the stars", elements: "Reading your chart", moon: "Listening to the cosmos" };
      let t0 = performance.now();
      function frame(t) {
        if (!ov.isConnected) return;
        const phase = ov.dataset.phase || "stars";
        sub.textContent = SUB[phase] || "";
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        if (phase === "stars") { // 星がカメラへ流れる
          for (const s of stars) {
            s.z -= 0.006; if (s.z <= 0.02) { s.z = 1; s.x = (Math.random() - 0.5) * w; s.y = (Math.random() - 0.5) * h; }
            const px = cx + s.x / s.z, py = cy + s.y / s.z;
            const px2 = cx + s.x / (s.z + 0.02), py2 = cy + s.y / (s.z + 0.02);
            ctx.strokeStyle = `rgba(200,212,232,${(1 - s.z) * 0.7})`; ctx.lineWidth = (1 - s.z) * 1.6;
            ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(px, py); ctx.stroke();
          }
        } else if (phase === "moon") { // 月光の粒子が中心へ集まる
          const k = Math.min(1, (t - t0) / 2600);
          for (const p of dust) {
            p.d = Math.max(56, p.d - p.s * 1.6);
            p.a += 0.004;
            const x = cx + Math.cos(p.a) * p.d, y = cy + Math.sin(p.a) * p.d;
            ctx.fillStyle = `rgba(230,201,104,${0.25 + 0.6 * k})`;
            ctx.shadowColor = "rgba(230,201,104,.9)"; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else { // elements: 静かな星屑
          for (const s of stars) {
            const px = cx + s.x * 0.9, py = cy + s.y * 0.9;
            ctx.fillStyle = `rgba(200,212,232,${0.15 + 0.2 * Math.abs(Math.sin(t / 1400 + s.z * 10))})`;
            ctx.beginPath(); ctx.arc(px, py, 0.9, 0, Math.PI * 2); ctx.fill();
          }
        }
        requestAnimationFrame(frame);
      }
      new MutationObserver(() => { t0 = performance.now(); }).observe(ov, { attributes: true, attributeFilter: ["data-phase"] });
      requestAnimationFrame(frame);
    }
  }

  /* ---------- 金の粒子が舞い上がる(カード表示時などに呼ぶ) ---------- */
  function goldDust(host, n = 28) {
    if (REDUCED || !host) return;
    const box = document.createElement("div");
    box.className = "gold-dust"; box.setAttribute("aria-hidden", "true");
    box.innerHTML = Array.from({ length: n }, () => {
      const sz = (2 + Math.random() * 4).toFixed(1);
      return `<i style="--x:${(Math.random() * 100).toFixed(1)}%;--sz:${sz}px;--t:${(1.6 + Math.random() * 1.8).toFixed(2)}s;--d:${(Math.random() * 0.8).toFixed(2)}s;--h:${(120 + Math.random() * 220).toFixed(0)}px;--dx:${((Math.random() - 0.5) * 80).toFixed(0)}px"></i>`;
    }).join("");
    const pos = getComputedStyle(host).position;
    if (pos === "static") host.style.position = "relative";
    host.appendChild(box);
    setTimeout(() => box.remove(), 4200);
  }
  window.goldDust = goldDust;

  /* ---------- 音(任意・デフォルトOFF・WebAudioで合成、音源ファイル不要) ---------- */
  const Sound = (() => {
    let ctx = null, master = null, ambient = null, on = false;
    const KEY = "myouriscope:sound";
    function ensure() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);
    }
    function bell(freq = 1320, dur = 2.4, gain = 0.06) {
      if (!ctx || !on) return;
      const t = ctx.currentTime;
      [1, 2.01, 2.74].forEach((m, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = "sine"; o.frequency.value = freq * m;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain / (i + 1), t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i + 1));
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur);
      });
    }
    function cardFlip() { // 紙の擦れ:短いノイズ
      if (!ctx || !on) return;
      const t = ctx.currentTime, len = 0.18;
      const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8;
      const g = ctx.createGain(); g.gain.value = 0.12;
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    }
    function startAmbient() { // 深夜の静寂:低いドローン + 稀な鈴
      if (!ctx || ambient) return;
      const g = ctx.createGain(); g.gain.value = 0.035;
      [55, 82.4, 110].forEach((fr, i) => {
        const o = ctx.createOscillator(); o.type = i ? "triangle" : "sine"; o.frequency.value = fr;
        const lg = ctx.createGain(); lg.gain.value = 1 / (i + 1.5);
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03;
        const lfoG = ctx.createGain(); lfoG.gain.value = 0.4;
        lfo.connect(lfoG); lfoG.connect(lg.gain);
        o.connect(lg); lg.connect(g); o.start(); lfo.start();
      });
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 220;
      g.connect(f); f.connect(master);
      ambient = { timer: setInterval(() => { if (Math.random() < 0.35) bell(1760 + Math.random() * 600, 3.5, 0.025); }, 9000) };
    }
    function set(v) {
      on = v;
      try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* noop */ }
      document.querySelectorAll(".sound-toggle").forEach((b) => { b.classList.toggle("is-on", v); b.setAttribute("aria-pressed", String(v)); });
      if (v) {
        ensure(); if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
        startAmbient();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
        bell(1320, 2.4, 0.05);
      } else if (ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      }
    }
    function init() {
      let saved = "0";
      try { saved = localStorage.getItem(KEY) || "0"; } catch { /* noop */ }
      document.querySelectorAll(".sound-toggle").forEach((b) => b.addEventListener("click", () => set(!on)));
      if (saved === "1") {
        // ブラウザの自動再生制限:最初の操作で開始
        const kick = () => { set(true); window.removeEventListener("pointerdown", kick); window.removeEventListener("keydown", kick); };
        window.addEventListener("pointerdown", kick, { once: true }); window.addEventListener("keydown", kick, { once: true });
        document.querySelectorAll(".sound-toggle").forEach((b) => b.classList.add("is-on"));
      }
      // 演出フック
      document.addEventListener("myouriscope:chime", () => bell());
      document.addEventListener("myouriscope:flip", () => cardFlip());
    }
    return { init, set, bell, cardFlip, get on() { return on; } };
  })();
  window.MysticSound = Sound;

  /* ---------- タロット:カードが現れた瞬間に金の粒子と紙の音 ---------- */
  function initTarotHooks() {
    new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const cards = n.matches?.(".tarot-reveal") ? [n] : [...(n.querySelectorAll?.(".tarot-reveal") || [])];
        if (!cards.length) return;
        document.dispatchEvent(new CustomEvent("myouriscope:flip"));
        cards.forEach((c) => goldDust(c.closest(".rv-card, .tarot-slot-body") || c.parentElement, 22));
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- 起動 ---------- */
  function boot() {
    initParticles();
    initCursorGlow();
    initReveal();
    initParallax();
    initMoons();
    initObservationPhases();
    initTarotHooks();
    Sound.init();
    // ヒーロー最初の表示
    document.documentElement.classList.add("mystic-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

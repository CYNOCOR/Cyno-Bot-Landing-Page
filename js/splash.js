/* ─────────────────────────────────────────────────────────────
   CYNO BOT splash: a holographic wireframe of the real robot
   (boxy head with ring eyes, chest screen, arms, legs, weighted
   base) traced bottom-up by a scan line, then the eyes light up
   and blink. Inspired by the cynocor.com preloader.
   ───────────────────────────────────────────────────────────── */
(() => {
  const splash = document.getElementById("splash");
  if (!splash) return;

  // Plays on every page load, including refreshes.

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = splash.querySelector(".splash-canvas");
  const bar = splash.querySelector(".splash-bar span");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  /* ── Geometry: CYNO BOT, 1.72 units tall, y up, z towards viewer ── */
  const S = []; // segments: { a, b, kind, t, eye }
  const STRUCT = 0, ACCENT = 1, GLOW = 2;
  const TOP = 1.74;

  const seg = (a, b, kind, eye) => {
    const t = Math.min(a[1], b[1]) / TOP; // reveal height, 0 = floor
    S.push({ a, b, kind, t: Math.max(0, Math.min(1, t)), eye });
  };

  // Superellipsoid "rounded box", drawn as horizontal loops + vertical ribs.
  function block(cx, cy, cz, w, h, d, opt = {}) {
    const n = opt.n || 20, loops = opt.loops || 6, p = opt.round || 5, kind = opt.kind || STRUCT;
    const ring = (v) => {
      const s = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(v), p)), 1 / p);
      const y = cy + (v * h) / 2;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const c = Math.cos(a), sn = Math.sin(a);
        pts.push([
          cx + (w / 2) * s * Math.sign(c) * Math.pow(Math.abs(c), 2 / p),
          y,
          cz + (d / 2) * s * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / p),
        ]);
      }
      return pts;
    };
    const rings = [];
    for (let k = 0; k <= loops; k++) rings.push(ring(-0.96 + (1.92 * k) / loops));
    rings.forEach((r) => r.forEach((pt, i) => seg(pt, r[(i + 1) % n], kind)));
    const ribEvery = opt.ribs || 2;
    for (let k = 0; k < rings.length - 1; k++)
      for (let i = 0; i < n; i += ribEvery) seg(rings[k][i], rings[k + 1][i], kind);
  }

  // Circle in a plane ("xy" faces the viewer, "yz" faces sideways, "xz" lies flat)
  function circle(cx, cy, cz, r, plane, kind, eye, from = 0, to = Math.PI * 2, n = 28) {
    let prev;
    for (let i = 0; i <= n; i++) {
      const a = from + ((to - from) * i) / n;
      const pt = plane === "yz"
        ? [cx, cy + Math.sin(a) * r, cz + Math.cos(a) * r]
        : plane === "xz"
          ? [cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r]
          : [cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz];
      if (prev) seg(prev, pt, kind, eye);
      prev = pt;
    }
  }

  // Joint cylinder along x
  function joint(cx, cy, cz, r, len) {
    for (const dx of [-len / 2, 0, len / 2]) circle(cx + dx, cy, cz, r, "yz", STRUCT, null, 0, Math.PI * 2, 16);
  }

  // Flat rounded rectangle on a front face (screens)
  function panel(cx, cy, z, w, h, kind) {
    const pts = [];
    const n = 32, p = 6;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      pts.push([cx + (w / 2) * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cy + (h / 2) * Math.sign(s) * Math.pow(Math.abs(s), 2 / p), z]);
    }
    for (let i = 0; i < n; i++) seg(pts[i], pts[i + 1], kind);
  }

  // Base plate and feet
  block(0, 0.025, 0.02, 0.66, 0.05, 0.46, { loops: 2, round: 8, n: 24, ribs: 3 });
  for (const sx of [-1, 1]) {
    const x = sx * 0.11;
    block(x, 0.1, 0.05, 0.17, 0.1, 0.27, { loops: 3, round: 6, n: 16 });          // foot
    block(x, 0.31, 0, 0.15, 0.34, 0.17, { loops: 6, round: 5, n: 16 });           // shin
    joint(x, 0.5, 0, 0.065, 0.12);                                                // knee
    block(x, 0.67, 0, 0.16, 0.3, 0.18, { loops: 5, round: 5, n: 16 });            // thigh
  }
  block(0, 0.87, 0, 0.36, 0.12, 0.22, { loops: 3, round: 5, n: 20 });             // pelvis
  block(0, 1.17, 0, 0.47, 0.46, 0.28, { loops: 8, round: 6, n: 24 });             // torso
  panel(0, 1.19, 0.142, 0.27, 0.23, ACCENT);                                      // chest screen
  // "AI" on the chest screen
  seg([-0.07, 1.13, 0.143], [-0.045, 1.25, 0.143], GLOW);
  seg([-0.045, 1.25, 0.143], [-0.02, 1.13, 0.143], GLOW);
  seg([-0.06, 1.175, 0.143], [-0.03, 1.175, 0.143], GLOW);
  seg([0.035, 1.13, 0.143], [0.035, 1.25, 0.143], GLOW);
  for (const sx of [-1, 1]) {
    const x = sx * 0.305;
    block(x, 1.33, 0, 0.13, 0.15, 0.17, { loops: 3, round: 4, n: 16 });           // shoulder
    circle(x + sx * 0.068, 1.33, 0, 0.05, "yz", ACCENT);                           // shoulder light
    block(x, 1.13, 0, 0.11, 0.26, 0.13, { loops: 5, round: 5, n: 14 });           // upper arm
    joint(x, 0.98, 0, 0.05, 0.1);                                                 // elbow
    block(x, 0.84, 0.01, 0.11, 0.24, 0.13, { loops: 5, round: 5, n: 14 });        // forearm
    block(x, 0.66, 0.02, 0.08, 0.12, 0.09, { loops: 3, round: 4, n: 12 });        // hand
  }
  for (const dy of [0, 0.03, 0.06]) circle(0, 1.41 + dy, 0, 0.055, "xz", STRUCT, null, 0, Math.PI * 2, 16); // neck
  block(0, 1.6, 0, 0.42, 0.27, 0.25, { loops: 7, round: 4, n: 26 });              // head
  panel(0, 1.6, 0.128, 0.33, 0.19, ACCENT);                                       // face screen
  circle(-0.075, 1.625, 0.13, 0.034, "xy", GLOW, { cy: 1.625 });                  // eyes
  circle(0.075, 1.625, 0.13, 0.034, "xy", GLOW, { cy: 1.625 });
  circle(0, 1.585, 0.13, 0.035, "xy", GLOW, null, Math.PI * 1.15, Math.PI * 1.85, 14); // smile
  for (const sx of [-1, 1]) {
    circle(sx * 0.215, 1.6, 0, 0.055, "yz", STRUCT);                              // ear pod
    circle(sx * 0.222, 1.6, 0, 0.035, "yz", ACCENT);                              // ear light
  }
  circle(0, 1.735, 0, 0.012, "xy", STRUCT, null, 0, Math.PI * 2, 8);             // camera

  /* ── Drawing ─────────────────────────────────────────────── */
  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const BUILD = 2.4;          // seconds to trace the robot
  const LIGHT = BUILD + 0.2;  // eyes switch on
  const BLINK = 3.2;         // single blink
  const MIN_SHOW = reduce ? 600 : 4000; // + 1s fade = 5s in total
  const start = performance.now();

  function frame(now) {
    if (!ctx || splash.classList.contains("is-gone")) return;
    const t = reduce ? 10 : (now - start) / 1000;
    const build = Math.min(1, t / BUILD);
    const ease = 1 - Math.pow(1 - build, 2.2);

    ctx.clearRect(0, 0, W, H);
    const scale = Math.min(H * 0.33, W * 0.55);  // px per unit (robot is ~1.74 units tall)
    const cx = W / 2, cy = H * 0.69;               // floor position
    const yaw = reduce ? -0.45 : -0.55 + Math.sin(t * 0.7) * 0.35;
    const pitch = 0.1;
    const float = reduce ? 0 : Math.sin(t * 1.6) * 0.012;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const blink = t > BLINK && t < BLINK + 0.24 ? 0.12 : 1;

    const proj = (pt, eye) => {
      let [x, y, z] = pt;
      if (eye) y = eye.cy + (y - eye.cy) * blink;
      y += float;
      const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
      const yc = y - 0.86;
      const y2 = yc * cp - z1 * sp, z2 = yc * sp + z1 * cp;
      const persp = 3.2 / (3.2 - z2);
      return [cx + x1 * scale * persp, cy - (y2 + 0.86) * scale * persp, z2];
    };

    const glowOn = t >= LIGHT ? Math.min(1, (t - LIGHT) / 0.45) : 0;
    ctx.lineCap = "round";
    for (const s of S) {
      const vis = Math.max(0, Math.min(1, (ease - s.t) / 0.05));
      if (s.kind === GLOW ? glowOn <= 0 : vis <= 0) continue;
      const a = proj(s.a, s.eye), b = proj(s.b, s.eye);
      const depth = 0.4 + 0.6 * Math.max(0, Math.min(1, ((a[2] + b[2]) / 2 + 0.3) / 0.6));
      if (s.kind === GLOW) {
        ctx.strokeStyle = `rgba(59, 164, 255, ${glowOn})`;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "rgba(59, 164, 255, 0.9)";
        ctx.shadowBlur = 10;
      } else if (s.kind === ACCENT) {
        ctx.strokeStyle = `rgba(0, 98, 235, ${(0.85 * vis * depth).toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = `rgba(15, 23, 42, ${(0.42 * vis * depth).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Scan line sweeping up while it builds
    if (build < 1) {
      const sy = cy - ease * TOP * scale;
      const g = ctx.createLinearGradient(cx - scale * 0.7, 0, cx + scale * 0.7, 0);
      g.addColorStop(0, "rgba(0, 112, 255, 0)");
      g.addColorStop(0.5, "rgba(0, 112, 255, 0.75)");
      g.addColorStop(1, "rgba(0, 112, 255, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.7, sy);
      ctx.lineTo(cx + scale * 0.7, sy);
      ctx.stroke();
    }

    if (bar) bar.style.transform = `scaleX(${Math.min(1, (now - start) / MIN_SHOW).toFixed(3)})`;
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── Leaving ─────────────────────────────────────────────── */
  let left = false;
  const leave = () => {
    if (left) return;
    left = true;
    splash.classList.add("is-done");
    setTimeout(() => {
      splash.classList.add("is-gone");
      window.removeEventListener("resize", resize);
    }, 1050);
  };
  const ready = () => setTimeout(leave, Math.max(0, MIN_SHOW - (performance.now() - start)));
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready, { once: true });
  setTimeout(leave, 6500); // never hold the page longer than this
})();

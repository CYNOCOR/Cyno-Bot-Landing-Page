/* Page-level interactions for index.html. The 3D robot and kiosk live in app.js. */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function boot() {
        if (typeof startApp === 'function') startApp();

        const year = $('#copyright-year');
        if (year) year.textContent = new Date().getFullYear();

        setupReveal();
        setupCounters();
        setupSpecFilter();
        setupGreetingProgress();
        setupNavIndicator();
        setupMobileMenu();
        setupHeroClickToWave();
        setupHeroScroll();
        setupSpotlight();
        setupHeadingScramble();
        setupEdgeBlur();
        setupFooterAscii();
    }

    /* ---------- Scroll reveal ---------- */
    function setupReveal() {
        const items = $$('[data-reveal]');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        items.forEach(el => io.observe(el));

        // A fast scroll or an anchor jump can skip an element entirely, so the observer
        // never sees it intersect. Reveal anything that is already above the fold.
        let pending = false;
        const sweep = () => {
            pending = false;
            const limit = window.innerHeight * 0.95;
            items.forEach(el => {
                if (!el.classList.contains('in') && el.getBoundingClientRect().top < limit) {
                    el.classList.add('in');
                    io.unobserve(el);
                }
            });
        };
        window.addEventListener('scroll', () => {
            if (!pending) { pending = true; setTimeout(sweep, 120); }
        }, { passive: true });
        window.addEventListener('load', () => setTimeout(sweep, 200));

        const roadmap = $('#roadmap');
        if (roadmap) {
            const rio = new IntersectionObserver(([e]) => {
                if (!e.isIntersecting) return;
                const now = $('.phase.is-now', roadmap);
                const fill = $('.rail-fill', roadmap);
                if (now && fill) fill.style.height = (now.offsetTop + now.offsetHeight - 8) + 'px';
                rio.disconnect();
            }, { threshold: 0.4 });
            rio.observe(roadmap);
        }
    }

    /* ---------- Count-up for the figures band (values come from the markup) ---------- */
    function setupCounters() {
        const nums = $$('[data-count]');
        if (reduceMotion || !('IntersectionObserver' in window)) return;
        nums.forEach(el => {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            el.textContent = (0).toFixed(decimals);
            const io = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                const dur = 1100;
                const t0 = performance.now();
                const tick = now => {
                    const t = Math.min(1, (now - t0) / dur);
                    const eased = 1 - Math.pow(1 - t, 4);
                    el.textContent = (target * eased).toFixed(decimals);
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }, { threshold: 0.6 });
            io.observe(el);
        });
    }

    /* ---------- Spec filter ---------- */
    function setupSpecFilter() {
        const bar = $('#spec-filter');
        if (!bar) return;
        const blocks = $$('#specs-grid .spec-block');
        bar.addEventListener('click', e => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            const f = btn.dataset.filter;
            $$('button', bar).forEach(b => {
                const on = b === btn;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-selected', String(on));
            });
            blocks.forEach(block => {
                const show = f === 'all' || block.dataset.specCat === f;
                if (show) {
                    block.classList.remove('is-hidden');
                    block.classList.add('in', 'is-dim');
                    requestAnimationFrame(() => requestAnimationFrame(() => block.classList.remove('is-dim')));
                } else {
                    block.classList.add('is-hidden');
                }
            });
        });
    }

    /* ---------- Greeting progress bar + play button state ---------- */
    function setupGreetingProgress() {
        const fill = $('#flow-fill');
        const play = $('#flow-play');
        if (typeof window.activateGreetingStep !== 'function') return;

        const original = window.activateGreetingStep;
        window.activateGreetingStep = function (step) {
            original(step);
            if (fill) fill.style.width = (step / 6 * 100) + '%';
        };

        if (play && typeof window.playFullGreetingSequence === 'function') {
            const label = $('span', play);
            window.playFullGreetingSequence = function () {
                if (play.disabled) return;
                play.disabled = true;
                play.style.opacity = '0.6';
                let step = 1;
                window.activateGreetingStep(step);
                if (label) label.textContent = 'Playing 1 of 6';
                const timer = setInterval(() => {
                    step++;
                    if (step > 6) {
                        clearInterval(timer);
                        play.disabled = false;
                        play.style.opacity = '';
                        if (label) label.textContent = 'Play again';
                        return;
                    }
                    window.activateGreetingStep(step);
                    if (label) label.textContent = 'Playing ' + step + ' of 6';
                }, 3400);
            };
        }
    }

    /* ---------- Sliding underline under the active nav link ---------- */
    function setupNavIndicator() {
        const nav = $('.nav-links');
        const bar = $('.nav-indicator');
        if (!nav || !bar) return;
        let last = null;
        const place = () => {
            const active = $('.nav-spy-link.is-active', nav);
            if (active === last) return;
            last = active;
            if (!active) { bar.style.opacity = '0'; return; }
            bar.style.opacity = '1';
            bar.style.width = (active.offsetWidth - 24) + 'px';
            bar.style.transform = 'translateX(' + (active.offsetLeft + 12) + 'px)';
        };
        // app.js rewrites the link classes on scroll; follow those changes.
        new MutationObserver(place).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', () => { last = null; place(); });
        place();
    }

    function setupMobileMenu() {
        const toggle = $('#mobile-menu-toggle');
        const drawer = $('#mobile-menu-drawer');
        if (!toggle || !drawer) return;
        new MutationObserver(() => {
            toggle.setAttribute('aria-expanded', String(!drawer.classList.contains('hidden')));
        }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------- Click the robot to wave (a drag still turns it) ---------- */
    function setupHeroClickToWave() {
        const stage = $('#hero-robot-canvas-container');
        if (!stage || typeof window.triggerHeroWave !== 'function') return;
        let down = null;
        stage.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
        stage.addEventListener('pointerup', e => {
            if (!down) return;
            const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
            const quick = performance.now() - down.t < 400;
            down = null;
            if (moved < 6 && quick) window.triggerHeroWave();
        });
    }

    /* ---------- Hero parallax while scrolling away ---------- */
    function setupHeroScroll() {
        if (reduceMotion) return;
        const hero = $('#cynobot');
        const word = $('.hero-wordmark');
        const stage = $('#hero-robot-canvas-container');
        const bottom = $('.hero-bottom');
        if (!hero || !word || !stage) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            const h = hero.offsetHeight || 1;
            const p = Math.min(1, Math.max(0, window.scrollY / h));
            word.style.transform = 'translateY(calc(-62% + ' + (p * 18) + 'vh)) scale(' + (1 - p * 0.08) + ')';
            word.style.opacity = String(1 - p * 1.2);
            stage.style.transform = 'translateY(' + (p * -6) + 'vh) scale(' + (1 - p * 0.06) + ')';
            if (bottom) bottom.style.opacity = String(1 - p * 2.2);
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
    }

    /* ---------- Pointer spotlight on architecture layers ---------- */
    function setupSpotlight() {
        $$('.layer').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* ---------- Section headings decode from random letters into the real text ----------
       Headings are turned into noise as soon as the fonts load, while they are still hidden,
       so the first thing a visitor sees is the jumble, and the real text is what it settles on.
       Every letter has its own fixed-width slot measured from the real letter, so words keep
       their exact length and the line never shifts or re-wraps. */
    function setupHeadingScramble() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        // Noise comes from the same width group as the real letter (narrow / normal / wide).
        const GROUPS = ['fijlrt', 'abcdeghknopqsuvxyz', 'mw', 'IJ', 'ABCDEFGHKLNOPQRSTUVXYZ', 'MW'];
        const groupOf = {};
        GROUPS.forEach(g => { for (const c of g) groupOf[c] = g; });
        const randomFor = ch => {
            const g = groupOf[ch];
            return g ? g[(Math.random() * g.length) | 0] : ch; // punctuation and quotes stay put
        };

        const HOLD = 450;        // ms of pure noise before the first letter lands
        const SPREAD = 1500;     // ms for the settle to sweep from the first to the last letter
        const JITTER = 160;      // ms of random offset per letter so it doesn't look mechanical
        const NOISE_EVERY = 55;  // ms between noise changes

        // Swap the heading's text for one span per letter, already showing noise.
        function prepare(el) {
            const html = el.innerHTML;
            const slots = [];
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
            nodes.forEach(node => {
                const frag = document.createDocumentFragment();
                node.nodeValue.split(/(\s+)/).forEach(chunk => {
                    if (!chunk) return;
                    if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
                    const word = document.createElement('span');
                    word.style.cssText = 'display:inline-block;white-space:nowrap';
                    word.setAttribute('aria-hidden', 'true');
                    for (const ch of chunk) {
                        const s = document.createElement('span');
                        s.textContent = ch;
                        s.style.cssText = 'display:inline-block;text-align:center';
                        word.appendChild(s);
                        slots.push({ el: s, ch });
                    }
                    frag.appendChild(word);
                });
                node.parentNode.replaceChild(frag, node);
            });
            // Measure with the real letters in place, then switch to noise.
            slots.forEach(s => { s.el.style.width = s.el.getBoundingClientRect().width + 'px'; });
            slots.forEach(s => {
                s.el.textContent = randomFor(s.ch);
                if (/[A-Za-z]/.test(s.ch)) s.el.style.opacity = '0.55';
            });
            el._scramble = { html, slots, started: false };
        }

        function restore(el) {
            const st = el._scramble;
            if (!st) return;
            el.innerHTML = st.html;
            el.removeAttribute('aria-label');
            delete el._scramble;
        }

        function run(el) {
            const st = el._scramble;
            if (!st || st.started) return;
            st.started = true;
            const { slots } = st;
            const n = slots.length;
            slots.forEach((s, i) => {
                s.settleAt = HOLD + (i / Math.max(1, n - 1)) * SPREAD + (Math.random() - 0.5) * JITTER;
            });
            const t0 = performance.now();
            let lastNoise = t0;
            const frame = now => {
                const t = now - t0;
                const noise = now - lastNoise >= NOISE_EVERY;
                if (noise) lastNoise = now;
                let pending = 0;
                slots.forEach(s => {
                    if (s.done) return;
                    if (t >= s.settleAt) {
                        s.el.textContent = s.ch;
                        s.el.style.opacity = '';
                        s.done = true;
                    } else {
                        pending++;
                        if (noise) s.el.textContent = randomFor(s.ch);
                    }
                });
                if (pending) requestAnimationFrame(frame);
                else restore(el); // back to plain text so kerning and selection are normal
            };
            requestAnimationFrame(frame);
        }

        const headings = $$('.h-section');

        // Start as the heading begins to fade in (same trigger as the scroll reveal).
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                run(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        // A fast scroll or an anchor jump can skip a heading; never leave one stuck as noise.
        const sweep = () => {
            headings.forEach(h => {
                const st = h._scramble;
                if (st && !st.started && h.getBoundingClientRect().top < window.innerHeight) run(h);
            });
        };
        let pendingSweep = false;
        window.addEventListener('scroll', () => {
            if (!pendingSweep) { pendingSweep = true; setTimeout(() => { pendingSweep = false; sweep(); }, 120); }
        }, { passive: true });

        // If the window size changes before a heading has played, re-measure its slots.
        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                headings.forEach(h => {
                    if (h._scramble && !h._scramble.started) { restore(h); prepare(h); }
                });
            }, 150);
        });

        // Slots must be measured in the real typeface, so wait for the fonts.
        const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        fontsReady.then(() => {
            headings.forEach(h => {
                // Headings already on screen when the fonts land: noise right away, then play.
                prepare(h);
                io.observe(h);
            });
            sweep();
        });
    }

    /* ---------- Bottom-edge blur: on once you leave the hero, off at the very end ---------- */
    function setupEdgeBlur() {
        const blur = $('.edge-blur');
        const hero = $('#cynobot');
        if (!blur) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            const pastHero = window.scrollY > (hero ? hero.offsetHeight * 0.5 : 40);
            const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
            blur.classList.toggle('is-on', pastHero && !atEnd);
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ---------- Footer wordmark drawn in small jumbling ASCII characters ----------
       "CYNOBOT" is rendered once into a tiny mask (one pixel per character cell).
       Cells inside the letters get a character; dense ones in the middle, light ones on the edges.
       Characters slowly re-jumble on their own, and run hot (fast + cyan) under the pointer. */
    function setupFooterAscii() {
        const host = $('.footer-mark');
        if (!host || !document.createElement('canvas').getContext) return;

        const FILL = '#%&@$*+=01';
        const EDGE = '.:;-~\'';
        const pick = s => s[(Math.random() * s.length) | 0];
        const BASE = [238, 241, 244];   // --on-ink
        const HOT = [44, 200, 240];     // --signal

        const canvas = document.createElement('canvas');
        canvas.className = 'footer-ascii';
        canvas.setAttribute('aria-hidden', 'true');
        const ctx = canvas.getContext('2d');

        let cells = [], mask = null, cols = 0, rows = 0, cw = 9, chH = 13.5, W = 0, H = 0, dpr = 1;
        const pointer = { x: -1e4, y: -1e4, inside: false };
        let revealStart = null, visible = false, rafId = 0, lastFrame = 0, lastPointerMove = 0;
        const glyph = { ref: 200, left: 0, asc: 0, scale: 1 };
        const glyphFont = () => `800 ${glyph.ref}px Archivo, "Helvetica Neue", Arial, sans-serif`;

        function build() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = host.clientWidth;
            if (!W) return false;
            cw = W < 600 ? 6 : W < 900 ? 7.5 : 9;   // cell width in CSS px
            chH = cw * 1.45;                        // cell height
            cols = Math.floor(W / cw);

            // Measure the word in the display face.
            const m = document.createElement('canvas');
            let mc = m.getContext('2d');
            const REF = 200;
            const setFont = c => { c.font = `800 ${REF}px Archivo, "Helvetica Neue", Arial, sans-serif`; if ('fontStretch' in c) c.fontStretch = 'expanded'; };
            setFont(mc);
            const met = mc.measureText('CYNOBOT');
            const left = met.actualBoundingBoxLeft || 0;
            const textW = left + (met.actualBoundingBoxRight || met.width);
            const asc = met.actualBoundingBoxAscent || REF * 0.72;
            const desc = met.actualBoundingBoxDescent || 0;
            const scale = (cols * cw) / textW;          // reference px -> CSS px
            rows = Math.ceil(((asc + desc) * scale) / chH) + 2;
            H = rows * chH;

            // Draw into a cols x rows mask: one mask pixel == one character cell.
            m.width = cols; m.height = rows;
            mc = m.getContext('2d');
            setFont(mc);
            mc.setTransform(scale / cw, 0, 0, scale / chH, 0, (chH + asc * scale) / chH);
            mc.fillStyle = '#fff';
            mc.fillText('CYNOBOT', left, 0);
            const data = mc.getImageData(0, 0, cols, rows).data;
            Object.assign(glyph, { ref: REF, left, asc, scale });

            cells = [];
            mask = new Uint8Array(cols * rows);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const a = data[(r * cols + c) * 4 + 3] / 255;
                    if (a < 0.03) continue;
                    mask[r * cols + c] = 1;
                    const edge = a < 0.6;
                    cells.push({
                        x: c * cw, y: r * chH,
                        edge,
                        chr: pick(edge ? EDGE : FILL),
                        heat: 0,
                        revealAt: 150 + (c / cols) * 1100 + Math.random() * 260
                    });
                }
            }

            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            canvas.style.height = H + 'px';
            return true;
        }

        function draw(now) {
            const t = revealStart === null ? 0 : now - revealStart;
            const R = Math.max(70, W * 0.07);           // pointer radius
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.font = `500 ${(cw * 1.3).toFixed(1)}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            let busy = false;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (!reduceMotion && t < cell.revealAt) { busy = true; continue; }
                const decoding = !reduceMotion && t < cell.revealAt + 320;

                const dx = cell.x + cw / 2 - pointer.x, dy = cell.y + chH / 2 - pointer.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                const near = pointer.inside && d < R ? 1 - d / R : 0;
                cell.heat = Math.max(near, cell.heat * 0.93);
                if (cell.heat > 0.01) busy = true;

                if (!reduceMotion && (decoding || Math.random() < cell.heat * 0.55 || Math.random() < 0.003)) {
                    cell.chr = pick(cell.edge ? EDGE : FILL);
                }

                // Slow diagonal shimmer so it feels alive even when nobody touches it.
                const shimmer = reduceMotion ? 0 : 0.5 + 0.5 * Math.sin(now * 0.0011 - (cell.x + cell.y * 0.6) * 0.012);
                let alpha = (cell.edge ? 0.26 : 0.42) + shimmer * 0.12;
                if (decoding) alpha = 0.75;
                const h = Math.min(1, cell.heat * 1.4);
                alpha += h * (1 - alpha);
                const rC = BASE[0] + (HOT[0] - BASE[0]) * h;
                const gC = BASE[1] + (HOT[1] - BASE[1]) * h;
                const bC = BASE[2] + (HOT[2] - BASE[2]) * h;
                ctx.fillStyle = `rgba(${rC | 0},${gC | 0},${bC | 0},${alpha.toFixed(3)})`;
                ctx.fillText(cell.chr, cell.x + cw / 2, cell.y);
            }

            // Trim the characters to the exact letter shapes so the edges stay clean.
            const placeWord = () => {
                ctx.setTransform(dpr * glyph.scale, 0, 0, dpr * glyph.scale, 0, dpr * (chH + glyph.asc * glyph.scale));
                ctx.font = glyphFont();
                if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
            };
            ctx.save();
            placeWord();
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = '#000';
            ctx.fillText('CYNOBOT', glyph.left, 0);
            ctx.restore();

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `500 ${(cw * 1.3).toFixed(1)}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            // Faint dot grid around the pointer, outside the letters only.
            if (pointer.inside && !reduceMotion) {
                const c0 = Math.max(0, Math.floor((pointer.x - R) / cw)), c1 = Math.min(cols - 1, Math.ceil((pointer.x + R) / cw));
                const r0 = Math.max(0, Math.floor((pointer.y - R) / chH)), r1 = Math.min(rows - 1, Math.ceil((pointer.y + R) / chH));
                for (let r = r0; r <= r1; r++) {
                    for (let c = c0; c <= c1; c++) {
                        if (mask[r * cols + c]) continue;
                        const dx = c * cw + cw / 2 - pointer.x, dy = r * chH + chH / 2 - pointer.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d >= R) continue;
                        ctx.fillStyle = `rgba(${HOT[0]},${HOT[1]},${HOT[2]},${((1 - d / R) * 0.35).toFixed(3)})`;
                        ctx.fillText('·', c * cw + cw / 2, r * chH);
                    }
                }
            }
            return busy;
        }

        function loop(now) {
            rafId = 0;
            if (!visible) return;
            const busy = draw(now);
            // Full frame rate while decoding or under the pointer, ~20 fps when idling.
            const delay = busy || now - lastPointerMove < 600 ? 0 : 50;
            if (reduceMotion && !busy) return;
            if (delay) setTimeout(() => { if (!rafId) rafId = requestAnimationFrame(loop); }, delay);
            else rafId = requestAnimationFrame(loop);
        }
        const kick = () => { if (!rafId && visible) rafId = requestAnimationFrame(loop); };

        const setPointer = e => {
            const r = canvas.getBoundingClientRect();
            pointer.x = e.clientX - r.left;
            pointer.y = e.clientY - r.top;
            pointer.inside = true;
            lastPointerMove = performance.now();
            kick();
        };
        host.addEventListener('pointermove', setPointer);
        host.addEventListener('pointerdown', setPointer);
        host.addEventListener('pointerleave', () => { pointer.inside = false; pointer.x = pointer.y = -1e4; });

        const start = () => {
            if (!build()) return;
            host.classList.add('is-ascii');
            if (!canvas.parentNode) host.appendChild(canvas);
            new IntersectionObserver(([e]) => {
                visible = e.isIntersecting;
                if (visible && revealStart === null) revealStart = performance.now();
                kick();
            }, { threshold: 0.2 }).observe(host);

            let resizeTimer = 0, lastW = W;
            new ResizeObserver(() => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (host.clientWidth === lastW) return;
                    lastW = host.clientWidth;
                    if (build()) { revealStart = performance.now() - 5000; kick(); }
                }, 150);
            }).observe(host);
        };

        // The mask must be measured with Archivo, so wait for it.
        const fontsReady = document.fonts && document.fonts.load
            ? Promise.all([document.fonts.load('800 100px Archivo'), document.fonts.load('500 12px "IBM Plex Mono"')]).catch(() => {})
            : Promise.resolve();
        fontsReady.then(start);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

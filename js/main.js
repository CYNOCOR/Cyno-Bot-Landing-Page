(() => {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* Header state */
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navLinks");

  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  const links = [...nav.querySelectorAll("a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            const on = a.getAttribute("href") === "#" + entry.target.id;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => navObs.observe(s));
  }

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = [...el.parentElement.children].filter((c) =>
            c.classList.contains("reveal"),
          );
          el.style.transitionDelay =
            Math.min(siblings.indexOf(el), 6) * 60 + "ms";
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    reveals.forEach((el) => revObs.observe(el));
  }

  /* face moods */
  const face = document.getElementById("botFace");
  const moodText = document.getElementById("moodText");
  const chips = [...document.querySelectorAll(".mood-chips .chip")];
  const moodCopy = {
    happy: "Happy: ready to greet visitors",
    curious: "Curious: someone new just walked in",
    thinking: "Thinking: finding the answer",
    sleepy: "Sleepy: idle, nobody around",
  };

  const moodLive = document.getElementById("moodLive");
  const setMood = (mood, announce = false) => {
    face.dataset.mood = mood;
    moodText.textContent = moodCopy[mood];
    if (announce && moodLive)
      moodLive.textContent = "Expression set to " + moodCopy[mood];
    chips.forEach((c) => {
      const on = c.dataset.mood === mood;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
  };

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      setMood(chip.dataset.mood, true);
    }),
  );

  /* Robot face: eyes follow the pointer */
  const eyes = face.querySelector(".eyes");
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (
            face.dataset.mood === "thinking" ||
            face.dataset.mood === "sleepy"
          ) {
            eyes.style.removeProperty("--lx");
            eyes.style.removeProperty("--ly");
            return;
          }
          const r = face.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
          const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
          const clamp = (v) => Math.max(-1, Math.min(1, v * 2.2));
          eyes.style.setProperty("--lx", (clamp(dx) * 16).toFixed(1) + "px");
          eyes.style.setProperty("--ly", (clamp(dy) * 10).toFixed(1) + "px");
        });
      },
      { passive: true },
    );
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

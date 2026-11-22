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

  /* Demo request form (WhatsApp or FormSubmit Email) */
  const form = document.getElementById("ctaForm");
  if (form) {
    const status = document.getElementById("formStatus");
    const submit = form.querySelector(".cta-submit");
    const to = form.dataset.email;
    const waNumber = form.dataset.whatsapp || "94742321760";
    const methodEl = document.getElementById("f-method");
    const phoneReq = document.getElementById("f-phone-req");
    const emailOpt = document.getElementById("f-email-opt");

    const syncMethodUI = () => {
      const isWa = methodEl && methodEl.value === "whatsapp";
      if (phoneReq) phoneReq.textContent = isWa ? "*" : "(optional)";
      if (phoneReq) phoneReq.className = isWa ? "req" : "opt";
      if (emailOpt) emailOpt.textContent = isWa ? "(optional)" : "*";
      if (emailOpt) emailOpt.className = isWa ? "opt" : "req";
    };
    if (methodEl) {
      methodEl.addEventListener("change", syncMethodUI);
      syncMethodUI();
    }

    const checks = [
      ["f-name", (el) => (el.value.trim() ? "" : "Please enter your name.")],
      [
        "f-phone",
        (el) =>
          methodEl && methodEl.value === "whatsapp" && !el.value.trim()
            ? "Please enter your phone or WhatsApp number."
            : "",
      ],
      [
        "f-email",
        (el) => {
          const val = el.value.trim();
          const isEmail = !methodEl || methodEl.value === "email";
          if (isEmail && !val) return "Please enter your email.";
          if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
            return "Please enter a valid email, like name@example.com.";
          return "";
        },
      ],
      [
        "f-consent",
        (el) =>
          el.checked
            ? ""
            : "Please agree to the privacy notice so we can reply.",
      ],
    ];
    const validate = () => {
      let first = null;
      checks.forEach(([id, test]) => {
        const el = document.getElementById(id);
        const msg = test(el);
        document.getElementById(id + "-err").textContent = msg;
        if (msg) {
          el.setAttribute("aria-invalid", "true");
          first = first || el;
        } else el.removeAttribute("aria-invalid");
      });
      return first;
    };
    checks.forEach(([id]) =>
      document.getElementById(id).addEventListener("change", () => {
        if (document.getElementById(id).hasAttribute("aria-invalid")) validate();
      }),
    );

    let lastSent = 0;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      const bad = validate();
      if (bad) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.add("is-bad");
        bad.focus();
        return;
      }
      if (form.elements._honey.value) return; // bot filled the hidden field
      if (Date.now() - lastSent < 5000) {
        status.textContent = "Please wait a moment before sending again.";
        return;
      }
      lastSent = Date.now();
      const name = document.getElementById("f-name").value.trim();
      const phone = document.getElementById("f-phone").value.trim();
      const email = document.getElementById("f-email").value.trim();
      const org = document.getElementById("f-org")
        ? document.getElementById("f-org").value.trim()
        : "";
      const msg = document.getElementById("f-msg")
        ? document.getElementById("f-msg").value.trim()
        : "";
      const lines = ["Hello CYNO BOT team,", `Name: ${name}`];
      if (phone) lines.push(`Phone / WhatsApp: ${phone}`);
      if (email) lines.push(`Email: ${email}`);
      if (org) lines.push(`Organisation: ${org}`);
      if (msg) lines.push(`Message: ${msg}`);
      const bodyText = lines.join("\n");

      if (methodEl && methodEl.value === "whatsapp") {
        const waUrl =
          "https://wa.me/" +
          waNumber +
          "?text=" +
          encodeURIComponent(bodyText);
        window.open(waUrl, "_blank", "noopener");
        status.textContent = "Opening WhatsApp with your request…";
        status.classList.add("is-ok");
        return;
      }

      const mailtoUrl =
        "mailto:" +
        to +
        "?subject=" +
        encodeURIComponent("CYNO BOT demo request - " + name) +
        "&body=" +
        encodeURIComponent(bodyText);
      window.location.href = mailtoUrl;
      status.textContent = "Opening your email app…";
      status.classList.add("is-ok");
    });
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

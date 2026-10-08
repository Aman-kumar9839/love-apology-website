(() => {
  "use strict";

  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuButton = one(".menu-toggle");
  const navigation = one("#primary-navigation");
  const header = one(".site-header");
  const musicButton = one(".music-toggle");
  const music = one(".optional-music");
  const toast = one(".toast");
  const answerMessage = one(".answer-message");
  const hugOverlay = one(".hug-overlay");
  let toastTimer = 0;
  let lastFocusedElement = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
  }

  function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });
    all("a", navigation).forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (event) => {
      if (navigation.classList.contains("is-open") && header && !header.contains(event.target)) closeMenu();
    });
  }

  all('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = one(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.location.hash !== targetId) history.replaceState(null, "", targetId);
    });
  });

  all(".memory-visual img").forEach((image) => {
    const visual = image.closest(".memory-visual");
    const showFallback = () => {
      if (visual) visual.classList.add("is-missing");
    };
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });

  const revealItems = all(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const navLinks = all(".primary-navigation a");
  const observedSections = navLinks.map((link) => one(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-38% 0px -52% 0px" });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  function createAmbientHearts() {
    const container = one(".ambient-hearts");
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hearts = ["♡", "♥", "✧"];
    for (let index = 0; index < 18; index += 1) {
      const heart = document.createElement("span");
      const size = 10 + Math.random() * 16;
      heart.className = "ambient-heart";
      heart.textContent = hearts[index % hearts.length];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty("--size", `${size}px`);
      heart.style.setProperty("--duration", `${13 + Math.random() * 13}s`);
      heart.style.setProperty("--delay", `${-Math.random() * 23}s`);
      heart.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
      container.appendChild(heart);
    }
  }
  createAmbientHearts();

  function createConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const symbols = ["♥", "♡", "✦", "✧"];
    const colors = ["#ff9fbd", "#f8d3a9", "#dfc0f4", "#fff0f6"];
    for (let index = 0; index < 42; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.setAttribute("aria-hidden", "true");
      piece.textContent = symbols[index % symbols.length];
      piece.style.setProperty("--left", `${Math.random() * 100}vw`);
      piece.style.setProperty("--size", `${10 + Math.random() * 13}px`);
      piece.style.setProperty("--confetti", colors[index % colors.length]);
      piece.style.setProperty("--duration", `${2.3 + Math.random() * 2}s`);
      piece.style.setProperty("--sway", `${-110 + Math.random() * 220}px`);
      piece.style.setProperty("--spin", `${-230 + Math.random() * 460}deg`);
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 5000);
    }
  }

  if (answerMessage) {
    all("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const response = button.getAttribute("data-answer");
        answerMessage.replaceChildren();
        const heading = document.createElement("strong");
        const detail = document.createElement("span");
        if (response === "forgive") {
          heading.textContent = "Thank you, Meri Princess ❤️";
          detail.textContent = "Ek virtual hug tumhare liye 🤗";
          createConfetti();
        } else if (response === "time") {
          heading.textContent = "Theek hai Gudiya ❤️";
          detail.textContent = "Jitna time chahiye le lo. Main tumhari feelings aur space ki respect karta hoon.";
        } else {
          return;
        }
        answerMessage.append(heading, detail);
        answerMessage.hidden = false;
        answerMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  function closeHugOverlay() {
    if (!hugOverlay || hugOverlay.hidden) return;
    hugOverlay.hidden = true;
    document.body.classList.remove("overlay-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  function openHugOverlay() {
    if (!hugOverlay) return;
    lastFocusedElement = document.activeElement;
    hugOverlay.hidden = false;
    document.body.classList.add("overlay-open");
    const heartContainer = one(".hug-hearts", hugOverlay);
    if (heartContainer && heartContainer.childElementCount === 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const colors = ["#ff9fbd", "#ffc9d9", "#e1c5f5"];
      for (let index = 0; index < 24; index += 1) {
        const heart = document.createElement("span");
        heart.className = "hug-heart";
        heart.textContent = index % 2 ? "♡" : "♥";
        heart.style.setProperty("--left", `${Math.random() * 100}%`);
        heart.style.setProperty("--size", `${14 + Math.random() * 28}px`);
        heart.style.setProperty("--duration", `${5 + Math.random() * 5}s`);
        heart.style.setProperty("--delay", `${-Math.random() * 8}s`);
        heart.style.setProperty("--heart-color", colors[index % colors.length]);
        heartContainer.appendChild(heart);
      }
    }
    const closeButton = one(".overlay-close", hugOverlay);
    if (closeButton) closeButton.focus();
  }

  const hugButton = one(".hug-button");
  if (hugButton) hugButton.addEventListener("click", openHugOverlay);
  const closeButton = one(".overlay-close", hugOverlay || document);
  if (closeButton) closeButton.addEventListener("click", closeHugOverlay);
  if (hugOverlay) {
    hugOverlay.addEventListener("click", (event) => {
      if (event.target === hugOverlay) closeHugOverlay();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        closeHugOverlay();
      }
    });
  }

  if (musicButton && music) {
    music.addEventListener("error", () => {
      musicButton.disabled = true;
      musicButton.setAttribute("aria-label", "Optional music unavailable");
      musicButton.setAttribute("aria-pressed", "false");
      showToast("Add your music file as assets/music.mp3 to enable the soundtrack.");
    });
    musicButton.addEventListener("click", async () => {
      if (!music.getAttribute("src")) {
        showToast("To add music, put your track at assets/music.mp3 and set the audio src in index.html.");
        return;
      }
      if (!music.paused) {
        music.pause();
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.setAttribute("aria-label", "Play optional music");
        showToast("Music paused.");
        return;
      }
      try {
        await music.play();
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.setAttribute("aria-label", "Pause optional music");
        showToast("A little soundtrack, just for you.");
      } catch {
        musicButton.disabled = true;
        musicButton.setAttribute("aria-label", "Optional music unavailable");
        showToast("Add your music file as assets/music.mp3 to enable the soundtrack.");
      }
    });
  }
})();

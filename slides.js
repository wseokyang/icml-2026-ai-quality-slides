(() => {
  "use strict";

  const deck = document.querySelector("#deck");
  const slides = [...document.querySelectorAll(".slide")];
  const previousButton = document.querySelector("#prev-button");
  const nextButton = document.querySelector("#next-button");
  const overviewButton = document.querySelector("#overview-button");
  const notesButton = document.querySelector("#notes-button");
  const fullscreenButton = document.querySelector("#fullscreen-button");
  const sourcesButton = document.querySelector("#sources-button");
  const counter = document.querySelector("#slide-counter");
  const progress = document.querySelector("#progress-bar");
  const notesPanel = document.querySelector("#notes-panel");
  const sourcesPanel = document.querySelector("#sources-panel");
  const notesTitle = document.querySelector("#notes-title");
  const notesCopy = document.querySelector("#notes-copy");
  const liveRegion = document.querySelector("#live-region");

  let currentIndex = 0;
  let scrollFrame = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let overviewOrigin = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const pad = (value) => String(value).padStart(2, "0");

  function indexFromHash() {
    const match = window.location.hash.match(/^#(?:slide-)?(\d+)$/i);
    return match ? clamp(Number(match[1]) - 1, 0, slides.length - 1) : 0;
  }

  function updateNotes() {
    const slide = slides[currentIndex];
    const note = slide.querySelector(".speaker-notes");
    notesTitle.textContent = slide.dataset.title || `슬라이드 ${currentIndex + 1}`;
    notesCopy.textContent = note?.textContent.trim() || "이 슬라이드에는 별도 노트가 없습니다.";
  }

  function setActive(index, announce = false) {
    const nextIndex = clamp(index, 0, slides.length - 1);
    if (nextIndex === currentIndex && slides[nextIndex].classList.contains("is-active")) {
      return;
    }

    currentIndex = nextIndex;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle("is-active", active);
      if (active) {
        slide.setAttribute("aria-current", "page");
      } else {
        slide.removeAttribute("aria-current");
      }
    });

    const humanIndex = currentIndex + 1;
    const title = slides[currentIndex].dataset.title || `슬라이드 ${humanIndex}`;
    counter.textContent = `${pad(humanIndex)} / ${pad(slides.length)}`;
    progress.style.width = `${(humanIndex / slides.length) * 100}%`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    updateNotes();

    history.replaceState(null, "", `#${humanIndex}`);
    document.title = `${pad(humanIndex)} · ${title} — ICML 2026`;
    if (announce) {
      liveRegion.textContent = `${humanIndex}번 슬라이드, ${title}`;
    }
  }

  function goTo(index, behavior = "smooth", announce = true) {
    const targetIndex = clamp(index, 0, slides.length - 1);
    if (document.body.classList.contains("overview-mode")) {
      leaveOverview(targetIndex);
      return;
    }
    setActive(targetIndex, announce);
    slides[targetIndex].scrollIntoView({ block: "start", behavior });
  }

  function nearestSlide() {
    const deckTop = deck.getBoundingClientRect().top;
    let closestIndex = currentIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().top - deckTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  }

  function onDeckScroll() {
    if (document.body.classList.contains("overview-mode")) return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => setActive(nearestSlide()));
  }

  function closePanel(panel) {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    if (panel === notesPanel) notesButton.setAttribute("aria-expanded", "false");
    if (panel === sourcesPanel) sourcesButton?.setAttribute("aria-expanded", "false");
  }

  function openPanel(panel) {
    [notesPanel, sourcesPanel].forEach((candidate) => {
      if (candidate !== panel) closePanel(candidate);
    });
    if (panel === notesPanel) updateNotes();
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    if (panel === notesPanel) notesButton.setAttribute("aria-expanded", "true");
    if (panel === sourcesPanel) sourcesButton?.setAttribute("aria-expanded", "true");
    panel.querySelector(".panel-close")?.focus({ preventScroll: true });
  }

  function togglePanel(panel) {
    if (panel.classList.contains("is-open")) {
      closePanel(panel);
    } else {
      openPanel(panel);
    }
  }

  function enterOverview() {
    overviewOrigin = currentIndex;
    closePanel(notesPanel);
    closePanel(sourcesPanel);
    document.body.classList.add("overview-mode");
    overviewButton.setAttribute("aria-pressed", "true");
    overviewButton.setAttribute("aria-label", "전체 보기 닫기");
    requestAnimationFrame(() => {
      slides[currentIndex].scrollIntoView({ block: "center", behavior: "instant" });
    });
  }

  function leaveOverview(targetIndex = overviewOrigin) {
    document.body.classList.remove("overview-mode");
    overviewButton.setAttribute("aria-pressed", "false");
    overviewButton.setAttribute("aria-label", "전체 슬라이드 보기");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => goTo(targetIndex, "instant"));
    });
  }

  function toggleOverview() {
    if (document.body.classList.contains("overview-mode")) {
      leaveOverview();
    } else {
      enterOverview();
    }
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      liveRegion.textContent = "이 브라우저에서는 전체 화면을 사용할 수 없습니다.";
    }
  }

  function isTypingTarget(target) {
    return target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  }

  function onKeydown(event) {
    if (isTypingTarget(event.target)) return;

    if (event.key === "Escape") {
      if (notesPanel.classList.contains("is-open")) closePanel(notesPanel);
      else if (sourcesPanel.classList.contains("is-open")) closePanel(sourcesPanel);
      else if (document.body.classList.contains("overview-mode")) leaveOverview();
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "o") {
      event.preventDefault();
      toggleOverview();
      return;
    }
    if (key === "n") {
      event.preventDefault();
      togglePanel(notesPanel);
      return;
    }
    if (key === "s") {
      event.preventDefault();
      togglePanel(sourcesPanel);
      return;
    }
    if (key === "f") {
      event.preventDefault();
      toggleFullscreen();
      return;
    }

    if (document.body.classList.contains("overview-mode")) return;

    const nextKeys = ["ArrowRight", "ArrowDown", "PageDown", " "];
    const previousKeys = ["ArrowLeft", "ArrowUp", "PageUp"];
    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      goTo(currentIndex + 1);
    } else if (previousKeys.includes(event.key)) {
      event.preventDefault();
      goTo(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  }

  function onOverviewClick(event) {
    if (!document.body.classList.contains("overview-mode")) return;
    if (event.target.closest("a, button")) return;
    const slide = event.target.closest(".slide");
    if (slide) leaveOverview(slides.indexOf(slide));
  }

  previousButton.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton.addEventListener("click", () => goTo(currentIndex + 1));
  overviewButton.addEventListener("click", toggleOverview);
  notesButton.addEventListener("click", () => togglePanel(notesPanel));
  fullscreenButton.addEventListener("click", toggleFullscreen);
  sourcesButton?.addEventListener("click", () => togglePanel(sourcesPanel));
  document.querySelectorAll(".panel-close").forEach((button) => {
    button.addEventListener("click", () => closePanel(button.closest(".utility-panel")));
  });
  deck.addEventListener("scroll", onDeckScroll, { passive: true });
  deck.addEventListener("click", onOverviewClick);
  document.addEventListener("keydown", onKeydown);

  deck.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  deck.addEventListener("touchend", (event) => {
    if (document.body.classList.contains("overview-mode")) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      goTo(currentIndex + (deltaX < 0 ? 1 : -1));
    }
  }, { passive: true });

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
  });
  window.addEventListener("hashchange", () => goTo(indexFromHash(), "instant", false));

  notesButton.setAttribute("aria-expanded", "false");
  notesButton.setAttribute("aria-controls", "notes-panel");
  overviewButton.setAttribute("aria-pressed", "false");
  fullscreenButton.setAttribute("aria-pressed", "false");
  sourcesButton?.setAttribute("aria-expanded", "false");
  sourcesButton?.setAttribute("aria-controls", "sources-panel");

  const initialIndex = indexFromHash();
  setActive(initialIndex);
  requestAnimationFrame(() => goTo(initialIndex, "instant", false));

  window.icmlDeck = {
    goTo,
    next: () => goTo(currentIndex + 1),
    previous: () => goTo(currentIndex - 1),
    overview: toggleOverview,
    get current() { return currentIndex + 1; },
    get total() { return slides.length; }
  };
})();

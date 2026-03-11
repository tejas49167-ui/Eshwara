const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".site-header");
const revealItems = document.querySelectorAll("[data-reveal]");
const counters = document.querySelectorAll("[data-counter]");

const setHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const animateCounter = (element) => {
  const target = Number(element.dataset.counter);
  if (!target || element.dataset.counted === "true") {
    return;
  }

  element.dataset.counted = "true";

  if (prefersReducedMotion) {
    element.textContent = `${target}`;
    return;
  }

  const duration = 1400;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      if (entry.target.hasAttribute("data-counter")) {
        animateCounter(entry.target);
      }

      const counter = entry.target.querySelector("[data-counter]");
      if (counter) {
        animateCounter(counter);
      }

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px"
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

counters.forEach((counter) => {
  const wrapper = counter.closest("div");
  if (!wrapper || wrapper.hasAttribute("data-reveal")) {
    return;
  }

  revealObserver.observe(counter);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

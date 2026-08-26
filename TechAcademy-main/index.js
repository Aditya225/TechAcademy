/* =========================================================
   Techs Academy - index.js
   Homepage interactions + mobile navbar
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavbar();
  initProcessTabs();
  initTestimonials();
  initCookieConsent();
  initSmoothScroll();
  initAnalyticsTracking();
});

/* ---------- Mobile Navbar ---------- */
function initMobileNavbar() {
  const toggle = document.querySelector("[data-mobile-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const close = document.querySelector("[data-mobile-menu-close]");

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-menu-open");
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-menu-open");
  };

  toggle.addEventListener("click", () => {
    menu.classList.contains("is-open")
      ? closeMenu()
      : openMenu();
  });

  if (close) {
    close.addEventListener("click", closeMenu);
  }

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      menu.classList.contains("is-open") &&
      !menu.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

/* ---------- Process Tabs ---------- */
function initProcessTabs() {
  const tabs = document.querySelectorAll(
    "[data-process-tab]"
  );

  const panels = document.querySelectorAll(
    "[data-process-panel]"
  );

  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.processTab;

      tabs.forEach((item) => {
        item.classList.toggle(
          "active",
          item === tab
        );

        item.setAttribute(
          "aria-selected",
          item === tab ? "true" : "false"
        );
      });

      panels.forEach((panel) => {
        panel.hidden =
          panel.dataset.processPanel !== target;
      });
    });
  });
}

/* ---------- Testimonials ---------- */
function initTestimonials() {
  const track = document.querySelector(
    "[data-testimonial-track]"
  );

  const cards = track
    ? Array.from(track.children)
    : [];

  const prev = document.querySelector(
    "[data-testimonial-prev]"
  );

  const next = document.querySelector(
    "[data-testimonial-next]"
  );

  if (!track || cards.length < 2) return;

  let current = 0;
  let timer;

  const render = () => {
    const width =
      cards[0].getBoundingClientRect().width;

    track.style.transform =
      `translateX(-${current * width}px)`;
  };

  const goTo = (index) => {
    current =
      (index + cards.length) % cards.length;

    render();
  };

  const start = () => {
    clearInterval(timer);

    timer = setInterval(() => {
      goTo(current + 1);
    }, 5000);
  };

  if (prev) {
    prev.addEventListener("click", () => {
      goTo(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      goTo(current + 1);
      start();
    });
  }

  window.addEventListener("resize", render);

  render();
  start();
}

/* ---------- Cookie Consent ---------- */
function initCookieConsent() {
  const banner = document.querySelector(
    "[data-cookie-banner]"
  );

  const accept = document.querySelector(
    "[data-cookie-accept]"
  );

  const reject = document.querySelector(
    "[data-cookie-reject]"
  );

  if (!banner) return;

  const key =
    "techsacademy_cookie_consent";

  if (localStorage.getItem(key)) {
    banner.hidden = true;
    return;
  }

  const save = (value) => {
    localStorage.setItem(key, value);
    banner.hidden = true;
  };

  if (accept) {
    accept.addEventListener("click", () => {
      save("accepted");
    });
  }

  if (reject) {
    reject.addEventListener("click", () => {
      save("rejected");
    });
  }
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener("click", (event) => {
        const id =
          link.getAttribute("href");

        if (!id || id === "#") return;

        const target =
          document.querySelector(id);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

    });
}

/* ---------- Analytics ---------- */
function initAnalyticsTracking() {
  document
    .querySelectorAll("[data-track]")
    .forEach((element) => {

      element.addEventListener("click", () => {
        const eventName =
          element.dataset.track;

        if (typeof window.gtag === "function") {
          window.gtag("event", eventName, {
            event_category:
              "Techs Academy Website"
          });
        }
      });

    });
}

/* ---------- Backward Compatibility ----------
   If your existing HTML still calls:

   switchTab("students")

   this keeps that working.
-------------------------------------------------- */

window.switchTab = function (target) {

  const tab = document.querySelector(
    `[data-process-tab="${target}"]`
  );

  if (tab) {
    tab.click();
    return;
  }

  document
    .querySelectorAll("[data-process-panel]")
    .forEach((panel) => {

      panel.hidden =
        panel.dataset.processPanel !== target;

    });
};
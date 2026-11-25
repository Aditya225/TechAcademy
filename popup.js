(function () {
  const modal = document.getElementById("ta-onboarding");
  const closeBtn = document.getElementById("ta-close");
  const skipBtn = document.getElementById("ta-skip");

  if (!modal || !closeBtn || !skipBtn) return;

  const STORAGE_KEY = "ta_onboarding_seen";
  let lastFocusedElement = null;

  function trackEvent(eventName, category = "Unknown") {
    if (window.TAAnalytics && typeof window.TAAnalytics.track === "function") {
      window.TAAnalytics.track(eventName, category);
    }
  }

  function closeModal(action, category = "Unknown") {
    if (!modal.classList.contains("ta-active")) return;

    trackEvent(action, category);

    modal.classList.remove("ta-active");
    modal.setAttribute("aria-hidden", "true");
    sessionStorage.setItem(STORAGE_KEY, "true");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function openModal() {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    lastFocusedElement = document.activeElement;
    modal.classList.add("ta-active");
    modal.setAttribute("aria-hidden", "false");

    trackEvent("popup_shown");
    closeBtn.focus();
  }

  if (!sessionStorage.getItem(STORAGE_KEY)) {
    setTimeout(openModal, 2000);
  }

  closeBtn.addEventListener("click", function () {
    closeModal("close_clicked");
  });

  skipBtn.addEventListener("click", function () {
    closeModal("skip_clicked");
  });

  // Backdrop click closes popup cleanly without navigating
  modal.addEventListener("click", function (event) {
    if (event.target === modal && modal.classList.contains("ta-active")) {
      closeModal("backdrop_clicked");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("ta-active")) {
      closeModal("close_clicked");
    }
  });

  // Category selection: stays on page, records selection, and closes modal
  const options = modal.querySelectorAll(".ta-option");

  options.forEach(function (option) {
    option.addEventListener("click", function (event) {
      event.preventDefault();

      const titleText = option.querySelector(".ta-option-title")?.textContent || "";
      let category = option.dataset.category || "Unknown";
      let eventName = option.dataset.event || "option_selected";

      if (!option.dataset.category) {
        if (titleText.includes("Student")) {
          category = "Student";
          eventName = "student_selected";
        } else if (titleText.includes("Job")) {
          category = "Job Seeker";
          eventName = "job_seeker_selected";
        } else {
          category = "Professional / Employer";
          eventName = "professional_selected";
        }
      }

      sessionStorage.setItem("ta_selected_audience", category);
      trackEvent(eventName, category);
      closeModal("option_selected", category);
    });
  });
})();

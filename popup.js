
(function () {

  const modal = document.getElementById("ta-onboarding");
  const closeBtn = document.getElementById("ta-close");
  const skipBtn = document.getElementById("ta-skip");

  if (!modal || !closeBtn || !skipBtn) return;

  const STORAGE_KEY = "ta_onboarding_seen";

  function trackEvent(eventName, category = "Unknown") {
    if (window.TAAnalytics) {
      window.TAAnalytics.track(eventName, category);
    }
  }

  function closeModal(action) {

    if (!modal.classList.contains("ta-active")) return;

    trackEvent(action);

    modal.classList.remove("ta-active");
    modal.setAttribute("aria-hidden", "true");

    sessionStorage.setItem(STORAGE_KEY, "true");
  }

  function openModal() {

    if (sessionStorage.getItem(STORAGE_KEY)) return;

    modal.classList.add("ta-active");
    modal.setAttribute("aria-hidden", "false");

    // Count actual popup impressions
    trackEvent("popup_shown");

    closeBtn.focus();
  }

  // Show after 6 seconds
  if (!sessionStorage.getItem(STORAGE_KEY)) {
    setTimeout(openModal, 6000);
  }

  // Close button
  closeBtn.addEventListener("click", function () {
    closeModal("close_clicked");
  });

  // Skip button
  skipBtn.addEventListener("click", function () {
    closeModal("skip_clicked");
  });

  // Click outside
  modal.addEventListener("click", function (event) {

    if (event.target === modal) {
      closeModal("close_clicked");
    }

  });

  // Escape key
  document.addEventListener("keydown", function (event) {

    if (
      event.key === "Escape" &&
      modal.classList.contains("ta-active")
    ) {
      closeModal("close_clicked");
    }

  });

  // Category selection
  const options = modal.querySelectorAll(".ta-option");

  options.forEach(function (link) {

    link.addEventListener("click", function () {

      let category = "Unknown";
      let eventName = "";

      if (link.querySelector(".ta-option-title")
        .textContent.includes("Student")) {

        category = "Student";
        eventName = "student_selected";

      } else if (
        link.querySelector(".ta-option-title")
          .textContent.includes("Job Seeker")
      ) {

        category = "Job Seeker";
        eventName = "job_seeker_selected";

      } else {

        category = "Professional / Employer";
        eventName = "professional_selected";

      }

      trackEvent(eventName, category);
      trackEvent("form_link_clicked", category);

      sessionStorage.setItem(STORAGE_KEY, "true");

    });

  });

})();

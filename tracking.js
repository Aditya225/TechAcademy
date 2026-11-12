
/*
 * TECHS ACADEMY - FRONTEND TRACKER
 */

(function () {

  const API_URL = "https://script.google.com/macros/s/AKfycbxJw7VY9l07FCIxmbEcdRpp0HNHMqLPoy29qCpj31_G5kvLBL4vRHtuXvdrMxJ7IMhchA/exec";

  const VISITOR_KEY = "ta_visitor_id";
  const SESSION_KEY = "ta_session_id";

  // Generate anonymous ID
  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return "ta-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 14);
  }

  // Get or create visitor ID
  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = generateId();
      localStorage.setItem(VISITOR_KEY, id);
      return { id, isNew: true };
    }

    return { id, isNew: false };
  }

  // Get or create session ID
  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }

    return id;
  }

  const visitor = getVisitorId();
  const visitorId = visitor.id;
  const sessionId = getSessionId();

  // Coarse device category
  function getDevice() {
    const ua = navigator.userAgent;

    if (/iPad|Tablet/i.test(ua)) return "Tablet";

    if (/Mobi|Android|iPhone/i.test(ua)) {
      return "Mobile";
    }

    return "Desktop";
  }

  // Send event to Google Apps Script
  function track(eventName, category = "Unknown") {

    const eventData = {
      visitorId: visitorId,
      sessionId: sessionId,
      event: eventName,
      category: category,

      // Store path only, not query parameters or fragments
      page: location.pathname,

      title: document.title.slice(0, 200),

      // Only referrer origin, not full URL
      referrer: getReferrerOrigin(),

      device: getDevice()
    };

    const body = JSON.stringify(eventData);

    // Apps Script cross-origin requests:
    // no-cors avoids a preflight request.
    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: body,
      keepalive: true
    }).catch(function (error) {
      console.error("Analytics error:", error);
    });
  }

  function getReferrerOrigin() {
    try {
      return document.referrer
        ? new URL(document.referrer).origin
        : "Direct";
    } catch (error) {
      return "Unknown";
    }
  }

  // Public tracking method
  window.TAAnalytics = {
    track: track,
    visitorId: visitorId
  };

  // Track new visitor
  if (visitor.isNew) {
    track("visitor_first_seen");
  }

  // Track each page load
  track("page_view");

})();

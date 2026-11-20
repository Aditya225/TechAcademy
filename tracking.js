/*
 * TECHS ACADEMY - FRONTEND TRACKER
 */

(function () {

  const API_URL = "https://script.google.com/macros/s/AKfycbxeLL0sdUbyRrOCi6k-wOTzCs4gK_sPR0XYCAO_wKIdt7ikFJToescCAo1oT2pWWVV3Hg/exec";

  const VISITOR_KEY = "ta_visitor_id";
  const SESSION_KEY = "ta_session_id";
  const LANDING_KEY = "ta_landing_page";
  const GEO_CACHE_KEY = "ta_geo_cache_v1";
  const GEO_TTL_MS = 24 * 60 * 60 * 1000;

  let cachedGeo = { country: "Unknown", state: "Unknown" };

  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return "ta-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 14);
  }

  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = generateId();
      localStorage.setItem(VISITOR_KEY, id);
      return { id, isNew: true };
    }

    return { id, isNew: false };
  }

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }

    return id;
  }

  function getLandingPage() {
    let landing = sessionStorage.getItem(LANDING_KEY);
    if (!landing) {
      landing = location.pathname;
      sessionStorage.setItem(LANDING_KEY, landing);
    }
    return landing;
  }

  const visitor = getVisitorId();
  const visitorId = visitor.id;
  const sessionId = getSessionId();
  const landingPage = getLandingPage();

  function getDevice() {
    const ua = navigator.userAgent;

    if (/iPad|Tablet/i.test(ua)) return "Tablet";

    if (/Mobi|Android|iPhone/i.test(ua)) {
      return "Mobile";
    }

    return "Desktop";
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

  function getAcquisitionInfo() {
    const params = new URLSearchParams(location.search);
    const utmSource = (params.get("utm_source") || "").trim();
    const utmMedium = (params.get("utm_medium") || "").trim();
    const utmCampaign = (params.get("utm_campaign") || "").trim();
    const referrerOrigin = getReferrerOrigin();

    let source = "Direct";
    if (utmSource) {
      source = utmSource;
    } else if (referrerOrigin && referrerOrigin !== "Direct" && referrerOrigin !== "Unknown") {
      try {
        source = new URL(referrerOrigin).hostname.replace(/^www\./, "");
      } catch (e) {
        source = referrerOrigin;
      }
    }

    let medium = "none";
    if (utmMedium) {
      medium = utmMedium;
    } else if (source === "Direct") {
      medium = "direct";
    } else {
      medium = "referral";
    }

    return {
      source: source.slice(0, 100),
      medium: medium.slice(0, 100),
      campaign: utmCampaign.slice(0, 120)
    };
  }

  function readCachedGeo() {
    try {
      const raw = localStorage.getItem(GEO_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp) return null;
      if (Date.now() - parsed.timestamp > GEO_TTL_MS) return null;
      return {
        country: parsed.country || "Unknown",
        state: parsed.state || "Unknown"
      };
    } catch (e) {
      return null;
    }
  }

  function writeCachedGeo(geo) {
    try {
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({
        country: geo.country || "Unknown",
        state: geo.state || "Unknown",
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore storage quota / privacy mode errors
    }
  }

  async function fetchGeoLocation() {
    const fromCache = readCachedGeo();
    if (fromCache) {
      cachedGeo = fromCache;
      return cachedGeo;
    }

    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, 1500);

    try {
      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        return cachedGeo;
      }

      const data = await response.json();
      const geo = {
        country: (data.country_name || data.country || "Unknown").toString().slice(0, 100),
        state: (data.region || data.region_code || "Unknown").toString().slice(0, 100)
      };

      cachedGeo = geo;
      writeCachedGeo(geo);
      return cachedGeo;
    } catch (error) {
      clearTimeout(timer);
      return cachedGeo;
    }
  }

  function sendPayload(payload) {
    const body = JSON.stringify(payload);

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

  function track(eventName, category = "Unknown") {
    const acquisition = getAcquisitionInfo();

    const eventData = {
      visitorId: visitorId,
      sessionId: sessionId,
      event: eventName,
      category: category,

      source: acquisition.source,
      medium: acquisition.medium,
      campaign: acquisition.campaign,

      country: cachedGeo.country,
      state: cachedGeo.state,

      landingPage: landingPage,
      page: location.pathname,
      title: document.title.slice(0, 200),
      referrer: getReferrerOrigin(),
      device: getDevice()
    };

    if (cachedGeo.country === "Unknown" && cachedGeo.state === "Unknown") {
      Promise.race([
        fetchGeoLocation(),
        new Promise(function (resolve) {
          setTimeout(function () {
            resolve(cachedGeo);
          }, 600);
        })
      ]).then(function (geo) {
        eventData.country = (geo && geo.country) || "Unknown";
        eventData.state = (geo && geo.state) || "Unknown";
        sendPayload(eventData);
      });
      return;
    }

    sendPayload(eventData);
  }

  window.TAAnalytics = {
    track: track,
    visitorId: visitorId
  };

  fetchGeoLocation();

  if (visitor.isNew) {
    track("visitor_first_seen");
  }

  track("page_view");

})();

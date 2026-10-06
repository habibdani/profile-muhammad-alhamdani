const storageKey = "portfolio-analytics-optout";
export function analyticsOptedOut() {
  try {
    return localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}
export function setAnalyticsOptOut(value) {
  try {
    localStorage.setItem(storageKey, value ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event("portfolio-privacy-change"));
}
function trackingAllowed() {
  return (
    (import.meta.env.PROD ||
      import.meta.env.VITE_ENABLE_LOCAL_ANALYTICS === "true") &&
    !analyticsOptedOut() &&
    navigator.doNotTrack !== "1" &&
    navigator.globalPrivacyControl !== true &&
    !navigator.webdriver
  );
}
function send(type) {
  if (!trackingAllowed() || !crypto.randomUUID) return;
  // Referrer host only: never send source URL paths, query parameters, or current URL query.
  let referrer = "";
  try {
    if (document.referrer) referrer = new URL(document.referrer).origin;
  } catch {}
  const body = JSON.stringify({ id: crypto.randomUUID(), type, referrer });
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {});
}
export function initAnalytics() {
  let started = false;
  function page() {
    if (!started && document.visibilityState === "visible") {
      started = true;
      send("page_view");
    }
  }
  page();
  document.addEventListener("visibilitychange", page);
  const click = (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (link.hasAttribute("download") && href.endsWith(".pdf"))
      send("download_cv");
    else if (href.startsWith("https://wa.me/")) send("whatsapp");
    else if (href.startsWith("mailto:")) send("email");
    else if (href.startsWith("https://www.linkedin.com/")) send("linkedin");
    else if (href.startsWith("https://github.com/")) send("github");
  };
  document.addEventListener("click", click);
  return () => {
    document.removeEventListener("click", click);
    document.removeEventListener("visibilitychange", page);
  };
}

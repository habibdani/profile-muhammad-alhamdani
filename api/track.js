import {
  allowedOrigin,
  enabled,
  EVENTS,
  header,
  json,
  record,
  visitorEvent,
} from "../server/analytics.js";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }
  if (!enabled()) return json(res, 200, { status: "disabled" });
  if (!allowedOrigin(req))
    return json(res, 403, { error: "Origin not allowed" });
  if (!header(req, "content-type").toLowerCase().startsWith("application/json"))
    return json(res, 415, { error: "JSON required" });
  if (Number(header(req, "content-length") || 0) > 2048)
    return json(res, 413, { error: "Payload too large" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      JSON.stringify(body).length > 2048 ||
      !EVENTS.has(body.type) ||
      !/^[-a-f0-9]{36}$/i.test(body.id) ||
      typeof body.referrer !== "string" ||
      body.referrer.length > 300
    )
      return json(res, 400, { error: "Invalid event" });
    const event = visitorEvent(req, body);
    if (!event) return json(res, 200, { status: "ignored" });
    const status = await record(event);
    return json(res, status === "rate_limited" ? 429 : 200, { status });
  } catch (error) {
    if (error instanceof SyntaxError)
      return json(res, 400, { error: "Invalid JSON" });
    console.error("Analytics capture failed:", error.name);
    return json(res, 503, { error: "Analytics temporarily unavailable" });
  }
}

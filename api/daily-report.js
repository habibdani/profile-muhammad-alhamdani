import { randomUUID } from "node:crypto";
import {
  cronAuthorized,
  enabled,
  json,
  redis,
  reportEmail,
  required,
  summarize,
  validReportDay,
  yesterdayWib,
} from "../server/analytics.js";
const unlockScript =
  "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end";
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }
  if (!cronAuthorized(req)) return json(res, 401, { error: "Unauthorized" });
  if (!enabled())
    return json(res, 503, { error: "Analytics disabled for this deployment" });
  const query = new URL(req.url, "https://portfolio.invalid").searchParams;
  const day = query.get("date") || yesterdayWib();
  if (!validReportDay(day))
    return json(res, 400, {
      error: "Choose a completed WIB day within the last 29 days",
    });
  const base = `portfolio:${day}`;
  const token = randomUUID();
  let locked = false;
  try {
    if (query.get("preview") === "1") {
      const events = (
        (await redis(["LRANGE", `${base}:events`, 0, -1])) || []
      ).map((x) => JSON.parse(x));
      return json(res, 200, { day, ...summarize(events), emailSent: false });
    }
    required("RESEND_API_KEY");
    if (await redis(["GET", `${base}:sent`]))
      return json(res, 200, { status: "already_sent", day });
    locked =
      (await redis(["SET", `${base}:report-lock`, token, "NX", "EX", 120])) ===
      "OK";
    if (!locked) return json(res, 409, { error: "Report already running" });
    if (await redis(["GET", `${base}:sent`]))
      return json(res, 200, { status: "already_sent", day });
    let saved = await redis(["GET", `${base}:report-payload`]);
    if (!saved) {
      const events = (
        (await redis(["LRANGE", `${base}:events`, 0, -1])) || []
      ).map((x) => JSON.parse(x));
      saved = JSON.stringify({
        createdAt: Date.now(),
        payload: reportEmail(day, events),
      });
      await redis(["SET", `${base}:report-payload`, saved, "EX", 30 * 86400]);
    }
    const snapshot = JSON.parse(saved);
    // Resend remembers idempotency keys for 24h. Do not blindly resend an old ambiguous attempt.
    if (Date.now() - snapshot.createdAt > 23 * 3600000)
      return json(res, 409, {
        error:
          "Old unsent report requires checking Resend logs before retrying",
        day,
      });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${required("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-daily-${day}`,
      },
      body: JSON.stringify(snapshot.payload),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!response.ok || !result.id)
      throw new Error(`Email provider rejected request (${response.status})`);
    await redis([
      "SET",
      `${base}:sent`,
      JSON.stringify({
        emailId: result.id,
        acceptedAt: new Date().toISOString(),
      }),
      "EX",
      90 * 86400,
    ]);
    return json(res, 200, {
      status: "accepted_by_email_provider",
      day,
      emailId: result.id,
    });
  } catch (error) {
    console.error("Daily report failed:", error.name);
    return json(res, 503, {
      error:
        "Report failed; check configuration/provider logs and retry within 23 hours",
      day,
    });
  } finally {
    if (locked) {
      try {
        await redis(["EVAL", unlockScript, 1, `${base}:report-lock`, token]);
      } catch {
        /* Lock expires after 120 seconds. */
      }
    }
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import {
  dayWib,
  yesterdayWib,
  validReportDay,
  safeReferrer,
  visitorEvent,
  summarize,
  reportEmail,
  classifyAgent,
} from "../server/analytics.js";
import track from "../api/track.js";
import daily from "../api/daily-report.js";
const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36";
Object.assign(process.env, {
  VERCEL: "1",
  VERCEL_ENV: "production",
  SITE_URL: "https://portfolio.example",
  ANALYTICS_HASH_SECRET: "h".repeat(64),
  CRON_SECRET: "c".repeat(64),
  UPSTASH_REDIS_REST_URL: "https://redis.example",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  RESEND_API_KEY: "test-key",
});
function req(overrides = {}) {
  return {
    method: "POST",
    url: "/api/track",
    headers: {
      origin: "https://portfolio.example",
      "content-type": "application/json",
      "user-agent": ua,
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-vercel-ip-country": "ID",
      "x-vercel-ip-city": "South%20Jakarta",
    },
    body: {
      id: "123e4567-e89b-42d3-a456-426614174000",
      type: "page_view",
      referrer: "https://www.linkedin.com/feed?private=secret",
    },
    ...overrides,
  };
}
function res() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.statusCode = n;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
test("WIB midnight and year boundary use local calendar, not UTC date", () => {
  assert.equal(dayWib(new Date("2026-12-31T17:00:00Z")), "2027-01-01");
  assert.equal(yesterdayWib(new Date("2026-01-01T01:00:00Z")), "2025-12-31");
  assert.equal(dayWib(new Date("2026-10-06T16:59:59Z")), "2026-10-06");
});
test("Only completed valid report days in retention window are accepted", () => {
  const now = new Date("2026-10-06T05:00:00Z");
  assert.ok(validReportDay("2026-10-05", now));
  assert.ok(!validReportDay("2026-10-06", now));
  assert.ok(!validReportDay("2026-09-31", now));
  assert.ok(!validReportDay("2026-01-01", now));
});
test("Referrer paths, queries, usernames and emails never enter captured data", () => {
  assert.equal(
    safeReferrer(
      "https://user:password@linkedin.com/person?email=secret@example.com",
    ),
    "linkedin.com",
  );
  assert.equal(safeReferrer("javascript:alert(1)"), "Direct / unknown");
  const e = visitorEvent(req(), req().body, new Date("2026-10-06T01:00:00Z"));
  assert.equal(e.city, "South Jakarta");
  assert.equal(e.referrer, "www.linkedin.com");
  assert.ok(!JSON.stringify(e).includes("203.0.113.7"));
  assert.ok(!JSON.stringify(e).includes(ua));
  assert.ok(!JSON.stringify(e).includes("secret"));
});
test("Same-day visitor hash is stable but rotates next day", () => {
  const a = visitorEvent(req(), req().body, new Date("2026-10-06T01:00:00Z"));
  const b = visitorEvent(req(), req().body, new Date("2026-10-06T04:00:00Z"));
  const c = visitorEvent(req(), req().body, new Date("2026-10-06T18:00:00Z"));
  assert.equal(a.visitor, b.visitor);
  assert.notEqual(a.visitor, c.visitor);
});
test("Common bots are ignored and browser detection has correct precedence", () => {
  const r = req();
  r.headers["user-agent"] = "Googlebot";
  assert.equal(visitorEvent(r, r.body), null);
  assert.equal(classifyAgent(ua + " Edg/130").browser, "Edge");
});
test("Clicks do not inflate page view or visitor count", () => {
  const e = visitorEvent(req(), req().body);
  const s = summarize([e, { ...e, type: "download_cv" }, e]);
  assert.equal(s.pageViews, 2);
  assert.equal(s.estimatedVisitors, 1);
  assert.equal(s.actions[0].total, 1);
});
test("Report is addressed only to Habib, escapes HTML and mitigates CSV formulas", () => {
  const e = {
    ...visitorEvent(req(), req().body),
    referrer: "<script>alert(1)</script>",
    city: '=HYPERLINK("bad")',
  };
  const report = reportEmail("2026-10-05", [e]);
  assert.deepEqual(report.to, ["habibdani86@gmail.com"]);
  assert.ok(!report.html.includes("<script>"));
  const csv = Buffer.from(report.attachments[0].content, "base64").toString();
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(reportEmail("2026-10-05", []).text.includes("Kunjungan: 0"));
});
test("Capture blocks foreign origins and unrecognized event types before storage", async () => {
  const a = req();
  a.headers.origin = "https://attacker.example";
  const ra = res();
  await track(a, ra);
  assert.equal(ra.statusCode, 403);
  const b = req();
  b.body.type = "send_email";
  const rb = res();
  await track(b, rb);
  assert.equal(rb.statusCode, 400);
});
test("Capture rejects huge bodies and wrong methods", async () => {
  const a = req();
  a.headers["content-length"] = "9000";
  const ra = res();
  await track(a, ra);
  assert.equal(ra.statusCode, 413);
  const rb = res();
  await track(req({ method: "GET" }), rb);
  assert.equal(rb.statusCode, 405);
});
test("Report requires a configured strong secret and rejects requests without it", async () => {
  const a = res();
  await daily(req({ method: "GET", url: "/api/daily-report" }), a);
  assert.equal(a.statusCode, 401);
  const old = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "";
  try {
    const b = res();
    await daily(
      req({ method: "GET", headers: { authorization: "Bearer undefined" } }),
      b,
    );
    assert.equal(b.statusCode, 401);
  } finally {
    process.env.CRON_SECRET = old;
  }
});
test("Report preview sends no email; repeated scheduled request sends only once", async (t) => {
  const memory = new Map();
  let sends = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("api.resend.com")) {
      sends++;
      assert.ok(options.headers["Idempotency-Key"]);
      return Response.json({ id: "email_test" });
    }
    const [op, key, ...args] = JSON.parse(options.body);
    let result = null;
    if (op === "GET") result = memory.get(key) || null;
    else if (op === "SET") {
      if (args.includes("NX") && memory.has(key)) result = null;
      else {
        memory.set(key, args[0]);
        result = "OK";
      }
    } else if (op === "LRANGE") result = [];
    else if (op === "EVAL") result = 1;
    else assert.fail("Unexpected storage command " + op);
    return Response.json({ result });
  });
  const base = {
    method: "GET",
    url: "/api/daily-report",
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  };
  const p = res();
  await daily({ ...base, url: "/api/daily-report?preview=1" }, p);
  assert.equal(p.statusCode, 200);
  assert.equal(sends, 0);
  const a = res();
  await daily(base, a);
  assert.equal(a.data.status, "accepted_by_email_provider");
  assert.equal(sends, 1);
  const b = res();
  await daily(base, b);
  assert.equal(b.data.status, "already_sent");
  assert.equal(sends, 1);
});
test("Ambiguous provider failure retains identical payload for an idempotent retry", async (t) => {
  const memory = new Map();
  const bodies = [];
  let failure = true;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("api.resend.com")) {
      bodies.push(options.body);
      if (failure) {
        failure = false;
        throw new Error("Network timeout");
      }
      return Response.json({ id: "email_retry" });
    }
    const [op, key, ...args] = JSON.parse(options.body);
    let result = null;
    if (op === "GET") result = memory.get(key) || null;
    else if (op === "SET") {
      memory.set(key, args[0]);
      result = "OK";
    } else if (op === "LRANGE") result = [];
    else if (op === "EVAL") result = 1;
    return Response.json({ result });
  });
  const base = {
    method: "GET",
    url: "/api/daily-report",
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  };
  const a = res();
  await daily(base, a);
  assert.equal(a.statusCode, 503);
  const b = res();
  await daily(base, b);
  assert.equal(b.statusCode, 200);
  assert.equal(bodies.length, 2);
  assert.equal(bodies[0], bodies[1]);
});

import { createHmac, timingSafeEqual } from "node:crypto";
export const RECIPIENT = "habibdani86@gmail.com";
export const RETENTION = 30 * 86400;
export const MAX_DAILY_EVENTS = 5000;
export const EVENTS = new Set([
  "page_view",
  "download_cv",
  "whatsapp",
  "email",
  "linkedin",
  "github",
]);
export function dayWib(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600000).toISOString().slice(0, 10);
}
export function yesterdayWib(now = new Date()) {
  return dayWib(new Date(now.getTime() - 86400000));
}
export function validReportDay(day, now = new Date()) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    !Number.isNaN(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day &&
    day < dayWib(now) &&
    day >= dayWib(new Date(now.getTime() - 29 * 86400000))
  );
}
export function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
export function header(req, name) {
  const v = req.headers[name.toLowerCase()];
  return (Array.isArray(v) ? v[0] : v) || "";
}
export function enabled() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.ENABLE_LOCAL_ANALYTICS === "true"
  );
}
export function cronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const actual = Buffer.from(header(req, "authorization"));
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function allowedOrigin(req) {
  try {
    return (
      new URL(header(req, "origin")).origin ===
      new URL(required("SITE_URL")).origin
    );
  } catch {
    return false;
  }
}
export function safeReferrer(value) {
  if (!value) return "Direct / unknown";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol)
      ? url.hostname.slice(0, 150)
      : "Direct / unknown";
  } catch {
    return "Direct / unknown";
  }
}
export function classifyAgent(ua) {
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\//i.test(ua)
      ? "Opera"
      : /Firefox|FxiOS/i.test(ua)
        ? "Firefox"
        : /Chrome|CriOS/i.test(ua)
          ? "Chrome"
          : /Safari/i.test(ua)
            ? "Safari"
            : "Other";
  const device = /iPad|Tablet/i.test(ua)
    ? "Tablet"
    : /Mobile|Android|iPhone/i.test(ua)
      ? "Mobile"
      : "Desktop / other";
  return { browser, device };
}
function geo(value) {
  try {
    return decodeURIComponent(value)
      .replace(/[\x00-\x1f\x7f]/g, "")
      .slice(0, 80);
  } catch {
    return "Unknown";
  }
}
export function visitorEvent(req, body, now = new Date()) {
  const ua = header(req, "user-agent").slice(0, 512);
  if (
    !ua ||
    /bot|crawler|spider|headless|facebookexternalhit|preview|slackbot|whatsapp|lighthouse|curl|wget/i.test(
      ua,
    )
  )
    return null;
  // Vercel supplies these headers. Trust geo/IP only on Vercel, never the JSON payload.
  const vercel = process.env.VERCEL === "1";
  const ip = vercel
    ? header(req, "x-vercel-forwarded-for").split(",")[0].trim()
    : req.socket?.remoteAddress;
  if (!ip) return null;
  const secret = required("ANALYTICS_HASH_SECRET");
  if (secret.length < 32) throw new Error("ANALYTICS_HASH_SECRET too short");
  const day = dayWib(now);
  const visitor = createHmac("sha256", secret)
    .update(`${day}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 24);
  return {
    id: body.id,
    type: body.type,
    at: now.toISOString(),
    day,
    visitor,
    path: "/",
    referrer: safeReferrer(body.referrer),
    ...classifyAgent(ua),
    country: vercel
      ? geo(header(req, "x-vercel-ip-country") || "Unknown")
      : "Local",
    city: vercel ? geo(header(req, "x-vercel-ip-city") || "Unknown") : "Local",
  };
}
export async function redis(command) {
  const url = new URL(required("UPSTASH_REDIS_REST_URL"));
  if (url.protocol !== "https:") throw new Error("Redis URL must use HTTPS");
  const response = await fetch(url.origin, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${required("UPSTASH_REDIS_REST_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Redis HTTP ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error("Redis command failed");
  return data.result;
}
export const RECORD_SCRIPT = `
local rate = redis.call('INCR', KEYS[1])
if rate == 1 then redis.call('EXPIRE', KEYS[1], 60) end
if rate > 30 then return 'rate_limited' end
if redis.call('LLEN', KEYS[2]) >= tonumber(ARGV[3]) then return 'daily_limit' end
if redis.call('SET', KEYS[3], '1', 'NX', 'EX', ARGV[2]) == false then return 'duplicate' end
redis.call('RPUSH', KEYS[2], ARGV[1])
redis.call('EXPIRE', KEYS[2], ARGV[2])
return 'recorded'
`;
export function record(event) {
  const base = `portfolio:${event.day}`;
  return redis([
    "EVAL",
    RECORD_SCRIPT,
    3,
    `${base}:rate:${event.visitor}`,
    `${base}:events`,
    `${base}:dedupe:${event.id}`,
    JSON.stringify(event),
    RETENTION,
    MAX_DAILY_EVENTS,
  ]);
}
export function json(res, status, data) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(data);
}
export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function count(items, key) {
  const result = {};
  for (const e of items) result[e[key]] = (result[e[key]] || 0) + 1;
  return Object.entries(result)
    .sort((a, b) => b[1] - a[1])
    .map(([label, total]) => ({ label, total }));
}
export function summarize(events) {
  const views = events.filter((e) => e.type === "page_view");
  return {
    pageViews: views.length,
    estimatedVisitors: new Set(views.map((e) => e.visitor)).size,
    events: events.length,
    countries: count(views, "country"),
    devices: count(views, "device"),
    browsers: count(views, "browser"),
    sources: count(views, "referrer"),
    actions: count(
      events.filter((e) => e.type !== "page_view"),
      "type",
    ),
  };
}
export function reportEmail(day, events) {
  const s = summarize(events);
  const esc = escapeHtml;
  const lines = (list) =>
    list.length
      ? list
          .slice(0, 10)
          .map((x) => `${x.label}: ${x.total}`)
          .join("\n")
      : "Tidak ada";
  const text = `Laporan portofolio ${day} (WIB)\n\nKunjungan: ${s.pageViews}\nPerkiraan pengunjung unik: ${s.estimatedVisitors}\nTotal event: ${s.events}\n\nNegara\n${lines(s.countries)}\n\nPerangkat\n${lines(s.devices)}\n\nBrowser\n${lines(s.browsers)}\n\nSumber\n${lines(s.sources)}\n\nKlik\n${lines(s.actions)}\n\nRincian event ada di lampiran CSV. ID berubah setiap hari dan bukan identitas orang. IP mentah tidak disimpan oleh aplikasi. Lokasi berupa perkiraan; VPN, bot, pemblokir tracking, dan jaringan bersama dapat memengaruhi data. Batas penyimpanan 5.000 event per hari, retensi 30 hari.`;
  const csvCell = (value) => {
    let s = String(value ?? "").replace(/[\r\n]/g, " ");
    if (/^[=+@\-\t]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const time = (value) =>
    new Date(value).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
  const rows = [
    [
      "Waktu WIB",
      "ID anonim harian",
      "Aktivitas",
      "Halaman",
      "Negara",
      "Kota perkiraan",
      "Perangkat",
      "Browser",
      "Sumber",
    ],
    ...events.map((e) => [
      time(e.at),
      e.visitor,
      e.type,
      e.path,
      e.country,
      e.city,
      e.device,
      e.browser,
      e.referrer,
    ]),
  ];
  return {
    from: process.env.REPORT_FROM || "Portfolio <onboarding@resend.dev>",
    to: [RECIPIENT],
    subject: `Portofolio ${day}: ${s.pageViews} kunjungan · ${s.estimatedVisitors} pengunjung (perkiraan)`,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#102043"><h1 style="color:#025af8;font-size:25px">Laporan portofolio harian</h1><p>${esc(day)} · WIB</p><div style="background:#edf4ff;border-radius:12px;padding:20px;font-size:20px"><strong>${s.pageViews}</strong> kunjungan · <strong>${s.estimatedVisitors}</strong> pengunjung (perkiraan)</div><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.7;font-size:14px">${esc(text)}</pre></div>`,
    attachments: [
      {
        filename: `portfolio-${day}.csv`,
        content: Buffer.from(
          "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
        ).toString("base64"),
      },
    ],
  };
}

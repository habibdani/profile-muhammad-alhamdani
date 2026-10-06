// npm run check:report => preview, does not send email.
// npm run check:report -- --send => sends yesterday's report once.
const site = process.env.SITE_URL,
  secret = process.env.CRON_SECRET;
if (!site || !secret)
  throw new Error("Set SITE_URL and CRON_SECRET in .env.local first");
const send = process.argv.includes("--send");
const url = new URL("/api/daily-report", site);
if (!send) url.searchParams.set("preview", "1");
const date = process.argv.find((v) => /^\d{4}-\d{2}-\d{2}$/.test(v));
if (date) url.searchParams.set("date", date);
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(35000),
});
console.log("HTTP", response.status);
console.log(await response.text());
if (!response.ok) process.exitCode = 1;

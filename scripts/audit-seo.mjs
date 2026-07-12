#!/usr/bin/env node
/**
 * RankMySEO static HTML audit over Astro dist/ output.
 * Fail on structural SEO regressions; report live-only/CWV checks as warnings.
 *
 * Usage: node scripts/audit-seo.mjs [--dir dist]
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractPageSignals,
  runAuditChecks,
  buildAuditRecommendations,
} from "@rankmyseo/core";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const dirIdx = args.indexOf("--dir");
const DIST = join(ROOT, dirIdx >= 0 ? args[dirIdx + 1] : "dist");

/** Soft warnings for advisory checks that are noisy on short marketing/utility pages */
const WARN_PATTERNS = [
  "thin content",
  "no h2",
  "lcp",
  "cls",
  "inp",
  "fid",
  "ttfb",
  "fcp",
  "core_web_vitals",
  "cwv",
  "performance",
];

/** Checks that require live browser metrics — warn only for static builds */
const WARN_ONLY = new Set([
  "lcp",
  "cls",
  "inp",
  "fid",
  "ttfb",
  "fcp",
  "core_web_vitals",
  "cwv",
  "performance",
]);

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walkHtml(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkHtml(p)));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

/**
 * @param {string} filePath
 * @param {string} html
 */
function absoluteUrlFromPath(filePath) {
  const rel = relative(DIST, filePath).replace(/\\/g, "/");
  if (rel === "index.html") return "https://nca-cli.com/";
  if (rel === "404.html") return "https://nca-cli.com/404";
  return `https://nca-cli.com/${rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "")}`;
}

/**
 * @param {unknown} check
 */
function checkId(check) {
  if (!check || typeof check !== "object") return "";
  const c = /** @type {Record<string, unknown>} */ (check);
  return String(c.id ?? c.key ?? c.name ?? c.check ?? "").toLowerCase();
}

/**
 * @param {unknown} check
 */
function checkPassed(check) {
  if (!check || typeof check !== "object") return true;
  const c = /** @type {Record<string, unknown>} */ (check);
  if (typeof c.passed === "boolean") return c.passed;
  if (typeof c.ok === "boolean") return c.ok;
  if (typeof c.pass === "boolean") return c.pass;
  if (typeof c.status === "string") {
    const s = c.status.toLowerCase();
    return s === "pass" || s === "ok" || s === "success" || s === "info";
  }
  if (typeof c.severity === "string") {
    const s = c.severity.toLowerCase();
    return s === "pass" || s === "ok" || s === "info" || s === "success";
  }
  return true;
}

/**
 * @param {unknown} check
 */
function checkMessage(check) {
  if (!check || typeof check !== "object") return "";
  const c = /** @type {Record<string, unknown>} */ (check);
  return String(c.message ?? c.detail ?? c.description ?? c.recommendation ?? checkId(check));
}

async function main() {
  let files;
  try {
    files = await walkHtml(DIST);
  } catch (e) {
    console.error(`Cannot read ${DIST}. Run \`npm run build\` first.`);
    console.error(e);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No HTML files in ${DIST}`);
    process.exit(1);
  }

  let hardFails = 0;
  let warns = 0;

  console.log(`RankMySEO audit — ${files.length} HTML files in ${relative(ROOT, DIST) || DIST}\n`);

  for (const file of files.sort()) {
    const html = await readFile(file, "utf8");
    const url = absoluteUrlFromPath(file);
    const rel = relative(ROOT, file);

    // Skip soft-404 page from hard fail thresholds that don't apply the same way
    const is404 = rel.endsWith("404.html");

    const signals = extractPageSignals(html, url);
    const result = runAuditChecks(signals);
    const checks = Array.isArray(result?.checks)
      ? result.checks
      : Array.isArray(result)
        ? result
        : [];
    const score = typeof result?.score === "number" ? result.score : null;
    const recommendations = buildAuditRecommendations(checks);

    const pageFails = [];
    const pageWarns = [];

    for (const check of checks) {
      if (checkPassed(check)) continue;
      const id = checkId(check);
      const msg = checkMessage(check);
      const hay = `${id} ${msg}`.toLowerCase();
      if (
        [...WARN_ONLY].some((w) => id.includes(w)) ||
        WARN_PATTERNS.some((w) => hay.includes(w))
      ) {
        pageWarns.push({ id: id || "advisory", msg });
        continue;
      }
      // 404 pages often intentionally differ
      if (is404 && (id.includes("canonical") || id.includes("index"))) {
        pageWarns.push({ id, msg });
        continue;
      }
      pageFails.push({ id: id || "check", msg });
    }

    // Extra structural guards RankMySEO may not always flag as hard fails
    const extras = [];
    if (!is404) {
      if (!/<title>[^<]+<\/title>/i.test(html)) extras.push("missing <title>");
      if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html) &&
          !/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html)) {
        extras.push("missing meta description");
      }
      if (!/<h1[\s>]/i.test(html)) extras.push("missing H1");
      if (!/rel=["']canonical["']/i.test(html)) extras.push("missing canonical");
      if (!/<html[^>]+lang=/i.test(html)) extras.push("missing html lang");
      if (!/property=["']og:title["']/i.test(html)) extras.push("missing og:title");
      if (!/application\/ld\+json/i.test(html)) extras.push("missing JSON-LD");
      if ((html.match(/<h1[\s>]/gi) || []).length > 1) extras.push("multiple H1");
    }
    for (const e of extras) pageFails.push({ id: "structural", msg: e });

    const label = score != null ? `score ${score}` : "audited";
    if (pageFails.length === 0 && pageWarns.length === 0) {
      console.log(`✓ ${rel} (${label})`);
    } else {
      console.log(`${pageFails.length ? "✗" : "~"} ${rel} (${label})`);
      for (const f of pageFails) {
        console.log(`  FAIL [${f.id}] ${f.msg}`);
        hardFails += 1;
      }
      for (const w of pageWarns) {
        console.log(`  WARN [${w.id}] ${w.msg}`);
        warns += 1;
      }
      if (Array.isArray(recommendations) && recommendations.length && pageFails.length) {
        for (const r of recommendations.slice(0, 3)) {
          const text = typeof r === "string" ? r : r?.message ?? r?.title ?? JSON.stringify(r);
          console.log(`  tip: ${text}`);
        }
      }
    }
  }

  console.log(`\nSummary: ${hardFails} failure(s), ${warns} warning(s)`);
  if (hardFails > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

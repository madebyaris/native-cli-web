#!/usr/bin/env node
/**
 * Fetches markdown, install script, and version from madebyaris/native-cli-ai.
 * Run: npm run sync-docs
 *
 * Env:
 *   NCA_DOCS_REF  — docs base URL (default: main branch documentation/)
 *   NCA_REF       — git ref for install.sh / Cargo.toml (default: main)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src", "content", "docs");
const INSTALL_OUT = join(ROOT, "public", "install");
const CONSTS_PATH = join(ROOT, "src", "consts.ts");
const PACKAGE_PATH = join(ROOT, "package.json");

const REF = process.env.NCA_REF?.trim() || "main";
const RAW = `https://raw.githubusercontent.com/madebyaris/native-cli-ai/${REF}`;
const BASE =
  process.env.NCA_DOCS_REF?.trim() || `${RAW}/docs/documentation`;

/** @type {{ file: string; out?: string; title: string; description: string; order: number }[]} */
const DOCS = [
  {
    file: "index.md",
    out: "overview.md",
    title: "Overview",
    description:
      "Overview of nca, the Rust-native terminal AI coding agent: quick start, feature map, and documentation index.",
    order: 0,
  },
  {
    file: "getting-started.md",
    title: "Getting Started",
    description:
      "Install nca on macOS, Linux, or Windows, run first-time setup, and configure providers for the terminal AI coding agent.",
    order: 1,
  },
  {
    file: "commands.md",
    title: "Commands",
    description:
      "Complete nca CLI command and flag reference for run, spawn, sessions, attach, logs, skills, models, and doctor.",
    order: 2,
  },
  {
    file: "interactive-mode.md",
    title: "Interactive Mode",
    description:
      "nca TUI and REPL guide: live busy activity, slash commands, keyboard shortcuts, command palette, and image paste.",
    order: 3,
  },
  {
    file: "configuration.md",
    title: "Configuration",
    description:
      "nca configuration files, unified product home paths, TOML format, smart compaction, and environment variables.",
    order: 4,
  },
  {
    file: "providers.md",
    title: "Providers",
    description:
      "Configure MiniMax, Anthropic, OpenAI, OpenRouter, and custom OpenAI/Anthropic-compatible endpoints in nca.",
    order: 5,
  },
  {
    file: "tools.md",
    title: "Tools",
    description:
      "nca agent tools reference: file operations, structured search, shell, web, ask_question, spawn_subagent, and MCP.",
    order: 6,
  },
  {
    file: "sessions.md",
    title: "Sessions",
    description:
      "nca session lifecycle under the unified product home: spawn, resume, attach, logs, status, and persistence.",
    order: 7,
  },
  {
    file: "permissions.md",
    title: "Permissions",
    description:
      "nca approval system, permission modes, safe mode, and how tool approvals work in the interactive TUI.",
    order: 8,
  },
  {
    file: "skills.md",
    title: "Skills",
    description:
      "Discover, install, and author nca skills from AGENTS.md, workspace directories, user skill dirs, and built-ins.",
    order: 9,
  },
  {
    file: "advanced.md",
    title: "Advanced",
    description:
      "Advanced nca topics: sub-agents, git worktrees, MCP servers, hooks, JSON/NDJSON orchestration, and Unix IPC.",
    order: 10,
  },
];

function escapeYaml(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** @param {string} md */
function rewriteLinks(md) {
  return md.replace(/\]\(\.\/([^)]+\.md)(#[^)]*)?\)/g, (_, path, hash) => {
    const slug = path.replace(/\.md$/, "");
    const mapped = slug === "index" ? "overview" : slug;
    const frag = hash ?? "";
    return `](/docs/${mapped}${frag})`;
  });
}

/** @param {string} text */
function extractVersion(text) {
  const m = text.match(/VERSION="([0-9]+\.[0-9]+\.[0-9]+)"/);
  if (!m) throw new Error("Could not parse VERSION from install.sh");
  return m[1];
}

/**
 * @param {string} path
 * @param {string} version
 */
async function bumpConstsVersion(path, version) {
  const src = await readFile(path, "utf8");
  const next = src.replace(
    /export const NCA_VERSION = "[^"]+";/,
    `export const NCA_VERSION = "${version}";`,
  );
  if (next === src) {
    console.warn("consts.ts: NCA_VERSION pattern not found or already matching");
  }
  await writeFile(path, next, "utf8");
  console.log("Updated", "src/consts.ts", "→", version);
}

/**
 * @param {string} path
 * @param {string} version
 */
async function bumpPackageVersion(path, version) {
  const pkg = JSON.parse(await readFile(path, "utf8"));
  pkg.version = version;
  await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log("Updated", "package.json", "→", version);
}

async function syncInstall() {
  const url = `${RAW}/install.sh`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: HTTP ${res.status}`);
  let body = await res.text();
  // Keep the EXIT-trap-safe tmpdir pattern used by the site install endpoint
  if (!body.includes("tmpdir=\"$(mktemp -d)\"")) {
    throw new Error("Unexpected install.sh shape");
  }
  // Prefer the site's set -u-safe trap if upstream uses local tmpdir
  if (body.includes("local platform target_url tmpdir archive")) {
    body = body
      .replace(
        "local platform target_url tmpdir archive\n\n    info \"Installing",
        "local platform target_url archive\n    # Global tmpdir: EXIT trap runs after main returns (local would be unset with set -u).\n    tmpdir=\"$(mktemp -d)\"\n    trap 'rm -rf \"${tmpdir:-}\"' EXIT\n\n    info \"Installing",
      )
      .replace(/\n\s*tmpdir="\$\(mktemp -d\)"\n\s*trap 'rm -rf "\$tmpdir"' EXIT\n/, "\n");
  }
  await writeFile(INSTALL_OUT, body, "utf8");
  console.log("Wrote", "public/install");
  return extractVersion(body);
}

async function syncDocs() {
  await mkdir(OUT, { recursive: true });
  for (const d of DOCS) {
    const url = `${BASE}/${d.file}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed ${url}: HTTP ${res.status}`);
    }
    let body = await res.text();
    body = rewriteLinks(body);
    const outFile = d.out ?? d.file;
    const fm = `---
title: "${escapeYaml(d.title)}"
description: "${escapeYaml(d.description)}"
sidebarOrder: ${d.order}
---

`;
    await writeFile(join(OUT, outFile), fm + body, "utf8");
    console.log("Wrote", outFile);
  }
}

async function main() {
  const version = await syncInstall();
  await bumpConstsVersion(CONSTS_PATH, version);
  await bumpPackageVersion(PACKAGE_PATH, version);
  await syncDocs();
  console.log(`\nSynced upstream @ ${REF} → v${version}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

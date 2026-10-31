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
      "Overview of nca, a Rust terminal AI coding agent in one binary: what it does, how to install it, and where each guide in the documentation lives.",
    order: 0,
  },
  {
    file: "getting-started.md",
    title: "Getting Started",
    description:
      "Install nca on macOS, Linux, or Windows with one command or a GitHub release archive, then run first-time setup and add your provider API key.",
    order: 1,
  },
  {
    file: "commands.md",
    title: "Commands",
    description:
      "Complete nca command and flag reference for acp, run, spawn, sessions, attach, logs, skills, models, and doctor, after the binary is installed.",
    order: 2,
  },
  {
    file: "interactive-mode.md",
    title: "Interactive Mode",
    description:
      "The nca full-screen TUI and line REPL: slash commands, keyboard shortcuts, the command palette, live busy timers, and pasting an image into a prompt.",
    order: 3,
  },
  {
    file: "configuration.md",
    title: "Configuration",
    description:
      "Where nca reads its settings: TOML config files, product-home paths, smart compaction, and the environment variables that change how each session runs.",
    order: 4,
  },
  {
    file: "providers.md",
    title: "Providers",
    description:
      "Set up nca with a MiniMax, Anthropic, OpenAI, or OpenRouter API key, or a custom OpenAI-compatible endpoint. Covers keys, model names, and base URLs.",
    order: 5,
  },
  {
    file: "tools.md",
    title: "Tools",
    description:
      "What nca can call during each coding task: file reads and edits, structured search, the shell, the web, questions, subagents, and MCP servers.",
    order: 6,
  },
  {
    file: "sessions.md",
    title: "Sessions",
    description:
      "Spawn, resume, attach, and inspect an nca session. Each one keeps a JSON snapshot and a JSONL log under the product home. You can leave it running.",
    order: 7,
  },
  {
    file: "permissions.md",
    title: "Permissions",
    description:
      "When nca runs a command without asking, and when it still stops for a delete, sudo, git push, a global install, screen capture, or an MCP tool.",
    order: 8,
  },
  {
    file: "skills.md",
    title: "Skills",
    description:
      "Find, install, and write nca skills as SKILL.md files, from AGENTS.md, a workspace folder, your user skill folder, and the built-in skills shipped with nca.",
    order: 9,
  },
  {
    file: "advanced.md",
    title: "Advanced",
    description:
      "Run nca headless: sub-agents, git worktrees, MCP servers, hooks, JSON and NDJSON output, and the Unix socket protocol for scripts and CI jobs.",
    order: 10,
  },
  {
    file: "acp.md",
    title: "Desktop Clients",
    description:
      "Add nca to T3 Code, Termul, Zed, or any other Agent Client Protocol client. The desktop entry is the command nca with the single argument acp.",
    order: 11,
  },
];

function escapeYaml(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * The published install path is a binary. Keep the Rust toolchain on the
 * source-build section when upstream still lists it as a prerequisite.
 * @param {string} file
 * @param {string} md
 */
function preferBinaryInstall(file, md) {
  if (file !== "getting-started.md") return md;
  const rustBullet =
    "- **Rust toolchain** — install via [rustup](https://rustup.rs/) (edition 2024, stable channel)\n";
  if (!md.includes(rustBullet)) return md;
  let next = md.replace(rustBullet, "");
  const marker = "### Build from Source\n\n";
  const note =
    "### Build from Source\n\nThe install script and the release archives ship a binary. Build from source needs the Rust toolchain (edition 2024, stable) from [rustup](https://rustup.rs/).\n\n";
  if (next.includes(marker) && !next.includes("Build from source needs the Rust toolchain")) {
    next = next.replace(marker, note);
  }
  return next;
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
    body = preferBinaryInstall(d.file, body);
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

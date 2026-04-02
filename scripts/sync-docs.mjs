#!/usr/bin/env node
/**
 * Fetches markdown from madebyaris/native-cli-ai and writes src/content/docs/
 * with YAML frontmatter. Run: npm run sync-docs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "content", "docs");
const BASE =
  process.env.NCA_DOCS_REF?.trim() ||
  "https://raw.githubusercontent.com/madebyaris/native-cli-ai/main/docs/documentation";

/** @type {{ file: string; out?: string; title: string; description: string; order: number }[]} */
const DOCS = [
  {
    file: "index.md",
    out: "overview.md",
    title: "Overview",
    description: "Introduction, quick start, and documentation map",
    order: 0,
  },
  {
    file: "getting-started.md",
    title: "Getting Started",
    description: "Installation, first run, and initial configuration",
    order: 1,
  },
  {
    file: "commands.md",
    title: "Commands",
    description: "Complete CLI command and flag reference",
    order: 2,
  },
  {
    file: "interactive-mode.md",
    title: "Interactive Mode",
    description: "TUI, REPL, slash commands, keyboard shortcuts",
    order: 3,
  },
  {
    file: "configuration.md",
    title: "Configuration",
    description: "Config files, TOML format, and environment variables",
    order: 4,
  },
  {
    file: "providers.md",
    title: "Providers",
    description: "LLM provider setup — MiniMax, Anthropic, OpenAI, OpenRouter",
    order: 5,
  },
  {
    file: "tools.md",
    title: "Tools",
    description: "All agent tools — file ops, search, shell, web, and more",
    order: 6,
  },
  {
    file: "sessions.md",
    title: "Sessions",
    description: "Session lifecycle, persistence, resume, and management",
    order: 7,
  },
  {
    file: "permissions.md",
    title: "Permissions",
    description: "Approval system, permission modes, and safe mode",
    order: 8,
  },
  {
    file: "skills.md",
    title: "Skills",
    description: "Skill discovery, installation, and authoring",
    order: 9,
  },
  {
    file: "advanced.md",
    title: "Advanced",
    description: "Sub-agents, MCP servers, hooks, orchestration, and IPC",
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

async function main() {
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

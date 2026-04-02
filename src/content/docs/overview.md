---
title: "Overview"
description: "Introduction, quick start, and documentation map"
sidebarOrder: 0
---

# nca — Native CLI AI

A native-first, Rust-powered AI coding assistant that runs entirely in the terminal. Zero JavaScript dependencies, sub-100ms startup, and a full agent loop for code generation, file editing, command execution, and project understanding.

## What is nca?

**nca** (native-cli-ai) is a terminal-native AI coding agent comparable to Claude Code and OpenAI Codex CLI — built from scratch in Rust. It provides:

- **Interactive REPL** with multi-turn conversation, full-screen TUI, and agent profiles
- **One-shot mode** for scripting and CI pipelines
- **Session management** with spawn, resume, attach, and structured logs
- **Tool execution** — file operations, code search, shell commands, web research, and more
- **Sub-agent spawning** with isolated git worktrees for parallel task delegation
- **Multiple LLM providers** — MiniMax, Anthropic, OpenAI, and OpenRouter
- **Permission system** — from fully interactive approval to bypass mode for automation
- **MCP integration** — connect external tool servers via Model Context Protocol
- **Skills system** — discoverable, loadable instruction packs that extend agent behavior

## Quick Start

```bash
# Build from source
cargo build --release

# Install to PATH
cp target/release/nca /usr/local/bin/

# Set up your API key
export MINIMAX_API_KEY="your-key-here"

# Start interactive session
nca

# Or run a one-shot task
nca -p "add error handling to src/main.rs"
```

## Documentation

| Page | Description |
|------|-------------|
| [Getting Started](/docs/getting-started) | Installation, first run, and initial configuration |
| [Commands](/docs/commands) | Complete CLI command and flag reference |
| [Interactive Mode](/docs/interactive-mode) | TUI, REPL, slash commands, keyboard shortcuts |
| [Configuration](/docs/configuration) | Config files, TOML format, and environment variables |
| [Providers](/docs/providers) | LLM provider setup — MiniMax, Anthropic, OpenAI, OpenRouter |
| [Tools](/docs/tools) | All agent tools — file ops, search, shell, web, and more |
| [Sessions](/docs/sessions) | Session lifecycle, persistence, resume, and management |
| [Permissions](/docs/permissions) | Approval system, permission modes, and safe mode |
| [Skills](/docs/skills) | Skill discovery, installation, and authoring |
| [Advanced](/docs/advanced) | Sub-agents, MCP servers, hooks, orchestration, and IPC |

## Architecture

nca is a Rust workspace with five crates:

```
nca
├── nca-common    Shared types, config, events, session metadata
├── nca-core      Agent loop, LLM providers, tool protocol, harness
├── nca-runtime   Session lifecycle, IPC, persistence, worktrees, supervision
├── nca-cli       Terminal UX — TUI, REPL, streaming, onboarding
└── nca-autoresearch   Automated research capabilities
```

Single binary output: `nca`. No runtime dependencies beyond a working terminal and network access for LLM calls.

## Design Principles

1. **Terminal-native** — every interaction works in a standard terminal, no mouse required
2. **Predictable** — the agent shows what it intends to do before doing it
3. **Interruptible** — Esc or Ctrl+C cleanly cancels any in-flight operation
4. **Transparent** — token costs, tool calls, and model responses are always visible
5. **Fast** — sub-100ms startup, <10ms local tool execution, <200ms session resume

## License

MIT — see [repository](https://github.com/madebyaris/native-cli-ai) for details.

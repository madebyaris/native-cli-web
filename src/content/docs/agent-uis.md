---
title: "Agent UIs"
description: "How Termul, T3 Code, and other agent managers can run nca: a terminal pane, or JSON and NDJSON. nca is not an ACP agent, and T3 Code does not drive it yet."
sidebarOrder: 11
---

# Agent UIs

nca is the agent. Termul and T3 Code are managers that sit in front of an agent. They do not share one protocol.

nca does not implement the Agent Client Protocol. A manager can still run it in a terminal pane, or drive a headless session with JSON and NDJSON.

## Termul

Termul can open the nca TUI in a workspace pane. nca is not one of Termul's built-in CLI agents. Those are Claude Code, Codex, Cursor, Gemini, OpenCode, and pi.

Add a custom CLI agent with these fields:

| Field | Value |
| --- | --- |
| Name | `nca` |
| Command | `nca` |
| Base arguments | empty |
| Prompt mode | `none` |

Prompt mode `none` starts `nca` with no extra arguments, so the full-screen TUI stays open. You type in that pane.

Do not point the prompt flag at `--prompt` by itself. `nca --prompt "..."` runs one turn and exits, so the pane closes when the turn ends.

To start from a seed prompt and stay in the session, set the base arguments to `--run` and the prompt flag to `--prompt`. Termul then runs:

```bash
nca --run --prompt "inspect the repo and draft a plan"
```

That runs the first turn and then stays in the interactive session.

Termul's ACP chat cannot drive nca. Use the CLI agent above, not an ACP agent.

## T3 Code

T3 Code drives other CLIs from a local server and a browser, desktop, or phone UI. The CLIs it documents are Codex, Claude Code, Cursor, Grok, OpenCode, and Antigravity. It launches each one in that CLI's own server mode and speaks JSON-RPC over stdio.

nca is not in that list, and nca does not offer that server mode. Installing T3 Code and running `t3` does not start nca.

Until T3 Code ships an nca provider, run nca in a terminal, or drive it with the headless interface below.

## Any other manager

A manager that can launch a program in a terminal should run `nca` in the project directory, with no extra arguments. That is the same session you get from the shell.

A manager that wants events instead of a TUI should use a headless run:

```bash
nca run \
  --prompt "run the tests and report failures" \
  --json \
  --stream ndjson
```

Each output line is one JSON event. The same session can then be watched with `nca status`, `nca logs`, and `nca attach`.

Set `NCA_ORCH_NAME`, `NCA_ORCH_RUN_ID`, and `NCA_ORCH_TASK_ID` when the manager needs to stamp the session with its own run. The full list, the event fields, and the Unix socket protocol are in [Advanced](/docs/advanced). Session commands are in [Sessions](/docs/sessions).

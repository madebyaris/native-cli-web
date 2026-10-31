---
title: "Agent UIs"
description: "Point T3 Code, Termul, or Zed at nca acp, or open the full-screen TUI in a terminal pane and drive a headless JSON session from your own shell."
sidebarOrder: 12
---

# Agent UIs

Desktop clients start nca with `nca acp`. That speaks the Agent Client Protocol on stdin and stdout. The same binary still opens the TUI, and it still runs headless jobs.

Client setup and the protocol surface are in [Desktop Clients](/docs/acp).

## T3 Code

In Settings → Providers → Local ACP command, set the command to `nca` and the arguments to `acp`.

## Termul

For ACP chat, use `AgentConfig { command: "nca", args: ["acp"] }`.

To open the full-screen TUI in a pane instead, add a custom CLI agent:

| Field | Value |
| --- | --- |
| Name | `nca` |
| Command | `nca` |
| Base arguments | empty |
| Prompt mode | `none` |

Prompt mode `none` starts `nca` with no extra arguments, so the TUI stays open. You type in that pane.

Do not point the prompt flag at `--prompt` by itself. `nca --prompt "..."` runs one turn and exits, so the pane closes when the turn ends.

To start from a seed prompt and stay in the session, set the base arguments to `--run` and the prompt flag to `--prompt`. Termul then runs:

```bash
nca --run --prompt "inspect the repo and draft a plan"
```

## Zed

Add an `agent_servers` entry with `command: "nca"` and `args: ["acp"]`.

## Headless jobs

A manager that wants events instead of a TUI should use a headless run:

```bash
nca run \
  --prompt "run the tests and report failures" \
  --json \
  --stream ndjson
```

Each output line is one JSON event. The same session can then be watched with `nca status`, `nca logs`, and `nca attach`.

Set `NCA_ORCH_NAME`, `NCA_ORCH_RUN_ID`, and `NCA_ORCH_TASK_ID` when the manager needs to stamp the session with its own run. The event fields and the Unix socket protocol are in [Advanced](/docs/advanced).

`nca acp` never prompts for an API key, because stdin is the protocol. Put the key in config or the provider environment variable before the client starts the process.

---
title: "Agent UIs"
description: "Copy-paste agent config for T3 Code, Termul, and Zed that runs nca acp, plus the full-screen TUI in a terminal pane and a headless JSON session."
sidebarOrder: 12
---

# Agent UIs

Desktop clients start nca with `nca acp`. That speaks the Agent Client Protocol on stdin and stdout. The same binary still opens the TUI, and it still runs headless jobs.

Each client section below has a block that you can copy and paste. Protocol details are in [Desktop Clients](/docs/acp).

## Before you start

1. Install nca. If the client cannot find `nca` later, run `which nca` and use that absolute path as the command.
2. Set your API key before the client starts the process. `nca acp` never prompts, because stdin carries the protocol.

Paste this into `~/.local/share/ncacli/config.toml` and replace the key:

```toml
[provider]
default = "minimax"

[provider.minimax]
api_key = "paste-your-key-here"
```

You can set the provider's environment variable instead, such as `MINIMAX_API_KEY`. Other providers are in [Providers](/docs/providers).

## Alibaba DashScope

To use a Qwen model instead, replace that config with this one:

```toml
[provider]
default = "alibaba"

[provider.alibaba]
api_key_env = "DASHSCOPE_API_KEY"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
model = "qwen2.5-coder-32b-instruct"
```

Set the key in the shell that starts the client:

```bash
export DASHSCOPE_API_KEY="paste-your-key-here"
```

`ALIBABA_API_KEY` works in place of `DASHSCOPE_API_KEY`. In Zed, put the same key in the agent server `env` block:

```json
"env": {
  "DASHSCOPE_API_KEY": "paste-your-key-here"
}
```

Other Qwen model names are in [Providers](/docs/providers#alibaba-cloud-dashscope).

## T3 Code

Open Settings → Providers → Local ACP command and fill in two fields.

| Field | Value |
| --- | --- |
| Command | `nca` |
| Arguments | `acp` |

The full command line is:

```bash
nca acp
```

## Termul

For ACP chat, add this agent config:

```text
AgentConfig { command: "nca", args: ["acp"] }
```

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

Run `zed: open settings` from the command palette. Add this entry to `settings.json`:

```json
{
  "agent_servers": {
    "nca": {
      "type": "custom",
      "command": "nca",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

If `settings.json` already has an `agent_servers` object, add only the `"nca": { ... }` entry inside it.

To pass the API key to nca from Zed, or to start in a stricter mode, use this entry instead:

```json
{
  "agent_servers": {
    "nca": {
      "type": "custom",
      "command": "nca",
      "args": ["acp", "--permission-mode", "plan"],
      "env": {
        "MINIMAX_API_KEY": "paste-your-key-here"
      }
    }
  }
}
```

The flags that `nca acp` accepts are `--model`, `--safe`, and `--permission-mode`. They are listed in [Desktop Clients](/docs/acp#add-it-to-a-client).

## Any other ACP client

Every ACP client takes an executable and literal arguments. Use these values:

| Field | Value |
| --- | --- |
| Command | `nca` |
| Arguments | `acp` |
| Working directory | The project that nca should work on |

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

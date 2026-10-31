import { GITHUB_REPO } from "../consts";

export type CompareRow = { label: string; nca: string; other: string };

export type Comparison = {
  slug: string;
  name: string;
  title: string;
  description: string;
  summary: string;
  rows: CompareRow[];
  ncaBehind: string[];
  ncaAhead: string[];
  pickOther: string;
  pickNca: string;
  sources: { label: string; href: string }[];
};

export const CHECKED_ON = "31 October 2026";

export const COMPARISONS: Comparison[] = [
  {
    slug: "claude-code",
    name: "Claude Code",
    title: "nca vs Claude Code: terminal coding agents compared",
    description:
      "nca compared with Claude Code on license, install, account, models, where each runs, and memory use. Facts checked 31 October 2026, with sources.",
    summary:
      "Claude Code is Anthropic's coding agent. It needs a paid Claude plan or a Console account. nca costs nothing to use under the MIT license, and you pay your own model provider.",
    rows: [
      { label: "License", nca: "MIT, open source", other: "Closed source. Anthropic said in June 2025 it had no plans to open source it right now." },
      { label: "Install", nca: "One command on macOS and Linux. Zip on Windows.", other: "Install script, Homebrew, WinGet, or apt, dnf, and apk packages." },
      { label: "Account", nca: "No account. You bring a provider API key.", other: "A paid Claude plan or a Console account. The free plan does not include it." },
      { label: "Models", nca: "MiniMax by default. Also OpenAI, Anthropic, OpenRouter, and custom endpoints.", other: "Anthropic models. Also Amazon Bedrock, Google Cloud, and Microsoft Foundry." },
      { label: "Where it runs", nca: "Terminal, line REPL, and ACP for T3 Code, Termul, and Zed.", other: "Terminal, VS Code, JetBrains, desktop app, and web." },
      { label: "RAM in one sample", nca: "6.4 MB", other: "162 MB, same sample method, on one Mac before nca 0.5.0." },
    ],
    ncaBehind: [
      "No desktop app, IDE extension, or web version of its own. Desktop clients reach nca through ACP.",
      "No Amazon Bedrock, Google Cloud, or Microsoft Foundry route. Claude Code supports all three.",
      "No team plans or admin controls. Claude Code has Team and Enterprise plans.",
      "The memory numbers come from one sample on one Mac, taken before nca 0.5.0.",
    ],
    ncaAhead: [
      "Open source under MIT. You can read, change, and fork it.",
      "No account needed. You pay your provider for model use, and nca adds no subscription.",
      "Sessions you can detach, check, and attach to, plus JSON and NDJSON output for scripts.",
      "A small footprint: one binary, 6.4 MB RAM in one measured sample.",
    ],
    pickOther:
      "You already pay for a Claude plan, and you want Anthropic's own agent in the terminal, the IDE, the desktop app, or the browser.",
    pickNca:
      "You want an open source terminal agent, a model provider you choose, or sessions you can script and run in the background.",
    sources: [
      { label: "Claude Code overview", href: "https://code.claude.com/docs/en/overview" },
      { label: "Claude Code setup and requirements", href: "https://code.claude.com/docs/en/setup" },
      { label: "Claude plans and pricing", href: "https://claude.com/pricing?mode=code" },
      { label: "Claude Code open source question", href: "https://github.com/anthropics/claude-code/issues/2109" },
      { label: "nca speed and memory method", href: `${GITHUB_REPO}/blob/main/docs/plans/cli-speed-and-footprint.md` },
    ],
  },
  {
    slug: "codex",
    name: "Codex CLI",
    title: "nca vs Codex CLI: terminal coding agents compared",
    description:
      "nca compared with Codex CLI on license, install, ChatGPT plan or API key, models, worktrees, and where each runs. Facts checked 31 October 2026.",
    summary:
      "Codex CLI is OpenAI's open source terminal agent. You sign in with a ChatGPT plan or an OpenAI API key. nca is MIT licensed, needs no account, and uses the model provider you choose.",
    rows: [
      { label: "License", nca: "MIT, open source", other: "Apache-2.0, open source on GitHub." },
      { label: "Install", nca: "One command on macOS and Linux. Zip on Windows.", other: "Install script, npm, Homebrew, or a release binary." },
      { label: "Account", nca: "No account. You bring a provider API key.", other: "Sign in with a ChatGPT plan, including Free and Go, or with an OpenAI API key." },
      { label: "Models", nca: "MiniMax by default. Also OpenAI, Anthropic, OpenRouter, and custom endpoints.", other: "Built around OpenAI models." },
      { label: "Where it runs", nca: "Terminal, line REPL, and ACP for T3 Code, Termul, and Zed.", other: "Terminal, IDE extension, ChatGPT desktop app, and Codex web." },
      { label: "Worktrees and agents", nca: "Child agents with lineage and optional git worktrees.", other: "Worktrees and multi-agent tools in the CLI." },
      { label: "RAM in one sample", nca: "6.4 MB", other: "Not measured. Codex CLI was not installed on the test machine." },
    ],
    ncaBehind: [
      "Codex works with a ChatGPT plan you may already pay for. nca needs a provider API key.",
      "No IDE extension, ChatGPT desktop app, or cloud agent of its own.",
      "No Codex memory number, so the footprint claim has no Codex comparison.",
    ],
    ncaAhead: [
      "Not tied to one model family. The default is MiniMax, and you can switch to OpenAI, Anthropic, OpenRouter, or a custom endpoint.",
      "Background sessions with spawn, status, logs, and attach, plus JSON and NDJSON output for scripts.",
      "Permission prompts only for dangerous actions. Ordinary shell commands run without asking.",
      "A small footprint in one measured sample: 6.4 MB RAM.",
    ],
    pickOther:
      "You have a ChatGPT plan, and you want OpenAI's models in the terminal, the IDE, and the cloud agent from one account.",
    pickNca:
      "You want to choose the model provider, run sessions in the background, or script the agent with JSON and NDJSON output.",
    sources: [
      { label: "openai/codex on GitHub", href: "https://github.com/openai/codex" },
      { label: "Using Codex with your ChatGPT plan", href: "https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan" },
      { label: "Codex authentication", href: "https://learn.chatgpt.com/docs/auth.md" },
      { label: "nca speed and memory method", href: `${GITHUB_REPO}/blob/main/docs/plans/cli-speed-and-footprint.md` },
    ],
  },
  {
    slug: "opencode",
    name: "OpenCode",
    title: "nca vs OpenCode: terminal coding agents compared",
    description:
      "nca compared with OpenCode on MIT license, install, providers, agents, where each runs, and memory use. Facts checked 31 October 2026, with sources.",
    summary:
      "OpenCode is an open source terminal agent under the MIT license. It supports 75+ providers and includes free models. nca is also MIT, with fewer built-in providers and a single binary.",
    rows: [
      { label: "License", nca: "MIT, open source", other: "MIT, open source." },
      { label: "Install", nca: "One command on macOS and Linux. Zip on Windows.", other: "Install script, npm, Homebrew, and Arch Linux packages." },
      { label: "Account", nca: "No account. You bring a provider API key.", other: "No account to start. Free models are included. Other providers need their own key or plan." },
      { label: "Models", nca: "MiniMax by default. Also OpenAI, Anthropic, OpenRouter, and custom endpoints.", other: "75+ providers through Models.dev, including local models. Sign-in with ChatGPT Plus or Pro and GitHub Copilot." },
      { label: "Where it runs", nca: "Terminal, line REPL, and ACP for T3 Code, Termul, and Zed.", other: "Terminal, desktop app, and IDE extension." },
      { label: "Agents", nca: "Build agent and child agents with optional git worktrees.", other: "Build agent, a read-only plan agent, and a general subagent." },
      { label: "RAM in one sample", nca: "6.4 MB", other: "Not measured." },
    ],
    ncaBehind: [
      "Far fewer built-in providers. OpenCode lists 75+ through Models.dev.",
      "No desktop app or IDE extension of its own.",
      "No free model tier. You need a provider key to start.",
    ],
    ncaAhead: [
      "One Rust binary, built from source or downloaded as a release archive.",
      "Background sessions with attach, status, and logs, plus JSON and NDJSON output for scripts.",
      "Permission prompts only for dangerous actions, such as deletes, sudo, and git push.",
    ],
    pickOther:
      "You want many providers, free models to start with, or a desktop app and IDE extension.",
    pickNca:
      "You want one small binary, background sessions you can script, and prompts only for dangerous commands.",
    sources: [
      { label: "OpenCode", href: "https://opencode.ai/" },
      { label: "OpenCode providers", href: "https://opencode.ai/docs/providers/" },
      { label: "anomalyco/opencode on GitHub", href: "https://github.com/anomalyco/opencode" },
      { label: "nca speed and memory method", href: `${GITHUB_REPO}/blob/main/docs/plans/cli-speed-and-footprint.md` },
    ],
  },
];

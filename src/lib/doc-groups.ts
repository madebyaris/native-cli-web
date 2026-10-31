/** Sidebar groups for someone mid-task: install first, then the pages they look up, then the rest. */
export const docGroups = [
  { label: "Start", ids: ["overview", "getting-started"] },
  { label: "Look up", ids: ["commands", "interactive-mode", "configuration", "providers", "acp", "agent-uis"] },
  { label: "Go further", ids: ["tools", "sessions", "permissions", "skills", "advanced"] },
] as const;

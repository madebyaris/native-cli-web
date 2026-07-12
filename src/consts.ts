/** Marketing + docs — keep in sync with native-cli-ai releases */
export const NCA_VERSION = "0.4.0";

export const GITHUB_REPO = "https://github.com/madebyaris/native-cli-ai";

export const SPONSOR_GITHUB = "https://github.com/sponsors/madebyaris";
export const SPONSOR_PAYPAL = "https://paypal.me/airs";

export const DOCS_UPSTREAM =
  "https://raw.githubusercontent.com/madebyaris/native-cli-ai/main/docs/documentation";

/** Canonical production origin — keep in sync with `site` in astro.config.mjs */
export const SITE_URL = "https://nca-cli.com";

/** Default meta / JSON-LD WebSite description (page props may override meta only) */
export const SITE_DESCRIPTION =
  "Rust-native coding agent. Single binary. Terminal-first TUI with live busy activity, sessions, worktrees, and local-first control.";

/** Default Open Graph / Twitter image (absolute URL). File: public/og.png */
export const OG_IMAGE_PATH = "/og.png";
/** Actual asset dimensions (update if og.png is replaced) */
export const OG_IMAGE_WIDTH = 1536;
export const OG_IMAGE_HEIGHT = 1024;

export function absoluteOgImageUrl(): string {
  return new URL(OG_IMAGE_PATH, SITE_URL).href;
}

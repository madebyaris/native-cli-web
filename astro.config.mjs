import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/** Canonical production URL — keep in sync with src/consts.ts SITE_URL */
const SITE = "https://nca-cli.com";

/** Map slug -> source markdown path (for per-doc lastmod) */
const DOCS_DIR = fileURLToPath(new URL("./src/content/docs", import.meta.url));
const BUILD_TIME = new Date();

function safeMtime(absPath) {
  try {
    return statSync(absPath).mtime;
  } catch {
    return null;
  }
}

function lastmodFor(url) {
  // url is the full absolute URL string from @astrojs/sitemap
  const { pathname } = new URL(url);
  const docMatch = pathname.match(/^\/docs\/([^/]+)\/?$/);
  if (docMatch) {
    const mtime = safeMtime(`${DOCS_DIR}/${docMatch[1]}.md`);
    if (mtime) return mtime;
  }
  return BUILD_TIME;
}

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [
    sitemap({
      serialize(item) {
        return { ...item, lastmod: lastmodFor(item.url).toISOString() };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: ["anchor-link"] },
        },
      ],
    ],
    shikiConfig: {
      theme: "github-light",
    },
  },
});

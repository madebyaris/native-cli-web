import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
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
  // Marketing pages: use source mtimes when available
  const pageMap = {
    "/": "src/pages/index.astro",
    "/get-started": "src/pages/get-started.astro",
    "/support": "src/pages/support.astro",
    "/docs": "src/pages/docs/index.astro",
  };
  const rel = pageMap[pathname.replace(/\/$/, "") || "/"];
  if (rel) {
    const mtime = safeMtime(fileURLToPath(new URL(`./${rel}`, import.meta.url)));
    if (mtime) return mtime;
  }
  return BUILD_TIME;
}

export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404") && !page.includes("/404/"),
      serialize(item) {
        const lastmod = lastmodFor(item.url);
        return {
          ...item,
          lastmod: lastmod.toISOString(),
          changefreq: item.url.includes("/docs") ? "weekly" : "monthly",
          priority: item.url.replace(/\/$/, "") === SITE || item.url === `${SITE}/` ? 1.0 : item.url.includes("/docs") ? 0.8 : 0.7,
        };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
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
    }),
    shikiConfig: {
      theme: "github-light",
    },
  },
});

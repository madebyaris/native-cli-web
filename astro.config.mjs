import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/** Canonical production URL — keep in sync with src/consts.ts SITE_URL */
const SITE = "https://nca-cli.com";

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [sitemap()],
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

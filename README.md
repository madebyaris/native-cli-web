# native-cli-ai-web

Marketing site for [`native-cli-ai`](https://github.com/madebyaris/native-cli-ai), built with Astro and Tailwind CSS v4 for static deployment on Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Quality / SEO

```bash
npm run sync-docs   # pull docs + install script + version from CLI repo
npm run quality     # astro check + build + RankMySEO static audit
```

RankMySEO (`@rankmyseo/core`) audits generated HTML for titles, descriptions, H1, canonical, Open Graph, and JSON-LD. Live Core Web Vitals checks are reported as warnings only so static CI stays deterministic.

## Cloudflare Pages

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: use a current LTS release in Pages settings

This site uses Astro static output, so it does not require a Cloudflare SSR adapter.

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

## Cloudflare Pages

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: use a current LTS release in Pages settings

This site uses Astro static output, so it does not require a Cloudflare SSR adapter for the first version.

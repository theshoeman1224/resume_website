# Josh Shuman Resume Website

The source for [joshshuman.com](https://joshshuman.com), a static engineering resume and portfolio built with Astro and deployed to Cloudflare Workers.

## Requirements

- Node.js 22.12 or newer (`.nvmrc` is provided)
- npm 9.6.5 or newer

## Local Development

```bash
npm install
npm run dev
```

Astro prints the local URL when the development server starts. Use `npm run check` for static validation, `npm run build` for a production build, and `npm run preview` to inspect that build locally.

## Production Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow installs locked dependencies, validates and builds the Astro site, then deploys `dist/` to the `resume-website` Cloudflare Worker at [joshshuman.com](https://joshshuman.com).

The GitHub repository must define these Actions secrets:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Workers Scripts edit permissions for this account
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID containing the Worker and domain

For an authenticated manual deployment:

```bash
npm run build
npm run deploy
```

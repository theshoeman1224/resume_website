# Josh Shuman Resume Website

The source for [joshshuman.com](https://joshshuman.com), a static engineering resume and portfolio built with Astro and deployed to Cloudflare Workers.

## Requirements

- Node.js 22.20 or newer (`.nvmrc` pins the setup version)
- npm 9.6.5 or newer
- Rust with the `wasm32-unknown-unknown` target and Trunk 0.21.14 when rebuilding Snake

## Local Development

```bash
npm run setup
npm run dev
```

`npm run setup` asks once before installing the versions locked in `package-lock.json` and the project skills pinned in `scripts/setup.sh`. For an unattended installation, run `npm run setup -- --force`.

Astro prints the local URL when the development server starts. Use `npm test` for the unit tests, `npm run check` for static validation, `npm run build` for a production build, and `npm run preview` to inspect that build locally.

## Tests and CI

`npm test` runs the Vitest unit tests next to the code they cover: `src/lib/*.test.ts` (dates, career-content links, timeline layout, project demo links) and `scripts/lib/*.test.mjs` (project metadata validation).

`.github/workflows/check.yml` runs the tests and the type-checked build on every branch push and pull request. It never deploys.

## Production Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow installs locked dependencies, runs the unit tests, validates and builds the Astro site, then deploys `dist/` to the `resume-website` Cloudflare Worker at [joshshuman.com](https://joshshuman.com).

Redirects live in `public/_redirects`, which Cloudflare applies before serving files. `npm run preview` ignores it; use `npx wrangler dev` after a build to test redirects locally.

The GitHub repository must define these Actions secrets:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Workers Scripts edit permissions for this account
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID containing the Worker and domain

For an authenticated manual deployment:

```bash
npm run sync:portfolio
npm run build:snake
npm run build:site
npm run deploy
```

## Career Content

Roles live in `src/content/roles/` and accomplishments in `src/content/accomplishments/`, both validated by the schema in `src/content.config.ts`. To add an accomplishment, create a Markdown file whose `roleId` names its role, and list its file name (without `.md`) under that role's `accomplishments`. The card's role title and organization come from the role. The build fails if a role and an accomplishment disagree, or if any `roleId`, `relatedRoles`, or `accomplishments` entry points at a file that doesn't exist (`validateCareerGraph` in `src/lib/career.ts`).

## Styles

`src/styles/global.css` holds the design tokens (colours, type sizes, spacing, motion, layers), base element styles, and shared primitives such as `.button`, `.label`, `.chip-list`, and section headings. Everything else is scoped to its component or page in a `<style>` block. Use the tokens rather than literal values, and give label text the `.label` class. Animations go inside `@media (prefers-reduced-motion: no-preference)`.

Project repositories own their public descriptions in `.portfolio/project.yaml`. `portfolio.sources.json` explicitly allowlists repositories and trusted demo adapters. `npm run sync:portfolio` validates each source at its current default-branch revision and generates ignored build inputs under `.portfolio-cache/`; unavailable or invalid sources fail the build.

To publish updated metadata or a new trusted demo build without changing this repository, update the allowlisted project repository and manually run the `Build and deploy` workflow on `main`. The workflow synchronizes metadata first and builds every adapter from the exact recorded revision. Adding a repository or granting a demo adapter still requires a reviewed change to `portfolio.sources.json`.

## Snake WebAssembly Build

The Snake source remains in the independent [`theshoeman1224/snake`](https://github.com/theshoeman1224/snake) repository. `npm run build:snake` checks out the exact revision recorded during metadata synchronization, runs its release exporter, and writes generated assets to the ignored `public/games/snake/` directory. Set `SNAKE_SOURCE_DIR` to an existing checkout at that revision to build without cloning.

The deployment workflow installs the pinned Trunk version and rebuilds Snake before Astro. Ordinary Astro builds and non-game pages do not require the Snake repository or generated assets.

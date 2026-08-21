# Project: `resume_website`

## Project Objective

Build and deploy a professional engineering résumé/portfolio website at:

`https://joshshuman.com`

The site should showcase professional accomplishments through an interactive career timeline, present technical projects through reusable project pages/cards, and support browser-executable demonstrations.

One featured project is a Snake game written in Rust. The game shall be compiled to WebAssembly and playable directly from the résumé website without requiring installation.

The project should prioritize:

* Simple infrastructure
* Fast static-site performance
* Maintainability
* Modular design
* Responsive/mobile-friendly UI
* Automated deployment
* Minimal operating cost
* Easy addition of future accomplishments and projects

---

# 1. Technology Stack

Use the following technologies unless there is a strong technical reason to deviate.

## Website

* Astro
* TypeScript
* HTML/CSS
* Tailwind CSS only if it materially simplifies styling

Avoid introducing a large frontend framework unless needed.

React, Vue, or Svelte should not be required for the MVP unless a specific interactive component clearly benefits from one.

## Interactive Project

* Rust
* WebAssembly
* `wasm-bindgen` and/or `wasm-pack`
* HTML Canvas or the rendering approach already used by the Snake project

The existing Rust Snake project should remain an independent GitHub repository.

## Hosting

* Cloudflare
* Production domain: `joshshuman.com`
* HTTPS enabled

## Source Control

Primary repository:

`resume_website`

Hosting location:

GitHub

## CI/CD

Use GitHub and Cloudflare-supported deployment tooling.

The desired production workflow is:

```text
Local Development
       |
       v
git commit
       |
       v
git push
       |
       v
GitHub
       |
       v
Build / Test
       |
       v
Cloudflare
       |
       v
https://joshshuman.com
```

---

# 2. General Implementation Rules

Follow these rules throughout development.

1. Keep the architecture simple.
2. Do not introduce a backend unless an MVP requirement explicitly needs one.
3. Do not introduce a database.
4. Do not introduce Docker or container infrastructure.
5. Avoid unnecessary JavaScript.
6. Prefer static generation wherever possible.
7. Components should be reusable.
8. Accomplishment and project content should be data-driven rather than hardcoded into UI components.
9. New accomplishments should be addable without modifying timeline logic.
10. New projects should be addable without redesigning project pages.
11. Keep the Snake project independent from `resume_website`.
12. Ensure the website works without the Snake project being available during ordinary page rendering.
13. Maintain good mobile behavior throughout implementation rather than postponing responsive design until the end.
14. Avoid premature optimization.
15. Avoid unnecessary dependencies.
16. Prefer standard browser functionality where practical.
17. Keep deployment reproducible from source control.

---

# 3. Repository Target Structure

The project should evolve toward approximately this structure:

```text
resume_website/
|
├── src/
│   ├── components/
│   │   ├── Timeline.astro
│   │   ├── TimelineItem.astro
│   │   ├── ProjectCard.astro
│   │   ├── ProjectGrid.astro
│   │   └── GameEmbed.astro
│   │
│   ├── content/
│   │   ├── accomplishments/
│   │   └── projects/
│   │
│   ├── layouts/
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── experience.astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── snake.astro
│   │
│   └── styles/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── games/
│       └── snake/
│
├── scripts/
│   └── build-snake.sh
│
├── .github/
│   └── workflows/
│
├── astro.config.mjs
├── package.json
├── wrangler.jsonc
└── README.md
```

This is a target structure, not an absolute requirement. Adjust it when Astro conventions or implementation details provide a cleaner solution.

---

# 4. Milestone M0 — Hello World Deployment

## Goal

Verify the entire basic hosting path before introducing Astro, WebAssembly, CI/CD, or other complexity.

The following items must be proven:

* Domain ownership/configuration
* Cloudflare hosting
* DNS
* HTTPS
* Local deployment tooling
* Ability to update production content

## Initial Files

Start with:

```text
resume_website/
├── public/
│   └── index.html
└── wrangler.jsonc
```

Create a minimal `index.html` similar to:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Josh Shuman</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>joshshuman.com is online.</p>
</body>
</html>
```

Configure Cloudflare deployment with `wrangler.jsonc`.

## Required Validation

Deploy the page.

Verify:

```text
https://joshshuman.com
```

loads successfully.

Verify:

* HTTPS is valid
* No certificate warnings occur
* The expected HTML is displayed
* A change to `index.html` can be redeployed
* The changed content appears at the production URL

## Acceptance Criteria

M0 is complete when:

> Opening `https://joshshuman.com` from a normal browser displays the expected Hello World page over HTTPS and subsequent changes can successfully be redeployed.

Do not proceed with major website development until this deployment path is known to work.

---

# 5. Milestone M1 — Establish Application Infrastructure

## Goal

Convert the simple Hello World deployment into the actual website project.

## Tasks

Initialize Astro with TypeScript.

Establish:

* package management
* Astro configuration
* TypeScript
* production build command
* Cloudflare deployment configuration
* Git repository
* GitHub repository
* `.gitignore`
* README
* basic development instructions

Configure automated deployment.

Desired behavior:

```text
push to main
      |
      v
build
      |
      v
test / validate
      |
      v
deploy
      |
      v
joshshuman.com
```

## Required Commands

The repository should provide simple documented commands equivalent to:

```bash
npm install
npm run dev
npm run build
```

Add additional commands when useful.

## Acceptance Criteria

M1 is complete when:

1. The Astro site builds successfully.
2. The site runs locally.
3. The production site deploys successfully.
4. A commit pushed to the primary deployment branch can update the production website.
5. Deployment instructions are documented in `README.md`.

---

# 6. Milestone M2 — Resume Website Shell

## Goal

Create the initial professional résumé website.

## Primary Sections

The MVP should contain:

```text
Home
About
Experience
Timeline
Projects
Skills
Contact
```

These may be individual pages or well-defined homepage sections.

Prefer a simple navigation model.

## Homepage Requirements

The homepage should quickly communicate:

* Name
* Professional role/focus
* Short professional summary
* Primary engineering specialties
* Link to professional experience/timeline
* Link to projects
* GitHub link
* LinkedIn link
* Contact mechanism

Avoid recreating a traditional paper résumé line-for-line.

The website should instead serve as an expanded interactive engineering portfolio.

## Design Requirements

The website should be:

* Professional
* Modern
* Technically oriented
* Clean
* Responsive
* Easy to scan
* Suitable for engineering hiring managers and technical leadership

Avoid excessive animation or visual effects that distract from the content.

## Acceptance Criteria

M2 is complete when:

* Main navigation works
* Primary sections exist
* Desktop rendering is usable
* Mobile rendering is usable
* No significant layout overflow exists
* Placeholder data can be used where final résumé content is not yet available

---

# 7. Milestone M3 — Structured Accomplishment Data

## Goal

Make career accomplishments data-driven.

Do not hardcode every accomplishment directly inside timeline components.

Use Astro content collections or an equivalent structured approach.

Example:

```text
src/content/accomplishments/
├── dsp-performance.md
├── receiver-architecture.md
├── principal-engineer.md
├── ai-pilot.md
└── devsecops.md
```

## Suggested Accomplishment Schema

Each accomplishment should support fields such as:

```yaml
title:
date:
endDate:
category:
summary:
impact:
technologies:
role:                  # specific title used for this accomplishment (free text)
organization:
roleId:                # slug of the PRIMARY owning role
relatedRoles: []       # optional list of secondary role slugs
featured:
```

Optional fields may be added when useful.

### Roles Collection (M4 update)

The interactive timeline anchors accomplishments to **roles**, which are their own content collection:

```yaml
# src/content/roles/<slug>.md
title:
organization:
startDate:
endDate:               # optional; absent => "Present"
summary:
focus:                 # optional list of themes
accomplishments:       # slugs of accomplishments where this role is the PRIMARY owner
  - <accomplishment-slug>
order:                 # tie-breaker for overlapping roles
```

Adding a role is a new markdown file plus appending its slug to any new accomplishments. No timeline component changes required.

### Categories

The design should support categories such as:

* DSP
* Architecture
* Leadership
* AI
* DevOps
* Software
* Systems
* Performance

Do not tightly couple UI logic to this exact list.

## Acceptance Criteria

M3 is complete when:

> Adding a new accomplishment content file causes the website to display the new accomplishment without requiring modifications to timeline component logic.

A role file produces the same outcome: adding a new role causes the timeline to show a new spine marker, and appending a slug to its `accomplishments` list surfaces that accomplishment under the role's panel without any timeline-component changes.

---

# 8. Milestone M4 — Interactive Career Timeline

## Goal

Build a visually strong interactive timeline that showcases career progression and major accomplishments.

This should be one of the primary features of the website.

## Timeline Features

Support:

* Chronological ordering
* Career progression
* Major accomplishments
* Role changes
* Expandable entries
* Concise accomplishment summaries
* Technical tags
* Categories
* Filtering

Example filters:

```text
All
DSP
Architecture
Leadership
AI
DevOps
```

## Interaction

Roles form the spine of the timeline and are always visible. Clicking a role opens a callout panel above the spine that lists the role's primary accomplishments. The selected role's marker is highlighted and a vertical connector links it to the panel.

* Single-select: opening one role closes any other. Clicking the same role again or pressing `Esc` closes the panel.
* Each accomplishment card inside the panel can list **related roles**. Clicking a related-role chip switches the panel to that role without a page reload.
* URL state: the selected role is reflected in the URL hash (`/experience#role-<slug>`) and can be deep-linked.
* Keyboard: `Tab` to a role node, `Enter`/`Space` to open, `Esc` to close, `Left`/`Right` arrows to move between roles, `Home`/`End` to jump to first/last.
* Filters dim roles with no matching accomplishments (rather than hiding them) so the spine still conveys career structure.

Expanded information per accomplishment may include:

* Problem
* Contribution
* Technical approach
* Impact
* Technologies
* Related roles (chips that switch the active panel)

Keep timeline content concise enough to scan.

## Responsive Behavior

Desktop uses a **horizontal timeline**: year ticks along a 1px axis, role markers positioned by start-date ratio, callout panel above the spine with a connector to the active role.

Mobile (below 52rem) reflows to **vertical role bands**: each role is a `<details>` section with title, organization, dates, summary, and accomplishments listed inline when expanded. The same data, single-select model, and filter dimming are reused.

Do not force a large horizontal scrolling experience on phones.

## Acceptance Criteria

M4 is complete when:

* Timeline content comes from structured role and accomplishment data
* Timeline sorts correctly
* Timeline displays correctly on desktop and mobile
* Filters work (dim non-matching roles)
* A role can be selected, the panel opens, and the connector visually links panel to marker
* URL hash deep-links to a role
* Keyboard navigation works as described
* No accomplishment or role requires custom timeline code

---

# 9. Milestone M5 — Project Showcase System

## Goal

Create a reusable framework for showcasing technical projects.

## Project Content

Use structured project data similar to accomplishment data.

Suggested fields:

```yaml
title:
slug:
summary:
description:
technologies:
github:
demo:
featured:
status:
image:
```

## Project Cards

Each project card should support:

* Project name
* Short summary
* Technologies
* Visual/screenshot when available
* GitHub link
* Project details link
* Live demo link when available

Example concept:

```text
+--------------------------------------+
| Rust Snake                           |
|                                      |
| Snake written in Rust and compiled   |
| to WebAssembly for the browser.      |
|                                      |
| Rust | WASM | Canvas                 |
|                                      |
| [Play]                    [GitHub]    |
+--------------------------------------+
```

## Project Detail Pages

Projects should support individual pages.

Example:

```text
/projects/snake
```

A project detail page should be able to contain:

* Background
* Motivation
* Architecture
* Technologies
* Interesting implementation decisions
* Screenshots
* GitHub
* Interactive demo

## Acceptance Criteria

M5 is complete when:

> A new normal project can be added primarily by creating project content/configuration rather than creating a new custom layout.

---

# 10. Milestone M6 — Rust Snake WebAssembly Integration

## Goal

Allow the existing Rust Snake game to be played directly from `joshshuman.com`.

The game source should remain in its independent GitHub repository.

Architecture:

```text
GitHub
|
├── resume_website
|
└── rust-snake
```

## Build Flow

The deployment/build process should obtain the Snake project and generate browser-compatible WebAssembly.

Conceptually:

```text
Rust Snake Source
        |
        v
cargo / wasm-pack
        |
        v
wasm-bindgen
        |
        +--> snake.js
        |
        +--> snake_bg.wasm
        |
        v
resume_website/public/games/snake/
```

The exact implementation should account for how the existing Snake repository is structured.

Do not rewrite the game simply to conform to this architecture unless necessary.

## Website Integration

Create:

```text
/projects/snake
```

The page should include:

* Project description
* Rust details
* WebAssembly explanation
* GitHub link
* Playable embedded game
* Controls
* Restart capability
* Score display if supported by the game

Example:

```text
Rust Snake

Snake implemented in Rust and compiled to WebAssembly.

+---------------------------+
|                           |
|        GAME AREA          |
|                           |
+---------------------------+

Score: 28

[Start] [Restart]

Controls: Arrow Keys / WASD
```

## Required Behavior

The game should run entirely client-side.

No server-side game execution is required.

## Acceptance Criteria

M6 is complete when:

1. A normal user can visit `joshshuman.com`.
2. The user can navigate to the Snake project.
3. The game loads.
4. The game starts.
5. Keyboard controls work.
6. Restart works.
7. No software installation is required.
8. The game works in supported modern desktop browsers.

Mobile game controls are desirable but not required unless easy to implement.

---

# 11. Milestone M7 — Production Polish

## Goal

Prepare the MVP for public use.

## Browser Testing

Validate at least:

* Firefox
* Chrome
* Edge

## Responsive Testing

Validate:

* Desktop
* Tablet
* Mobile

## Accessibility

Include:

* Semantic HTML
* Keyboard-accessible navigation
* Accessible links/buttons
* Reasonable contrast
* Useful `alt` text
* Visible focus behavior
* Appropriate headings

## SEO / Metadata

Add:

* Useful page titles
* Meta descriptions
* Canonical URL where appropriate
* OpenGraph metadata
* Social preview image
* Favicon

Example title:

```text
Josh Shuman | Principal Software Engineer
```

Avoid generic titles such as:

```text
Home
```

## Error Handling

Add a useful custom 404 page.

Ensure missing project assets do not crash unrelated pages.

## Acceptance Criteria

M7 is complete when:

* No significant browser console errors exist
* Core pages work on supported browsers
* Mobile layout works
* Metadata is present
* Site navigation is keyboard accessible
* 404 handling works
* WASM loads reliably
* Important external links work

---

# 12. MVP Release Checklist

The MVP is complete when all applicable items below pass.

```text
[ ] joshshuman.com resolves
[ ] HTTPS is valid

[ ] Cloudflare deployment works
[ ] GitHub deployment automation works

[ ] Local development instructions exist
[ ] Production deployment instructions exist

[ ] Home page exists
[ ] About section exists
[ ] Experience section exists
[ ] Skills section exists
[ ] Contact section exists

[ ] Accomplishment data is structured
[ ] Interactive timeline works
[ ] Timeline filtering works

[ ] Project system is reusable
[ ] Project cards work
[ ] Project detail pages work

[ ] Rust Snake project is integrated
[ ] Snake WASM loads
[ ] Snake can be played
[ ] Snake controls work
[ ] Snake can restart
[ ] Snake GitHub repository is linked

[ ] Desktop layout tested
[ ] Mobile layout tested

[ ] Firefox tested
[ ] Chrome tested
[ ] Edge tested

[ ] Favicon exists
[ ] Metadata exists
[ ] OpenGraph metadata exists
[ ] 404 page exists

[ ] No significant console errors

[ ] Production website is available at:
    https://joshshuman.com
```

---

# 13. Explicitly Out of Scope for MVP

Do not implement the following unless required by a discovered dependency.

```text
Database
User authentication
User accounts
CMS
Docker
Kubernetes
AWS infrastructure
Dedicated VPS
Server-side Rust application
Node backend
Analytics dashboard
Blog engine
Comment system
Persistent contact-message database
Complex admin interface
```

A basic contact link is sufficient for the MVP.

---

# 14. Future-Friendly Design Requirements

Although not part of the MVP, architecture should avoid preventing future additions such as:

* Additional WebAssembly demos
* Interactive DSP demonstrations
* Embedded engineering visualizations
* Technical articles
* Downloadable résumé PDF
* Analytics
* Contact form
* Additional timeline filtering
* Project galleries
* GitHub repository statistics
* Light/dark mode
* Custom engineering diagrams

Do not implement these simply because they are listed.

---

# 15. Milestone Execution Order

Implement in this order:

```text
M0  Domain Alive
 |
 v
M1  Deployment Pipeline
 |
 v
M2  Resume Shell
 |
 v
M3  Structured Career Data
 |
 v
M4  Interactive Timeline
 |
 v
M5  Project Showcase
 |
 v
M6  Rust/WASM Snake
 |
 v
M7  Production Polish
 |
 v
MVP RELEASE
```

Do not skip M0.

---

# 16. Instructions for OpenCode

Work incrementally.

For each milestone:

1. Inspect the existing repository before changing files.
2. Identify what already exists.
3. Implement only the work required for the current milestone.
4. Keep changes modular.
5. Run relevant tests/builds.
6. Fix errors before proceeding.
7. Verify acceptance criteria.
8. Update documentation when commands or infrastructure change.
9. Summarize completed work.
10. Clearly identify anything that requires manual user action.

Do not make assumptions about credentials, Cloudflare account identifiers, GitHub access, domain ownership configuration, or the Snake repository URL when those values are not available.

When manual action is required, provide the user with:

* The exact action required
* Where to perform it
* The exact command or UI location when known
* What result should be expected
* How to verify success

Never place secrets, API tokens, Cloudflare credentials, or private keys into source-controlled files.

Prefer environment variables or the appropriate secret-management mechanism.

---

# 17. Current Starting Point

Project name:

`resume_website`

Production domain:

`https://joshshuman.com`

Hosting provider:

Cloudflare

The first task is:

## M0 — Hello World Deployment

Create and deploy the smallest possible static website that displays:

```text
Hello World!

joshshuman.com is online.
```

Verify that it can be loaded through:

`https://joshshuman.com`

Once M0 is proven, continue with M1.


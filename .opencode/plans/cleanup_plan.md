# Resume Website Cleanup Plan

**Goal**: An engineering resume site that hiring managers and HR (promotion review) can scan in seconds: what shipped, what it did, what he runs.

**Audience**: External hiring managers; internal HR for promotion cases.

**Site-wide guardrails** (decided 2026-08-22):

1. **Employer name appears only inside role/timeline surfaces.** Allowed: spine labels, role panels, accomplishment cards, current-role card, mobile role bands. Forbidden: page headers, hero, about, contact, skills, projects, meta descriptions, footer.
2. **No age or degree commentary anywhere.** Trajectory is stated once as fact ("Seven years from first industry role to principal engineer"); dates on the timeline carry the math. The no-Master's story stays for interviews and the promotion packet.
3. Tone rules from the unslop pass apply everywhere: active voice, concrete over adjectival, one list per paragraph max.

---

## Status snapshot

Verified by audit 2026-08-22 (git log + clean build, `astro check` 0 errors, timeline slug validation silent).

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Homepage hero/about/section rewrite | DONE |
| 2 | Experience intro rewrite + focus cards removed | DONE |
| 2b | `CurrentRoleCard` above timeline | DONE |
| 3 | Accomplishment copy rewrites | IN PROGRESS this round (qualitative; metrics deferred) |
| 4a | Roles collection + schema (roleId, relatedRoles, roleType dropped) | DONE |
| 4b | Horizontal timeline (panel overlay, connector, keyboard, hash deep-link, mobile bands) | DONE |
| 4b2 | Panel/card width fixes | DONE |
| 4c | `metrics` schema + `AccomplishmentMetrics.astro` | DEFERRED until real figures exist |
| 5 | Projects review | DECIDED: keep all three incl. Time Card Tracker |
| 6 | Design direction | OPEN |

---

## This round of changes (2026-08-22)

### Copy fixes

| # | Task | File | Notes |
|---|------|------|-------|
| A | ~~Rewrite H1/subtitle/meta description~~ **REVERTED by owner** — original "leading performant systems..." text kept; audit's replacement read as duplicative of the about section | `src/pages/experience.astro` | Owner preference 2026-08-22 |
| B | Replace "Drove adoption of delivery-process improvements" filler with concrete actions; mirror in role summary | `src/content/accomplishments/devsecops-leadership.md`, `src/content/roles/devsecops-lead.md` | |
| C | Rewrite impact around owned scope: arbitrating between hardware/firmware/integration/test orgs, unblocking before schedule impact | `src/content/accomplishments/principal-engineer.md` | |
| D | Contact section: wire real email via Cloudflare Email Routing alias (`contact@joshshuman.com` → personal inbox), remove "coming soon"/"pending" placeholders | `src/pages/index.astro` | **MANUAL STEP (Josh)**: create the alias in Cloudflare dashboard → Email → Email Routing before deploying, or the mailto points at a dead mailbox |
| E | Hero summary → trajectory line. Final wording uses the exact figure ("Six and a half years") — timeline math (Oct 2019 → Mar 2026) is public on the same page, so rounding up invites a nitpick the exact number preempts | `src/pages/index.astro` | |
| F | Split about paragraph: it stacked two rule-of-three lists back-to-back; also "next-generation" puffery cut | `src/pages/index.astro` | |
| G | ~~"Built, measured, documented." overclaim~~ **KEPT as-is by owner** — project metrics display is planned future work (see TODO backlog); heading describes intent | `src/pages/projects/index.astro` | |

### Code cleanup

| # | Task | File | Notes |
|---|------|------|-------|
| H | Delete dead `panelJson` block (computed + injected via `define:vars`, never read — script uses RolePanel's `data-timeline-panels`) and unused `data-role-slugs` attribute | `src/components/Timeline.astro` | Removes a duplicated full payload from every experience-page render |
| I | Fix `.principles li` right-alignment bug: `justify-content: space-between` pushed bullet text flush right (visible on short bullets like "Profile real-time paths before I touch them"). Dropped `space-between`; marker + text now flow left | `src/styles/global.css` | |

### Decisions recorded

- **Metrics**: dsp-performance, principal-engineer, devsecops-leadership rewritten qualitatively (scope/stakes, no invented numbers). boot-reliability already carries 7–10% → 1–2%; receiver-architecture carries team growth 8→18.
- **Email**: Cloudflare Email Routing alias forwarding to personal address (free, domain already on Cloudflare).
- **Time Card Tracker**: kept (shows Python, SQLite, data integrity, packaging discipline).
- **"Applied AI"**: kept in skills/specialties. TODO below: add a supporting accomplishment so the claim has evidence on-site.
- **Master's clause**: omitted entirely (guardrail #2).

---

## Process facts worth keeping

- **Project copy lives upstream.** `.portfolio-cache/projects/*.json` is generated at build time by `scripts/sync-portfolio-metadata.mjs` from each repo's `.portfolio/project.yaml`. Local edits there get overwritten. Snake and Time Card Tracker copy must be edited in their own repos; this portfolio's own project.yaml is editable locally at `.portfolio/project.yaml`.
- **Node version**: system node is v18 (unsupported). Use nvm node ≥ 22.12 (`.nvmrc` pins v24; README documents). Build: `export PATH=~/.nvm/versions/node/v24.19.0/bin:$PATH && npm run build`.
- **Timeline validation**: `experience.astro` console-warns on unresolved roleId/relatedRoles/accomplishment slugs. Silent output = graph intact.
- `PROJECT_PLAN.md` is the original M0–M7 build spec; historical reference, all milestones complete.

---

## TODO backlog

- [ ] Josh: create `contact@joshshuman.com` Cloudflare Email Routing rule → then deploy Task D's mailto
- [ ] Add Applied AI accomplishment entry (backs the skills claim)
- [ ] Project metrics: measure and display actual metrics on project pages/cards (justifies the "Built, measured, documented." heading)
- [ ] Add 2–5 more metric-rich accomplishments as numbers become available (boot-reliability is the template)
- [ ] Phase 4c when metrics land: `metrics` array schema + `AccomplishmentMetrics.astro` rendered between summary and "Inspect impact"
- [ ] Phase 6: design direction decision (keep / simplify / customize) after content settles
- [ ] Consider syncing upstream project.yaml copy with unslop rules next time those repos are touched

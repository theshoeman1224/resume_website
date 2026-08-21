# Resume Website Cleanup Plan

**Goal**: Transform AI-generated marketing copy into an authentic engineering resume that hiring managers respect. Focus on measurable results, direct language, and technical credibility.

**Audience**: Hiring managers who care about impact, not buzzwords.

**Core Message**: "I get results. I am a determined engineer that targets difficult tasks others fail to accomplish."

---

## Phase 1: Homepage — Rewrite Hero & Section Copy

**File**: `src/pages/index.astro`

### Changes

| Section | Current Problem | Target |
|---------|-----------------|--------|
| Hero H1 | "Engineering systems that perform." — puffery, abstract | "Real-time DSP. Embedded C. Systems that ship." |
| Hero summary | "at the intersection of..." — cliché connector | "6 years making radar signal processing hit deadlines on embedded hardware. Principal engineer now." |
| About H2 | "From complex constraints to dependable software." — vague abstraction | Cut or replace with one concrete sentence |
| About copy | Generic "I work where software meets..." | 2-3 sentences: what you've shipped, what you're good at, what you want next |
| Principles list | 4 generic bullets | Replace with 3-4 specific things you actually do (e.g., "Profile before optimizing — cut 40% latency on radar correlator") |
| Timeline H2 | "A career built around consequential engineering." — puffery | "What I've built and what it did" |
| Projects H2 | "Technical ideas made executable." — abstract metaphor | "Side builds that taught me something" |
| Skills H2 | "Depth across the system." — zero information | "What I use daily" — group by actual daily use vs. known |
| Contact H2 | "Let's solve something difficult." — chatbot phrase | "Currently at Raytheon. Open to principal/lead roles in DSP, embedded, or systems." |

---

## Phase 2: Experience Page — Replace Marketing Copy with Signal

**File**: `src/pages/experience.astro`

### Changes

| Section | Current Problem | Target |
|---------|-----------------|--------|
| Page intro H1 | "Technical range. Focused outcomes." — marketing speak | "Principal Software Engineer, Raytheon (2019–present). Real-time radar DSP, receiver architecture, team lead." |
| Page intro paragraph | "A career centered on performance-sensitive software..." — filler | Delete. The timeline speaks. |
| Focus section (3 cards) | "How I contribute" + 3 abstract modes — forced rule of three | **REMOVE ENTIRELY** or replace with 3 concrete achievements with numbers |
| Accomplishments H2 | "Selected accomplishments." — generic | "Measurable results" |
| Accomplishments sub | UI description | One sentence: what the timeline shows |

---

## Phase 3: Accomplishment Content — Add Metrics, Cut Fluff

**Files**: `src/content/accomplishments/*.md` (5 files)

### Required Changes Per File

Each accomplishment needs:
- **Summary**: One sentence, active voice, what you *did* (not "served as" or "led")
- **Impact**: **REQUIRED** — specific numbers (latency reduction, throughput increase, team size, build time, defect rate, cost savings, schedule recovery)
- **Technologies**: Keep (recruiter keywords)
- **Role/Org**: Keep

### Current → Target Transforms

| File | Current Impact | **BLOCKER: Need Metrics** |
|------|----------------|---------------------------|
| `dsp-performance.md` | "improved DSP timing while preserving algorithmic intent" | **ASK: What was the latency before/after? Pulse density? Cycle count reduction?** |
| `principal-engineer.md` | "Provide technical direction across... coordinating systems, software, hardware, firmware, integration, and test organizations" | **ASK: How many programs? Team size? Defect reduction %? Integration time saved?** |
| `devsecops-leadership.md` | "helping drive delivery-process improvements" | **ASK: Build time reduction? Deploy frequency change? MTTR improvement? Team count affected?** |
| `photolithography-control.md` | "a more usable interface" | **ASK: What metric improved? Setup time? Error rate? Throughput?** |
| `receiver-architecture.md` | "Designed for reuse and scalability..." | **ASK: Integration defects before/after? Interface count? Rework hours saved? Schedule impact?** |

### ⚠️ IMPLEMENTATION BLOCKER: Metrics Required

**Before implementing Phase 3, the AI MUST ask for these metrics:**

```markdown
## REQUIRED METRICS — Provide Before Implementation

### dsp-performance.md (Raytheon, 2019-2025)
- Correlation kernel latency before/after (μs or cycles)
- Pulse density increase (× factor)
- Memory bandwidth improvement
- Any cycle-count or throughput numbers

### principal-engineer.md (Raytheon, 2026-present)
- Number of radar programs architected
- Team size (current 18, but historically?)
- Integration defect reduction (% or count)
- Schedule/rework time saved

### devsecops-leadership.md (Raytheon, 2019-2025)
- Build time before/after
- Deploy frequency change
- MTTR (mean time to recovery) improvement
- Number of teams/engineers affected

### photolithography-control.md (Wentworth, 2017-2018)
- Setup time reduction
- Error rate reduction
- Throughput improvement
- Any quantifiable outcome from AAAS/NCUR presentation

### receiver-architecture.md (Raytheon, 2025-2026)
- Integration defects before/after interface contracts
- Number of HW/FW interfaces defined
- Rework hours saved
- Schedule impact (weeks saved)
```

**Do not proceed with Phase 3 until metrics are provided.** Use conservative estimates if exact numbers unavailable — note them as "est." in the impact field.

---

## Phase 4: Accomplishment Timeline — Status Update

### What's already built

The horizontal career timeline on `/experience` is implemented and live. It anchors the page: clicking a role opens a panel that overlays above the spine without pushing it down. Roles and accomplishments are decoupled, with accomplishments cross-linkable via `relatedRoles` chips.

### New content collection: `src/content/roles/`

Roles are now a first-class content collection, not free-text fields on each accomplishment. Each role markdown declares its primary accomplishments by slug.

```yaml
# src/content/roles/<slug>.md
title:                  # "Senior Software Engineering Task Lead"
organization:           # "Raytheon"
startDate:
endDate:                # optional; absent => "Present"
summary:                # role-level narrative
focus: []               # optional themes
accomplishments: []     # slugs of accomplishments where this role is PRIMARY owner
order:                  # tie-breaker for overlapping roles
```

Current roles (5):

| Slug | Title | Span | Primary accomplishments |
|---|---|---|---|
| `research-assistant-wit` | Research Assistant | 2017-05 → 2018-01 | photolithography-control |
| `software-engineer-raytheon` | Software Engineer | 2019-10 → 2025-01 | dsp-performance, boot-reliability |
| `devsecops-lead` | DevSecOps Lead | 2019-10 → 2025-01 | devsecops-leadership |
| `senior-software-engineering-task-lead` | Senior SE Task Lead | 2025-01 → 2026-03 | receiver-architecture |
| `principal-software-engineer` | Principal Software Engineer | 2026-03 → Present | principal-engineer |

### Accomplishment schema changes (`src/content.config.ts`)

```typescript
const accomplishments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/accomplishments" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    category: z.string(),
    summary: z.string(),
    impact: z.string(),
    technologies: z.array(z.string()).default([]),
    role: z.string(),                    // free-text title for this accomplishment
    organization: z.string(),
    roleId: z.string(),                  // PRIMARY owning role slug (required)
    relatedRoles: z.array(z.string()).default([]),  // secondary role slugs
    featured: z.boolean().default(false),
    // roleType: REMOVED — redundant now that roleId exists
  }),
});
```

`roleType` (primary/leadership/initiative) was removed — the role entity makes it redundant.

### Component structure (replaces the planned `TimelineItem.astro`)

| Component | Role |
|---|---|
| `Timeline.astro` | Orchestrator: loads data, computes layout, owns selection state, keyboard nav, URL hash, filter |
| `TimelineFilters.astro` | Category chips (dim non-matching roles) |
| `RoleSpine.astro` | Horizontal axis with year ticks + role markers |
| `RoleNode.astro` | One role on the spine (button, ARIA-correct) |
| `RolePanel.astro` | The callout panel above the spine |
| `AccomplishmentCard.astro` | Card inside the panel (compact, expandable) |
| `TimelineConnector` (inline) | Vertical line from panel-bottom to marker |

`TimelineItem.astro` (referenced in the plan's file index) was deleted.

### Visual / interaction design (committed)

- **Alternation pattern**: labels alternate above/below the spine by parity-of-index. Currently 3 above (PSE, DevSecOps Lead, Research Assistant) and 2 below (Senior SE Task Lead, Software Engineer). DevOps and SE share Oct 2019 with no marker collision because they sit on opposite sides.
- **Signature**: markers are diamonds (rotated 0.65rem squares) on the axis, connected to their label by a 1.1rem "tab". The diamond + tab reads as a flag on a map. Ongoing role (Principal SE) has a slow pulse ring.
- **Connector**: vertical 1px line, signal green, fades 0% → 100% via linear-gradient at both ends. JS positions it from panel-bottom (5rem above spine-top) to marker center.
- **Panel anchored above the spine**: `position: absolute; bottom: calc(100% + 5rem)`. Spine has `margin-top: 4rem` for breathing room against the filter chips above. Spine stays put on every selection — no layout shift.
- **Stacked label content**: title (italic Georgia) → organization (mono caps signal green) → dates (mono caps muted). Title wraps to 2 lines on long titles ("Senior Software Engineering Task Lead").
- **Single-select**: clicking a role opens its panel and closes any other. Click again or `Esc` closes.
- **Filter**: category chips dim non-matching roles (not hide). Status reads "N roles shown".
- **URL deep-link**: `#role-<slug>` opens that role on load and syncs on selection.
- **Keyboard**: `Tab` to role, `Enter`/`Space` to open, `Esc` to close, `←`/`→` between roles, `Home`/`End` jump.
- **Related-role chips**: each accomplishment card lists `relatedRoles` as clickable chips that switch the panel without a page reload.
- **Mobile**: below 52rem the horizontal spine hides and vertical `<details>` role bands take over (same data, same single-select model via mobile UI).
- **Build-time validation** in `experience.astro` console-warns if any `roleId` or role-`accomplishments` slug is unresolved.
- **Reduced-motion**: globally respected.

### What's still needed for Phase 4

The plan's `metrics` schema is **not yet added**. The work in this phase is structurally complete; it just doesn't surface metrics.

```typescript
// To be added to accomplishments schema when metrics arrive
metrics: z.array(z.object({
  label: z.string(),
  value: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
  unit: z.string().optional(),
})).default([]),
```

And a new `src/components/AccomplishmentMetrics.astro` to render them inside `AccomplishmentCard.astro`. Likely placement: between the summary and the "Inspect impact" details, as a small horizontal row of stat cards.

When metrics land, each existing role markdown and accomplishment markdown should be reviewed — the "impact" string currently carries the number; once `metrics` exists, the prose can be trimmed and the structured fields can do the work.

---

## Phase 5: Projects — Keep Strong, Trim Weak

**Source**: `.portfolio-cache/projects/*.json`

| Project | Status | Action |
|---------|--------|--------|
| `resume-website.json` | Strong technical depth | Keep |
| `rust-wasm-snake.json` | Strong — WASM, Rust, CI provenance | Keep |
| `time-card-tracker.json` | Python/desktop — relevant if showing data integrity, packaging | **DECIDE: Keep or archive?** |

**Add**: 1-2 more projects demonstrating DSP/embedded/systems depth if available.

---

## Phase 6: Design System Decision

**Current**: Monospace/serif, grid background, signal green — chosen by AI.

### Options

1. **Keep** — distinctive, technical feel
2. **Simplify** — drop grid, reduce serif, cleaner hierarchy
3. **Customize** — brutalist, minimal, or terminal-inspired

### Recommendation

**Decide after content rewrite.** Content should drive design. If current aesthetic feels like "AI chose this," simplify to something you'd build yourself.

**⚠️ DECISION NEEDED**: Before Phase 6 implementation, confirm direction.

---

## Phase 7: Contact Page TODO Tracking

**File**: `src/pages/index.astro` (contact section) or new `TODO.md` in repo root

Add visible TODO list signaling "active builder":

- [ ] Add email/contact form
- [ ] Add accomplishment metrics to timeline
- [ ] Add 2 more project entries
- [ ] Decide on design direction
- [ ] Add 5-8 metric-rich accomplishment entries

---

## Prioritized Execution Order

| Priority | Task | Effort | Impact | Dependencies | Status |
|----------|------|--------|--------|--------------|--------|
| 1 | Rewrite homepage hero + about copy | 1 hr | High | None | **DONE** |
| 2 | Rewrite experience page intro + remove focus cards | 30 min | High | None | **DONE** |
| 2b | Add `CurrentRoleCard` component (signal-green border, pulse dot, focus chips) above timeline | 30–60 min | High | Phase 2 | **DONE** |
| 3 | **Add metrics to 6 accomplishment MD files** | 2-3 hrs | **Critical** | **METRICS REQUIRED** | Blocked on metrics |
| 4a | Roles collection + schema (roleId, relatedRoles, drop roleType) | — | — | — | **DONE** |
| 4b | Horizontal timeline component (alternation, panel overlay, connector, keyboard, hash, mobile) | — | — | — | **DONE** |
| 4b2 | Widen timeline panel + current-role card padding and remove `max-width: 52rem` on summary text so cards use the available horizontal space when selected | 15 min | Medium | — | **DONE** |
| 4c | Add `metrics` schema + `AccomplishmentMetrics` component + render in card | 2-3 hrs | High | Phase 3 complete | **Not started** |
| 5 | Add 5-8 metric-rich accomplishment entries | 2 hrs | High | Phase 4c | **Not started** |
| 6 | Review/trim projects | 30 min | Medium | None | **Not started** |
| 7 | Design decision + contact TODOs | 1 hr | Low | Content stable | **Not started** |

---

## Questions for Implementation Time

### Must Answer Before Phase 3

1. **Metrics for 5 existing accomplishments** — Provide the numbers listed in the blocker section above. Conservative estimates acceptable (mark as "est.").

### Must Answer Before Phase 4

2. **Schema approach** — Add `metrics` to accomplishment schema in `content.config.ts`, or use sidecar `metrics.json` files?

### Must Answer Before Phase 2

3. **Focus cards** — Remove entirely, or replace with 3 specific achievements? (e.g., "Cut radar correlator latency 42%")

### Must Answer Before Phase 6

4. **Design direction** — Keep current, simplify, or customize? Want 2-3 proposals after content solidifies?

### Must Answer Before Phase 5

5. **Time Card Tracker** — Keep as project (shows Python, desktop, data integrity) or archive?

---

## Implementation Notes

- **Tone**: Direct, terse, specific. No "leverage," "synergy," "drive," "pivotal," "landscape," "intersection of."
- **Voice**: First person where natural. "I cut latency 42%" not "Latency was reduced by 42%."
- **Evidence over claims**: Every impact statement needs a number or it gets cut.
- **Recruiter scan test**: Can someone extract your stack and your biggest win in 10 seconds?

---

## File Index for Implementation

```
/home/josh/repos/resume_website/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Phase 1, 7
│   │   └── experience.astro         # Phase 2
│   ├── content/
│   │   ├── roles/                            # Phase 4 (new collection)
│   │   │   ├── research-assistant-wit.md
│   │   │   ├── software-engineer-raytheon.md
│   │   │   ├── devsecops-lead.md
│   │   │   ├── senior-software-engineering-task-lead.md
│   │   │   └── principal-software-engineer.md
│   │   ├── accomplishments/
│   │   │   ├── boot-reliability.md           # Phase 3
│   │   │   ├── devsecops-leadership.md       # Phase 3
│   │   │   ├── dsp-performance.md            # Phase 3
│   │   │   ├── photolithography-control.md   # Phase 3
│   │   │   ├── principal-engineer.md         # Phase 3
│   │   │   └── receiver-architecture.md      # Phase 3
│   │   └── content.config.ts          # Phase 4 (schema)  [note: not config.ts]
│   └── components/
│       ├── Timeline.astro            # Phase 4 (orchestrator)
│       ├── TimelineFilters.astro     # Phase 4
│       ├── RoleSpine.astro           # Phase 4
│       ├── RoleNode.astro            # Phase 4
│       ├── RolePanel.astro           # Phase 4
│       ├── CurrentRoleCard.astro     # Phase 2b (current-role callout above timeline)
│       ├── AccomplishmentCard.astro  # Phase 4
│       └── AccomplishmentMetrics.astro  # Phase 4 (new, when metrics land)
├── .portfolio-cache/projects/      # Phase 5
└── cleanup_plan.md                  # This file
```

---

**Status**: Plan complete. Awaiting metrics and decisions before implementation begins.
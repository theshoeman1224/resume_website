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

## Phase 4: Add Accomplishment Timeline with Metrics (New Feature)

### New Schema Addition

Extend `src/content.config.ts` accomplishment schema:

```typescript
metrics: z.array(z.object({
  label: z.string(),           // "Correlation kernel latency"
  value: z.string(),           // "42% reduction"
  before: z.string().optional(), // "1.2 ms"
  after: z.string().optional(),  // "700 μs"
  unit: z.string().optional(),   // "ms", "cycles", "%", "hrs"
})).default([]),
```

### New Component

Create `src/components/AccomplishmentMetrics.astro` or extend `TimelineItem.astro` to render metrics as visual cards below the timeline entry.

### Content

Add 5-8 new accomplishment entries with real metrics (separate from the 5 existing role-based entries). These are **result-oriented**, not role-oriented.

**Placement**: Below career timeline on `/experience` or new `/results` page.

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

| Priority | Task | Effort | Impact | Dependencies |
|----------|------|--------|--------|--------------|
| 1 | Rewrite homepage hero + about copy | 1 hr | High | None |
| 2 | Rewrite experience page intro + remove focus cards | 30 min | High | None |
| 3 | **Add metrics to 5 accomplishment MD files** | 2-3 hrs | **Critical** | **METRICS REQUIRED** |
| 4 | Extend schema + build metrics display in Timeline | 2-3 hrs | High | Phase 3 complete |
| 5 | Add 5-8 metric-rich accomplishment entries | 2 hrs | High | Phase 4 schema |
| 6 | Review/trim projects | 30 min | Medium | None |
| 7 | Design decision + contact TODOs | 1 hr | Low | Content stable |

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
│   │   ├── accomplishments/
│   │   │   ├── dsp-performance.md           # Phase 3
│   │   │   ├── principal-engineer.md        # Phase 3
│   │   │   ├── devsecops-leadership.md      # Phase 3
│   │   │   ├── photolithography-control.md  # Phase 3
│   │   │   └── receiver-architecture.md     # Phase 3
│   │   └── config.ts               # Phase 4 (schema)
│   └── components/
│       ├── TimelineItem.astro      # Phase 4 (extend)
│       └── AccomplishmentMetrics.astro  # Phase 4 (new)
├── .portfolio-cache/projects/      # Phase 5
└── CLEANUP_PLAN.md                 # This file
```

---

**Status**: Plan complete. Awaiting metrics and decisions before implementation begins.
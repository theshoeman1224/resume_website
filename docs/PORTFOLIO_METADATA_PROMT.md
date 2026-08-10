# Portfolio Metadata Generation Prompt

You are working inside a software project repository that may be showcased on my engineering portfolio website:

`https://joshshuman.com`

Your task is to inspect this repository and create or update its standardized portfolio metadata under:

```text
.portfolio/
```

The repository owns its project descriptions and metadata. The `resume_website` project will consume this metadata and decide how to render it.

---

## 1. Inspect the Repository First

Before creating portfolio files, inspect the repository and determine from available evidence:

* What the project does
* Why it exists
* Primary technologies
* Major features
* Important implementation details
* Architecture
* Engineering challenges
* Testing/build approach
* Whether an interactive or hosted demo exists
* Whether public engineering dashboards exist
* Whether the project is active, complete, experimental, a prototype, or archived

Review relevant files such as:

* `README.md`
* source directories
* tests
* build files
* dependency manifests
* CI configuration
* documentation
* scripts
* examples
* git remotes
* existing screenshots or diagrams

Do not invent performance numbers, technologies, features, dates, roles, or accomplishments that cannot reasonably be supported by the repository.

Use conservative wording when uncertain.

---

# 2. Required Portfolio Structure

Create:

```text
.portfolio/
├── project.yaml
└── preview.png          # when a meaningful preview is available
```

Optional richer content may include:

```text
.portfolio/
├── project.yaml
├── preview.png
├── overview.md
├── architecture.md
├── architecture.png
└── screenshots/
```

Only create optional files when they add meaningful value.

Do not create blank or meaningless placeholders.

---

# 3. `project.yaml`

Create or update:

```text
.portfolio/project.yaml
```

Use this structure:

```yaml
schema_version: 1

project:
  name: ""
  slug: ""

  tagline: ""

  summary: >

  description: >

  status: ""

  role: ""

  dates:
    started:
    completed:

  technologies: []

  categories: []

  highlights: []

  links:
    repository: ""

    primary: []

    dashboards: []

  media:
    preview: ".portfolio/preview.png"

  demo:
    type: "none"
```

---

# 4. Metadata Rules

## Schema Version

Always use:

```yaml
schema_version: 1
```

---

## Name

Use the project's established human-readable name when available.

Example:

```yaml
name: "CIntel"
```

---

## Slug

Create a URL-safe project identifier.

Prefer:

* lowercase
* hyphens
* no spaces
* no special characters

Example:

```yaml
slug: "rust-snake"
```

---

## Tagline

Write one concise technical description, approximately 5–12 words.

Good:

```yaml
tagline: "Legacy C code intelligence for AI-assisted development"
```

Avoid vague marketing language.

---

## Summary

Write approximately 1–3 concise sentences suitable for a project card.

Explain:

* what the project is
* its primary purpose
* its most important technical characteristic

Write for an engineering hiring manager or software engineer unfamiliar with the repository.

---

## Description

Write approximately 1–3 short paragraphs for the project's detail page.

Focus on:

* motivation
* major capabilities
* architecture
* interesting implementation choices
* meaningful technical challenges

Do not simply copy the README.

Write professional portfolio content, not marketing copy.

---

## Status

Use one of:

```text
active
complete
experimental
prototype
archived
```

Determine the most appropriate value from repository evidence.

Do not assume `active` if development status is unclear.

---

## Role

Describe my contribution conservatively.

Examples:

```yaml
role: "Developer"
```

```yaml
role: "Creator and Lead Developer"
```

```yaml
role: "Architecture and DSP Implementation"
```

Do not invent organizational titles or leadership roles without evidence.

If contribution cannot be determined reliably, default to:

```yaml
role: "Developer"
```

---

## Dates

Use:

```yaml
dates:
  started:
  completed:
```

Accepted formats:

```text
YYYY
YYYY-MM
YYYY-MM-DD
```

Use git history or repository documentation when reliable.

For active projects, leave `completed` empty.

Do not guess dates.

---

# 5. Technologies

Populate:

```yaml
technologies:
  - ...
```

Include meaningful implementation technologies, not every dependency.

Examples:

```yaml
technologies:
  - Rust
  - WebAssembly
  - wasm-bindgen
  - HTML Canvas
```

or:

```yaml
technologies:
  - Python
  - C
  - GCC
  - Make
```

Target approximately 3–8 technologies.

---

# 6. Categories

Populate:

```yaml
categories:
  - ...
```

Use broad portfolio categories describing the nature of the project.

Examples:

```text
AI
Developer Tools
DSP
Embedded Software
Systems
WebAssembly
Static Analysis
Performance
DevOps
Automation
Games
Networking
```

Target approximately 1–4 categories.

`categories` describe what kind of project this is.

`technologies` describe how it was built.

---

# 7. Engineering Highlights

Create approximately 3–6 concise technical highlights:

```yaml
highlights:
  - "..."
  - "..."
```

Prioritize meaningful engineering work such as:

* architecture
* algorithms
* automation
* performance optimization
* portability
* build tooling
* testing
* static analysis
* browser integration
* modularity
* complex technical constraints

Example:

```yaml
highlights:
  - "Parses Makefiles to discover compiler flags, defines, and include paths"
  - "Generates per-directory function call relationships"
  - "Produces structured documentation optimized for AI-assisted code navigation"
  - "Uses a modular analyzer architecture designed for future extensions"
```

Do not invent unsupported metrics or results.

---

# 8. Repository and Project Links

## Repository

Determine the public repository URL from git configuration when possible.

For example:

```bash
git remote -v
```

Normalize GitHub SSH URLs such as:

```text
git@github.com:user/project.git
```

to:

```text
https://github.com/user/project
```

Store it as:

```yaml
links:
  repository: "https://github.com/user/project"
```

---

## Primary Links

Use `primary` for important user-facing destinations such as:

* live application
* documentation site
* package page
* releases
* major project documentation

Format:

```yaml
primary:
  - name: "Live Demo"
    type: "demo"
    url: "https://..."

  - name: "Documentation"
    type: "documentation"
    url: "https://..."
```

Only add useful links that actually exist.

---

## Dashboards

Use `dashboards` for engineering/project-health resources.

Examples include:

* SonarQube
* CI/CD pipelines
* code coverage
* benchmark results
* performance reports
* static analysis
* generated API documentation
* release dashboards

Format:

```yaml
dashboards:
  - name: "SonarQube"
    type: "quality"
    url: "https://..."

  - name: "CI Pipeline"
    type: "ci"
    url: "https://..."

  - name: "Code Coverage"
    type: "coverage"
    url: "https://..."
```

Use descriptive `type` values such as:

```text
quality
ci
coverage
performance
analysis
documentation
releases
```

The schema should remain extensible; other sensible types may be used when appropriate.

---

# 9. Public-Link Safety

Only include links that are:

* publicly accessible
* appropriate for a public résumé
* free of sensitive company or customer information

Never include:

* internal company URLs
* VPN-only systems
* private Jenkins instances
* internal SonarQube servers
* proprietary dashboards
* credentials
* tokens
* private infrastructure details
* classified or controlled information

If a potentially useful dashboard exists but is not appropriate for public exposure, omit it.

---

# 10. Preview Image

The standard preview location is:

```text
.portfolio/preview.png
```

Search the repository for an appropriate existing:

* application screenshot
* game screenshot
* generated output
* visualization
* architecture image

Prefer a real project image.

Do not create a misleading or meaningless preview.

If no suitable preview is available and image generation is outside your available capabilities:

* do not create a fake placeholder
* leave the preview file absent
* report that a preview image still needs to be created

If `preview.png` does not exist, remove or omit the `media.preview` field rather than pointing to a missing asset.

---

# 11. Optional Rich Content

For projects that benefit from deeper explanation, optionally create:

```text
.portfolio/overview.md
```

Suitable sections include:

```markdown
## Overview

## Motivation

## Key Engineering Challenges

## Architecture

## Implementation

## Testing
```

Use this for portfolio-oriented explanation, not duplication of the README.

For architecture-heavy projects, optionally create:

```text
.portfolio/architecture.md
```

Describe:

* major components
* data flow
* interfaces
* build flow
* important design decisions

If a useful real diagram already exists, it may be copied into:

```text
.portfolio/architecture.png
```

---

# 12. Demo Configuration

Every project must contain:

```yaml
demo:
  type: "..."
```

Supported baseline demo types:

```text
none
wasm
web
external
```

## No Demo

```yaml
demo:
  type: "none"
```

Use this unless a working demo exists.

---

## WebAssembly

For a browser-compatible WebAssembly project:

```yaml
demo:
  type: "wasm"
  build_command: "wasm-pack build --release --target web"
  output_directory: "pkg"
```

Use only commands and paths that match the repository.

---

## Static Web Demo

```yaml
demo:
  type: "web"
  entrypoint: "demo/index.html"
```

---

## External Demo

```yaml
demo:
  type: "external"
  url: "https://..."
```

Do not mark a project as having a demo unless the demo actually works.

---

# 13. Existing `.portfolio` Content

If `.portfolio` already exists:

1. Inspect it before making changes.
2. Preserve accurate manually authored content.
3. Correct outdated or invalid metadata.
4. Improve incomplete fields where repository evidence supports doing so.
5. Maintain compatibility with `schema_version: 1`.

Do not replace good human-authored descriptions with weaker autogenerated text.

---

# 14. Security and Publication Review

Before finalizing the portfolio content, ensure it contains no:

* credentials
* API keys
* tokens
* internal hostnames
* proprietary source details
* private customer data
* classified information
* private company infrastructure details

Only include information suitable for publication on a public website.

---

# 15. Validate the Result

Before finishing, verify:

```text
[ ] .portfolio/project.yaml exists
[ ] YAML parses successfully
[ ] schema_version is 1
[ ] project.name exists
[ ] project.slug exists
[ ] tagline exists
[ ] summary exists
[ ] description exists
[ ] status uses an allowed value
[ ] role is reasonable
[ ] technologies are supported by repository evidence
[ ] categories are meaningful
[ ] 3–6 useful highlights exist
[ ] repository URL is correct
[ ] all primary links are valid and public
[ ] all dashboard links are valid and public
[ ] demo.type is valid
[ ] preview path references a real file, if present
[ ] no unsupported claims were invented
[ ] no sensitive information was exposed
```

---

# 16. Expected Minimum Result

A normal repository should end with something similar to:

```text
<repository>/
├── ...
└── .portfolio/
    ├── project.yaml
    └── preview.png
```

If no meaningful preview is available:

```text
<repository>/
├── ...
└── .portfolio/
    └── project.yaml
```

A richer project may contain:

```text
.portfolio/
├── project.yaml
├── preview.png
├── overview.md
├── architecture.md
├── architecture.png
└── screenshots/
```

Only create files that provide real value.

---

# 17. Completion Report

After implementing the portfolio metadata, report:

1. Files created or modified
2. Project name and slug
3. Status and role
4. Technologies identified
5. Categories selected
6. Engineering highlights created
7. Repository/primary/dashboard links discovered
8. Demo type
9. Preview image status
10. Any values that could not be reliably determined
11. Any recommended manual improvements

If you have write access to the repository, create or update the `.portfolio` files directly rather than only showing suggested contents.

# The Suhba Library — Claude Code Context

> Read this file fully before starting any task. Check PROGRESS.md before writing code.

## Key Documents

@docs/PRD.md
@docs/PROGRESS.md

---

## Project Overview

A static digital archive of Islamic spiritual discourses (suhbas). Built as a Digital Waqf — zero-bloat, fully automated, no runtime server. Hosted at `suhbalibrary.org` via Cloudflare Pages.

- **Repo:** `project-ghuraba/suhba-library` (Public)
- **Live URL:** `https://suhba-library.pages.dev/` (canonical domain pending — see Open Decision below)
- **PRD version:** v4.0 (6 May 2026)

---

## Open Decision — BLOCKING

**Canonical URL: `suhbalibrary.org` (apex). This has been confirmed by user.

## Tech Stack

| Component | Technology | Key Detail |
|---|---|---|
| Framework | **Astro 5.x** | Static output only; Content Collections with explicit glob loader |
| Styling | **Tailwind CSS v4** | CSS-first; `@theme` in `global.css`; NO `tailwind.config.mjs` |
| Package manager | **pnpm 9** | ONLY pnpm. Never npm or yarn. Always `--frozen-lockfile` in CI |
| Node.js | **22 LTS** | Minimum `22.0.0` — required by Wrangler 4.x |
| Search | **Pagefind** | Post-build static indexing; runs as postbuild hook |
| Hosting | **Cloudflare Pages** (Direct Upload) | Deployed via `cloudflare/wrangler-action@v3` only |
| Asset storage | **Cloudflare R2** | Bucket: `suhba-media`; public domain: `r2.suhbalibrary.org` |
| Analytics | **Cloudflare Web Analytics** | Automatic (edge-injected beacon) — no code changes needed |

---

## Tailwind v4 — Critical Differences

The project started as Tailwind v3 and was upgraded to v4. Watch for v3/v4 mismatches in existing files.

**v4 rules (non-negotiable):**
- `tailwind.config.mjs` does NOT exist and must NOT be created
- All design tokens live in `src/styles/global.css` under `@theme { ... }`
- Astro config uses `@tailwindcss/vite` Vite plugin — NOT `@astrojs/tailwind`
- Class naming and some utilities differ from v3 — check v4 docs before adding utilities

**Common v3→v4 mismatch symptoms to look for:**
- `@astrojs/tailwind` import in `astro.config.mjs` (wrong — must be `@tailwindcss/vite`)
- A `tailwind.config.mjs` or `tailwind.config.js` file existing in the repo (delete it)
- `@apply` with v3-only utility names
- `tailwind.config` being referenced anywhere in source files

---

## Astro 5 API — Critical Differences from v4

| Old (Astro 4) | Correct (Astro 5) |
|---|---|
| Content auto-discovered from `src/content/` | Requires `loader: glob(...)` in `defineCollection` in `config.ts` |
| `entry.render()` | `render(entry)` imported from `astro:content` |
| `getEntryBySlug()` | `getCollection()` + filter by `data.slug` |

---

## CI/CD Pipeline

Six sequential stages — any failure blocks all downstream stages:

```
Stage 1: validate-frontmatter  →  astro check (Zod schema)
Stage 2: check-slugs           →  scripts/check-slugs.mjs (duplicate slugs)
Stage 3: check-links           →  scripts/check-links.mjs (broken /suhba/* refs)
Stage 4: build                 →  pnpm build (astro build + pagefind postbuild)
Stage 5: lighthouse            →  lighthouserc.json thresholds (serves dist/ on port 4000)
Stage 6: deploy                →  cloudflare/wrangler-action@v3 — MAIN BRANCH ONLY
```

**Deploy stage must look like this — no other pattern is acceptable:**
```yaml
- uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    wranglerVersion: "4"
    command: pages deploy dist --project-name=suhba-library
```

- `cloudflare/pages-action` is **deprecated** — never use it
- Stages 1–5 run on all branches and PRs; Stage 6 runs only on push to `main`
- GitHub Secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (Repository secrets, not Org or Environment)

---

## Repository Structure

```
suhba-library/
  .github/workflows/deploy.yml     ← All 6 CI stages
  scripts/
    check-slugs.mjs                ← CI Stage 2
    check-links.mjs                ← CI Stage 3
  src/
    content/
      config.ts                    ← Astro 5 Content Collections + Zod schema
      discourses/                  ← All .md files
    pages/                         ← Routes
    components/
      layout/                      ← BaseLayout.astro, Header.astro, Footer.astro
      discourse/                   ← DiscourseCard.astro
      search/                      ← PagefindSearch.astro
    config/synonyms.json           ← Pagefind synonym groups (15 seeded)
    data/speakers/                 ← One .md per speaker (biography)
    styles/global.css              ← Tailwind v4 @theme + all base styles
  public/
    llms.txt                       ← AI crawler instructions [needs URL update]
    favicon.svg
  lighthouserc.json
  astro.config.mjs                 ← Uses @tailwindcss/vite, NOT @astrojs/tailwind
  package.json, tsconfig.json
```

---

## Content Schema — Frontmatter

Every discourse `.md` file in `src/content/discourses/` must have:

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | |
| `date` | Yes | YYYY-MM-DD |
| `speaker` | Yes | Array, even for single speaker |
| `location_country` | Yes | |
| `language` | Yes | BCP 47 (e.g. `"en"`, `"ar"`) |
| `slug` | Yes | `YYYY-MM-DD-short-title` — immutable once published |
| `status` | Yes | `"published"` \| `"draft"` \| `"archived"` |
| `topic` | Yes | Array |
| `date_hijri` | No | Computed from `date` if absent |
| `location_city`, `location_venue` | No | |
| `youtube_url`, `image`, `quotes_verified` | No | |

- Slugs are immutable after publication — never rename them
- `speaker`, `topic`, `quotes_verified` are always arrays
- Images always point to `r2.suhbalibrary.org/...`
- Only `status: "published"` entries appear on the live site

---

## Design System

All tokens are defined in `src/styles/global.css`. Do not hardcode colours inline.

| Token | Value |
|---|---|
| Background light | `#FAF8F5` |
| Background dark | `#0F0E0C` |
| Primary accent | `#2C5F4A` (deep forest green) |
| Secondary accent | `#B8956A` (warm sand/gold) |
| Text primary | `#1C1917` |
| Text secondary | `#6B6560` |

Typography: system sans-serif for UI; Georgia/serif for discourse body. Minimum 18px body text, 70ch max line length for prose.

---

## Hard Rules — Never Violate

- **Never use `npm` or `yarn`** — pnpm only
- **Never create `tailwind.config.mjs`** — Tailwind v4 is CSS-first
- **Never use `cloudflare/pages-action`** — use `cloudflare/wrangler-action@v3`
- **Never use `@astrojs/tailwind`** — use `@tailwindcss/vite` in Vite plugins
- **Never use `entry.render()`** — use `render(entry)` from `astro:content` (Astro 5)
- **Never use `getEntryBySlug()`** — use `getCollection()` + filter
- **Never add server-side rendering** — output is `static` only
- **Never add client-side frameworks** — Astro islands only where strictly necessary
- **Never commit a discourse with a slug that already exists**
- **No external fonts at runtime** — system font stack only
- **Max JS per route: 50 KB compressed** (Lighthouse CI will fail)
- **WCAG 2.1 AA is a hard requirement** — not a stretch goal
- **Do not modify `.github/workflows/deploy.yml` without explaining the change**

---

## Performance Targets (Lighthouse CI enforced — build fails if missed)

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 90 |
| LCP | < 1.5s |
| CLS | < 0.05 |
| Total JS (compressed) | < 80 KB per route |
| Total HTML per page | < 100 KB |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys on merge; protected; requires PR + CI pass |
| `dev` | Integration branch; requires CI pass |
| `content/*` | Short-lived content additions — merge to dev |
| `feature/*` | Short-lived features — merge to dev |

> Branch protection rules on `main` and `dev` must be set AFTER the first push to `main` (status check names only appear in the search field after they've run once).

---

## Workstream Status Summary

- **Workstream A:** ✅ Complete (scaffold built)
- **Workstream B:** ⛔ Blocked on canonical URL decision — do not start until resolved
- **Workstreams C–G:** 🔲 Not started

Current priority when unblocked: **Workstream B** — URL find-and-replace → first deploy → branch protection → content pipeline.

---

## Known Issues to Investigate

- Tailwind v3 → v4 upgrade may have left mismatches in existing component files. When touching any component, check for:
  - `@astrojs/tailwind` references
  - `tailwind.config.mjs` existence
  - v3-only utility classes or `@apply` patterns
  - Inline styles that should be tokens
- CI pipeline errors on GitHub — diagnose by reading the failing stage output and cross-referencing the pipeline spec above

---

## What's Out of Scope for v1 (Do Not Implement)

User accounts, AI enrichment, semantic/vector search, Google Analytics/GA4, PDF export, newsletter, multi-language UI, audio/podcast feed, JSON API endpoints, comments, A/B testing.

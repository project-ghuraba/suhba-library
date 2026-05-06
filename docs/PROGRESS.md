# The Suhba Library — Build Progress Tracker

| | |
|---|---|
| **Repository** | `project-ghuraba/suhba-library` |
| **Live domain** | `suhbalibrary.org` (canonical URL pending decision — see below) |
| **Last updated** | 6 May 2026 |
| **PRD version** | v4.0 (6 May 2026) — supersedes v3.0 + Addendums A.1 & A.2 |

---

## How to read this tracker

- ✅ **Done** — completed and committed to scaffold or confirmed live
- 🔧 **Manual** — must be done by repo owner in a browser/dashboard (cannot be scripted)
- 🔲 **Pending** — not yet started
- 🚧 **Partial** — scaffolded as placeholder; full implementation deferred
- ⛔ **Blocked** — cannot proceed until a dependency is resolved

---

## ⚠️ Open Decisions — Must Resolve Before Workstream B

| Decision | Options | Impact |
|---|---|---|
| **Canonical URL** | `suhbalibrary.org` (apex) or `www.suhbalibrary.org` | Gates all codebase URL updates, OG tags, RSS, llms.txt, JSON-LD, and custom domain setup in Cloudflare |

---

## Workstream A — Repository & Pipeline Setup

### A1. Technical decisions
| Task | Status | Notes |
|---|---|---|
| Node.js version | ✅ | Node 22 LTS |
| Package manager | ✅ | pnpm 9 |
| Astro version | ✅ | Astro 5.x |
| Tailwind version | ✅ | Tailwind v4 — CSS-first; no `tailwind.config.mjs` |

### A2. Project scaffold — config files
| File | Status | Notes |
|---|---|---|
| `package.json` | ✅ | All deps declared; pnpm scripts wired |
| `astro.config.mjs` | ✅ | Static output; Tailwind v4 Vite plugin; R2 remote patterns |
| `tsconfig.json` | ✅ | Strict; path aliases configured |
| `.gitignore` | ✅ | |
| `.env.example` | ✅ | |
| `lighthouserc.json` | ✅ | All PRD thresholds encoded |
| `README.md` | ✅ | Setup, branch strategy, secrets, adding discourses |

### A3. Styles & design system
| File | Status | Notes |
|---|---|---|
| `src/styles/global.css` | ✅ | Tailwind v4 `@theme`; all PRD colour tokens; prose; dark mode; RTL; print |

### A4. Content schema
| File | Status | Notes |
|---|---|---|
| `src/content/config.ts` | ✅ | Astro 5 glob loader; full Zod schema; all PRD fields; NFC normalisation |
| Sample discourse `.md` | ✅ | `1994-05-12-reality-of-sincerity-lefke.md` — full frontmatter + body |

### A5. Layout components
| File | Status | Notes |
|---|---|---|
| `BaseLayout.astro` | ✅ | OG tags; JSON-LD slot; dark mode init; `__CF_ANALYTICS_TOKEN__` placeholder (remove in Workstream B) |
| `Header.astro` | ✅ | Mobile drawer; dark mode toggle; font size control; WCAG AA |
| `Footer.astro` | ✅ | RSS + llms.txt links |

### A6. Shared components
| File | Status | Notes |
|---|---|---|
| `DiscourseCard.astro` | ✅ | Used in all list views |
| `PagefindSearch.astro` | ✅ | Pagefind island; graceful dev-mode fallback |

### A7. Pages
| Route | File | Status | Notes |
|---|---|---|---|
| `/` | `index.astro` | ✅ | WotD (seeded PRNG); random quote; Latest Suhbas; On This Day; search bar |
| `/search` | `search.astro` | 🚧 | Pagefind wired; filter panel placeholder — full impl in Workstream C |
| `/suhba/[slug]` | `suhba/[slug].astro` | ✅ | Hero image, badges, YouTube btn, share bar, topics, related |
| `/topics` | `topics/index.astro` | ✅ | A–Z / Most Discourses toggle; client-side sort |
| `/topics/[topic]` | `topics/[topic].astro` | ✅ | Breadcrumb; filtered list; empty state |
| `/speakers` | `speakers/index.astro` | ✅ | Grid; discourse count; initials avatar |
| `/speakers/[speaker]` | `speakers/[speaker].astro` | ✅ | Bio; quotes; discourse list; graceful no-bio fallback |
| `/about` | `about.astro` | ✅ | Mission; how it works; contribute; feeds |
| `/rss.xml` | `rss.xml.ts` | ✅ | Full RSS 2.0 — needs URL update in Workstream B |
| `/llms.txt` | `public/llms.txt` | ✅ | AI crawler instructions — needs URL update in Workstream B |

### A8. Static assets
| File | Status | Notes |
|---|---|---|
| `public/favicon.svg` | ✅ | Minimal SVG; brand green |

### A9. CI validation scripts
| File | Status | Notes |
|---|---|---|
| `scripts/check-slugs.mjs` | ✅ | Stage 2: duplicate slug detection |
| `scripts/check-links.mjs` | ✅ | Stage 3: broken `/suhba/*` cross-reference detection |

### A10. CI/CD pipeline
| File | Status | Notes |
|---|---|---|
| `.github/workflows/deploy.yml` | ✅ | All 6 stages; deploy uses `cloudflare/wrangler-action@v3` with `wranglerVersion: "4"` |
| `.github/CODEOWNERS` | ✅ | |

### A11. Config data
| File | Status | Notes |
|---|---|---|
| `src/config/synonyms.json` | ✅ | 15 synonym groups seeded |

### A12. One-time manual infrastructure setup
| Task | Status | Notes |
|---|---|---|
| Purchase domain `suhbalibrary.org` | ✅ | |
| Add domain to Cloudflare / configure DNS | ✅ | |
| Create GitHub org `project-ghuraba` | ✅ | |
| Create repo `project-ghuraba/suhba-library` (Public) | ✅ | |
| Authorise Cloudflare access to GitHub org | ✅ | Via GitHub OAuth installation |
| Create Cloudflare Pages project via Wrangler CLI | ✅ | `npx wrangler pages project create suhba-library` |
| Create Cloudflare User API token (Pages: Edit) | ✅ | |
| Add `CLOUDFLARE_API_TOKEN` to GitHub Repository secrets | ✅ | |
| Add `CLOUDFLARE_ACCOUNT_ID` to GitHub Repository secrets | ✅ | |
| Set up Cloudflare Web Analytics | ✅ | Automatic setup; no manual token needed |
| Enable R2 on Cloudflare account | ✅ | |
| Create R2 bucket `suhba-media` | ✅ | |
| Enable public access on R2 bucket | ✅ | |
| Set R2 custom domain `r2.suhbalibrary.org` | ✅ | |
| Upload default OG image `og-default.jpg` to R2 | ✅ | |
| **Decide canonical URL** | ⛔ | **Blocking all below** |
| Link custom domain to Cloudflare Pages project | 🔧 | Blocked on canonical URL decision |
| Push scaffold to `main` | 🔧 | Blocked on canonical URL decision (URL updates needed first) |
| Create `dev` branch | 🔧 | After initial push to `main` |
| Set branch protection rules on `main` | 🔧 | After repo has commits; see Workstream B next steps |
| Set branch protection rules on `dev` | 🔧 | After `dev` branch created |

### A13. Documentation
| File | Status | Notes |
|---|---|---|
| `PRD v4.0` | ✅ | This document consolidates v3.0 + Addendums A.1 + A.2 |
| `PROGRESS.md` (this file) | ✅ | |

---

## Workstream B — First Deploy & Codebase Cleanup

> Blocked on canonical URL decision. Once unblocked, complete in this order.

### B0. Pre-deploy codebase updates (canonical URL fix)
| Task | Status | Notes |
|---|---|---|
| Decide canonical URL (apex vs www) | ⛔ | Must be done first |
| Global find-and-replace `library.suhba.org` → confirmed URL | 🔲 | Affects: llms.txt, BaseLayout.astro, rss.xml.ts, README.md |
| Replace `r2.suhba.org` → `r2.suhbalibrary.org` | 🔲 | In any hardcoded component URLs |
| Remove `__CF_ANALYTICS_TOKEN__` placeholder from `BaseLayout.astro` | 🔲 | Cloudflare injects beacon automatically — placeholder is not needed |

### B1. Initial deployment
| Task | Status | Notes |
|---|---|---|
| Push scaffold (with URL fixes) to `main` | 🔲 | First push; CI pipeline will run |
| Verify all 6 CI stages pass | 🔲 | Check GitHub Actions run |
| Link custom domain in Cloudflare Pages dashboard | 🔲 | Workers & Pages → suhba-library → Custom domains → Set up a domain |
| Confirm live site accessible at canonical URL | 🔲 | |

### B2. Branch protection (set up after first push)
| Task | Status | Notes |
|---|---|---|
| Set branch protection on `main` | 🔲 | Settings → Branches → Add branch protection rule. See detail below. |
| Set branch protection on `dev` | 🔲 | Status checks only — no PR required |

**`main` branch protection settings:**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
- Required checks: `Stage 1 — Frontmatter Validation`, `Stage 2 — Duplicate Slug Detection`, `Stage 3 — Broken Internal Link Check`, `Stage 4 — Astro Static Build`, `Stage 5 — Lighthouse CI`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

> **Note:** Status check names only appear in the search field after they have run at least once. Push to `main` first (before adding branch protection), let CI run, then add the protection rules and search for the check names.

**`dev` branch protection settings:**
- Branch name pattern: `dev`
- ✅ Require status checks to pass before merging
- Same required checks as `main`

### B3. Content pipeline & JSON indexes
| Task | Status | Notes |
|---|---|---|
| Speaker biography Markdown files (seeded) | 🔲 | `src/data/speakers/*.md` |
| Additional sample discourse files | 🔲 | For realistic search/filter testing |
| Precomputed JSON indexes (`/indexes/*.json`) | 🔲 | by-topic, by-year, by-speaker, by-country, quotes |
| Index generation Astro integration | 🔲 | Build-time script producing static JSON |
| `hijri-js` build-time Hijri date computation | 🔲 | Fallback when `date_hijri` absent |

---

## Workstream C — Search & Filter

> Not yet started.

| Task | Status | Notes |
|---|---|---|
| Pagefind diacritic folding configuration | 🔲 | Build-time config |
| Pagefind synonyms integration | 🔲 | Wire `src/config/synonyms.json` into Pagefind config |
| Filter panel UI (speaker, topic, language) | 🔲 | Placeholder exists in `/search` |
| Cascading location filter (country → city → venue) | 🔲 | |
| Date range filter | 🔲 | |
| Sort toggle (Relevance / Newest / Oldest) | 🔲 | |
| Empty state with suggestions | 🔲 | |
| Zero-result rate tracking via CF Analytics | 🔲 | Custom event |

---

## Workstream D — Speaker Pages (full)

> Partially complete (scaffold done in Workstream A).

| Task | Status | Notes |
|---|---|---|
| Speaker page scaffold | ✅ | Done in Workstream A |
| Speaker biography content (authored) | 🔲 | |
| Full Markdown rendering for bio body | 🚧 | Currently paragraph-split only; full MD deferred |
| Speaker portrait images in R2 | 🔲 | |

---

## Workstream E — Analytics & Tracking Events

> Not yet started.

| Task | Status | Notes |
|---|---|---|
| CF Analytics beacon live | ✅ | Automatic setup — no code change needed |
| Custom event: quote copy | 🔲 | `data-cf-event` wiring |
| Custom event: share button clicks per platform | 🔲 | |
| Custom event: YouTube click | 🔲 | `data-cf-event="youtube_click"` attribute exists |
| Custom event: search query log | 🔲 | |
| Zero-result search rate tracking | 🔲 | |
| Scroll depth tracking | 🔲 | |

---

## Workstream F — Performance & Accessibility Audit

> Not yet started. Should run after first real content batch.

| Task | Status | Notes |
|---|---|---|
| First Lighthouse CI run against live site | 🔲 | |
| WCAG 2.1 AA audit | 🔲 | |
| Mobile layout QA (375px baseline) | 🔲 | |
| Print stylesheet QA | 🔲 | |
| RTL layout QA (Arabic discourse) | 🔲 | |
| Cross-browser test (Safari, Firefox, Chrome) | 🔲 | |

---

## Workstream G — v2 Features (future)

> All deferred per PRD Section 13.

| Feature | Status |
|---|---|
| AI enrichment pipeline | 🔲 |
| Semantic / vector search | 🔲 |
| JSON API endpoints | 🔲 |
| Google Analytics (GA4) | 🔲 |
| PDF export | 🔲 |
| Newsletter / email notifications | 🔲 |
| Multi-language UI | 🔲 |
| Audio / podcast feed | 🔲 |
| User accounts / saved bookmarks | 🔲 |

---

*This tracker is updated at the end of each workstream.*

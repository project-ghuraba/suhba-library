# The Suhba Library — Build Progress Tracker

| | |
|---|---|
| **Repository** | `project-ghuraba/suhba-library` |
| **Live domain** | `suhbalibrary.org` |
| **Last updated** | 1 May 2026 |
| **PRD version** | v3.0 + Addendum A.1 |

---

## How to read this tracker

- ✅ **Done** — completed and committed to scaffold
- 🔧 **Manual** — must be done by repo owner in a browser/dashboard (cannot be scripted)
- 🔲 **Pending** — not yet started
- 🚧 **Partial** — scaffolded as placeholder; full implementation deferred

---

## Workstream A — Repository & Pipeline Setup

### A1. Technical decisions
| Task | Status | Notes |
|---|---|---|
| Node.js version selected | ✅ | Node 22 LTS |
| Package manager selected | ✅ | pnpm 9 |
| Astro version selected | ✅ | Astro 5.x |
| Tailwind version selected | ✅ | Tailwind v4 (CSS-first config) |

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
| `BaseLayout.astro` | ✅ | OG tags; JSON-LD slot; dark mode init; Cloudflare Analytics |
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
| `/search` | `search.astro` | 🚧 | Pagefind wired; filter panel placeholder for later workstream |
| `/suhba/[slug]` | `suhba/[slug].astro` | ✅ | Full PRD spec: hero image, badges, YouTube btn, share bar, topics, related |
| `/topics` | `topics/index.astro` | ✅ | A–Z / Most Discourses toggle; client-side sort |
| `/topics/[topic]` | `topics/[topic].astro` | ✅ | Breadcrumb; filtered list; empty state |
| `/speakers` | `speakers/index.astro` | ✅ | Grid; discourse count; initials avatar |
| `/speakers/[speaker]` | `speakers/[speaker].astro` | ✅ | Bio; quotes; discourse list; graceful no-bio fallback |
| `/about` | `about.astro` | ✅ | Mission; how it works; contribute; feeds |
| `/rss.xml` | `rss.xml.ts` | ✅ | Full RSS 2.0 with categories, enclosures |
| `/llms.txt` | `public/llms.txt` | ✅ | AI crawler instructions; permissions; quality signals |

### A8. Static assets
| File | Status | Notes |
|---|---|---|
| `public/favicon.svg` | ✅ | Minimal SVG; brand green |

### A9. CI validation scripts
| File | Status | Notes |
|---|---|---|
| `scripts/check-slugs.mjs` | ✅ | Stage 2: duplicate slug detection; clear error output |
| `scripts/check-links.mjs` | ✅ | Stage 3: broken `/suhba/*` cross-reference detection |

### A10. CI/CD pipeline
| File | Status | Notes |
|---|---|---|
| `.github/workflows/deploy.yml` | ✅ | All 6 stages; concurrency control; deploy guard |
| `.github/CODEOWNERS` | ✅ | |

### A11. Config data
| File | Status | Notes |
|---|---|---|
| `src/config/synonyms.json` | ✅ | 15 synonym groups seeded |

### A12. One-time manual setup (owner action required)
| Task | Status | Notes |
|---|---|---|
| Create GitHub org `project-ghuraba` | 🔧 | [github.com/organizations/new](https://github.com/organizations/new) |
| Create repo `project-ghuraba/suhba-library` (Public) | 🔧 | |
| Push scaffold to `main` | 🔧 | Initial commit |
| Create `dev` branch | 🔧 | `git checkout -b dev && git push -u origin dev` |
| Set branch protection rules on `main` | 🔧 | See Addendum A.1 §7.2 |
| Set branch protection rules on `dev` | 🔧 | See Addendum A.1 §7.2 |
| Add GitHub Secret: `CLOUDFLARE_API_TOKEN` | 🔧 | Settings → Secrets → Actions |
| Add GitHub Secret: `CLOUDFLARE_ACCOUNT_ID` | 🔧 | Settings → Secrets → Actions |
| Create Cloudflare Pages project `suhba-library` | 🔧 | See Addendum A.1 §7.4 |
| Link custom domain `suhbalibrary.org` | 🔧 | See Addendum A.1 §7.5 |
| Set up Cloudflare Web Analytics | 🔧 | See Addendum A.1 §7.6 |
| Insert CF Analytics token into `BaseLayout.astro` | 🔧 | Replace `__CF_ANALYTICS_TOKEN__` |
| Create Cloudflare R2 bucket `suhba-media` | 🔧 | See Addendum A.1 §7.7 |
| Upload default OG image `og-default.jpg` to R2 | 🔧 | |
| Set R2 public domain `r2.suhbalibrary.org` | 🔧 | |

### A13. Documentation
| File | Status | Notes |
|---|---|---|
| `docs/prd-addendum-workstream-a.md` | ✅ | All decisions, deviations, manual setup steps |
| `PROGRESS.md` (this file) | ✅ | |

---

## Workstream B — Content Pipeline & JSON Indexes

> Not yet started.

| Task | Status | Notes |
|---|---|---|
| Precomputed JSON indexes (`/indexes/*.json`) | 🔲 | by-topic, by-year, by-speaker, by-country, quotes |
| `hijri-js` build-time Hijri date computation | 🔲 | Fallback when `date_hijri` absent |
| Speaker biography Markdown files (seeded) | 🔲 | `src/data/speakers/*.md` |
| Additional sample discourse files | 🔲 | For realistic search/filter testing |
| Index generation Astro integration | 🔲 | Build-time script producing static JSON |

---

## Workstream C — Search & Filter

> Not yet started.

| Task | Status | Notes |
|---|---|---|
| Pagefind diacritic folding configuration | 🔲 | Build-time config |
| Pagefind synonyms integration | 🔲 | Wire `src/config/synonyms.json` into Pagefind config |
| Filter panel UI (speaker, topic, language) | 🔲 | Currently a placeholder in `/search` |
| Cascading location filter (country → city → venue) | 🔲 | |
| Date range filter (year / month+year / full date) | 🔲 | |
| Sort toggle (Relevance / Newest / Oldest) | 🔲 | |
| Empty state with suggestions | 🔲 | |
| Zero-result rate tracking via CF Analytics | 🔲 | Custom event |

---

## Workstream D — Speaker Pages (full)

> Partially complete (scaffold done). Full implementation pending.

| Task | Status | Notes |
|---|---|---|
| Speaker page scaffold | ✅ | Done in Workstream A |
| Speaker biography content (authored) | 🔲 | Needs real or placeholder bios |
| Full Markdown rendering for bio body | 🚧 | Currently: paragraph-split only; full MD deferred |
| Speaker portrait images in R2 | 🔲 | |
| Lineage / silsila field | 🔲 | Not in current schema; add in v2 if needed |

---

## Workstream E — Analytics & Tracking Events

> Not yet started.

| Task | Status | Notes |
|---|---|---|
| CF Analytics token live | 🔧 | Manual post-deployment step |
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
| AI enrichment pipeline (quote extraction, `content_hash`) | 🔲 |
| Semantic / vector search | 🔲 |
| JSON API endpoints (`/api/discourses.json`) | 🔲 |
| Google Analytics (GA4) | 🔲 |
| PDF export | 🔲 |
| Newsletter / email notifications | 🔲 |
| Multi-language UI | 🔲 |
| Audio / podcast feed | 🔲 |
| User accounts / saved bookmarks | 🔲 |

---

*This tracker is updated at the end of each workstream.*

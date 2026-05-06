# THE SUHBA LIBRARY
## Product Requirements Document

| | |
|---|---|
| **Version** | 4.0 |
| **Status** | Approved — Build Ready |
| **Scope** | v1 Public Launch |
| **Domain** | suhbalibrary.org |
| **Date** | 6 May 2026 |
| **Supersedes** | PRD v3.0 (29 Apr 2026), Addendum A.1 (1 May 2026), Addendum A.2 (6 May 2026) |

> This document supersedes all prior versions and all addendums. It is the single source of truth for all development from Workstream B onwards.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Target Audience](#2-target-audience)
3. [Technical Stack](#3-technical-stack)
4. [Repository & Infrastructure](#4-repository--infrastructure)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Data Architecture — Frontmatter Schema](#6-data-architecture--frontmatter-schema)
7. [Functional Requirements](#7-functional-requirements)
8. [Page Specifications](#8-page-specifications)
9. [UI / UX Requirements](#9-ui--ux-requirements)
10. [Analytics & Performance Monitoring](#10-analytics--performance-monitoring)
11. [Success Metrics](#11-success-metrics)
12. [Future-Proofing & AI Readiness](#12-future-proofing--ai-readiness)
13. [Out of Scope — v1](#13-out-of-scope--v1)
14. [Infrastructure Decisions Log](#14-infrastructure-decisions-log)

---

## 1. Project Overview

### 1.1 Mission

To preserve and organise thousands of spiritual discourses in a lightning-fast, searchable digital archive — built as a Digital Waqf (endowment) that serves readers, seekers, and AI systems alike, hosted at `suhbalibrary.org`.

### 1.2 Domain & Naming

The project is hosted at `suhbalibrary.org`, purchased via Cloudflare Registrar. DNS is managed entirely within Cloudflare, co-located with the Pages deployment.

| URL | Purpose |
|---|---|
| `suhbalibrary.org` | The Suhba Library — this project (v1). Canonical URL — **decision pending apex vs www; see Section 14.1** |
| `www.suhbalibrary.org` | Alternative — may redirect to apex or serve as canonical |
| `app.suhbalibrary.org` | Reserved for future application |
| `api.suhbalibrary.org` | Reserved for future API (v2+) |
| `r2.suhbalibrary.org` | Cloudflare R2 media bucket (public CDN) |

> **Action required before Workstream B:** Decide whether the canonical URL is `suhbalibrary.org` (apex) or `www.suhbalibrary.org`. This decision gates all codebase URL updates, OG tags, RSS feed, `llms.txt`, and JSON-LD structured data.

### 1.3 Core Philosophy

Zero-bloat architecture: maximum speed, total data ownership, and automated maintenance. The site must be sustainable without ongoing developer intervention — all maintenance paths must be automatable.

### 1.4 Guiding Constraints

The following constraints are binding across all technical and design decisions:

- Maximum JavaScript per route: < 50 KB compressed
- Maximum initial HTML payload: < 100 KB
- No client-side framework hydration except Astro islands where strictly necessary
- No runtime database or server-side rendering — static output only
- No external fonts loaded at runtime — system font stack only
- All content owned outright — no dependency on third-party CMS or hosting lock-in
- AI metadata pipeline deferred entirely to v2 — all tags and metadata are human-authored

---

## 2. Target Audience

| User Type | Description & Access Pattern |
|---|---|
| **The Seeker** | Students seeking specific spiritual guidance. Arrives via search. Needs reliable full-text search, faceted filtering, and stable bookmarkable URLs. |
| **The Casual Reader** | Community members seeking daily inspiration. Arrives via home page or shared link. Needs ambient discovery — Wisdom of the Day, latest discourses, On This Day. |
| **The AI Agent** | LLMs and RAG systems using the archive as a grounded knowledge source. Needs machine-readable structure, canonical URLs, `llms.txt`, JSON-LD, and RSS feed. |

---

## 3. Technical Stack

| Component | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Astro | 5.x latest stable | Content Collections + island architecture; static output by default |
| Styling | Tailwind CSS | 4.x | CSS-first config via `@theme` directive; no `tailwind.config.mjs`; Vite plugin |
| Search | Pagefind | Latest | Post-build static indexing; no server required; diacritic folding built-in |
| Hosting / CDN | Cloudflare Pages | — | Global edge delivery; Direct Upload project; free tier sufficient for v1 |
| DNS / Domain | Cloudflare (suhbalibrary.org) | — | At-cost domain; co-located DNS management |
| Asset Storage | Cloudflare R2 | — | Bucket: `suhba-media`; public domain: `r2.suhbalibrary.org` |
| CI/CD | GitHub Actions | — | Validation pipeline + build + deploy via `cloudflare/wrangler-action@v3` |
| Analytics | Cloudflare Web Analytics | — | Automatic setup (domain on same account); cookieless; no consent banner |
| Package Manager | pnpm | 9.x | Strict dependency resolution; deterministic lockfile; Astro 5 compatible |
| Node.js | Node 22 LTS | ≥ 22.0.0 | Current LTS; required by Wrangler 4.x; matches Cloudflare Pages runtime |
| Hijri Conversion | hijri-js | — | Build-time only; computes Islamic date fallback if `date_hijri` absent |

### 3.1 Key Tailwind v4 Differences from PRD v3

Tailwind v4 uses a fully CSS-first configuration model. There is **no** `tailwind.config.mjs`. All design tokens live in `src/styles/global.css` under the `@theme` block. The Vite plugin (`@tailwindcss/vite`) replaces the old Astro integration (`@astrojs/tailwind`).

### 3.2 Key Astro 5 API Differences

| Astro 4 | Astro 5 |
|---|---|
| Content auto-discovered from `src/content/` | Requires explicit `loader: glob(...)` in `defineCollection` |
| `entry.render()` | `render(entry)` imported from `astro:content` |
| `getEntryBySlug()` | Use `getCollection()` + filter by `data.slug` |

---

## 4. Repository & Infrastructure

### 4.1 GitHub Organisation & Repository

| | |
|---|---|
| **Organisation** | `project-ghuraba` |
| **Repository** | `project-ghuraba/suhba-library` |
| **Visibility** | Public — aligns with Digital Waqf philosophy; enables free Cloudflare Pages tier |
| **Default branch** | `main` — protected; no direct push; requires PR + CI pass |

### 4.2 Branch Strategy

| Branch | Purpose | Protection |
|---|---|---|
| `main` | Production — auto-deploys to live site on merge | Require PR; require CI pass; no direct push |
| `dev` | Integration branch for batched work | Require CI pass |
| `content/*` | Short-lived branches for content additions | None — merge to dev |
| `feature/*` | Short-lived branches for new features | None — merge to dev |

### 4.3 GitHub Secrets

Stored as **Repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages via Wrangler (Stage 6) |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy to Cloudflare Pages via Wrangler (Stage 6) |

> `ANTHROPIC_API_KEY` is not required for v1. AI enrichment pipeline is deferred to v2.

### 4.4 Cloudflare Infrastructure

| Resource | Detail |
|---|---|
| Pages project name | `suhba-library` |
| Pages default URL | `https://suhba-library.pages.dev/` |
| Pages project type | **Direct Upload** (created via Wrangler CLI) — cannot be converted to Git integration |
| API token type | User API token (Account → Cloudflare Pages → Edit) |
| R2 bucket | `suhba-media` |
| R2 public domain | `r2.suhbalibrary.org` |
| Web Analytics | Automatic setup — no token insertion needed in code; beacon injected at edge |
| Custom domain | Pending canonical URL decision (see Section 14.1) |

### 4.5 Repository Structure

```
suhba-library/
  .github/
    workflows/
      deploy.yml              ← Full CI/CD pipeline (all 6 stages)
    CODEOWNERS
  scripts/
    check-slugs.mjs           ← CI Stage 2: duplicate slug detection
    check-links.mjs           ← CI Stage 3: broken internal link check
  src/
    content/
      config.ts               ← Astro 5 Content Collections + Zod schema
      discourses/             ← All .md files (canonical source)
    pages/
      index.astro             ← Home page
      search.astro            ← Advanced search & filter
      about.astro             ← About the archive
      rss.xml.ts              ← RSS feed
      suhba/
        [slug].astro          ← Individual discourse page
      topics/
        index.astro           ← Topics index
        [topic].astro         ← Filtered list per topic
      speakers/
        index.astro           ← Speakers index
        [speaker].astro       ← Individual speaker page
    components/
      layout/
        BaseLayout.astro      ← Master layout (OG, JSON-LD, analytics)
        Header.astro          ← Responsive nav + dark mode + mobile drawer
        Footer.astro
      discourse/
        DiscourseCard.astro   ← Compact list card
      search/
        PagefindSearch.astro  ← Pagefind island (client:load)
      home/                   ← Placeholder — WisdomOfTheDay, OnThisDay (Workstream B)
    config/
      synonyms.json           ← Global Pagefind synonyms (15 groups seeded)
    data/
      speakers/               ← One .md file per speaker (biography)
    styles/
      global.css              ← Tailwind v4 @theme + all base styles + dark mode + RTL + print
  public/
    llms.txt                  ← AI crawler instructions [needs URL update]
    favicon.svg
  lighthouserc.json           ← Lighthouse CI thresholds
  .gitignore
  .env.example
  astro.config.mjs            ← No tailwind integration; uses @tailwindcss/vite
  tsconfig.json
  package.json
  README.md

  NOTE: tailwind.config.mjs does NOT exist — Tailwind v4 is CSS-first.
```

### 4.6 Permissions Model

| Role | Who | Access |
|---|---|---|
| Owner | You | Full admin |
| Maintainer | Future trusted collaborator | Can merge to `dev`, approve PRs |
| Contributor | Content editors | Can push `content/*` branches; cannot merge to `main` |

---

## 5. CI/CD Pipeline

All 6 stages run as sequential GitHub Actions jobs with `needs:` dependencies. Any failure halts all downstream stages.

```
validate-frontmatter → check-slugs → check-links → build → lighthouse → deploy
```

| Stage | Job Name | Description |
|---|---|---|
| Stage 1 | Frontmatter Validation | `astro check` validates all Content Collections entries against Zod schema in `src/content/config.ts`. Fails with file + field reference. |
| Stage 2 | Duplicate Slug Detection | `scripts/check-slugs.mjs` scans all `slug` fields; fails if any two files share a slug. |
| Stage 3 | Broken Internal Link Check | `scripts/check-links.mjs` verifies all cross-references resolve to existing slugs. |
| Stage 4 | Astro Static Build | `pnpm build` = `astro build` + `pagefind` postbuild hook. Pagefind index written to `dist/pagefind/`. Fails on type error or missing schema field. |
| Stage 5 | Lighthouse CI | Serves `dist/` on port 4000 via `serve`. Tests 4 representative URLs. Thresholds encoded in `lighthouserc.json`. |
| Stage 6 | Deploy to Cloudflare Pages | **Only runs on `push` to `main`.** Uses `cloudflare/wrangler-action@v3` (with `wranglerVersion: "4"`) and the command `pages deploy dist --project-name=suhba-library`. PRs and pushes to `dev` run Stages 1–5 only. |

### 5.1 Deploy Stage Detail

The deploy stage uses the official Cloudflare Wrangler GitHub Action. The deprecated `cloudflare/pages-action` is **not used**. The correct pattern is:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    wranglerVersion: "4"
    command: pages deploy dist --project-name=suhba-library
```

---

## 6. Data Architecture — Frontmatter Schema

Every Markdown file must conform to this schema. Fields marked **Required** will cause a build failure if absent.

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Full title of the discourse. Used in page `<title>`, OG tags, and search index. |
| `date` | date | Yes | Gregorian delivery date (YYYY-MM-DD). Used for sorting, Wisdom of the Day, year index, and Hijri fallback calculation. |
| `date_hijri` | string | No | Islamic date as plain text e.g. `"2 Dhul Qadah 1414"`. If absent, computed at build time from `date` using hijri-js with an `"est."` indicator. |
| `speaker` | string[] | Yes | Array of speaker names. Accepts multiple for panel or guest discourses. |
| `location_country` | string | Yes | Country of delivery. Level 1 location filter. |
| `location_city` | string | No | City of delivery. Level 2 — optional. |
| `location_venue` | string | No | Venue of delivery. Level 3 — optional. |
| `language` | string | Yes | BCP 47 language code (e.g. `"en"`, `"ar"`, `"tr"`). Drives `lang` attribute and RTL rendering. |
| `slug` | string | Yes | Immutable URL slug. Convention: `YYYY-MM-DD-short-title`. Duplicate detection runs in CI. Never change after publication. |
| `status` | enum | Yes | `"published"` \| `"draft"` \| `"archived"`. Only published entries are built into the public site. |
| `topic` | string[] | Yes | Array of topic tags e.g. `["Tazkiyah", "Ikhlas"]`. Human-authored. Drives topic index and related-discourse logic. |
| `transcript_quality` | enum | No | `"draft"` \| `"reviewed"` \| `"verified"`. Displayed as trust signal on page and in structured data. |
| `youtube_url` | string | No | Full YouTube URL. If absent, Watch on YouTube button does not render. |
| `image` | string | No | Absolute URL to Cloudflare R2 image (`r2.suhbalibrary.org/...`). OG image and discourse header. Falls back to global default if absent. |
| `quotes_verified` | string[] | No | Human-approved quotes. Used for Wisdom of the Day and Random Quote. Human-authored in v1. |
| `version` | integer | No | Monotonic integer incremented on substantive edits. Starts at 1. |
| `edited_at` | date | No | Date of most recent substantive edit (YYYY-MM-DD). Displays "Last updated" notice if different from `date`. |

> `speaker`, `topic`, and `quotes_verified` are arrays even when containing a single value. Forward-compatible without migration.

### 6.1 Example Frontmatter

```yaml
---
title: "The Reality of Sincerity"
date: 1994-05-12
date_hijri: "2 Dhul Qadah 1414"
speaker: ["Shaykh Nazim al-Haqqani"]
location_country: "Cyprus"
location_city: "Lefke"
location_venue: ""
language: "en"
slug: "1994-05-12-sincerity-lefke"
status: "published"
topic: ["Tazkiyah", "Ikhlas"]
transcript_quality: "verified"
version: 1
youtube_url: "https://www.youtube.com/watch?v=xxxxx"
image: "https://r2.suhbalibrary.org/1994-05-12-sincerity.jpg"
quotes_verified:
  - "The heart is a mirror — polish it with remembrance."
edited_at: ""
---
```

### 6.2 Precomputed JSON Indexes

Generated at build time. Client-side JavaScript reads these for faceted filtering without a server.

| File | Contents |
|---|---|
| `/search-index.json` | All discourses with metadata summary |
| `/indexes/by-topic.json` | `topic → [discourse slugs]` |
| `/indexes/by-year.json` | `year → [discourse slugs]` |
| `/indexes/by-speaker.json` | `speaker → [discourse slugs]` |
| `/indexes/quotes.json` | Flat array of all verified quotes + source slugs |
| `/indexes/by-country.json` | `country → [discourse slugs]` |

> These indexes are implemented in Workstream B.

---

## 7. Functional Requirements

### 7.1 Search & Indexing

Search and filtering are two separate concerns:

- **Search layer:** Pagefind, configured post-build. Handles full-text keyword search and diacritic folding.
- **Filter layer:** Precomputed static JSON indexes. Client-side JavaScript reads these to power faceted filtering.

#### 7.1.1 Diacritic Folding

Pagefind is configured with diacritic folding enabled. Users can search `"Suhba"` and find `"Ṣuḥbah"`. Build-time configuration only.

#### 7.1.2 Global Synonyms

`src/config/synonyms.json` (15 groups seeded) maps variant spellings, ingested by Pagefind at index time. Examples: `Mureed / Murid`, `Shaykh / Sheikh`, `Tasawwuf / Tasavvuf`.

#### 7.1.3 Faceted Filtering

| Filter | Behaviour |
|---|---|
| Speaker | Select from list of all speakers |
| Topic | Select from all topic tags |
| Language | Select from available language codes |
| Country | Level 1 location filter |
| City | Level 2 — cascades from Country selection |
| Venue | Level 3 — cascades from City selection |
| Date From | Optional. Accepts year only, month+year, or full date. |
| Date To | Optional. Same flexibility as Date From. |

Empty state: friendly message — never a blank page.

### 7.2 Discovery Features

| Feature | Specification |
|---|---|
| **Wisdom of the Day** | Deterministic daily quote — same for all users on a given date. Seeded PRNG using ISO date string, selecting from verified quotes index. Computed client-side in < 2 KB JS. |
| **Random Quote** | Truly random quote on each button press from verified quotes index. Index loaded once on page load; subsequent presses are instant. Home page only. |
| **Latest Suhbas** | 10 most recent published discourses on home page, ordered by date. Compact list format. |
| **On This Day** | All historical discourses delivered on today's month/day across all years. Friendly empty state if none exist. |
| **Topic Index** | Browsable at `/topics`. Toggle between A–Z and Most Discourses sort. Clicking any tag navigates to `/topics/[tag]` with breadcrumb "← All Topics". |
| **Related Suhbas** | 3 related discourses on each discourse page, based on shared topics. Precomputed at build time. |
| **Reading Time** | Estimated reading time on each discourse page. Calculated at build time from word count at 200 wpm. |

### 7.3 Content Management

- All content stored as Markdown (`.md`) files with YAML frontmatter. Files are the canonical source of truth.
- Tags and all metadata are human-authored directly in frontmatter. No AI enrichment in v1.
- Slugs are immutable once published. Convention: `YYYY-MM-DD-short-title`.
- Unicode normalisation (NFC) applied to all frontmatter strings — enforced by Zod schema.
- Speaker biographies are manually authored as individual Markdown files in `src/data/speakers/`.

---

## 8. Page Specifications

### 8.1 Route Inventory

| Route | Page |
|---|---|
| `/` | Home |
| `/suhba/[slug]` | Individual discourse |
| `/search` | Advanced search & filter |
| `/topics` | Topics index |
| `/topics/[topic]` | Filtered discourse list by topic |
| `/speakers` | Speaker biographies index |
| `/speakers/[speaker]` | Individual speaker biography page |
| `/about` | About the archive |
| `/rss.xml` | RSS feed of all published discourses |
| `/llms.txt` | AI crawler instructions |

### 8.2 Home Page

Page order (top to bottom):

1. Wordmark / hero — "The Suhba Library" + one-line tagline. No banner image.
2. Wisdom of the Day — single verified quote, date-seeded. Copy + Share icons inline.
3. Random Quote button — replaces quote above in place without page reload.
4. Search bar — prominent, with "Advanced Search →" call-to-action link below it.
5. Latest Suhbas — 10 most recent, compact list (title, date, speaker, location).
6. On This Day — discourses from this month/day across all years. Friendly empty state if none.
7. Footer.

### 8.3 Individual Discourse Page (`/suhba/[slug]`)

Page order (top to bottom):

1. Full-width header image (unique to discourse; falls back to global default).
2. Title, speaker(s), Gregorian date, Islamic date (manual or calculated with `"est."` indicator), location.
3. Reading time estimate + transcript quality badge.
4. Watch on YouTube button — rendered only if `youtube_url` is present.
5. Discourse body — continuous scroll, serif body text, max 70ch line length.
6. Share bar — WhatsApp, X/Twitter, Telegram, Facebook, LinkedIn, Email, Copy Link.
7. Topic tags — pill row.
8. Related Suhbas — 3 cards based on shared topics.

### 8.4 Advanced Search Page (`/search`)

- Search bar at top.
- Filter bar below search — horizontal chips/pills: Speaker, Topic, Language, Country, City, Venue, Date From, Date To.
- Location filters cascade: City enabled only after Country selected; Venue enabled only after City selected.
- Results: compact list — Title | Date | Speaker | Location.
- Sort toggle: Relevance / Newest / Oldest.
- Empty state: friendly message with suggested topics or recent discourses.

### 8.5 Topics Index (`/topics`)

- Toggle at top: A–Z / Most Discourses.
- Tag pills in a flowing grid.
- `/topics/[tag]` page: compact filtered discourse list with breadcrumb "← All Topics".

### 8.6 Speaker Pages

**Index (`/speakers`):** Grid of speaker cards — portrait, name, discourse count, one-line description.

**Individual (`/speakers/[speaker]`):**
- Portrait image
- Full name + dates (birth/death if applicable)
- Lineage / silsila
- Written biography (from `src/data/speakers/`)
- Notable verified quotes attributed to them
- All their discourses — compact list, sortable by date

### 8.7 About Page (`/about`)

- Mission statement — Digital Waqf explanation
- How the archive works
- How to contribute content
- RSS feed link
- Attribution and acknowledgements

---

## 9. UI / UX Requirements

### 9.1 Visual Identity

Aesthetic direction: modern/minimal with spiritual depth. Clean whitespace, editorial typography. No decorative patterns or ornamental elements.

| Role | Value | Notes |
|---|---|---|
| Background (light) | `#FAF8F5` | Warm off-white |
| Background (dark) | `#0F0E0C` | Near-black with warmth |
| Surface (light) | `#FFFFFF` | Cards, modals |
| Surface (dark) | `#1A1917` | Cards in dark mode |
| Primary accent | `#2C5F4A` | Deep forest green |
| Secondary accent | `#B8956A` | Warm sand / gold |
| Text primary | `#1C1917` | Near-black, warm |
| Text secondary | `#6B6560` | Muted metadata |
| Border / divider | `#E8E4DF` | Subtle warm dividers |

All tokens implemented as CSS custom properties in `src/styles/global.css` under the `@theme` block.

### 9.2 Typography

| | |
|---|---|
| UI / navigation | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Discourse body | `Georgia, "Times New Roman", serif` |
| Minimum body size | 18px |
| Maximum line length | 70ch — enforced via CSS `max-width` on prose columns |
| Reading Mode | Font size toggle only. Stored in `localStorage` under key `suhba-reading-size`. Values: `""` (18px), `"lg"` (20px), `"xl"` (22px). Applied via `data-reading-size` attribute on `<html>`. |

### 9.3 Navigation

| Breakpoint | Behaviour |
|---|---|
| Mobile (< 768px) | Logo left, search icon + hamburger right. Hamburger opens full-height slide-in drawer. |
| Desktop (≥ 768px) | Logo left, inline nav links (Suhbas, Topics, Speakers, About) + search icon right. Settings in a small dropdown. |
| Dark mode | Toggle stored in `localStorage` under key `suhba-theme`. Defaults to system preference (`prefers-color-scheme`). Initialisation script runs inline before first paint in `BaseLayout.astro` to prevent flash. |

### 9.4 Social Sharing

OG tags drive previews automatically on all platforms. Share bar rendered as static HTML with progressive-enhancement JS — functional without JS in degraded state.

| Platform | Implementation |
|---|---|
| WhatsApp | URL share — WhatsApp auto-renders OG image + title |
| X / Twitter | Pre-filled tweet; Twitter Card pulls OG image |
| Telegram | URL share — renders OG preview |
| Facebook | URL share — Open Graph pulls image |
| LinkedIn | URL share — pulls OG image + title |
| Email | `mailto:` with pre-filled subject (title) + body (first verified quote + URL) |
| Copy Link | Canonical URL copied to clipboard |

### 9.5 Print Support

CSS print stylesheet (`@media print`) included in v1. Hides navigation, share bar, and related discourses. No PDF export button in v1.

### 9.6 Accessibility — WCAG 2.1 AA

WCAG 2.1 AA compliance is a hard requirement, not a stretch goal.

- All interactive elements must have accessible labels and focus states.
- Images must have descriptive alt text — enforced by schema validation.
- Colour contrast ratio minimum 4.5:1 for body text; 3:1 for large text.
- Keyboard navigable throughout.
- Screen reader semantic structure: correct heading hierarchy, landmark roles, `aria-live` regions for search results.
- Touch targets minimum 44 × 44px.
- No hover-only interactions.

### 9.7 Internationalisation & RTL

- UI language: English only in v1.
- The `language` frontmatter field drives the `lang` attribute on `<html>` per page.
- Arabic discourses (`language: "ar"`) render with `dir="rtl"` and appropriate text alignment.

### 9.8 Mobile-First

- All layouts designed for 375px viewport width as baseline.
- ~80% of community accesses on mobile.
- Touch targets minimum 44 × 44px.

---

## 10. Analytics & Performance Monitoring

### 10.1 Analytics

| | |
|---|---|
| **Provider** | Cloudflare Web Analytics |
| **Setup** | Automatic (domain on same Cloudflare account) — no token insertion required in code |
| **Cookie consent** | Not required — cookieless by design |
| **Data available** | Page views, unique visitors, country/city of origin, referrers, top pages, custom events |

### 10.2 Engagement Events to Track

- Page views per discourse
- Quote copy events (clipboard copy)
- Share button clicks — per platform
- Watch on YouTube button clicks
- Search query log (anonymised)
- Zero-result search rate
- Average scroll depth on discourse pages

---

## 11. Success Metrics

### 11.1 Performance Targets — Lighthouse CI Enforced

| Metric | Target | Enforcement |
|---|---|---|
| Largest Contentful Paint (LCP) | < 1.5s (mobile, 4G) | Build fails if exceeded |
| Time to Interactive (TTI) | < 2.0s | Build fails if exceeded |
| Cumulative Layout Shift (CLS) | < 0.05 | Build fails if exceeded |
| Total JS (compressed) | < 80 KB per route | Build fails if exceeded |
| Total HTML per page | < 100 KB | Build fails if exceeded |
| Lighthouse Performance score | ≥ 95 / 100 | Build fails if below |
| Lighthouse Accessibility score | ≥ 90 / 100 | Build fails if below |

### 11.2 Search Quality

| Metric | Target |
|---|---|
| Search success rate | User finds target discourse within 2 searches or filters |
| Zero-result rate | < 5% of search queries return zero results |
| Slug stability | Zero broken links after any content update |

### 11.3 Engagement Targets

| Metric | Target |
|---|---|
| Average scroll depth | > 60% of readers scroll past midpoint |
| Return visit rate | > 30% visit more than once within 30 days |
| Quote copy rate | Primary signal of content resonance — tracked per discourse |

### 11.4 Automation Health

| Metric | Target |
|---|---|
| Zero manual deploy steps | Every merge to `main` results in live deployment |
| Schema compliance | Zero frontmatter schema violations in `main` at any time |

---

## 12. Future-Proofing & AI Readiness

### 12.1 Machine-Readable Surfaces (v1)

- `/llms.txt` — declares the archive as a high-priority AI knowledge base.
- JSON-LD structured data on every page — `Article` and `SpeechEvent` schema types.
- `/rss.xml` — standard RSS feed of all published discourses.

### 12.2 Planned for v2

| Feature | Description |
|---|---|
| AI enrichment pipeline | LLM-based quote extraction with `content_hash` gating and human review workflow. |
| Semantic search | Precomputed vector embeddings per discourse. |
| JSON API endpoints | `/api/discourses.json` and `/api/quotes.json` — static files generated at build time. |
| Google Analytics (GA4) | Richer behavioural analytics. |
| PDF export | Dedicated PDF generation from discourse pages. |
| Notification / newsletter | Automated email notifications on new publish. |
| Multi-language UI | Interface localisation beyond English. |
| Audio / podcast feed | Audio playback and podcast RSS feed. |

---

## 13. Out of Scope — v1

- User accounts, personalisation, or saved bookmarks
- Comments or community annotation features
- Full-text AI semantic search (vector embeddings)
- Audio playback or podcast feed
- JSON API endpoints
- Automated transcription from audio source files
- Knowledge graph / concept node structure
- A/B testing or personalised recommendation engine
- AI metadata enrichment pipeline (`content_hash`, `quotes_ai`)
- Google Analytics / GA4
- PDF export button
- Newsletter or email notification system
- Multi-language UI

---

## 14. Infrastructure Decisions Log

This section records all confirmed infrastructure decisions and deviations from prior PRD versions. It supersedes the content of Addendum A.1 and Addendum A.2.

### 14.1 Canonical URL — Decision Required

**Status: PENDING — must be resolved before Workstream B begins.**

The domain `suhbalibrary.org` is live in Cloudflare. The canonical URL has not yet been finalised.

| Option | URL |
|---|---|
| A | `suhbalibrary.org` (apex — clean and simple; recommended) |
| B | `www.suhbalibrary.org` |

Once decided, all of the following files in the scaffold must be updated with a global find-and-replace of `library.suhba.org` → confirmed canonical URL:

- `public/llms.txt`
- `src/components/layout/BaseLayout.astro` (OG tags, canonical, and remove `__CF_ANALYTICS_TOKEN__` placeholder)
- `src/pages/rss.xml.ts`
- `README.md`
- Any hardcoded R2 URLs: replace `r2.suhba.org` → `r2.suhbalibrary.org`

### 14.2 Domain Change

Original PRD used `suhba.org` / `library.suhba.org`. Domain was unavailable. Purchased `suhbalibrary.org` instead. All domain references updated throughout this PRD.

### 14.3 Package Manager

pnpm 9 selected (PRD v3 did not specify). `npm` and `yarn` must not be used in this project. All CI steps use `pnpm/action-setup@v4` and `--frozen-lockfile`.

### 14.4 Cloudflare Pages — Direct Upload

Pages project created via Wrangler CLI (`npx wrangler pages project create suhba-library`). This is a **Direct Upload** project and cannot be converted to Git integration. Deployments are driven entirely by the GitHub Actions CI pipeline using `cloudflare/wrangler-action@v3`.

Note: `cloudflare/pages-action` is **deprecated** — do not use it. The correct action is `cloudflare/wrangler-action@v3` with `command: pages deploy dist --project-name=suhba-library`.

### 14.5 Cloudflare API Token

A User API Token (not Account API Token) was created with Account → Cloudflare Pages → Edit permission. This is functionally identical to an Account API Token for a single-person project.

### 14.6 Cloudflare Web Analytics

Domain `suhbalibrary.org` is on the same Cloudflare account as the Pages project. Analytics were set up using the **Automatic setup** option. The beacon is injected at the edge — no manual token insertion into code is required. The `__CF_ANALYTICS_TOKEN__` placeholder in `BaseLayout.astro` must be **removed** (not replaced) during Workstream B codebase updates.

### 14.7 R2 Bucket

Bucket `suhba-media` confirmed. Public custom domain `r2.suhbalibrary.org` configured. Default OG image `og-default.jpg` uploaded to bucket root. R2 setup is complete.

### 14.8 GitHub Organisation

Organisation `project-ghuraba` created. Repository `project-ghuraba/suhba-library` is public. GitHub Secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` added as Repository secrets (not Environment or Organization secrets).

### 14.9 Node.js Requirement

Wrangler 4.x requires Node.js v22.0.0 minimum. All contributors running Wrangler commands locally must have Node 22+ installed. `.nvmrc` and `package.json` `engines` field set to `>=22.0.0`.

### 14.10 Tailwind v4 — No tailwind.config.mjs

Tailwind v4 uses CSS-first configuration. The file `tailwind.config.mjs` does not exist in this project. All configuration lives in `src/styles/global.css` under the `@theme` block. `astro.config.mjs` uses the Vite plugin (`@tailwindcss/vite`), not `@astrojs/tailwind`.

### 14.11 Custom Domain — Link to Pages Project

**Status: PENDING — blocked on canonical URL decision (§14.1).**

Once the canonical URL is decided:
1. Cloudflare Dashboard → Workers & Pages → `suhba-library` → Custom domains → Set up a domain
2. Enter the confirmed canonical URL (e.g. `suhbalibrary.org`)
3. Cloudflare will automatically create the required DNS record (since the domain is on the same account)
4. SSL certificate will be provisioned automatically

---

*End of PRD v4.0*

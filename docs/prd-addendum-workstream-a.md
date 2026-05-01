# THE SUHBA LIBRARY
## PRD Addendum — Workstream A Decisions

| | |
|---|---|
| **Addendum version** | A.1 |
| **Applies to** | PRD v3.0 (29 April 2026) |
| **Date** | 1 May 2026 |
| **Status** | Confirmed — incorporated into scaffold |

> This addendum records all decisions, clarifications, and technical deviations that arose during Workstream A (repository and pipeline setup). It does not supersede the PRD — it supplements it. A consolidated PRD v4.0 should be produced before Workstream B begins if desired.

---

## 1. Technical Stack Decisions

### 1.1 Node.js — Node 22 LTS (confirmed)

**Decision:** Node 22 LTS.

**Rationale:** Node 20 LTS reaches end-of-life April 2026, making it a poor foundation for a new project. Node 22 is the current LTS, is what Cloudflare Pages runs by default, and is fully supported by Astro 5, pnpm 9, and all dependencies. The `.nvmrc` / `engines` field in `package.json` is set to `>=22.0.0`.

### 1.2 Package Manager — pnpm 9 (confirmed)

**Decision:** pnpm 9.

**Rationale:** Faster installs, strict dependency resolution (no phantom dependencies), deterministic lockfile behaviour in CI, and excellent Astro 5 compatibility. All workflow steps use `pnpm/action-setup@v4` and `--frozen-lockfile` on CI installs.

**PRD v3.0 impact:** The PRD did not specify a package manager. `pnpm` is now the canonical tool. `npm` and `yarn` should not be used in this project.

### 1.3 Astro — Version 5.x (confirmed)

**Decision:** Astro 5, latest stable.

**Rationale:** Future-proof; stable as of early 2025. The Content Collections API in Astro 5 uses a `glob` loader pattern in `defineCollection`, which differs from Astro 4's implicit discovery. The scaffold is written to the Astro 5 API throughout.

**Key Astro 5 API differences (for contributor reference):**

| Astro 4 | Astro 5 |
|---|---|
| Content auto-discovered from `src/content/` | Requires explicit `loader: glob(...)` in `defineCollection` |
| `entry.render()` | `render(entry)` imported from `astro:content` |
| `getEntryBySlug()` | Use `getCollection()` + filter by `data.slug` |

### 1.4 Tailwind — Version 4.x (confirmed)

**Decision:** Tailwind CSS v4.

**PRD v3.0 deviation:** The PRD references `tailwind.config.mjs`. This file does **not exist** in Tailwind v4. All configuration moves to CSS via the `@theme` directive in `src/styles/global.css`. The Vite plugin (`@tailwindcss/vite`) replaces the Astro integration (`@astrojs/tailwind`).

**Impact on PRD Section 3 (Technical Stack):** The `tailwind.config.mjs` entry in the repository structure (Section 4.4) is **removed**. Tailwind configuration now lives entirely in `src/styles/global.css` under the `@theme` block.

**Impact on PRD Section 4.4 (Repository Structure):** Updated structure — see Section 3 of this addendum.

---

## 2. Repository & Organisation Changes

### 2.1 GitHub Organisation Name Change

**PRD v3.0:** `suhba-library` (GitHub Organisation)  
**Confirmed name:** `project-ghuraba`

**Full repository path:** `project-ghuraba/suhba-library`

All references in the scaffold, README, CODEOWNERS, `llms.txt`, and this addendum use `project-ghuraba`.

### 2.2 Cloudflare Pages Project Name

**Confirmed:** `suhba-library` (as used in the `wrangler pages deploy` command in `deploy.yml`).

---

## 3. Repository Structure — Updated

The following is the corrected repository structure reflecting Tailwind v4 and Astro 5 decisions. Changes from PRD v3.0 Section 4.4 are marked.

```
suhba-library/
  .github/
    workflows/
      deploy.yml                ← Full CI/CD pipeline (all 6 stages)
    CODEOWNERS
  scripts/
    check-slugs.mjs             ← CI Stage 2: duplicate slug detection  [NEW]
    check-links.mjs             ← CI Stage 3: broken internal link check [NEW]
  src/
    content/
      config.ts                 ← Astro 5 Content Collections + Zod schema
      discourses/               ← All .md files (canonical source)
    pages/
      index.astro               ← Home page
      search.astro              ← Advanced search & filter
      about.astro               ← About the archive
      rss.xml.ts                ← RSS feed
      suhba/
        [slug].astro            ← Individual discourse page
      topics/
        index.astro             ← Topics index
        [topic].astro           ← Filtered list per topic
      speakers/
        index.astro             ← Speakers index
        [speaker].astro         ← Individual speaker page
    components/
      layout/
        BaseLayout.astro        ← Master layout (OG, JSON-LD, analytics)
        Header.astro            ← Responsive nav + dark mode + mobile drawer
        Footer.astro
      discourse/
        DiscourseCard.astro     ← Compact list card
      search/
        PagefindSearch.astro    ← Pagefind island (client:load)
      home/                     ← [PLACEHOLDER — future workstream]
    config/
      synonyms.json             ← Global Pagefind synonyms
    data/
      speakers/                 ← One .md file per speaker (biography)
    styles/
      global.css                ← Tailwind v4 @theme + all base styles
                                   [REPLACES tailwind.config.mjs]
  public/
    llms.txt                    ← AI crawler instructions
    favicon.svg
  lighthouserc.json             ← Lighthouse CI thresholds [NEW]
  .gitignore
  .env.example
  astro.config.mjs              ← No tailwind integration; uses Vite plugin
  tsconfig.json
  package.json
  README.md

  REMOVED from PRD v3.0:
    tailwind.config.mjs         ← Does not exist in Tailwind v4
```

---

## 4. CI/CD Pipeline — Clarifications

### 4.1 Stage ordering and dependency chain

The pipeline runs as sequential GitHub Actions jobs with `needs:` dependencies. Any stage failure halts all downstream stages. The chain is:

```
validate-frontmatter → check-slugs → check-links → build → lighthouse → deploy
```

### 4.2 Stage 1 implementation detail

Frontmatter validation is performed by `astro check` (the Astro TypeScript checker), which validates all Content Collections entries against the Zod schema in `src/content/config.ts`. This is not a custom script — it is the standard Astro mechanism for schema enforcement. Error output includes file path and field name.

### 4.3 Stage 4 — Pagefind index generation

The `pnpm build` script runs `astro build` followed immediately by `pagefind` via a `postbuild` hook. The Pagefind index is generated into `dist/pagefind/`. This is included in the artifact uploaded to Stage 5 and the artifact deployed in Stage 6.

### 4.4 Stage 5 — Lighthouse CI server

The Lighthouse CI stage serves the built `dist/` using the `serve` package on port 4000. It tests 4 representative URLs: home, a discourse page, topics index, and search. The `lighthouserc.json` file encodes all PRD performance thresholds.

### 4.5 Stage 6 — Deployment guard

Stage 6 runs **only** on `push` to `main`. Pull requests and pushes to `dev` run Stages 1–5 only. The condition is enforced via:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

---

## 5. Design System — Tailwind v4 Implementation

### 5.1 Token location

All design tokens from PRD Section 9.1 are implemented as CSS custom properties inside the `@theme` block in `src/styles/global.css`. They are available as `var(--color-*)` throughout all components.

### 5.2 Dark mode implementation

Dark mode is driven by a `.dark` class on `<html>`, toggled via JavaScript and persisted in `localStorage` under the key `suhba-theme`. System preference (`prefers-color-scheme: dark`) is honoured as the default when no stored preference exists. The initialisation script runs inline before first paint (in `BaseLayout.astro`) to prevent flash of incorrect theme.

### 5.3 Reading mode

Font size toggle stores state in `localStorage` under `suhba-reading-size`. Values: `""` (normal, 18px), `"lg"` (20px), `"xl"` (22px). Applied via `data-reading-size` attribute on `<html>`.

---

## 6. Deferred Items (confirmed out of scope for Workstream A)

The following items from the PRD are confirmed as deferred to later workstreams:

| Item | Deferred to |
|---|---|
| Precomputed JSON indexes (`/indexes/*.json`) | Workstream B (content pipeline) |
| Filter panel on `/search` (speaker, topic, location, date) | Workstream C (search & filter) |
| `hijri-js` build-time Hijri date computation | Workstream B |
| `RelatedDiscourses` component (separate from inline logic) | Workstream B |
| `WisdomOfTheDay` as a named component | Merged into `index.astro` — no separate component needed |
| Speaker biography Markdown rendering (full MD) | Workstream D (speaker pages) |
| Cloudflare Analytics token insertion | Post-deployment step |

---

## 7. One-Time Setup Steps (not in codebase)

The following must be completed manually by the repository owner. They are documented here as the canonical reference.

### 7.1 GitHub Organisation

1. Go to [github.com/organizations/new](https://github.com/organizations/new)
2. Organisation name: `project-ghuraba`
3. Plan: Free
4. Create repository `suhba-library` inside the organisation
5. Visibility: **Public**
6. Default branch: `main`

### 7.2 Branch protection rules

Apply these rules to the `main` branch via **Settings → Branches → Add rule**:

| Setting | Value |
|---|---|
| Branch name pattern | `main` |
| Require a pull request before merging | ✅ |
| Required approvals | 1 |
| Require status checks to pass | ✅ |
| Required status checks | `Stage 1 — Frontmatter Validation`, `Stage 2 — Duplicate Slug Detection`, `Stage 3 — Broken Internal Link Check`, `Stage 4 — Astro Static Build`, `Stage 5 — Lighthouse CI` |
| Require branches to be up to date | ✅ |
| Do not allow bypassing the above settings | ✅ |

Apply these rules to the `dev` branch:

| Setting | Value |
|---|---|
| Branch name pattern | `dev` |
| Require status checks to pass | ✅ |
| Required status checks | `Stage 1 — Frontmatter Validation`, `Stage 2 — Duplicate Slug Detection`, `Stage 3 — Broken Internal Link Check`, `Stage 4 — Astro Static Build`, `Stage 5 — Lighthouse CI` |

### 7.3 GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value source |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token → "Cloudflare Pages: Edit" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar when viewing any domain |

### 7.4 Cloudflare Pages project

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages → Create → Pages**
3. Connect to GitHub → select `project-ghuraba/suhba-library`
4. Project name: `suhba-library`
5. Production branch: `main`
6. Build command: *(leave blank — CI handles the build; deploy sends pre-built dist/)*
7. Build output directory: `dist`
8. Save

> Note: Since the CI pipeline deploys via `wrangler` with a pre-built artifact, you do not need Cloudflare Pages to run its own build. The Pages project simply receives the `wrangler pages deploy` command.

### 7.5 Custom domain

1. In Cloudflare Pages → `suhba-library` project → **Custom domains**
2. Add domain: `library.suhba.org`
3. Cloudflare will automatically add the DNS record (since DNS is managed in Cloudflare)

### 7.6 Cloudflare Web Analytics

1. Cloudflare Dashboard → **Web Analytics → Add a site**
2. Enter `library.suhba.org`
3. Copy the token from the generated `<script>` beacon
4. Replace `__CF_ANALYTICS_TOKEN__` in `src/components/layout/BaseLayout.astro` with the real token
5. Commit and push

### 7.7 Cloudflare R2 bucket

1. Cloudflare Dashboard → **R2 → Create bucket**
2. Bucket name: `suhba-media`
3. Enable public access
4. Set public URL as `https://r2.suhba.org` (add a custom domain via R2 → Settings → Custom Domains)
5. Upload the default OG image as `og-default.jpg`

---

*End of Addendum A.1*

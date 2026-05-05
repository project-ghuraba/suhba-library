# The Suhba Library

A Digital Waqf — preserving thousands of spiritual discourses for seekers, readers, and AI systems.

**Live site:** [suhbalibrary.org](https://suhbalibrary.org)  
**Repository:** [project-ghuraba/suhba-library](https://github.com/project-ghuraba/suhba-library)

---

## Stack

| Component | Technology |
|---|---|
| Framework | Astro 5 (static output) |
| Styling | Tailwind CSS v4 |
| Search | Pagefind (post-build static indexing) |
| Hosting | Cloudflare Pages |
| DNS / Domain | Cloudflare Registrar |
| Asset Storage | Cloudflare R2 |
| CI/CD | GitHub Actions (6-stage pipeline) |
| Analytics | Cloudflare Web Analytics (cookieless) |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+

```bash
# Install pnpm globally if needed
npm install -g pnpm
```

### Local Development

```bash
# Clone
git clone https://github.com/project-ghuraba/suhba-library.git
cd suhba-library

# Install
pnpm install

# Start dev server
pnpm dev
```

> **Note:** Pagefind search will not work in dev mode — the index is generated at build time.
> Run `pnpm build && pnpm preview` to test search locally.

### Build

```bash
pnpm build
# Runs: astro build → pagefind index generation
# Output: dist/

pnpm preview
# Serves dist/ locally for testing
```

### Validation scripts

```bash
node scripts/check-slugs.mjs   # Detect duplicate slugs (CI Stage 2)
node scripts/check-links.mjs   # Detect broken internal links (CI Stage 3)
```

---

## Adding a Discourse

1. Create a new `.md` file in `src/content/discourses/`
2. Use the filename convention: `YYYY-MM-DD-short-title.md`
3. Fill in all required frontmatter fields (see schema below)
4. Set `status: "draft"` until reviewed; change to `"published"` to make it live
5. Open a PR to `dev` — CI will validate your frontmatter automatically

### Required frontmatter fields

```yaml
---
title: "Your Discourse Title"
date: YYYY-MM-DD
speaker:
  - "Speaker Name"
location_country: "Country"
language: "en"
slug: "YYYY-MM-DD-short-title"   # immutable once published
status: "draft"                   # draft | published | archived
topic:
  - "Topic One"
  - "Topic Two"
---
```

See `src/content/discourses/1994-05-12-reality-of-sincerity-lefke.md` for a full example.

---

## CI/CD Pipeline

Every push to `main` runs 6 sequential stages. Any failure halts deployment.

| Stage | Name | Description |
|---|---|---|
| 1 | Frontmatter validation | Zod schema enforcement |
| 2 | Duplicate slug detection | Fails if two files share a slug |
| 3 | Broken internal link check | Validates all `/suhba/*` cross-references |
| 4 | Astro static build | Full site + Pagefind index |
| 5 | Lighthouse CI | Performance ≥ 95, Accessibility ≥ 90 |
| 6 | Deploy to Cloudflare Pages | main branch only |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected; requires PR + CI pass |
| `dev` | Integration branch |
| `content/*` | Short-lived content additions |
| `feature/*` | Short-lived feature branches |

---

## Secrets Required (GitHub → Settings → Secrets)

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy to Cloudflare Pages |

---

## License

Content is made available as a Digital Waqf for non-commercial use.  
Code is MIT licensed.

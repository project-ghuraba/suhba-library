# Workplan — Speaker Pages (Workstream D)

## Decisions

- `name` field kept as-is (no rename)
- Hero image: skip section entirely if `image` absent (no fallback)
- Silsila: collapsed by default via `<details>/<summary>`
- Notable quotes: show all (no cap)

## Frontmatter Schema (final)

```yaml
name: string           # existing — kept as-is
born: number           # existing
died: number           # existing, optional
birth_place: string    # existing
tariqa: string         # new — Sufi order/path
silsila: string[]      # new — ordered chain from speaker to Prophet ﷺ
image: string          # new — hero image URL (r2.suhbalibrary.org/...)
image_avatar: string   # new — portrait/face URL (r2.suhbalibrary.org/...)
notable_quotes: string[] # new — replaces pulling quotes from discourse files
```

---

## Tasks

### 1. Speaker data files
- [x] Update `shaykh-nazim-al-haqqani.md` — add new frontmatter fields
- [x] Update `shaykh-hisham-kabbani.md` — add new frontmatter fields
- [x] Update `shaykh-mehmet-adil.md` — add new frontmatter fields

### 2. Speaker page — `[speaker].astro`
- [x] Add hero image section (skip if `image` absent)
- [x] Update header block — show `tariqa`, `born`/`died`, `birth_place`, discourse count
- [x] Use `image_avatar` for avatar (fallback to initials if absent)
- [x] Update Notable Quotes — read from `notable_quotes` frontmatter (not discourse files)
- [x] Add Silsila section — `<details>/<summary>`, collapsed by default, numbered list
- [x] Parse frontmatter from bio file (currently strips it — needs to read new fields)

### 3. Speakers index — `index.astro`
- [x] Use `image_avatar` for avatar in list rows (fallback to initials)

### 4. Verification
- [x] `pnpm build` passes with no errors
- [ ] Speaker pages render correctly in browser

---

## Workstream — Pagefind Full-Text Search

### Issues identified

| # | Severity | Description |
|---|---|---|
| 1 | Critical | `data-pagefind-body` is only on `.prose` div — title, speaker, date, location all outside indexed region → not searchable |
| 2 | Important | No `data-pagefind-meta` attributes — result cards show no speaker/date metadata |
| 3 | Important | Home page search form submits `?q=` but PagefindSearch never reads the URL param → search box arrives empty |
| 4 | Deprecation | `PagefindUI` (Default UI) deprecated in Pagefind 1.5.0 — should migrate to Component UI |
| 5 | Minor | `"pagefind": "^1.3.0"` in package.json — behind; should be `^1.5.0` |
| 6 | Minor | `excerptLength: 30` too short (barely a sentence) — raise to 50 |

### Tasks

#### P1 — Fix indexed content scope (`[slug].astro`)
- [x] Move `data-pagefind-body` from `.prose` div up to `<article class="discourse-page">`
- [x] Add `data-pagefind-ignore` to `.share-bar`, `.related-suhbas`, `.discourse-topics`, `.discourse-hero`
- [x] Add `data-pagefind-meta="title"` on `h1.discourse-title`
- [x] Add `data-pagefind-meta="author"` on `.meta-speaker` span
- [x] Add `data-pagefind-meta="date"` on `<time>` element
- [x] Verified: fragment files confirm title/speaker/date/location all indexed as searchable content

#### P2 — URL param passthrough (`PagefindSearch.astro`)
- [x] Read `?q=` URL param on page load
- [x] Pass it as `defaultQuery` to `PagefindUI`

#### P3 — Migrate to Component UI — DEFERRED
- Not suitable: Component UI is modal-first (`pagefind-modal`, `pagefind-modal-trigger` web components).
  The `/search` page requires an inline search widget. Default UI remains correct for this use case.
  Migration deferred to v2 if Pagefind adds a non-modal inline Component UI variant.

#### P4 — Package & config hygiene
- [x] Bumped `"pagefind"` to `"^1.5.0"` in `package.json`
- [x] Raised `excerptLength` from 30 to 50

#### P5 — Verification
- [x] `pnpm build` clean — word count increased 792 → 849
- [x] Fragment index confirmed: author/date/title metadata on all 5 pages
- [x] Content confirmed: title, speaker name, date, location all in indexed content per page
- [x] All implementation checks pass (URL param, excerptLength, version pin)
- [ ] Speaker pages render correctly in browser (pending browser connection)

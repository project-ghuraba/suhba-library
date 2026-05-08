# UI Enhancement Workplan — 8 May 2026

> This workplan tracks all tasks from the UI enhancement brief. Status is updated in-place as each task is completed.
>
> **Legend:** 🔲 Not started · 🚧 In progress · ✅ Done

---

## Section 1 — Homepage

### 1.2 Hero pattern → Ottoman geometric style

**Status:** ✅

**File:** `src/pages/index.astro` — `.hero` CSS block (~line 203)

**Current state:** Hero section has a subtle SVG star polygon tile as `background-image`. The pattern is already geometric but minimal.

**Change:** Replace the inline SVG data-URI background with a more distinctively Ottoman-style geometric pattern — a tessellating 8-pointed star / interlaced polygon grid, matching the warmth of the brand palette (`#2C5F4A` at low opacity).

**Implementation notes:**
- Keep the SVG inline as a `background-image` data-URI (no external file needed, no performance cost)
- Pattern tile: 60×60px, 8-pointed star (octagram) formed by two overlapping squares — classic Islamic geometric motif
- Stroke: `--color-accent-primary` (`#2C5F4A`) at 10–12% opacity so it's subtle but visible
- `background-repeat: repeat`; `background-size: 60px 60px`

---

### 1.3.1 Quote card — add "Read full suhba:" prefix + italicise link

**Status:** ✅

**File:** `src/pages/index.astro` — lines 83–85 (static render) and the random-quote JS handler (~line 481)

**Current state:**
```html
<p class="wisdom-source">
  <a id="wisdom-link" href={`/suhba/${wisdomOfTheDay.slug}`}>{wisdomOfTheDay.title}</a>
</p>
```

**Change:**
```html
<p class="wisdom-source">
  Read full suhba: <a id="wisdom-link" href="..." style="font-style: italic">{title}</a>
</p>
```

- Add literal text "Read full suhba: " before the `<a>` tag as a text node inside `<p>`
- Apply `font-style: italic` to the `<a>` (via class, not inline style)
- Update the JS random-quote handler: when swapping quotes, `wisdomLink.textContent` should only set the title (prefix text is a text node in the `<p>`, not inside the `<a>`, so it's unaffected)

---

### 1.3.2 Move copy/share/randomise actions inside the card as icon buttons

**Status:** ✅

**File:** `src/pages/index.astro` — `.wisdom-card` blockquote and `.wisdom-actions` div (~lines 80–110)

**Current state:** Three text-label buttons (`Copy`, `Share`, `Random`) sit in a `.wisdom-actions` div *after* the `.wisdom-card` blockquote. They are right-aligned below the card.

**Change:**
- Remove `.wisdom-actions` div from after the card
- Move the three buttons *inside* the `.wisdom-card` blockquote
- Convert text labels to SVG icon buttons (with `aria-label` and `.sr-only` text for screen readers)
  - Copy → clipboard icon
  - Share → share/upload icon
  - Random → shuffle/dice icon
- Position: absolutely positioned bottom-right within the card (card gets `position: relative`)
- Style: small (28–32px), circular or rounded, low-contrast border, subtle hover accent
- Touch targets: minimum 44×44px tap area via padding or pseudo-element

**Icons (inline SVG, no external dependency):**
- Copy: clipboard outline
- Share: upload-arrow or share-nodes outline
- Random: shuffle arrows outline

---

## Section 2 — Search Page

### 2.1 Page title → "Explore the collection"

**Status:** ✅

**File:** `src/pages/search.astro` — lines 12 and 17

**Changes:**
- `<BaseLayout title="Search & Browse Discourses">` → `<BaseLayout title="Explore the collection">`
- `<h1 class="page-title">Search & Browse</h1>` → `<h1 class="page-title">Explore the collection</h1>`

---

### 2.2 Add page heading subtext

**Status:** ✅

**File:** `src/pages/search.astro` — after line 17

**Add:**
```html
<p class="page-subtitle">Discover suhbas, topics, and insights through search or browsing the collection</p>
```

**Add corresponding CSS** `.page-subtitle` (font-size: ~0.95rem, color: `--color-text-secondary`, margin-top: 0.375rem, margin-bottom: 2rem).

---

### 2.3 Remove "Search index not found" dev-mode message

**Status:** ✅

**File:** `src/components/search/PagefindSearch.astro` — lines 37–43

**Root cause:** In the `catch` block of `initSearch()`, when the Pagefind index doesn't exist (dev mode), the component writes the error message into `#pagefind-search-mount`. This is rendered visibly on the page.

**Change:** Make the catch block silent — clear the mount's content (or leave it empty) instead of writing the error text. The user will understand they are in dev mode; there is no need to display it to site visitors.

```js
} catch {
  const mount = document.getElementById('pagefind-search-mount');
  if (mount) mount.innerHTML = '';
}
```

---

### 2.4 Filter heading → "BROWSE & DISCOVER"

**Status:** ✅

**File:** `src/pages/search.astro` — line 26

**Change:** `Browse & Filter` → `BROWSE & DISCOVER`

Note: The `.section-label` CSS already applies `text-transform: uppercase` so the heading will render uppercased regardless — the literal string in the HTML should match the intended text.

---

### 2.5 Remove language filter

**Status:** ✅

**File:** `src/pages/search.astro`

**All occurrences to remove:**

HTML:
- `<select id="filter-language" ...>` and its `<option>` (lines 46–48)

JavaScript:
- `const LANG_NAMES` constant (~line 354)
- `const selLanguage = document.getElementById('filter-language') as HTMLSelectElement;` (~line 365)
- `appendOptions(selLanguage, ...)` call in `populateFilters()` (~line 398)
- `if (f.language && d.language !== f.language) return false;` in `applyFilters()` (~line 435)
- `language: selLanguage.value` in `getFilters()` (~line 418)
- `selLanguage.addEventListener('change', render)` (~line 535)
- `selLanguage.value = '';` in `btnClear` handler (~line 545)
- `language: f2.language || null` in the `zero_results` tracking call (~line 515)

---

### 2.6 Collapse filters into a collapsible drawer

**Status:** ✅

**File:** `src/pages/search.astro`

**Approach:** Use a `<details>/<summary>` element wrapping the filter bar (native HTML collapsible, accessible, no JS needed for toggle). Keep the text search input **outside** the collapsible (it is the primary search UX; it should always be visible).

**Structure:**
```html
<!-- Text search — always visible -->
<input type="search" id="filter-text" ... />

<!-- Collapsible filters -->
<details class="filters-drawer" id="filters-drawer">
  <summary class="filters-toggle">
    Filters
    <span class="filters-toggle-icon" aria-hidden="true">▾</span>
  </summary>
  <div class="filter-bar" ...>
    <!-- dropdowns + year range + clear -->
  </div>
</details>
```

**CSS notes:**
- Style `summary` to look like a muted button/link with chevron
- `details[open] .filters-toggle-icon` rotates chevron 180°
- Collapsed by default (`<details>` without `open` attribute)
- Sort bar stays outside the details element (always visible)

---

### 2.7 Style result cards to match DiscourseCard

**Status:** ✅

**File:** `src/pages/search.astro`

**Current state:** Result cards are dynamically created via `renderCard()` JS. Their CSS is already close to DiscourseCard, but the render function outputs `div.result-card-title` (a `div`, not `h2`), and the speaker `span` has no weight class.

**Changes needed:**
1. In `renderCard()`, output `article.discourse-card` → `a.card-link` → `div.card-title` + `p.card-meta` (using the same CSS class names as DiscourseCard for visual consistency)
2. Give the speaker span `font-weight: 600` to match DiscourseCard's visual weight
3. Add a top border on the first card by wrapping the list in a div with `border-top: 1px solid var(--color-border)` to create a clear bounding group
4. Ensure `gap: 0` on `.result-list` and `padding-block: 1.25rem` on each card — identical to DiscourseCard
5. Mirror `.meta-sep { opacity: 0.4 }` and same `font-size` / `color` on meta spans

---

## Section 3 — Topic Pages

### 3.1 Slugify topic URLs

**Status:** ✅

**Files:**
- `src/pages/topics/index.astro` — link `href` generation (line 50) + client-side sort JS re-render (pills already in DOM, hrefs intact — no JS change needed)
- `src/pages/topics/[topic].astro` — `getStaticPaths` slug generation (line 22) and `topic` filter (line 33)

**Current:** `encodeURIComponent(name.toLowerCase())` → produces `divine%20names`

**Target:** `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')` → produces `divine-names`

**Changes:**

`topics/index.astro` line 50:
```js
// Before:
href={`/topics/${encodeURIComponent(name.toLowerCase())}`}
// After:
href={`/topics/${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')}`}
```

`topics/[topic].astro` — `getStaticPaths` (line 22):
```js
// topicMap key changes from lowercased name to hyphenated slug
topicMap.set(t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, ''), t);
```

And the filter (line 33):
```js
.filter(d => d.data.topic.map(t => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')).includes(topic))
```

**Helper function:** Extract the slugification logic into a named constant `topicToSlug` inside `getStaticPaths` (Astro 5 isolation) and reuse it.

**SEO note:** Existing live URLs using `%20` will 404 after this change. Since the site is not yet widely indexed, this is acceptable. If needed, Cloudflare Pages redirect rules can forward old encoded URLs.

---

## Section 4 — Individual Speaker Pages

### 4.1 Additional speaker frontmatter fields

**Status:** ✅

**Files:**
- `src/data/speakers/shaykh-nazim-al-haqqani.md`
- `src/data/speakers/shaykh-hisham-kabbani.md`
- `src/data/speakers/shaykh-mehmet-adil.md`
- `src/pages/speakers/[speaker].astro`

**New frontmatter fields to add to each speaker MD:**

```yaml
name_full: "His Eminence Mawlana Shaykh Muhammad Nazim Adil al-Haqqani"
image: "https://r2.suhbalibrary.org/speakers/shaykh-nazim-hero.jpg"
image_avatar: "https://r2.suhbalibrary.org/speakers/shaykh-nazim-avatar.jpg"
selected_quotes:
  - "The heart is a mirror — polish it with remembrance."
  - "Seek knowledge, for it illuminates the path of the seeker."
```

**Note:** YAML key `image-avatar` contains a hyphen, which is valid YAML but awkward to access in JS/TS. Using `image_avatar` (underscore) is cleaner and avoids quoting the key. Frontmatter will be parsed with `image_avatar`.

**Speaker page changes (`src/pages/speakers/[speaker].astro`):**

1. Parse the speaker MD file to extract frontmatter fields — currently only the body is extracted. Update the frontmatter parsing to also read `name_full`, `image`, `image_avatar`, `selected_quotes`.

2. **Hero image:** If `image` is present, render a full-width hero image at the top of the page (above breadcrumb, or spanning the speaker header area). Graceful fallback if absent.

3. **Avatar:** If `image_avatar` is present, replace the initials avatar `div.speaker-avatar-lg` with an `<img>` element. Keep the initials fallback if absent.

4. **Full name:** Display `name_full` as a subtitle below the `speakerName` h1, or swap in as the primary h1 title (with `speakerName` as the accessible label). Render only if present.

5. **Notable quotes priority:** Use `selected_quotes` from the speaker MD as the primary source for Notable Quotes. If `selected_quotes` is empty or absent, fall back to quotes pulled from `quotes_verified` in discourse frontmatter (current behaviour).

---

### 4.2 Helpful links section

**Status:** ✅

**Files:**
- `src/data/speakers/*.md` — add `links` frontmatter field
- `src/pages/speakers/[speaker].astro` — render section after Notable Quotes

**Frontmatter field format:**

```yaml
links:
  - label: "Naqshbandi.org"
    url: "https://naqshbandi.org"
  - label: "Wikipedia"
    url: "https://en.wikipedia.org/wiki/..."
```

**Speaker page changes:**

1. Parse `links` array from speaker frontmatter.
2. Add a "Helpful Links" section after Notable Quotes, before All Discourses:

```html
{links.length > 0 && (
  <section aria-labelledby="links-heading">
    <h2 class="section-heading" id="links-heading">Helpful Links</h2>
    <ul class="links-list">
      {links.map(link => (
        <li>
          <a href={link.url} target="_blank" rel="noopener noreferrer" class="helpful-link">
            {link.label}
            <span aria-hidden="true"> ↗</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
)}
```

3. Style: clean list, `color-accent-primary`, external link arrow icon, `rel="noopener noreferrer"` for security.

---

## Implementation Order

Tasks are independent and can be done in any order. Suggested sequence — lowest risk first:

1. 2.1, 2.2 — trivial text changes
2. 2.4 — trivial text change
3. 2.3 — small catch-block change
4. 2.5 — remove language filter (HTML + JS)
5. 1.3.1 — add prefix + italicise link
6. 3.1 — slugify topic URLs
7. 2.7 — result card styling
8. 2.6 — collapsible filters drawer
9. 1.2 — Ottoman hero pattern
10. 1.3.2 — move actions inside card as icon buttons
11. 4.1 — speaker frontmatter + page updates
12. 4.2 — helpful links section

---

*Workplan created: 8 May 2026. Updated in-place as tasks complete.*

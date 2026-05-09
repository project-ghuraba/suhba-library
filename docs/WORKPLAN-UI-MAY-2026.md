# UI Improvements Workplan — May 2026

**Branch:** `feature/ui-enhancements-may-2026`  
**Created:** 2026-05-10  
**Status legend:** 🔲 Pending · 🚧 In progress · ✅ Done

---

## Task Summary

| # | Area | Task | Status |
|---|---|---|---|
| 1 | Homepage | Limit 'Latest Suhbas' to 3 items | ✅ |
| 2 | Speaker profile | Fix missing 'Helpful Links' section (regex bug) | ✅ |
| 3 | Speaker profile | Replace discourse list with 'View all suhbas →' button | ✅ |
| 4 | Search page | Rename 'Filters' → 'Show more filters' | ✅ |
| 5 | Search page | Fix result list styling to match homepage list | ✅ |
| 6 | Search page | Add 'Latest added' sort option | ✅ |
| 7 | Speakers index | Display avatar image when available | ✅ |
| 8 | Suhba page | Constrain landscape hero image to body width on desktop | ✅ |
| 9 | Suhba page | Reduce YouTube button prominence; add 'or read below' text | ✅ |
| 10 | Global | Reset prose 'Normal' to 1rem; add 'Small' font size option | ✅ |
| 11 | Speaker profile | Fix hero image: fully visible, body-width on desktop | ✅ |
| 12 | About page | Remove GitHub references; add placeholder email contact | ✅ |
| 13 | About page | Remove redundant JSON-LD sentence | ✅ |

---

## Detailed Task Specifications

---

### Task 1 — Homepage: Limit 'Latest Suhbas' to 3 items

**File:** `src/pages/index.astro`  
**Line:** 16  
**Current:** `const latest = allDiscourses.slice(0, 10);`  
**Fix:** Change `10` → `3`

---

### Task 2 — Speaker profile: Fix missing 'Helpful Links' section

**File:** `src/pages/speakers/[speaker].astro`  
**Root cause:** The regex at line 83 uses the `m` (multiline) flag:

```js
const linksSection = fmStr.match(/^links:\s*\n([\s\S]*?)(?=\n\S|$)/m);
```

With the `m` flag, `$` matches the end of **any line**, not end-of-string. The non-greedy `[\s\S]*?` therefore terminates at the end of the very first line inside the links block (e.g. `  - label: "Saltanat"`), before `url:` or `description:` are captured. The `url` field is then missing from the parsed object, the item is filtered out, `fm.links` ends up empty, and the conditional `{speakerFm.links && speakerFm.links.length > 0 && (...)}` evaluates to false.

**Fix:** Replace the regex-based extraction with a field-boundary split approach:

```js
// Split fmStr on lines that start with a non-whitespace char (= new YAML key)
// Find the chunk that starts with "links:"
const fieldChunks = fmStr.split(/\n(?=\S)/);
const linksChunk = fieldChunks.find(c => /^links:/.test(c));
if (linksChunk) {
  const linksContent = linksChunk.replace(/^links:\s*\n/, '');
  const blocks = linksContent.split(/\n(?=[ \t]+-[ \t])/);
  fm.links = blocks.map(block => {
    const lM = block.match(/label:\s*"?([^"\n]+)"?/);
    const uM = block.match(/url:\s*"?([^"\n]+)"?/);
    const dM = block.match(/description:\s*"?([^"\n]+)"?/);
    if (!lM || !uM) return null;
    return {
      label: lM[1].trim(),
      url: uM[1].trim(),
      ...(dM ? { description: dM[1].trim() } : {}),
    };
  }).filter((l): l is { label: string; url: string; description?: string } => l !== null);
}
```

The `split(/\n(?=[ \t]+-[ \t])/)` also fixes a secondary bug where the old `split(/(?=[ \t]+-[ \t])/)` would split mid-line on label text like `"Facebook - Tariqat Naqshbandi ʿAliyya"` (which contains ` - `).

---

### Task 3 — Speaker profile: Replace discourse list with 'View all suhbas' button

**File:** `src/pages/speakers/[speaker].astro`  
**Current:** Lines 225–245 render a full `DiscourseCard` list of all speaker discourses.

**Fix:**
1. Remove the `DiscourseCard` import and the `discourse-list` div.
2. Replace the section with a prominent link-button pointing to `/search?speaker=<encoded speaker name>`.
3. Add URL param pre-fill support in `search.astro` so navigating to `/search?speaker=Shaykh Nazim al-Haqqani` auto-selects that speaker in the filter dropdown.

**Speaker profile replacement markup:**
```astro
<section class="speaker-discourses" aria-labelledby="discourses-heading">
  <h2 class="section-heading" id="discourses-heading">
    Suhbas ({discourseCount})
  </h2>
  <a
    href={`/search?speaker=${encodeURIComponent(speakerName)}`}
    class="view-all-btn"
  >
    View all suhbas →
  </a>
</section>
```

**Search page addition** — pre-fill speaker filter from URL param (add to the JS block near the `urlQ` pre-fill):
```js
const urlSpeaker = new URLSearchParams(window.location.search).get('speaker');
// applied after populateFilters() populates the dropdown options
if (urlSpeaker) {
  selSpeaker.value = urlSpeaker;
}
```

---

### Task 4 — Search page: Rename 'Filters' to 'Show more filters'

**File:** `src/pages/search.astro`  
**Line:** 42  
**Current:** `<span>Filters</span>`  
**Fix:** `<span>Show more filters</span>`

---

### Task 5 — Search page: Fix result list styling to match homepage

**Root cause:** The search results are rendered by client-side JavaScript (`renderCard()` in the `<script>` block). Astro's scoped `<style>` adds a `data-astro-cid-XXXX` attribute to elements in the component template and scopes CSS selectors to that hash. Dynamically created DOM elements from JS **do not** get this attribute, so all scoped styles under `.result-list .discourse-card`, `.result-list .card-title`, `.result-list .card-meta` etc. **do not apply**.

Additionally, the date format differs: `DiscourseCard` uses `toLocaleDateString('en-GB', { month: 'long' })` (e.g. "12 January 1994"), while `renderCard()` uses abbreviated month arrays (e.g. "12 Jan 1994").

**Fix:**

1. **Styling:** Wrap all result-list card styles in `:global()` so they apply to dynamically created elements:
   ```css
   :global(.result-list) { border-top: 1px solid var(--color-border); }
   :global(.result-list .discourse-card) { padding-block: 1.25rem; border-bottom: 1px solid var(--color-border); }
   :global(.result-list .card-link) { text-decoration: none; color: inherit; display: block; }
   :global(.result-list .card-title) { font-size: 1.05rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 0.375rem; line-height: 1.35; transition: color 0.15s; }
   :global(.result-list .card-link:hover .card-title),
   :global(.result-list .card-link:focus-visible .card-title) { color: var(--color-accent-primary); }
   :global(.result-list .card-meta) { font-size: 0.825rem; color: var(--color-text-secondary); margin: 0; display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; }
   :global(.result-list .meta-sep) { opacity: 0.4; }
   ```

2. **Date format:** Update `formatDate()` in the script to use `toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })` so it matches DiscourseCard exactly.

3. **Hijri date:** Add Hijri date display to `renderCard()` when `d.date_hijri` is present, matching DiscourseCard's `<span class="meta-hijri">` output.

4. **Element tag:** Change `card-title` from `<div>` to `<div>` is fine visually, but also ensure `display: block` is on `.card-link` so it works correctly.

---

### Task 6 — Search page: Add 'Latest added' sort option

**Approach:** Add an optional `date_added` frontmatter field (YYYY-MM-DD) to track when a suhba was added to the archive (independent of its discourse date). When absent, falls back to the discourse `date`.

**Files to change:**

1. **`src/content/config.ts`** — add optional field:
   ```ts
   date_added: z.string().optional(),
   ```

2. **`src/pages/search-index.json.ts`** — include in output:
   ```ts
   date_added: d.data.date_added ?? d.data.date.toISOString().split('T')[0],
   ```

3. **`src/pages/search.astro`** — add sort button and sort logic:
   - Add `<button class="sort-btn" data-sort="latest-added">Latest added</button>` to the sort bar
   - Add branch to `sortResults()`:
     ```js
     if (activeSort === 'latest-added') return [...list].sort((a, b) => b.date_added.localeCompare(a.date_added));
     ```
   - Add `date_added: string` to the `DiscourseEntry` interface

---

### Task 7 — Speakers index: Display avatar image when available

**File:** `src/pages/speakers/index.astro`  
**Current:** Only renders initials in `.speaker-avatar` — does not read bio files.

**Fix:** At build time, read each speaker's bio file to check for `image_avatar`, then conditionally render `<img>` or the initials fallback. Uses the same `parseSpeakerFile`-style approach as `[speaker].astro`.

Implementation:
1. Import `readFile` from `node:fs/promises` and `join` from `node:path`.
2. For each speaker, attempt to read `src/data/speakers/${slug}.md` and extract `image_avatar` with a simple regex.
3. In the template, render `<img class="speaker-avatar-img" src={avatar} alt={name}>` when available, otherwise the existing initials `<div>`.
4. Add `.speaker-avatar-img` style (already exists in `[speaker].astro`, needs to be added to `index.astro`'s local style block):
   ```css
   .speaker-avatar-img {
     width: 2.75rem;
     height: 2.75rem;
     border-radius: 50%;
     object-fit: cover;
     flex-shrink: 0;
   }
   ```

---

### Task 8 — Suhba page: Constrain landscape hero image to body width on desktop

**File:** `src/pages/suhba/[slug].astro`  
**Current:** `.discourse-hero { width: 100%; }` — image spans full page width.  
**Goal:** On desktop, hero image should be no wider than the body text container (850px), centred.

**Fix:** Add a responsive constraint:
```css
/* Mobile: full bleed */
.discourse-hero {
  width: 100%;
  background: var(--color-bg-light);
}

/* Desktop: constrain to body width */
@media (min-width: 768px) {
  .discourse-hero {
    max-width: 850px;
    margin-inline: auto;
    padding-inline: 1rem;
  }
  .discourse-hero-img {
    border-radius: 0.375rem;
  }
}
```

The image keeps `object-fit: contain` so it displays at its natural proportions without cropping.

---

### Task 9 — Suhba page: Reduce YouTube button prominence; add 'or read below' text

**File:** `src/pages/suhba/[slug].astro`

**Current:** A prominent red button (`.youtube-btn`) with YouTube red `#FF0000` background.

**Fix:**
1. Restyle as a subtle outlined link (not a filled button).
2. Add adjacent inline text "or read the suhba below".

**New markup:**
```astro
{data.youtube_url && (
  <div class="youtube-row">
    <a
      href={data.youtube_url}
      class="youtube-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch "${data.title}" on YouTube (opens in new tab)`}
      data-cf-event="youtube_click"
    >
      <svg width="16" height="16" ...>...</svg>
      Watch on YouTube
    </a>
    <span class="youtube-alt">or read the suhba below</span>
  </div>
)}
```

**New styles** (replace `.youtube-btn`):
```css
.youtube-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.youtube-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.375rem 0.875rem;
  min-height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: border-color 0.15s, color 0.15s;
}

.youtube-link:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.youtube-alt {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
}
```

---

### Task 10 — Global: Reset prose 'Normal' to 1rem; add 'Small' font size

**Files:** `src/styles/global.css`, `src/components/layout/Header.astro`

**Current:**
- `html { font-size: 18px; }` (base)
- `.prose { font-size: 1.125rem; }` → 20.25px — this is the "Normal" reading size
- Reading size lg: `html { font-size: 20px; }` → prose becomes 22.5px
- Reading size xl: `html { font-size: 22px; }` → prose becomes 24.75px
- No "Small" option

**New scheme:**
- Normal: `.prose { font-size: 1rem; }` → 18px (the user's desired baseline)
- Large (lg): `html[data-reading-size="lg"] { font-size: 20px; }` → prose 20px (unchanged)
- Extra large (xl): `html[data-reading-size="xl"] { font-size: 22px; }` → prose 22px (unchanged)
- **New:** Small (sm): `html[data-reading-size="sm"] { font-size: 16px; }` → prose 16px

**`global.css` changes:**
```css
.prose { font-size: 1rem; /* was 1.125rem */ }

html[data-reading-size="sm"] { font-size: 16px; }
html[data-reading-size="lg"] { font-size: 20px; }   /* unchanged */
html[data-reading-size="xl"] { font-size: 22px; }   /* unchanged */
```

**`Header.astro` changes** — add "Small" option to the select and update the JS that reads/writes `localStorage`:
```html
<select id="font-size-select" aria-label="Select reading text size">
  <option value="sm">Small</option>
  <option value="" selected>Normal</option>
  <option value="lg">Large</option>
  <option value="xl">Extra large</option>
</select>
```

The existing JS in `BaseLayout.astro` (or `Header.astro`) that reads from `localStorage['suhba-reading-size']` and applies `data-reading-size` to `<html>` already supports arbitrary string values, so adding `"sm"` requires no JS changes beyond the select option.

---

### Task 11 — Speaker profile: Fix hero image visibility on desktop

**File:** `src/pages/speakers/[speaker].astro`

**Current:**
```css
.speaker-hero { width: 100%; max-height: 320px; overflow: hidden; }
.speaker-hero-img { width: 100%; height: 320px; object-fit: cover; object-position: center top; }
```
The image is cropped (`object-fit: cover` with fixed 320px height). On desktop, this cuts off much of the portrait.

**Fix:** Remove the fixed height crop; constrain to body width on desktop:
```css
.speaker-hero {
  width: 100%;
  background: var(--color-bg-light);
}

.speaker-hero-img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 480px;
  object-fit: contain;
  object-position: center top;
}

@media (min-width: 768px) {
  .speaker-hero {
    max-width: 850px;
    margin-inline: auto;
    padding-inline: 1rem;
    margin-bottom: 0.5rem;
  }
  .speaker-hero-img {
    border-radius: 0.375rem;
  }
}
```

This shows the full image at its natural proportions with a generous max-height, constrained to the body container on desktop.

---

### Task 12 — About page: Remove GitHub references; add placeholder email

**File:** `src/pages/about.astro`

**Current lines 39–60:** Three paragraphs mentioning GitHub/pull requests and a "View on GitHub →" button.

**New version of the section body** — keep the spirit (contribute transcripts, need verified links, Markdown preferred), remove all GitHub mentions, replace GitHub link with an email CTA:

```astro
<p>
  If you have transcripts, corrections, or additional discourses to contribute,
  please get in touch with the maintainers directly.
</p>
<p>
  Each submission must include a verified video or audio link (YouTube URL or equivalent)
  so the transcript can be authenticated against the original source. Submissions without
  a verifiable link cannot be accepted.
</p>
<p>
  Transcripts submitted as plain text or Markdown are preferred. Please include the
  speaker name, date, and location where known.
</p>
<a href="mailto:contribute@suhbalibrary.org" class="cta-link">
  contribute@suhbalibrary.org
</a>
```

---

### Task 13 — About page: Remove redundant JSON-LD sentence

**File:** `src/pages/about.astro`  
**Lines 74–75:**
```html
<p>
  All content is licensed for non-commercial use. Structured data (JSON-LD) is embedded
  in every page for use by search engines and AI systems.
</p>
```

**Assessment:** The sentence about JSON-LD is technical implementation detail that adds no value for most readers visiting the About page. The `llms.txt` link above already serves as the machine-access signal. Remove the JSON-LD sentence; keep the licensing note.

**Fix:**
```html
<p>All content is licensed for non-commercial use.</p>
```

---

## Execution Order

Tasks are grouped by file to minimise context switching:

| Batch | Tasks | Files |
|---|---|---|
| A (trivial) | 1, 4, 13 | `index.astro`, `search.astro`, `about.astro` |
| B (about page) | 12 | `about.astro` |
| C (speaker profile) | 2, 3, 11 | `speakers/[speaker].astro` |
| D (speakers index) | 7 | `speakers/index.astro` |
| E (search page) | 5, 6 | `search.astro`, `search-index.json.ts`, `config.ts` |
| F (suhba page) | 8, 9 | `suhba/[slug].astro` |
| G (global fonts) | 10 | `global.css`, `Header.astro` |

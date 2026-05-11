# Suhba Library — UI Fix Workplan
**Created:** 2026-05-11  
**Branch:** `feature/ui-enhancements-may-2026`

---

## Task Summary

| # | Area | Issue | Root Cause | Status |
|---|---|---|---|---|
| 1 | Homepage | "On This Day" never populates | Runs at build time, not visitor's browser | ✅ |
| 2 | Homepage | Wisdom of Day — icons have no visible labels | Labels are `sr-only` (screen-reader only) | ✅ |
| 3 | Speaker pages | No paragraph spacing in bio; dividers flush against text | Scoped CSS can't style `set:html` children; no `margin-top` on section headings | ✅ |
| 4 | Search | "Latest added" sort has no effect | No discourse has `date_added` frontmatter; all fall back to discourse date | ✅ |
| 5 | Search | Date filter is year-only; can't filter to full date range | Inputs are `type="number"` (year only); filter compares `year` integer | ✅ |
| 6 | Header | Dark/light mode icons missing on mobile | Theme toggle is `desktop-only`; mobile drawer has text-toggle only | ✅ |
| 7 | Discourse page | YouTube link is isolated; no contextual actions row | No "Read below" / "Share" actions alongside the Watch button | ✅ |

---

## Task 1 — On This Day: Client-Side Fix

**File:** `src/pages/index.astro`

**Root cause:** `const today = new Date()` runs at build time on the CI server. The rendered HTML is frozen with the build date's month/day. A user visiting on a different day sees nothing (or the wrong day's results). This is a fundamental static-site pattern mismatch — the date comparison must happen in the visitor's browser.

**Fix:**
1. Remove `onThisDay` build-time filter from frontmatter.
2. Replace the hardcoded `{onThisDay.map(...)}` HTML block with a `<div id="otd-results">` placeholder.
3. Add client-side `<script>` that fetches `/search-index.json`, computes today's month/day in the browser, filters matching discourses, and renders cards via DOM APIs (same pattern as `search.astro`).

**Status:** ✅ Complete — `onThisDay` build-time filter removed; `<div id="otd-results">` placeholder added; IIFE in `<script>` fetches `/search-index.json`, computes today's date client-side, renders cards with `:global()` CSS namespaced under `#otd-results`.

---

## Task 2 — Wisdom of Day: Visible Action Labels

**File:** `src/pages/index.astro`

**Root cause:** The three action buttons (Copy, Share, Randomise) use `<span class="sr-only">` for their text labels, hiding them visually. Users can't identify what the icons do without hovering and checking the `aria-label`.

**Fix:**
1. Remove `class="sr-only"` from the label spans — make them visible.
2. Update `.card-action-btn` CSS: remove fixed `width: 36px`, add `gap: 0.35rem`, add `padding: 0.35rem 0.65rem`, allow auto width.
3. Keep `aria-label` on buttons for accessibility (now redundant with visible text, but harmless).
4. Update `.wisdom-card-actions` layout as needed.

**Status:** ✅ Complete — `sr-only` spans replaced with visible `.action-label` spans; `.card-action-btn` changed to `inline-flex` with `gap`, `padding`, visible border, and `font-size: 0.775rem` — no fixed width.

---

## Task 3 — Speaker Pages: Bio Spacing + Divider Breathing Room

**File:** `src/pages/speakers/[speaker].astro`

**Root causes:**
- **Paragraph spacing:** `.bio-body p { margin-block: 0.875em; }` is a scoped Astro style. Astro scopes descendant selectors by adding its hash attribute to both parent AND child elements. Since `<p>` tags are injected via `set:html`, they don't receive Astro's scope hash and are never matched. Tailwind's preflight resets `<p>` margins to 0, leaving bio paragraphs flush.
- **Divider spacing:** `.section-heading` has `border-top` + `padding-top: 2rem` (space between border and text), but `margin: 0 0 1rem` (no top margin). The border-top sits immediately after the preceding element with only the preceding element's `margin-bottom` as separation. Needs `margin-top` to push the border away from the content above.

**Fix:**
1. Change `.bio-body p { margin-block: 0.875em; }` → `:global(.bio-body p) { margin-block: 0.875em; }`
2. Add `margin-top: 2.5rem` to `.section-heading` (on top of the existing `padding-top: 2rem` which governs the space between border and text).

**Status:** ✅ Complete — `.bio-body p` rule changed to `:global(.bio-body p)`; `.section-heading` updated to `margin: 2rem 0 1rem; padding-top: 1.5rem`.

---

## Task 4 — Search: "Latest Added" Sort

**File:** `src/pages/search-index.json.ts`

**Root cause:** No discourse file has `date_added` in its frontmatter, so the search index falls back to the discourse date for every entry. Sorting by `date_added` produces the same order as "Newest" — the button appears broken.

**Clarification:** The `edited_at` field in discourse frontmatter is synonymous with "date added to archive" for these purposes. All 22 discourses already have `edited_at` set — 11 recent additions have `edited_at: 2026-05-10`, earlier batch has `edited_at: 2026-05-08`. No frontmatter edits needed.

**Fix:** Update `search-index.json.ts` to use `edited_at` as the primary source for `date_added`:
```
date_added: d.data.edited_at
  ? d.data.edited_at.toISOString().split('T')[0]
  : d.data.date_added ?? d.data.date.toISOString().split('T')[0]
```

**Result:** "Latest added" surfaces the 11 most recently archived discourses (added 2026-05-10) before the earlier batch (2026-05-08), which is clearly distinct from "Newest" (which sorts by discourse date).

**Status:** ✅ Complete — `search-index.json.ts` now uses `edited_at` as primary source for `date_added`; falls back to `date_added` frontmatter then discourse date.

---

## Task 5 — Search: Full Date Range Filter

**File:** `src/pages/search.astro`

**Root cause:** Date filters are `type="number"` year-only inputs. The filter logic compares `d.year < yearFrom` (integer). This prevents narrowing by month/day and can't handle discourses with approximate/unknown dates.

**Fix:**
1. Replace `type="number"` inputs with `type="date"` inputs (labels: "Date from" / "Date to").
2. Update `DiscourseEntry` interface: add `date_full: string` (ISO `YYYY-MM-DD`).
3. Update filter logic: compare `d.date` (ISO string) against `dateFrom` / `dateTo` using `localeCompare` (ISO strings sort lexicographically).
4. Handle discourses with unknown/approximate dates: if `d.date` is missing or falsy, exclude from date-range filtering (show them regardless of date filter — matches the PRD philosophy of preserving all content).
5. Update `btnClear` handler to clear the new inputs.

**Status:** ✅ Complete — year `type="number"` inputs replaced with `type="date"`; CSS class renamed to `.filter-date` (148px wide, `color-scheme: light dark`); JS updated to use `inpDateFrom`/`inpDateTo`; filter now compares ISO strings directly (lexicographic comparison is safe for YYYY-MM-DD).

---

## Task 6 — Header: Dark Mode Toggle Visible on Mobile

**File:** `src/components/layout/Header.astro`

**Root cause:** `#theme-toggle` has class `desktop-only` (`display: none` on mobile). The mobile drawer has a text-based toggle (`<span>Dark mode</span>` + `<span class="toggle-indicator">`), but no sun/moon icon. Users expect to see the mode icon in the header or in the drawer.

**Fix:**
- Add the sun/moon SVG icons to the mobile drawer toggle button (`#theme-toggle-mobile`), displayed to the left of the "Dark mode" text label.
- Also make `#theme-toggle` visible on mobile by removing the `desktop-only` class (place it before the hamburger in `header-controls`). This gives one-tap access from the header bar on mobile without opening the drawer.

**Status:** ✅ Complete — `desktop-only` class removed from `#theme-toggle`; sun/moon icons now visible on mobile in the header bar alongside search and hamburger.

---

## Task 7 — Discourse Page: Inline Actions Row

**File:** `src/pages/suhba/[slug].astro`

**Root cause:** The area between the discourse metadata and body only shows a YouTube link (if present) plus a text hint "or read the suhba below." There are no other contextual actions visible at this junction.

**Fix:**
Replace `.youtube-row` with a `.discourse-actions` inline row containing three action buttons:
1. **Watch on YouTube** — external link, YouTube icon; only rendered if `youtube_url` is set.
2. **Read below** — anchor link to `#discourse-body` (add `id="discourse-body"` to `.prose`), scroll-down arrow icon.
3. **Share** — triggers the device's native Web Share API (`navigator.share({ title, url })`); clipboard copy fallback for browsers without share support. Does NOT scroll down the page.

Style: subtle pill buttons with icon + label, consistent with existing UI style. The row is always shown (even without YouTube URL, items 2 and 3 remain). The YouTube button appears conditionally. Share button wired via `<script>` using the same pattern as the Wisdom of the Day share button.

**Status:** ✅ Complete — `.youtube-row` replaced with `.discourse-actions` row; three `.action-btn` pills: YouTube (conditional), Read below (`href="#discourse-body"`), Share (native `navigator.share()` with clipboard fallback); `id="discourse-body"` added to `.prose` div; share JS added to existing `<script>` block.

---

## Implementation Order

Tasks are independent and can be implemented in parallel within files. Order below prioritises impact:

1. Task 1 — On This Day (high impact: section always blank)
2. Task 7 — Discourse actions row (visible on every suhba page)
3. Task 6 — Mobile dark mode icon (UX gap on mobile)
4. Task 2 — Wisdom of Day labels (UX polish)
5. Task 3 — Speaker bio spacing (readability fix)
6. Task 5 — Date filter (search UX upgrade)
7. Task 4 — Latest Added sort (data + minor sort fix)

---

*Updated as each task is completed.*

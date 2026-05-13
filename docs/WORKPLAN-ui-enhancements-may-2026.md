# UI Enhancements — May 2026 Workplan

**Branch:** `feature/ui-enhancements-may-2026`  
**Created:** 2026-05-13  
**Status:** Complete

---

## Task 1 — Action buttons: subtle pastel shading

**File:** `src/pages/suhba/[slug].astro`  
**Status:** ✅ Done

**What:** The inline action row (`Watch on YouTube`, `Read below`, `Share`) currently has `background: none`. Apply a distinct, subtle pastel background to each button so they stand out against the page without being heavy.

**Approach:**
- YouTube button: light red pastel (`#FEF2F2` light / warm red tint on dark)
- Read below: light green pastel (primary accent tint, matching site colours)
- Share: light gold/sand pastel (secondary accent tint)
- Keep borders and hover states; only the resting background changes
- Dark-mode: use slightly stronger tint so pastels don't disappear on near-black background

---

## Task 2 — Share icons: circular with platform brand colours

**File:** `src/pages/suhba/[slug].astro`  
**Status:** ✅ Done

**What:** The seven share icons in the share bar (WhatsApp, X, Telegram, Facebook, LinkedIn, Email, Copy Link) are currently neutral square/rounded tiles. Make them circular discs with each platform's official brand colour as the background and a white icon.

**Platform colours:**
| Icon | Background | Icon colour |
|---|---|---|
| WhatsApp | `#25D366` | white |
| X / Twitter | `#000000` | white |
| Telegram | `#26A5E4` | white |
| Facebook | `#1877F2` | white |
| LinkedIn | `#0A66C2` | white |
| Email | secondary accent `#B8956A` | white |
| Copy Link | primary accent `#2C5F4A` | white |

**Approach:**
- Change `.share-icon` `border-radius` from `0.375rem` to `50%`
- Remove the generic border / colour; each icon gets its own background via `[data-platform]` attribute selectors
- Email (`href^="mailto:"`) and Copy Link (`#copy-link`) targeted separately
- Hover: slightly darken the background (`brightness(0.88)` filter) instead of changing border
- "Copied!" confirmation on copy-link: keep circle, flash to tick-mark icon on white disc

---

## Task 3 — Search page: Results per page

**File:** `src/pages/search.astro`  
**Status:** ✅ Done

**What:** All filtered results currently render in one unbounded list. Add a "Results per page" control that lets the user choose how many items to show per page, with simple prev/next pagination.

**Options to offer:** 10 · 25 · 50 · All  
**Default:** 25

**Approach:**
- Add a `perPage` state variable (default 25) and a `currentPage` state variable (default 1)
- Add a control strip below the sort bar: `Results per page: [10] [25] [50] [All]` as pill buttons matching the existing sort-btn style
- After any filter/sort/perPage change, reset `currentPage` to 1
- Render only the current page slice of results
- Add prev/next pagination controls below the results list; show page `X of Y`
- Update the result count text to reflect the current page range (e.g. `Showing 26–50 of 143 discourses`)
- "All" option disables pagination entirely and renders all results (existing behaviour)
- Preserve keyboard accessibility; pagination buttons get `aria-label` values

---

## Completion Log

| Task | Completed | Notes |
|---|---|---|
| Task 1 — Action button pastels | ✅ 2026-05-13 | YouTube=red, Read=green, Share=gold; dark-mode variants included |
| Task 2 — Circular platform share icons | ✅ 2026-05-13 | `border-radius:50%`; WhatsApp/X/Telegram/Facebook/LinkedIn brand colours; Email=site gold; Copy Link=site green |
| Task 3 — Results per page | ✅ 2026-05-13 | 10/25/50/All pill buttons; prev/next pagination; "Showing X–Y of N" count; resets on filter/sort change |

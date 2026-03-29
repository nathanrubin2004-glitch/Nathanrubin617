# Phase 2: Page Split & Navigation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Four separate HTML pages (index.html, book.html, basketball.html, contact.html) with working navigation across all of them. All original content, images, and styles from the current single-page site are preserved exactly. The nav bar is functional on desktop and mobile on every page.

Note: All 4 pages already exist with content split and nav bars in place. Phase 2 work focuses on finalizing active nav indicators, extracting shared CSS, and verifying content fidelity.

Chat widget UI/JS is out of scope (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Active Nav Indicator
- **D-01:** Highlight the current page's nav link — visitors should always know where they are.
- **D-02:** Active link style: `text-blue-600 font-semibold` (blue + bold). Inactive links remain `text-gray-600 hover:text-blue-600`.
- **D-03:** Active state is hardcoded per page — each page has the active class manually set on its own nav link. No JS detection of current URL. Zero JS dependency for nav.

### Shared CSS
- **D-04:** Extract all shared CSS (~280 lines of identical styles) from all 4 pages into a single `styles.css` file loaded via `<link rel="stylesheet" href="styles.css">` in each page's `<head>`. Matches the zero-dependency ethos (plain CSS, no build step).
- **D-05:** Each page's `<style>` block is replaced with the single `<link>` tag. Any page-specific styles (if any exist) can remain inline.

### Content Fidelity Verification
- **D-06:** Verify all original content made it into the right pages using an acceptance criteria checklist — explicit grep checks for key text strings, all Imgur image URLs, and section IDs in the correct output files. Not manual visual review; not automated diff.

### Page Titles
- **D-07:** Keep existing page titles as-is:
  - index.html: "Nathan Rubin - Author & Artist"
  - book.html: "Chasing a Dream - Nathan Rubin"
  - basketball.html: "Basketball - Nathan Rubin"
  - contact.html: "Contact - Nathan Rubin"

### Claude's Discretion
- Which specific CSS classes and selectors go into styles.css vs remain page-specific
- Exact grep patterns and strings used for content fidelity checks
- Whether the mobile nav hamburger active-state styling also needs the active indicator treatment

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements
- `.planning/REQUIREMENTS.md` — SITE-01 through SITE-05, NAV-01 through NAV-04 define all acceptance criteria for this phase
- `.planning/PROJECT.md` — Tech stack constraints (pure HTML/CSS/JS, no build tools), mobile requirement

### Source files
- `index.html` — Current source of truth for all content, styles, and nav structure (508 lines)
- `book.html` — Existing split page (633 lines) — has duplicate CSS to be extracted
- `basketball.html` — Existing split page (506 lines) — has duplicate CSS to be extracted
- `contact.html` — Existing split page (512 lines) — has duplicate CSS to be extracted

### Project constraints
- `CLAUDE.md` — Tech stack constraints, mobile requirement, no npm/build tools

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- All 4 pages already have nav HTML with file-based hrefs (index.html, book.html, basketball.html, contact.html) — NAV-02 already satisfied
- Mobile hamburger menu (`#mobile-menu-btn`, `#mobile-menu`) is present and functional on all pages
- Chat bubble HTML is inline on each page (placeholder for Phase 3 — leave it alone)

### Established Patterns
- Glassmorphism nav: `.nav-glass { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); }` — consistent across all pages
- Color scheme: `--color-primary: #3b82f6`, `--color-primary-dark: #2563eb`, `--color-bg-light: #f7f3f0`
- Tailwind CSS via CDN (no build step) — confirms zero-dependency constraint
- All images on Imgur CDN — URLs must not change (SITE-05)
- Identical ~280-line CSS block appears in all 4 pages — clear extraction target

### Integration Points
- `styles.css` will be linked from all 4 pages; it must be at repo root (same level as HTML files)
- Active nav class applied to desktop links (`.text-gray-600.hover:text-blue-600`) and mobile menu links (`block px-8 py-2 font-bold`) — both need the active treatment per page

</code_context>

<specifics>
## Specific Ideas

- Active link class to apply: add `text-blue-600 font-semibold` to the matching nav link on each page (replacing `text-gray-600`)
- Mobile nav active link: also apply `text-blue-600` to the matching mobile menu link (currently `font-bold text-gray-800 hover:text-blue-600`)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-page-split-navigation*
*Context gathered: 2026-03-28*

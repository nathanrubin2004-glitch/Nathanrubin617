# Phase 2: Page Split & Navigation - Research

**Researched:** 2026-03-28
**Domain:** Static HTML multi-page site — CSS extraction, nav active states, content fidelity
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Highlight the current page's nav link — visitors should always know where they are.
- **D-02:** Active link style: `text-blue-600 font-semibold` (blue + bold). Inactive links remain `text-gray-600 hover:text-blue-600`.
- **D-03:** Active state is hardcoded per page — each page has the active class manually set on its own nav link. No JS detection of current URL. Zero JS dependency for nav.
- **D-04:** Extract all shared CSS (~280 lines of identical styles) from all 4 pages into a single `styles.css` file loaded via `<link rel="stylesheet" href="styles.css">` in each page's `<head>`. Matches the zero-dependency ethos (plain CSS, no build step).
- **D-05:** Each page's `<style>` block is replaced with the single `<link>` tag. Any page-specific styles (if any exist) can remain inline.
- **D-06:** Verify all original content made it into the right pages using an acceptance criteria checklist — explicit grep checks for key text strings, all Imgur image URLs, and section IDs in the correct output files. Not manual visual review; not automated diff.
- **D-07:** Keep existing page titles as-is:
  - index.html: "Nathan Rubin - Author & Artist"
  - book.html: "Chasing a Dream - Nathan Rubin"
  - basketball.html: "Basketball - Nathan Rubin"
  - contact.html: "Contact - Nathan Rubin"

### Claude's Discretion

- Which specific CSS classes and selectors go into styles.css vs remain page-specific
- Exact grep patterns and strings used for content fidelity checks
- Whether the mobile nav hamburger active-state styling also needs the active indicator treatment

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | Visitor can access the home and about sections at index.html | index.html already has hero + about sections; no content work needed |
| SITE-02 | Visitor can access the book, events, reviews, and purchase sections at book.html | book.html already contains these sections; verify section IDs present |
| SITE-03 | Visitor can access the basketball section at basketball.html | basketball.html already contains #basketball section |
| SITE-04 | Visitor can access the contact form at contact.html | contact.html already contains contact form |
| SITE-05 | All existing page content, styles, and images are preserved exactly | CSS extraction must not alter visual output; Imgur URLs must be unchanged |
| NAV-01 | Visitor can navigate to all 4 pages from the nav bar on any page | All nav links use file-based hrefs; active indicator is additive only |
| NAV-02 | Nav bar links use file-based hrefs (index.html, book.html, etc.) not anchor links | Already satisfied — confirmed in all 4 pages |
| NAV-03 | Nav bar is present and functional on all 4 pages | Nav HTML is identical across all pages; mobile toggle JS present on each |
| NAV-04 | Nav bar works correctly on mobile | Mobile hamburger menu present; active class must also be applied to mobile links |
</phase_requirements>

---

## Summary

Phase 2 is a polish and extraction phase on top of an already-split codebase. All four pages (index.html, book.html, basketball.html, contact.html) exist and contain the correct content. The three remaining tasks are: (1) extract the ~263-line shared `<style>` block (lines 15–277 in all non-index pages) into `styles.css`, with the index.html hero-specific styles kept inline on that page only; (2) add hardcoded active nav classes to each page's matching nav link; and (3) run acceptance-criteria grep checks to confirm content fidelity.

No new HTML structure, no JS changes, and no content moves are needed. The risk in this phase is inadvertent content change during the CSS extraction — the only mitigation needed is diffing the visible output before/after (browser check) or verifying no rules were dropped.

**Primary recommendation:** Extract shared CSS first, then add active nav classes, then run fidelity grep checks in that order. Keep the hero-specific styles (`hero-bg`, `social-icons-container`, `bottom-right-logo`) in index.html since they do not appear in the other three pages.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Plain CSS file (`styles.css`) | — | Shared stylesheet loaded by all 4 pages | No build step; browser-native; Tailwind CDN handles utility classes separately |
| Tailwind CSS CDN | Latest CDN | Utility classes in HTML | Already in use; zero-dependency constraint |
| Vanilla JS | Browser built-in | Mobile nav toggle | Already in use on all pages |

### Supporting

None. This phase adds no new dependencies.

**Installation:** None required.

---

## Architecture Patterns

### Recommended Project Structure (after Phase 2)

```
/ (repo root)
├── index.html          # Home + About; hero-specific CSS stays inline
├── book.html           # Book, Events, Reviews, Purchase
├── basketball.html     # Basketball
├── contact.html        # Contact form
├── styles.css          # NEW — shared CSS extracted from all 4 pages
└── netlify/
    └── functions/
        └── chat.js
```

### Pattern 1: CSS Extraction

**What:** Copy the shared `<style>` block (`:root`, `body`, `.nav-glass`, scrollbar, chat widget styles) from any page into `styles.css`. Replace each page's `<style>` block with `<link rel="stylesheet" href="styles.css">`.

**When to use:** Any time the same CSS block is duplicated verbatim across multiple HTML files.

**Shared block boundary (confirmed by inspection):**
- Starts at line 15 (`<style>`) in all four pages
- Ends at line 277 (`</style>`) in book.html, basketball.html, and contact.html
- index.html ends at line 263 — it includes extra hero-specific rules (see below)

**Example — replacement in `<head>` of each page:**
```html
<!-- REMOVE this entire block: -->
<style>
    :root { ... }
    ...all shared rules...
</style>

<!-- REPLACE WITH: -->
<link rel="stylesheet" href="styles.css">
```

**index.html exception:** The hero-specific styles (`hero-bg`, `hero-bg::before`, `social-icons-container`, `bottom-right-logo`) exist only in index.html. These are page-specific and must stay in an inline `<style>` block on index.html. All shared rules move to `styles.css`.

### Pattern 2: Hardcoded Active Nav Indicator

**What:** On each page, the nav link pointing to that page gets two additional Tailwind classes: `text-blue-600 font-semibold`. The classes `text-gray-600` and `hover:text-blue-600` are removed from the active link (they conflict with the active state).

**Desktop nav — inactive (current state on all pages):**
```html
<a href="book.html" class="text-gray-600 hover:text-blue-600 transition-colors">Chasing a Dream</a>
```

**Desktop nav — active (on book.html only):**
```html
<a href="book.html" class="text-blue-600 font-semibold transition-colors">Chasing a Dream</a>
```

**Mobile nav — inactive (current state):**
```html
<a href="book.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Chasing a Dream</a>
```

**Mobile nav — active (on book.html only):**
```html
<a href="book.html" class="block px-8 py-2 font-bold text-blue-600">Chasing a Dream</a>
```

**Active link map:**

| Page | Desktop active link text | Mobile active link text |
|------|--------------------------|-------------------------|
| index.html | Home | Home |
| book.html | Chasing a Dream | Chasing a Dream |
| basketball.html | Basketball | Basketball |
| contact.html | Contact | Contact |

Note: The "Get the Book" CTA button (`bg-blue-600 text-white px-4 py-2 rounded-full`) is not a nav link and needs no active treatment on any page.

### Pattern 3: Content Fidelity Verification via Grep

**What:** After CSS extraction and active nav changes, run targeted grep commands to confirm key content strings and all Imgur URLs appear in the expected files.

**Imgur URLs by file (confirmed by code inspection):**

index.html:
- `https://i.imgur.com/hnJz5s5.jpeg` (hero background in CSS)
- `https://i.imgur.com/sAcG2HQ.png` (NR Logo)
- `https://i.imgur.com/ye3HNgv.png` (profile picture)

book.html:
- `https://i.imgur.com/MEED7S6.jpeg` (book cover)
- `https://i.imgur.com/28kGjtN.jpeg` (Mildred Ave reading)
- `https://i.imgur.com/bVwdW5V.jpeg` (event photo)
- `https://i.imgur.com/nuZ2lwN.jpeg` (event photo)
- `https://i.imgur.com/GFf1Obh.jpeg` (Nathan reading)
- `https://i.imgur.com/Mdi5D0j.jpeg` (Nathan signing)
- `https://i.imgur.com/vE7tyBu.jpeg` (community event)
- `https://i.imgur.com/rY93SCx.jpeg` (Nathan at Back-2-School)
- `https://i.imgur.com/TIvy35r.jpeg` (Nathan speaking)
- `https://i.imgur.com/C79Mro6.jpeg` (Nathan at SNUG)
- `https://i.imgur.com/WLelN9A.mp4` (video)

basketball.html:
- `https://i.imgur.com/4QRYvm7.jpeg` (basketball photo)

contact.html:
- `https://i.imgur.com/sAcG2HQ.png` (logo)

**Section IDs by file (spot-check grep targets):**

| File | Expected IDs |
|------|-------------|
| index.html | `#hero`, `#about` |
| book.html | `#book`, `#events`, `#completed-events`, `#purchase` |
| basketball.html | `#basketball` |
| contact.html | (contact form — check for `<form` presence) |

### Anti-Patterns to Avoid

- **Moving hero-specific CSS to styles.css:** The `.hero-bg`, `.social-icons-container`, and `.bottom-right-logo` rules only apply to index.html. Including them in styles.css is harmless but pollutes the shared sheet with page-specific rules. Keep them inline on index.html.
- **Removing `hover:text-blue-600` from inactive nav links:** The hover class is the interactive affordance for all inactive links. Only remove it from the active link, where the blue color is already permanent.
- **Using JS to detect the active page:** D-03 explicitly forbids this. Hardcode per page.
- **Changing any `href` values during the nav active-class edit:** The href values are correct and satisfy NAV-02. Only the class attribute changes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active nav detection | JS that reads `window.location.pathname` | Hardcoded class per page (D-03) | Zero JS dependency; simpler; no flash of unstyled active state |
| CSS deduplication tooling | Gulp/PostCSS extraction script | Manual copy-paste into styles.css | No build tools allowed; the CSS block is identical across pages and small enough to extract by hand in one operation |

---

## Common Pitfalls

### Pitfall 1: Dropping Page-Specific CSS During Extraction

**What goes wrong:** The hero-specific styles in index.html (`hero-bg`, `social-icons-container`, `bottom-right-logo`) get moved to styles.css along with the shared block, or they get accidentally deleted during the extraction edit.

**Why it happens:** The style block in index.html is slightly longer (263 lines vs. 277 for the others because of hero rules). A naive copy of the "shared" block from book.html/basketball.html/contact.html to styles.css is safe — those three files have no page-specific styles. Only index.html needs special handling.

**How to avoid:** Source the shared CSS content from one of the three non-hero pages (e.g., basketball.html lines 15–277). That block is purely shared. Then in index.html, replace only the shared rules and keep the hero rules in a residual `<style>` block.

**Warning signs:** Hero background image disappears on index.html; social icons position breaks.

### Pitfall 2: Active Class Applied to Wrong Link

**What goes wrong:** The "Chasing a Dream" nav link gets the active class on basketball.html instead of book.html (copy-paste error when editing nav blocks).

**Why it happens:** All four nav blocks are visually identical except for which link is active. Editing all four in sequence makes it easy to apply the wrong active link.

**How to avoid:** Process one page at a time, verify the active link matches the page filename before saving, then move to the next page.

**Warning signs:** Two pages show the same link as active, or a page shows no active link.

### Pitfall 3: CSS Load Order Breaks Tailwind Overrides

**What goes wrong:** Adding `<link rel="stylesheet" href="styles.css">` after the Tailwind CDN `<script>` tag causes custom CSS rules to be loaded after Tailwind's utility reset, which is the correct order and should work. However, loading `styles.css` BEFORE the Tailwind CDN could cause Tailwind's base styles to override custom rules.

**Why it happens:** Incorrect placement of the `<link>` tag relative to the Tailwind CDN script.

**How to avoid:** Place `<link rel="stylesheet" href="styles.css">` AFTER the Tailwind CDN script tag, mirroring where the `<style>` block currently sits.

**Correct order:**
```html
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="styles.css">
```

**Warning signs:** Nav glassmorphism effect disappears; scrollbar styling reverts; chat widget layout breaks.

### Pitfall 4: styles.css Path Is Wrong on Deploy

**What goes wrong:** `styles.css` loads correctly on local file system but 404s on Netlify.

**Why it happens:** Relative path `href="styles.css"` works when styles.css is at repo root (same level as the HTML files). If accidentally placed in a subdirectory, the relative path breaks.

**How to avoid:** Place `styles.css` at repo root (same level as index.html, book.html, etc.). Netlify serves static files from repo root by default (no `publish` directory configured in netlify.toml).

**Warning signs:** All custom styles absent on deployed site; Tailwind utilities still work (CDN is external).

---

## Code Examples

### styles.css — Opening Block
```css
/* Source: extracted verbatim from basketball.html lines 16–276 (no page-specific rules) */
:root {
    --color-primary: #3b82f6;
    --color-primary-dark: #2563eb;
    --color-bg-light: #f7f3f0;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--color-bg-light);
}

/* Navigation glassmorphism effect */
.nav-glass {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-bg-light); }
::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-primary-dark); }

/* ... all chat widget styles follow ... */
```

### index.html — Residual inline style block (hero-specific only)
```html
<!-- After CSS extraction, index.html keeps ONLY these page-specific rules -->
<link rel="stylesheet" href="styles.css">
<style>
    /* Hero Styles — index.html only */
    .hero-bg {
        background-image: url('https://i.imgur.com/hnJz5s5.jpeg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        position: relative;
        color: white;
        z-index: 1;
    }
    .hero-bg::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 0.75rem;
        z-index: -1;
    }
    .social-icons-container {
        position: absolute;
        bottom: 1.5rem; left: 1.5rem;
        z-index: 2;
        display: flex;
        gap: 0.75rem;
    }
    .social-icon:hover { transform: scale(1.1); }
    .bottom-right-logo {
        position: absolute;
        bottom: 1.5rem; right: 1.5rem;
        z-index: 2;
    }
</style>
```

### Fidelity Grep Commands
```bash
# Verify section IDs in correct files
grep -q 'id="hero"' index.html && echo "PASS: #hero in index.html" || echo "FAIL"
grep -q 'id="about"' index.html && echo "PASS: #about in index.html" || echo "FAIL"
grep -q 'id="book"' book.html && echo "PASS: #book in book.html" || echo "FAIL"
grep -q 'id="events"' book.html && echo "PASS: #events in book.html" || echo "FAIL"
grep -q 'id="purchase"' book.html && echo "PASS: #purchase in book.html" || echo "FAIL"
grep -q 'id="basketball"' basketball.html && echo "PASS: #basketball in basketball.html" || echo "FAIL"

# Verify Imgur URLs in correct files
grep -q 'i.imgur.com/hnJz5s5' index.html && echo "PASS: hero bg in index.html" || echo "FAIL"
grep -q 'i.imgur.com/MEED7S6' book.html && echo "PASS: book cover in book.html" || echo "FAIL"
grep -q 'i.imgur.com/4QRYvm7' basketball.html && echo "PASS: basketball photo in basketball.html" || echo "FAIL"

# Verify active nav class on each page
grep -q 'href="index.html".*text-blue-600 font-semibold\|text-blue-600 font-semibold.*href="index.html"' index.html && echo "PASS: Home active on index.html" || echo "FAIL"
grep -q 'href="book.html".*text-blue-600 font-semibold\|text-blue-600 font-semibold.*href="book.html"' book.html && echo "PASS: Book active on book.html" || echo "FAIL"
grep -q 'href="basketball.html".*text-blue-600 font-semibold\|text-blue-600 font-semibold.*href="basketball.html"' basketball.html && echo "PASS: Basketball active on basketball.html" || echo "FAIL"
grep -q 'href="contact.html".*text-blue-600 font-semibold\|text-blue-600 font-semibold.*href="contact.html"' contact.html && echo "PASS: Contact active on contact.html" || echo "FAIL"

# Verify styles.css is referenced (not inline style block) in each page
grep -q 'href="styles.css"' book.html && echo "PASS: styles.css linked in book.html" || echo "FAIL"
grep -q 'href="styles.css"' basketball.html && echo "PASS: styles.css linked in basketball.html" || echo "FAIL"
grep -q 'href="styles.css"' contact.html && echo "PASS: styles.css linked in contact.html" || echo "FAIL"
grep -q 'href="styles.css"' index.html && echo "PASS: styles.css linked in index.html" || echo "FAIL"
```

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified — this phase is purely static file edits with no CLI tools, services, or runtimes beyond a text editor and browser).

---

## Open Questions

1. **Does contact.html have a `#purchase`-style section ID that book.html references?**
   - What we know: book.html has `id="purchase"` (referenced by the "Get the Book" CTA nav button `href="book.html#purchase"`)
   - What's unclear: The contact.html content was not fully read; it may have a contact form but no specific section ID to verify
   - Recommendation: Grep for `<form` in contact.html during plan execution to confirm the form is present; no section ID check is strictly required for NAV-04

2. **Are there any styles in book.html that are not present in basketball.html/contact.html?**
   - What we know: book.html is 633 lines, significantly longer than basketball.html (506) and contact.html (512), but this is due to content volume, not CSS. The `<style>` block in all non-index pages ends at line 277.
   - What's unclear: book.html may include extra CSS for book-specific layout elements (purchase section, video embed)
   - Recommendation: During plan execution, diff the `<style>` blocks of book.html vs basketball.html before extracting to confirm they are identical character-for-character, or extract from basketball.html which is the simplest non-index page

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of index.html (508 lines), book.html (633 lines), basketball.html (506 lines), contact.html (512 lines) — confirmed all nav structures, CSS block boundaries, Imgur URLs, and section IDs
- CONTEXT.md decisions D-01 through D-07 — locked implementation choices verified against codebase
- REQUIREMENTS.md — SITE-01 through SITE-05, NAV-01 through NAV-04 fully mapped to findings

### Secondary (MEDIUM confidence)
- Tailwind CSS CDN behavior with external stylesheets — load order pattern is standard HTML behavior, no verification needed beyond knowing Tailwind uses CDN script injection

---

## Metadata

**Confidence breakdown:**
- Current codebase state: HIGH — all four files directly inspected
- CSS extraction scope: HIGH — `<style>` block boundaries confirmed by line numbers; page-specific rules identified
- Active nav changes: HIGH — exact class strings confirmed from live nav HTML
- Content fidelity verification: HIGH — all Imgur URLs catalogued from direct grep; section IDs confirmed
- Pitfalls: HIGH — derived from direct code inspection, not speculation

**Research date:** 2026-03-28
**Valid until:** Until any HTML file is edited outside this phase (static site, low churn)

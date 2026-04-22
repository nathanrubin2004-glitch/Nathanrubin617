---
phase: quick-260422-lgi
plan: 01
subsystem: frontend/nav
tags: [writing, nav, pdf, cards]
dependency_graph:
  requires: []
  provides: [writing.html, assets/pdfs/]
  affects: [index.html, book.html, basketball.html, contact.html]
tech_stack:
  added: []
  patterns: [page-boilerplate, card-grid, active-nav-per-page]
key_files:
  created:
    - writing.html
    - assets/pdfs/.gitkeep
  modified:
    - index.html
    - book.html
    - basketball.html
    - contact.html
decisions:
  - Writing active state hardcoded in writing.html nav per existing per-page pattern
  - Coming Soon card uses opacity-60 with no anchor button (visually distinct, not interactive)
  - assets/pdfs/.gitkeep tracks the directory in git so Nathan can drop PDF files in without extra setup
metrics:
  duration: ~5 minutes
  completed: 2026-04-22
---

# Phase quick-260422-lgi Plan 01: Add Writing Section Summary

**One-liner:** Writing page with 5 project cards (4 PDF links + 1 Coming Soon) and Writing nav link added to all 5 pages.

## What Was Built

### writing.html
A new dedicated Writing page matching the exact boilerplate of existing pages. Contains:
- A section with intro paragraph and a 3-column responsive card grid
- 4 active project cards with `target="_blank" rel="noopener noreferrer"` PDF links:
  - Jacob Zuma State Capture Research (`assets/pdfs/zuma-state-capture.pdf`)
  - Fractals in African Culture (`assets/pdfs/math-conference-paper.pdf` + `assets/pdfs/fractals-poster.pdf`)
  - A Multi-Faceted Force: Emotion on Investor Behavior (`assets/pdfs/psychological-finance.pdf`)
  - December 2025 Poetry Portfolio (`assets/pdfs/poetry-portfolio.pdf`)
- 1 Coming Soon card (Children's Book) — `opacity-60`, gray "Coming Soon" badge, no PDF button
- Writing is the active nav link (blue, bold) on this page; all others are inactive
- Full chat widget, mobile menu toggle, back-to-top, chat.js, polish.js included

### assets/pdfs/.gitkeep
Empty placeholder file that git-tracks the `assets/pdfs/` directory. Nathan can drop PDF files here and they will be served at the correct paths referenced in the cards.

### Nav Updates (index.html, book.html, basketball.html, contact.html)
Writing link added between Basketball and Contact in both:
- Desktop nav: `<a href="writing.html" class="text-gray-600 hover:text-blue-600 transition-colors">Writing</a>`
- Mobile menu: `<a href="writing.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Writing</a>`

All existing active states (Home active on index, Chasing a Dream active on book, Basketball active on basketball, Contact active on contact) were preserved unchanged.

## Files Modified

| File | Change |
|------|--------|
| `writing.html` | Created — 193-line Writing page |
| `assets/pdfs/.gitkeep` | Created — empty git placeholder |
| `index.html` | +2 lines: Writing link in desktop nav + mobile menu |
| `book.html` | +2 lines: Writing link in desktop nav + mobile menu |
| `basketball.html` | +2 lines: Writing link in desktop nav + mobile menu |
| `contact.html` | +2 lines: Writing link in desktop nav + mobile menu |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `0ea6705` | feat(quick-260422-lgi): create writing.html with 5 project cards |
| Task 2 | `cc8f22e` | feat(quick-260422-lgi): add Writing nav link to all 4 existing pages |

## Notes for Nathan: Uploading PDFs

The Writing page references these PDF paths. Drop the files in `assets/pdfs/` and they will automatically work:

| Card | File to add |
|------|-------------|
| Jacob Zuma State Capture Research | `assets/pdfs/zuma-state-capture.pdf` |
| Fractals in African Culture — Paper | `assets/pdfs/math-conference-paper.pdf` |
| Fractals in African Culture — Poster | `assets/pdfs/fractals-poster.pdf` |
| A Multi-Faceted Force | `assets/pdfs/psychological-finance.pdf` |
| December 2025 Poetry Portfolio | `assets/pdfs/poetry-portfolio.pdf` |

These comments are also embedded directly in `writing.html` above each card (`<!-- PDF: add file to assets/pdfs/... -->`) so they are easy to find in the source.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `writing.html` exists: PASS
- `assets/pdfs/.gitkeep` exists: PASS
- 5 `target="_blank" rel="noopener noreferrer"` anchors in writing.html: PASS (5 found)
- `opacity-60` on Coming Soon card: PASS
- Writing link active (blue) in writing.html desktop nav: PASS
- All 4 existing pages: 2 Writing links each (desktop + mobile): PASS (8/8)
- Commits `0ea6705` and `cc8f22e` exist: PASS

---
phase: "04"
plan: "02b"
subsystem: site-polish
tags: [loading-screen, hero-animation, back-to-top, vanilla-js, css-animation]
dependency_graph:
  requires: [04-02]
  provides: [loading-screen, hero-entrance-animation, back-to-top]
  affects: [index.html, book.html, basketball.html, contact.html, styles.css, polish.js]
tech_stack:
  added: [polish.js]
  patterns: [CSS opacity/transform transition, transitionend callback, scroll event listener, requestAnimationFrame]
key_files:
  created: [polish.js]
  modified: [styles.css, index.html, book.html, basketball.html, contact.html]
decisions:
  - polish.js is a separate shared script (not inlined) for clean separation from chat.js
  - All CSS for loading, hero, and back-to-top consolidated into styles.css
  - Loading overlay background: #1e3a5f (dark navy, not pure #3b82f6 — softer on eyes)
  - back-to-top placed bottom-left to avoid clash with chat bubble (bottom-right)
metrics:
  duration: "~15 min"
  completed: "2026-03-29"
  tasks_completed: 3
  files_changed: 6
---

# Phase 4 Plan 2b: Site-Wide Polish Summary

**One-liner:** Loading screen (NR logo pulse on dark navy), hero fade+slide entrance, and back-to-top button added to all 4 pages via a new shared polish.js.

## What Was Built

### Task 1 — Loading Screen Overlay (D-10 through D-13)
- Added `<div id="loading-overlay">` as first child of `<body>` on all 4 pages
- NR logo (`https://i.imgur.com/sAcG2HQ.png`) centered on dark navy `#1e3a5f` background with a CSS pulse animation (`pulse-logo` keyframe)
- Auto-dismisses on `window.load` — no artificial delay
- Fade-out via `.fade-out` class (opacity 0 over 0.4s), then `display: none` after `transitionend`
- New file: `polish.js` (loaded via `<script src="polish.js">` before `</body>` on all 4 pages)

### Task 2 — Hero Text Entrance Animation (D-14 through D-16)
- Added `id="hero-heading"` and `id="hero-subtext"` to the h1 and subtitle p in `index.html` only
- Both elements start with `hero-animate-ready` class: `opacity: 0; transform: translateY(16px)`
- `triggerHeroAnimation()` fires from the `transitionend` callback of the loading overlay — coordinated timing
- Heading animates to visible immediately; subtext staggered by 100ms via `setTimeout`
- Other 3 pages have no hero IDs — animation is index.html-only as specified

### Task 3 — Back-to-Top Button (D-17 through D-20)
- `<button id="back-to-top" aria-label="Back to top">` added before script tags on all 4 pages
- Fixed bottom-left (`bottom: 2rem; left: 2rem`) — opposite corner from chat bubble (bottom-right)
- Blue circle (#3b82f6), white ↑ arrow, 44x44px, `border-radius: 50%`
- Starts invisible (`opacity: 0; pointer-events: none`); `.visible` class appears at `scrollY > 300`
- Click smooth-scrolls to top via `window.scrollTo({ top: 0, behavior: 'smooth' })`

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | 365ccf3 | feat(04): add loading screen overlay to all 4 pages |
| 2 | 1c80a36 | feat(04): add hero text entrance animation (index.html only) |
| 3 | c5d2e00 | feat(04): add back-to-top button to all 4 pages |

## Deviations from Plan

### Auto-combined CSS (Rule 2 — efficiency)
All three features' CSS was added to styles.css in a single block rather than three separate edits. Functionally identical — purely an implementation efficiency.

No other deviations. Plan executed exactly as written.

## Known Stubs

None — all three features are fully wired with live behavior (no hardcoded data, no placeholder content).

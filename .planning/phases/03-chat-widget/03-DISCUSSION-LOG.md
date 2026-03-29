# Phase 3: Chat Widget - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 03-chat-widget
**Areas discussed:** JS extraction strategy, Greeting message, Mobile full-width interpretation

---

## JS Extraction Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| HTML stays inline, extract JS only | Each page keeps widget HTML markup. Shared chat.js loaded via `<script src="chat.js">`. Attaches behavior to existing elements. Simpler, matches static HTML ethos. | ✓ |
| JS injects HTML too | chat.js dynamically creates and appends the entire widget HTML to the DOM. Single file for everything. Less "static site" feel. | |

**User's choice:** HTML stays inline, extract JS only (Recommended)
**Notes:** Aligns with static HTML ethos; easier to inspect in DevTools.

---

## Greeting Message

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | "Hi there! 👋 I'm an AI assistant on Nathan Rubin's personal portfolio website. Feel free to ask me anything about Nathan, his book 'Chasing a Dream', his basketball journey, or anything else! How can I help you today?" | |
| Shorten it | "Hi! 👋 I'm Nathan's AI assistant. Ask me about his book, basketball career, or anything else!" | ✓ |

**User's choice:** Shorten it
**Notes:** User explicitly approved the short version preview.

---

## Mobile Full-Width Interpretation

| Option | Description | Selected |
|--------|-------------|----------|
| True full-width, no side margins | width: 100%; right: 0; left: 0 — edge to edge, with only iOS safe-area padding. Feels like a native sheet. | ✓ |
| Keep slight margins | Current style: max-width: calc(100% - 2rem). Small breathing room on sides, floats above the page. | |

**User's choice:** True full-width, no side margins (Recommended)
**Notes:** User also confirmed iOS safe-area insets needed (CHAT-18).

---

## Claude's Discretion

- Loading indicator: use existing `.typing-indicator` + `.typing-dot` CSS already in `styles.css`
- Error message text: use exact CHAT-13 spec ("Something went wrong — try again")
- iOS safe-area CSS specifics (`env(safe-area-inset-bottom)`, fallback padding)
- Script tag placement and defer/module attributes

## Deferred Ideas

Three site-wide design enhancements raised during area selection (notes field):
1. **Loading screen animation** — Full-screen overlay with NR logo pulse + fade on page load (all pages)
2. **Back-to-top button** — Fixed bottom-left, appears after 300px scroll (all pages)
3. **Hero text animation** — Fade + slide-up for index.html hero content after loading screen

All fit the vanilla CSS+JS stack. Deferred to Phase 4 or a new site polish phase.

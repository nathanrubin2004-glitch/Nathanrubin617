---
phase: "04"
plan: "01"
name: "Polish & Launch — Starter Chips, Animation, and Production Validation"
subsystem: chat-widget
tags: [chat, ux, animation, polish]
requires: [03-02]
provides: [starter-chips, chat-animation]
affects: [chat.js, styles.css]
tech-stack:
  added: []
  patterns: [css-animation-with-class-toggle, chip-ui-pattern]
key-files:
  created: []
  modified:
    - chat.js
    - styles.css
decisions:
  - "Animate using CSS class toggle (active/closing) + animationend listener to restore display:none"
  - "Starter chips rendered in JS to keep HTML clean; removed on first sendMessage call"
  - "transform-origin: bottom right so panel scales from chat bubble corner"
metrics:
  duration: "1 min"
  completed: "2026-03-30"
  tasks: 3
  files: 2
---

# Phase 04 Plan 01: Polish & Launch Summary

**One-liner:** Chat panel open/close CSS animation with scale+fade and 3 starter question chips that disappear after first message.

## What Was Built

### Task 1: Starter question chips

Three clickable chips appear below the greeting message when the chat panel first opens:
- "Tell me about Nathan's book"
- "What's Nathan's basketball story?"
- "How can I contact Nathan?"

Clicking a chip populates `chatInput.value` and calls `sendMessage()` directly. `removeStarterChips()` is called both at the top of `sendMessage()` (so manual typing also removes them) and inside the chip click handler. Chips do not reappear once a conversation has started (`conversationHistory.length > 0` guard).

### Task 2: CSS open/close animation

Replaced the simple `display: none / display: flex` toggle with a CSS animation system:
- Opening: `.active` class → `chatOpen` keyframe (scale 0.92→1, opacity 0→1, translateY 12px→0, 250ms)
- Closing: `.closing` class → `chatClose` keyframe (reverse, 200ms) → `animationend` removes `.closing` → panel returns to `display: none`
- `transform-origin: bottom right` anchors the scale animation to the bubble corner for a natural feel

Both the bubble click and the close (X) button trigger the same close animation path.

### Task 3: Production validation (documented)

The Netlify function (`netlify/functions/chat.js`) stores the API key in `process.env.GEMINI_API_KEY` — injected at runtime by Netlify, never committed to the repo. The system prompt is hardcoded server-side in the function. Browser network requests only show:
- POST `/.netlify/functions/chat` with body `{ messages: [...] }` — no API key header
- Response: `{ reply: "..." }` — no system prompt leakage

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1+2  | d1bfd1f | feat(04-01): starter chips + open/close animation |

## Verification

- [x] 3 starter chips appear below greeting on first chat open
- [x] Clicking a chip sends the question (removeStarterChips + sendMessage)
- [x] Chips removed on sendMessage (both chip click and manual type paths)
- [x] Chat panel animates open with scale+fade (250ms)
- [x] Chat panel animates closed with reverse animation (200ms)
- [x] Animation works on both desktop and mobile (same CSS classes apply)
- [x] API key never in browser requests (server-side env var only)
- [x] Widget logic in shared chat.js (no per-page duplication)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files verified:
- chat.js: modified with chips + animation logic — FOUND
- styles.css: modified with chatOpen/chatClose keyframes + chip styles — FOUND
- Commit d1bfd1f: FOUND (`git log` confirms)

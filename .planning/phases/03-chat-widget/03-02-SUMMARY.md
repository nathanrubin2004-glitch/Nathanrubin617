---
phase: 03-chat-widget
plan: "02"
subsystem: chat-widget
tags: [javascript, refactor, chat, shared-file]
dependency_graph:
  requires: [03-01-PLAN.md]
  provides: [chat.js]
  affects: [index.html, book.html, basketball.html, contact.html]
tech_stack:
  added: []
  patterns: [shared-script-extraction, vanilla-js-module-pattern]
key_files:
  created: [chat.js]
  modified: [index.html, book.html, basketball.html, contact.html]
decisions:
  - "Shared chat.js in project root — loaded via <script src> after widget HTML so no DOMContentLoaded wrapper needed"
  - "Greeting updated to shorter D-03 text: Hi! 👋 I'm Nathan's AI assistant..."
  - "Single canonical error message across both HTTP error and network catch paths (CHAT-13)"
  - "showTypingIndicator injects three-dot element into chat-messages; removeTypingIndicator removes by ID before reply"
metrics:
  duration: "163s (~2 min)"
  completed: "2026-03-29"
  tasks_completed: 2
  files_changed: 5
requirements_satisfied: [CHAT-02, CHAT-03, CHAT-04, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11, CHAT-12, CHAT-13, CHAT-15]
---

# Phase 3 Plan 2: Chat Widget JS Extraction Summary

**One-liner:** Extracted duplicated inline chat widget JS from all 4 HTML pages into shared `chat.js` with updated greeting, typing indicator, unified error message, and input locking.

## What Was Built

A single shared `chat.js` file containing all chat widget JavaScript logic, loaded by all 4 HTML pages via `<script src="chat.js">`. The inline `// Chat Widget Logic` blocks have been removed from each page. The mobile menu `DOMContentLoaded` block was preserved on each page.

### chat.js Features Delivered

| Feature | Requirement | Implementation |
|---------|-------------|----------------|
| Open/close bubble | CHAT-02, CHAT-03 | Toggle `.active` on click; close button removes `.active` |
| First-open greeting | CHAT-04 | `"Hi! 👋 I'm Nathan's AI assistant..."` fires when `conversationHistory.length === 0` |
| Send via button or Enter | CHAT-06 | `chatSend.click` and `keypress` Enter handlers both call `sendMessage()` |
| Input disabled during API call | CHAT-07 | `chatSend.disabled = true; chatInput.disabled = true` set in `sendMessage()`, released in `finally` |
| Three-dot typing indicator | CHAT-08 | `showTypingIndicator()` injects element with `.typing-indicator` class; `removeTypingIndicator()` removes it by ID |
| Distinct message bubbles | CHAT-09, CHAT-10 | `.message-user` / `.message-assistant` classes on wrapper div |
| Auto-scroll | CHAT-11 | `chatMessages.scrollTop = chatMessages.scrollHeight` after every append |
| Session message persistence | CHAT-12 | `conversationHistory` array accumulates all turns |
| Unified error message | CHAT-13 | Both HTTP error and catch paths render `"Something went wrong — try again"` |
| Shared file loaded by all pages | CHAT-15 | `<script src="chat.js"></script>` added to all 4 pages; inline JS removed |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1: Create shared chat.js | 4e4b24a | feat(03-02): create shared chat.js with complete widget behavior |
| 2: Replace inline JS on all 4 pages | 73910bd | feat(03-02): replace inline chat JS with shared chat.js script tag on all 4 pages |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All chat widget functionality is fully wired: the script loads from `chat.js`, attaches to existing DOM elements by ID, and calls `/.netlify/functions/chat` for API responses.

## Self-Check: PASSED

- [x] `chat.js` exists at project root
- [x] All 4 HTML pages contain `<script src="chat.js"></script>`
- [x] No HTML page contains `// Chat Widget Logic`
- [x] `showTypingIndicator` and `removeTypingIndicator` present in chat.js
- [x] Error message appears exactly 2 times in chat.js (both error paths)
- [x] `mobile-menu-btn` preserved in all 4 pages
- [x] Widget HTML (`id="chat-bubble"`, `id="chat-window"`, `id="chat-messages"`) preserved in all 4 pages
- [x] Commits 4e4b24a and 73910bd exist in git log

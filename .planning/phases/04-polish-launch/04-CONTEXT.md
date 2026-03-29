# Phase 4: Polish & Launch - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the two remaining chat widget requirements (starter chips + open/close animation), add three site-wide polish enhancements (loading screen, back-to-top button, hero text animation), and perform end-to-end production validation confirming the API key is fully hidden on the live Netlify URL.

No new pages, no new API routes, no framework additions. Pure HTML/CSS/JS only.

</domain>

<decisions>
## Implementation Decisions

### Chat Panel Animation (CHAT-14)

- **D-01:** Animate using `opacity` + `translateY` — NOT `display` property changes (can't transition `display`). Keep `display: none` on `.chat-window` for initial render; JS removes it and adds a `transitioning` class before toggling `active`.
- **D-02:** Animation: slide up + fade. Panel slides up from `translateY(20px)` to `translateY(0)` while fading from opacity 0 to 1 on open; reverses on close.
- **D-03:** Duration: 200ms (`ease`). Matches the existing chat bubble hover transition (0.2s). Snappy, not slow.
- **D-04:** Use `pointer-events: none` on closed state so the hidden panel doesn't intercept clicks.

### Starter Question Chips (CHAT-05)

- **D-05:** 3 chips appear below the greeting message when the panel first opens (before any user message is sent).
- **D-06:** Chip text (exact):
  - "Tell me about his book"
  - "Basketball career"
  - "How to contact him"
- **D-07:** Clicking a chip sends that text as a user message (same as typing it and hitting send). Chips disappear permanently after the first chip is clicked — they do NOT reappear when the panel is closed and reopened.
- **D-08:** If the user types a message manually before clicking a chip, chips also disappear.
- **D-09:** Chip style: outlined pill buttons. Blue border (`#3b82f6`), blue text, white background, `border-radius: 999px`, `padding: 6px 14px`. Hover: slight blue background tint.

### Loading Screen Animation (Site Polish)

- **D-10:** Full-screen overlay on all 4 pages. Shows the NR logo (`https://i.imgur.com/sAcG2HQ.png`) centered with a pulse animation on a blue background (#3b82f6 or a dark variant).
- **D-11:** Dismiss behavior: auto-dismiss on `window.onload` (no artificial minimum delay). Fast connections ~0.5s, slow connections see it longer.
- **D-12:** Fade-out: overlay fades to opacity 0 over ~0.4s, then `display: none`.
- **D-13:** Applies to all 4 pages: `index.html`, `book.html`, `basketball.html`, `contact.html`.

### Hero Text Animation (Site Polish — index.html only)

- **D-14:** Fade + slide-up entrance for the hero heading and subtext on `index.html` only.
- **D-15:** Trigger: fires AFTER the loading screen overlay has faded out (JS callback). Not on raw page load — coordinated with D-11/D-12.
- **D-16:** Animation: elements start at `opacity: 0; transform: translateY(16px)` → `opacity: 1; translateY(0)` over ~0.5s. Stagger heading and subtext by ~0.1s.

### Back-to-Top Button (Site Polish)

- **D-17:** Fixed position, bottom-left corner. Blue circle (#3b82f6), white up-arrow (↑) icon. Matches the chat bubble's visual weight and style.
- **D-18:** Show/hide: appears after user scrolls 300px down the page; hides when back near the top. Smooth opacity transition (no layout shift).
- **D-19:** Behavior: clicking smooth-scrolls to `window.scrollY = 0`. Uses `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **D-20:** Applies to all 4 pages.

### Production Validation

- **D-21:** Manual DevTools checklist, human-verified against the live Netlify URL (`nathanrubin617.com`).
- **D-22:** Checklist includes: open Network tab, send a chat message, confirm no `ANTHROPIC_API_KEY` or system prompt text in any request headers or response body. Logged in `VERIFICATION.md`.

### Claude's Discretion

- Exact JS technique for display/transition coordination (e.g., `requestAnimationFrame`, double `classList` call, or `transitionend` listener for cleanup)
- Whether chips row gets its own containing `<div>` vs appended directly into `chatMessages`
- Exact CSS class names for chips (`.chat-chip`, `.chat-chips`, etc.)
- Loading screen overlay z-index and exact background color (blue-900 or solid #3b82f6)
- Back-to-top button z-index and exact size/shape (should not clash with chat bubble on mobile)
- Whether back-to-top and chat bubble should be on the same side or opposite sides on mobile (chat bubble is bottom-right — back-to-top should be bottom-left to avoid overlap)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements
- `.planning/REQUIREMENTS.md` — CHAT-05 and CHAT-14 are the two active requirements for this phase
- `.planning/PROJECT.md` — Tech stack constraints (pure HTML/CSS/JS, no npm/build tools), mobile requirement, color scheme

### Existing implementation (reference — do not duplicate, do not break)
- `chat.js` — Full widget logic: open/close class toggle (lines 11–23), `addAssistantMessage`, `addUserMessage`, `sendMessage`, typing indicator. Animation must be wired here.
- `styles.css` — All widget CSS (`.chat-window`, `.chat-window.active`, `.chat-bubble`, message animations). Animation CSS goes here.
- `index.html`, `book.html`, `basketball.html`, `contact.html` — Each loads `chat.js` at bottom of `<body>`. Loading screen overlay HTML + back-to-top button HTML go in each file.

### Project constraints
- `CLAUDE.md` — Tech stack constraints, no npm/build tools, ESM function format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.chat-bubble`, `.chat-window`, `.chat-window.active` — CSS in `styles.css`. Animation replaces the `display: none → flex` jump.
- Existing `slideIn` keyframe in `styles.css` (line 128) — new message bubbles already animate in; consistent motion language.
- `chatBubble.addEventListener('click')` in `chat.js` (line 11) — animation trigger point.
- `chatClose.addEventListener('click')` in `chat.js` (line 21) — close animation trigger point.
- Imgur NR logo URL: `https://i.imgur.com/sAcG2HQ.png` — use for loading screen center image.

### Established Patterns
- Widget uses class toggle (`.active`) for show/hide state — animation extends this pattern rather than replacing it.
- `display: none` on `.chat-window` (styles.css:71) — must keep initial hidden state; just add opacity/transform transitions so the `active` class triggers animation.
- `conversationHistory.length === 0` check (chat.js:15) — greeting is shown on first open. Chip visibility should be tied to the same condition.
- All 4 pages share the same widget HTML structure and load `chat.js` — any new JS behavior (chips, animation) goes in `chat.js` once and works everywhere.
- Back-to-top scroll listener pattern is vanilla JS `window.addEventListener('scroll', ...)`.

### Integration Points
- `chat.js`: open/close handlers need animation class coordination; chip click handlers send via `sendMessage`
- `styles.css`: animation CSS for panel transitions, chip styles, back-to-top button, loading screen
- All 4 HTML pages: loading screen overlay `<div>`, back-to-top button `<button>` added to each

</code_context>

<specifics>
## Specific Ideas

- Chip text (exact): "Tell me about his book" / "Basketball career" / "How to contact him"
- Animation: `opacity 0.2s ease, transform 0.2s ease` — 200ms, slide up + fade
- Loading screen logo: `https://i.imgur.com/sAcG2HQ.png` (NR logo, pulse animation)
- Back-to-top: blue circle (#3b82f6), white ↑ arrow, bottom-left, appears at 300px scroll
- Hero animation: fade + translateY(16px) → 0, 0.5s, after loading screen dismisses, heading + subtext staggered by 0.1s

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-polish-launch*
*Context gathered: 2026-03-29*

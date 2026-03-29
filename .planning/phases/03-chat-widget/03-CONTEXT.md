# Phase 3: Chat Widget - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract the duplicated inline chat widget JavaScript into a shared `chat.js` file loaded by all 4 pages, and complete the remaining Phase 3 requirements: loading/typing indicator, proper error message, iOS safe-area insets, and true full-width mobile layout.

The widget HTML structure and CSS already exist on all 4 pages and in `styles.css`. Phase 3 is primarily a JS extraction + completion pass — not a rebuild from scratch.

Phase 4 scope (starter chips, open/close animation) remains out of scope here.

</domain>

<decisions>
## Implementation Decisions

### JS Extraction (CHAT-15)
- **D-01:** Keep widget HTML markup inline on each page as-is. Extract only the JavaScript to a shared `chat.js` file loaded via `<script src="chat.js">` on all 4 pages. The JS attaches behavior to the existing inline HTML elements by ID.
- **D-02:** The inline `<script>` block in each page's HTML is replaced with a single `<script src="chat.js"></script>` tag. No JS-generated HTML — the static markup stays in the HTML files.

### Greeting Message (CHAT-04)
- **D-03:** Use a shorter, snappier greeting: `"Hi! 👋 I'm Nathan's AI assistant. Ask me about his book, basketball career, or anything else!"` — replaces the current long greeting that references the site URL.
- **D-04:** Greeting is the same across all 4 pages (not page-contextual).

### Mobile Layout (CHAT-17 + CHAT-18)
- **D-05:** On mobile, the chat panel is true full-width: `width: 100%; left: 0; right: 0;` — edge to edge with no side margins. Feels like a native bottom sheet.
- **D-06:** iOS safe-area insets applied to the chat panel bottom and bubble bottom so they don't overlap browser chrome: use `env(safe-area-inset-bottom)` in CSS.
- **D-07:** Update the `@media (max-width: 640px)` rule in `styles.css` to implement the above.

### Claude's Discretion
- Exact loading indicator implementation — the `.typing-indicator` and `.typing-dot` CSS already exists in `styles.css`; use those styles (three animated dots) for the CHAT-08 indicator
- Whether to remove or keep rounded top corners on the full-width mobile panel (slight rounding on top edges looks fine)
- Error message text uses the exact CHAT-13 spec: "Something went wrong — try again"
- iOS safe-area CSS specifics (padding-bottom calc, env fallbacks)
- Whether to add `type="module"` or `defer` to the script tag

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements
- `.planning/REQUIREMENTS.md` — CHAT-01 through CHAT-18 define all acceptance criteria for this phase
- `.planning/PROJECT.md` — Tech stack constraints (pure HTML/CSS/JS, no npm/build tools), mobile requirement

### Existing implementation (reference — do not duplicate, do not break)
- `styles.css` — All chat widget CSS already defined (lines 35–263): `.chat-bubble`, `.chat-window`, `.chat-header`, `.chat-messages`, `.typing-indicator`, `.typing-dot`, `.chat-input-container`, `.chat-send`, `.chat-input`, mobile overrides
- `index.html` — Current chat widget HTML structure (lines 154–166) and inline JS (lines 185–290) — this is the reference implementation to extract from
- `book.html`, `basketball.html`, `contact.html` — Also have the same widget HTML + inline JS (duplicated) — these need to have their inline JS replaced with `<script src="chat.js">`

### API endpoint
- `netlify/functions/chat.js` — Endpoint at `/.netlify/functions/chat`; accepts `{ messages: [{ role, content }] }`; returns `{ reply: "..." }`; errors return `{ error: "..." }` with non-2xx status

### Project constraints
- `CLAUDE.md` — Tech stack constraints, no npm/build tools, ESM function format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.chat-bubble`, `.chat-window`, `.chat-header`, `.chat-messages`, `.message-bubble`, `.message-user`, `.message-assistant`, `.typing-indicator`, `.typing-dot`, `.chat-input-container`, `.chat-input`, `.chat-send` — all defined in `styles.css`; no CSS changes needed beyond mobile overrides
- Existing JS logic in `index.html` (lines 185–290): `chatBubble`, `chatWindow`, `chatClose`, `chatInput`, `chatSend`, `chatMessages` element references + `addUserMessage`, `addAssistantMessage`, `sendMessage` functions — this is the extraction target

### Established Patterns
- Widget HTML uses toggle class `.active` on `.chat-window` to show/hide panel — no CSS animation yet (Phase 4)
- `conversationHistory` array persists messages for multi-turn context
- `chatSend.disabled = true` / `chatInput.disabled = true` during API call already in place
- Tailwind CSS via CDN; custom CSS in `styles.css`; vanilla JS only

### Integration Points
- Each HTML page needs: `<script src="chat.js"></script>` added, and the existing inline `<script>` chat block removed
- `chat.js` must not use `DOMContentLoaded` wrapper differently than current inline approach — current code runs immediately (not wrapped), so `<script>` tag should be placed after the widget HTML at the bottom of `<body>`
- `styles.css` mobile `@media (max-width: 640px)` block (lines 251–262) needs updating for true full-width + safe-area

</code_context>

<specifics>
## Specific Ideas

- Greeting text (exact): `"Hi! 👋 I'm Nathan's AI assistant. Ask me about his book, basketball career, or anything else!"`
- Error message text (exact, per CHAT-13): `"Something went wrong — try again"`
- Loading indicator: use existing `.typing-indicator` + 3 × `.typing-dot` elements (CSS animation already defined in `styles.css`)
- Mobile chat panel: `width: 100%; left: 0; right: 0; bottom: 0; border-radius: 12px 12px 0 0` (flat bottom, rounded top) + `padding-bottom: env(safe-area-inset-bottom)`

</specifics>

<deferred>
## Deferred Ideas

The following site-wide design enhancements were raised during discussion. They are **not** part of Phase 3 (chat widget extraction). Route to Phase 4 or a new "Site Polish" phase:

1. **Loading screen animation** — Full-screen overlay that fades out on page load. Shows NR logo from `https://i.imgur.com/sAcG2HQ.png` with a pulse animation before fading. Blue color scheme. Applies to all 4 pages.
2. **Back-to-top button** — Fixed bottom-left button. Appears after scrolling 300px. Smooth scroll to top. Blue color scheme. Applies to all 4 pages.
3. **Hero text animation** — Fade + slide-up entrance for heading and subtext on `index.html` only, triggered after the loading screen disappears.

All three are pure vanilla CSS + JS, no frameworks. They fit the tech stack — just belong in the polish phase.

</deferred>

---

*Phase: 03-chat-widget*
*Context gathered: 2026-03-29*

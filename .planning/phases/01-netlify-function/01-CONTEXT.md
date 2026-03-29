# Phase 1: Netlify Function - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

A Netlify Function serverless endpoint at `netlify/functions/chat.js` that accepts visitor messages and returns AI replies from Claude. The API key and system prompt are secured entirely server-side — never exposed to the browser. The function handles preflight CORS (OPTIONS) and caps responses at 500 tokens for Netlify free-tier timeout compliance.

Chat widget UI is out of scope (Phase 3). Page split is out of scope (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### API Call Method
- **D-01:** Use raw `fetch` to call `https://api.anthropic.com/v1/messages` — no npm, no package.json, no build step. Manual headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`.
- **D-02:** This resolves the REQUIREMENTS.md / CLAUDE.md conflict in favor of FUNC-02: "no npm packages needed". The site remains zero-dependency static HTML.

### Module Format
- **D-03:** Use ESM format (file can be `.js` with ESM `export default` or `export const handler`). Per STATE.md and CLAUDE.md, the legacy CommonJS format is being deprecated by Netlify in 2025. The function file is `netlify/functions/chat.js` (per FUNC-01).

### Response Shape
- **D-04:** Success response: HTTP 200 + `{ reply: "..." }` — a single string field with the assistant's message text. Chat widget reads `data.reply`.
- **D-05:** Error response: HTTP 500 + `{ error: "..." }` — standard REST convention. Chat widget checks for non-2xx status to display "Something went wrong — try again".
- **D-06:** OPTIONS preflight: HTTP 200 + empty body (per FUNC-06).

### System Prompt Content
- **D-07:** Derive system prompt content by reading the existing HTML pages (index.html, book.html, basketball.html, contact.html). The key facts about Nathan's bio, book, and basketball career already exist there — no manual authoring needed.
- **D-08:** System prompt instructs the assistant to redirect off-topic questions back to Nathan-related topics (per FUNC-05).
- **D-09:** System prompt lives server-side only inside the function — never sent in client requests (per FUNC-04).

### Token Limit
- **D-10:** Cap `max_tokens` at 500 to stay within the 10-second Netlify free-tier timeout (per FUNC-07).

### Model
- **D-11:** Use `claude-sonnet-4-20250514` (per PROJECT.md user-specified model).

### Claude's Discretion
- Exact system prompt wording (researcher derives from HTML page content)
- CORS headers to include on responses
- How to structure the messages array forwarded to Anthropic
- Exact error message text in `{ error: "..." }` responses

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above.

### Project requirements
- `.planning/REQUIREMENTS.md` — FUNC-01 through FUNC-07 define all acceptance criteria for this phase
- `.planning/PROJECT.md` — Tech stack constraints, API key handling policy, model selection

### Site content (for system prompt derivation)
- `index.html` — Nathan's bio and about section
- `book.html` — Book details, events, reviews
- `basketball.html` — Basketball career content
- `contact.html` — Contact information

### CLAUDE.md (project constraints)
- `CLAUDE.md` — Netlify Functions format guidance, ESM handler format, what NOT to use

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — no existing JavaScript files. The 4 HTML pages are static with no shared JS.

### Established Patterns
- Tailwind CSS via CDN (no build step) — confirms zero-dependency constraint
- All images served from Imgur CDN — no local asset pipeline
- No existing `netlify/functions/` directory or `package.json` — must be created from scratch

### Integration Points
- The function is a standalone serverless endpoint. Phase 3 (chat widget) will POST to `/.netlify/functions/chat` and parse `data.reply` from the response.
- No connection to existing HTML files needed for Phase 1.

</code_context>

<specifics>
## Specific Ideas

- No specific implementation references beyond what's in CLAUDE.md and REQUIREMENTS.md.
- The "raw fetch" decision aligns with the site's zero-dependency ethos — the function should feel as lightweight as the static HTML pages it serves.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-netlify-function*
*Context gathered: 2026-03-28*

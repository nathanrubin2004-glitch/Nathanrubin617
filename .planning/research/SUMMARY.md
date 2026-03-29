# Project Research Summary

**Project:** Nathan Rubin Portfolio Site
**Domain:** Static multi-page portfolio site with serverless AI chat widget proxy
**Researched:** 2026-03-28
**Confidence:** HIGH

## Executive Summary

This project is a zero-dependency static HTML portfolio site that needs to be split from a single `index.html` into four separate pages, then augmented with an AI-powered floating chat widget. The canonical approach for this domain is well-established: vanilla JS handles the UI, a Netlify Function acts as a server-side proxy to the Anthropic API, and the API key never touches the browser. The entire stack — Tailwind CDN, vanilla JS fetch, Netlify Functions with the modern ESM handler — is mature, documented, and carries no dependency on npm, build tools, or frameworks. This is a deliberate constraint that the architecture fully supports.

The recommended build sequence is: Netlify Function first, then the shared chat widget script, then the page split and nav fix, and finally cross-page integration and mobile verification. This order is critical because the Netlify Function is the sole dependency of the chat widget, and the page split introduces a well-documented pitfall (broken anchor-based nav links) that must be resolved before the widget is layered on top. Attempting to build the widget and split pages simultaneously creates debugging ambiguity.

The primary risks are operational, not architectural: API key scope misconfiguration in the Netlify dashboard, missing OPTIONS preflight handling (CORS), and mobile Safari clipping of fixed-position elements. All three are fully avoidable with specific, known countermeasures documented in research. The system prompt must live server-side in the Netlify Function — this is a non-negotiable security constraint, not an implementation detail.

---

## Key Findings

### Recommended Stack

The stack is intentionally minimal. The existing site uses Tailwind CDN and vanilla JS with no build step — the research confirms this is the correct approach to maintain throughout. The only addition is a single Netlify Function file (`netlify/functions/chat.mjs`) and a root `package.json` listing `@anthropic-ai/sdk` as the sole dependency. Netlify's esbuild bundler handles dependency bundling automatically; no explicit build command is required.

The modern Netlify Functions handler format (ESM `.mjs`, `export default async (request) => {}`, returning a `Response` object) is the correct choice. The legacy CommonJS format (`module.exports.handler`) is being deprecated in 2025. There is an important tension here: ARCHITECTURE.md suggests using raw `fetch()` with no SDK to avoid CommonJS/ESM issues on a no-build-tool project, while STACK.md recommends the Anthropic SDK with esbuild bundling. The resolution is to use the SDK approach with a root `package.json` and `node_bundler = "esbuild"` in `netlify.toml` — this is the cleaner long-term approach and avoids manual header construction.

**Core technologies:**
- Netlify Functions (Node.js 18+, ESM `.mjs`): serverless API proxy — same-origin with the static site, no CORS headers needed
- `@anthropic-ai/sdk ^0.80.0`: Anthropic API client — handles auth, retries, and type-safe message construction; eliminates raw fetch complexity
- Vanilla JS `fetch` (browser built-in): frontend communication to `/.netlify/functions/chat` — no library needed
- Netlify environment variables: stores `ANTHROPIC_API_KEY` — injected at function runtime, never sent to the browser
- `netlify.toml` with `node_bundler = "esbuild"`: enables automatic dependency bundling with tree-shaking

### Expected Features

The chat widget feature set is well-defined. All P1 features are low implementation complexity; the entire widget can be built as a single `chat.js` file loaded by all four pages. Mobile responsiveness is the only MEDIUM complexity item and requires real-device testing on iPhone Safari — Chrome devtools emulation is insufficient.

**Must have (table stakes):**
- Floating bubble toggle (open/close) — core entry point; users won't look elsewhere
- Scrollable chat panel with distinct message bubbles (user vs. assistant) — fundamental readability
- Text input with Enter-to-send and click-to-send — both pathways required
- Loading/typing indicator while API responds — prevents "is this broken?" abandonment
- Graceful inline error message on API failure — trust preservation
- Auto-scroll to latest message — continuity within conversation
- Session-scoped in-memory message history — continuity within a page visit
- Warm greeting bubble on open — reduces blank-slate friction
- Persona-aware system prompt with topic redirect — the core differentiator of this widget
- Mobile-responsive layout with safe-area insets — PROJECT.md requirement
- Widget present on all 4 pages — PROJECT.md requirement
- Send button disabled during pending request — prevents double-sends

**Should have (competitive):**
- Suggested starter question chips ("Tell me about his book", "Basketball career", "How to contact him") — reduces blank-slate paralysis
- Smooth CSS open/close animation — signals polish consistent with the site's glassmorphism aesthetic

**Defer (v2+):**
- Persistent cross-session history — requires database; out of scope per PROJECT.md
- Voice input — Web Speech API inconsistency; overkill for portfolio context
- Streaming character-by-character output — complicates both function and client; no user-visible benefit for short portfolio Q&A responses
- Keyboard accessibility full audit — valuable but not blocking for v1

### Architecture Approach

The architecture is a clean three-layer system: browser static files served from Netlify CDN, a single serverless function at `/.netlify/functions/chat`, and the Anthropic API called server-side only. The chat widget behavior lives in a single shared `chat.js` file loaded by all four HTML pages, with the widget HTML stub (~8 lines) duplicated in each page body and CSS injected dynamically from `chat.js`. The system prompt is hardcoded in the Netlify Function — never in the client-side JS or the request payload. Conversation history is maintained client-side as an in-memory array and sent with each request; the function is fully stateless.

**Major components:**
1. `netlify/functions/chat.mjs` — serverless proxy: reads API key from env, forwards messages + hardcoded system prompt to Anthropic, returns `{ reply: "..." }` as JSON
2. `chat.js` (repo root) — shared widget script: manages open/close state, message rendering, API calls via fetch, conversation history array, and injected CSS
3. `index.html`, `book.html`, `basketball.html`, `contact.html` — page content with inline nav, widget HTML stub, and `<script src="chat.js">` before `</body>`
4. `package.json` + `netlify.toml` — dependency declaration and esbuild bundler configuration

### Critical Pitfalls

1. **API key scope misconfiguration** — `ANTHROPIC_API_KEY` set in Netlify UI must have the "Functions" scope checked; variables defined in `netlify.toml` do NOT reach functions at runtime. Add a startup guard (`if (!process.env.ANTHROPIC_API_KEY) return 500`) and verify via live function logs immediately after first deploy.

2. **System prompt in client request payload** — sending the system prompt from the browser exposes it in DevTools and allows visitor manipulation of the assistant's persona. The system prompt must be a hardcoded constant inside the Netlify Function; the client sends only the user's message text.

3. **Broken nav links after page split** — the current `index.html` uses anchor-based links (`href="#book"`). When content moves to separate files, these become dead links. Every `href` attribute across all four nav blocks must be audited and converted to file-based links (`book.html`, `basketball.html`, etc.) before the chat widget is added.

4. **Missing OPTIONS preflight handler** — browsers send an HTTP OPTIONS request before POST when `Content-Type: application/json`. Without a handler, every chat message fails with a CORS error in the browser even though curl succeeds. Handle `OPTIONS` at the top of the function and return 200 with `Access-Control-Allow-*` headers. (Note: this only applies if CORS headers are needed — same-origin Netlify deployments should not need this, but it is a common source of confusion during local dev with `netlify dev`.)

5. **Mobile Safari fixed-position clipping** — `position: fixed` elements are clipped by ancestor elements with `overflow: hidden` in WebKit. The widget HTML stub must be a direct child of `<body>`. Use `bottom: calc(24px + env(safe-area-inset-bottom))` for iOS safe-area clearance. Set panel max-width to `min(360px, calc(100vw - 32px))`. Verify on real iPhone Safari, not Chrome devtools.

---

## Implications for Roadmap

Based on research, the build order is dictated by a clear dependency chain. The Netlify Function must exist before the chat widget can make real API calls. The page split must be verified before the widget is duplicated across pages — a broken nav is much easier to catch before the widget is in place. Mobile verification is last because it requires a deployed environment.

### Phase 1: Netlify Function and API Proxy

**Rationale:** The function is the sole dependency of the chat widget. Build and verify it in isolation before writing any UI. This is explicitly documented in ARCHITECTURE.md's build order as the correct first step.

**Delivers:** A working `/.netlify/functions/chat` endpoint that accepts `{ messages }`, proxies to Anthropic with a hardcoded system prompt, and returns `{ reply }`. Verified via direct POST (curl or Postman) and confirmed working with the live Anthropic API.

**Addresses:** Persona-aware system prompt, topic-redirect behavior, API key security

**Avoids:** API key scope misconfiguration (verify immediately after first deploy), system prompt exposure (hardcode in function, not client), CommonJS/ESM mismatch (use `.mjs` + esbuild from the start), function timeout (set `max_tokens` at 500-600 and an 8-second AbortController timeout)

**Files:** `netlify/functions/chat.mjs`, `package.json`, `netlify.toml`, `.gitignore`

### Phase 2: Page Split and Navigation

**Rationale:** The current single `index.html` must be split into four pages before the chat widget is added to all four. Fixing nav links in isolation is much simpler than debugging them after widget integration.

**Delivers:** Four separate HTML files (`index.html`, `book.html`, `basketball.html`, `contact.html`) with working file-based nav links, preserved content, preserved Imgur image URLs, and correct active-link state per page. All 16 nav link combinations (4 pages x 4 links) verified.

**Addresses:** Page-split requirement, navigation bar requirement, content preservation requirement

**Avoids:** Broken anchor-based nav links (full href audit before proceeding), JS-fetched nav anti-pattern (copy nav inline per page)

### Phase 3: Chat Widget UI

**Rationale:** With the function working and pages split, the widget can be built as a self-contained `chat.js` and integrated into all four pages. Building the widget after the page split means testing the "widget on all 4 pages" requirement is straightforward.

**Delivers:** Floating chat bubble (bottom-right, z-index 9999), expandable chat panel, distinct message bubbles matching site blue (#3b82f6), text input with Enter/click-to-send, loading indicator, inline error message, auto-scroll, session message history, warm greeting on open. Widget present and functional on all four pages.

**Addresses:** All P1 table-stakes features, mobile-responsive layout, widget-on-all-pages requirement

**Avoids:** Widget mobile clipping (direct child of `<body>`, safe-area insets, real iPhone Safari test), double-send (button disabled during pending), silent API failures (inline error message)

### Phase 4: Polish and Launch Validation

**Rationale:** After core functionality is verified, add P2 polish features and run the full "Looks Done But Isn't" checklist from PITFALLS.md before marking the project complete.

**Delivers:** Suggested starter question chips, smooth CSS open/close animation, Anthropic billing alert configured, complete end-to-end validation on production Netlify domain.

**Addresses:** Should-have features from FEATURES.md, security verification (DevTools network inspection of request payload), mobile verification on real device

**Avoids:** Shipping with system prompt in client payload, broken mobile experience, unbounded API cost exposure

### Phase Ordering Rationale

- The Netlify Function must precede the chat widget because the widget depends on it; building in this order allows isolated testing of the API proxy before UI complexity is added
- The page split must precede widget integration because nav link bugs are invisible if you only test `index.html`; fixing them in isolation prevents false confidence
- Mobile verification is explicitly last because it requires a deployed Netlify URL; Chrome devtools emulation does not replicate Safari safe-area or fixed-position clipping behavior
- P2 polish features (starter chips, animations) are deferred to Phase 4 to ensure the core P1 widget is stable before adding complexity

### Research Flags

Phases with standard patterns (skip research-phase — research already complete):
- **Phase 1 (Netlify Function):** Fully documented with exact handler format, dependency setup, and env var configuration in STACK.md
- **Phase 2 (Page Split):** Straightforward HTML refactoring; pitfalls fully documented
- **Phase 3 (Chat Widget):** Established patterns for floating chat widgets; all implementation details in ARCHITECTURE.md and FEATURES.md
- **Phase 4 (Polish/Validation):** Checklist-driven; no new technical territory

No phases require `/gsd:research-phase` — all technical questions are resolved by existing research.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology choices verified against official Netlify and Anthropic documentation; handler format and bundler configuration confirmed |
| Features | HIGH (core) / MEDIUM (UX specifics) | Table-stakes features backed by Baymard research and established widget patterns; specific UX patterns from practitioner sources at MEDIUM confidence |
| Architecture | HIGH | Build order, component boundaries, data flow, and anti-patterns all derived from official Netlify documentation and verified implementation patterns |
| Pitfalls | HIGH | Each pitfall verified against official Netlify support guides, Anthropic API docs, and WebKit bug reports; recovery strategies confirmed |

**Overall confidence:** HIGH

### Gaps to Address

- **Anthropic SDK vs. raw fetch tension:** STACK.md recommends the Anthropic SDK with esbuild; ARCHITECTURE.md suggests raw `fetch()` to avoid module complexity. Resolution: use the SDK with esbuild (cleaner, more maintainable). Confirm `node_bundler = "esbuild"` in `netlify.toml` before writing the function.

- **System prompt content:** Research establishes that the system prompt must be server-side, but the actual prompt text (Nathan's bio, book details, basketball career specifics) needs to be drafted from the existing site content during Phase 1 implementation. This is authoring work, not a technical gap.

- **CORS headers necessity:** Because the static files and the function share the same Netlify domain, OPTIONS preflight should not be triggered in production. However, during local development with `netlify dev`, behavior may differ. Confirm during Phase 1 local testing and add the OPTIONS handler preemptively if there is any ambiguity.

---

## Sources

### Primary (HIGH confidence)
- [Netlify Functions: Get Started](https://docs.netlify.com/build/functions/get-started/) — handler signature, module format, env vars, file extensions
- [Migrating to Modern Netlify Functions](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/) — legacy vs. modern format, deprecation timeline
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/) — execution limits, memory, payload sizes
- [Anthropic TypeScript SDK (GitHub)](https://github.com/anthropics/anthropic-sdk-typescript) — `messages.create()` signature, version `0.80.0`, Node 18 requirement
- [Netlify CORS Support Guide](https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739) — preflight handling, same-origin behavior
- [Modern Netlify Functions with esbuild (Netlify blog)](https://www.netlify.com/blog/2021/04/02/modern-faster-netlify-functions/) — `node_bundler = "esbuild"` configuration
- [Netlify Environment Variables and Functions](https://docs.netlify.com/build/functions/environment-variables/) — scope requirements for Functions access
- [Anthropic Messages Streaming API](https://platform.claude.com/docs/en/api/messages-streaming) — non-streaming vs. streaming comparison
- [WebKit Bug: position:fixed clipped inside overflow:hidden](https://bugs.webkit.org/show_bug.cgi?id=160953) — mobile Safari clipping behavior

### Secondary (MEDIUM confidence)
- [Baymard: Live Chat Usability Issues](https://baymard.com/blog/live-chat-usability-issues) — auto-open UX risk, widget behavior patterns
- [Building AI Experiences on Netlify](https://developers.netlify.com/guides/building-ai-experiences-on-netlify/) — Anthropic SDK in Netlify context (adapted; example used Edge Functions syntax)
- [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn) — widget UX conventions
- [Develop a Free Chatbot for Your Portfolio Website](https://dev.to/melvinprince/develop-a-free-chatbot-for-your-portfolio-website-a-step-by-step-guide-with-code-examples-2np6) — practitioner implementation patterns

### Tertiary (LOW confidence)
- [Top 10 AI Chat Widgets to Boost Website Engagement (2026)](https://www.kommunicate.io/blog/best-chat-widgets/) — vendor blog; feature comparison only
- [Agent UX in 2025: The New Table Stakes](https://medium.com/@Nexumo_/agent-ux-in-2025-the-new-table-stakes-dd189c7c2718) — no attributed author; used for directional confirmation only

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*

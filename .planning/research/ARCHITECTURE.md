# Architecture Research

**Domain:** Zero-dependency multi-page static site with serverless AI chat proxy
**Researched:** 2026-03-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────┐ │
│  │  index.html  │  │  book.html   │  │basketball  │  │contact│ │
│  │  (Home/About)│  │  (Book page) │  │  .html     │  │ .html │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  └───┬───┘ │
│         │                 │                │             │      │
│         └─────────────────┴────────────────┴─────────────┘      │
│                                   │                              │
│                      Shared inline: nav HTML + chat.js           │
│                                   │                              │
│                        chat.js calls fetch()                     │
└───────────────────────────────────┼─────────────────────────────┘
                                    │ POST /.netlify/functions/chat
┌───────────────────────────────────▼─────────────────────────────┐
│                     Netlify Edge (CDN + Functions)               │
│                                                                  │
│  Static files served from CDN root                               │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              netlify/functions/chat.js                     │  │
│  │   - reads ANTHROPIC_API_KEY from env                       │  │
│  │   - forwards messages[] + system prompt to Anthropic       │  │
│  │   - returns assistant text as JSON                         │  │
│  └───────────────────────────────┬───────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ POST https://api.anthropic.com/v1/messages
┌──────────────────────────────────▼──────────────────────────────┐
│                     Anthropic API                                │
│              claude-sonnet-4-20250514                            │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| index.html | Home + About content, nav, chat widget HTML | Plain HTML, inline `<style>`, inline `<script>` |
| book.html | Book content, nav, chat widget HTML | Same pattern as index |
| basketball.html | Basketball content, nav, chat widget HTML | Same pattern as index |
| contact.html | Contact content, nav, chat widget HTML | Same pattern as index |
| chat.js (shared script) | Chat widget behavior — open/close, message rendering, API call | Vanilla JS loaded via `<script src="chat.js">` |
| netlify/functions/chat.js | Serverless proxy — accepts JSON body, calls Anthropic, returns response | Node.js CommonJS or ESM module |

## Recommended Project Structure

```
/                               # Netlify publish root (entire repo)
├── index.html                  # Home + About page
├── book.html                   # Book page
├── basketball.html             # Basketball page
├── contact.html                # Contact page
├── chat.js                     # Shared chat widget JS (loaded by all pages)
├── netlify/
│   └── functions/
│       └── chat.js             # Serverless function (NOT served as static)
└── netlify.toml                # Optional: only needed to set functions dir if non-default
```

### Structure Rationale

- **chat.js at root:** A single external JS file shared by all four pages via `<script src="chat.js">`. Browsers cache it after the first page load. This eliminates duplication of ~120 lines of widget logic across four files.
- **netlify/functions/:** Netlify's default functions directory. No `netlify.toml` is required when using this default path. Functions here are NOT served as static assets — Netlify separates them automatically.
- **Nav stays inline in each HTML file:** The nav block is ~20 lines and requires the active-page link to be highlighted differently per page. Inlining it per page is the correct call at this scale. A JS-include approach for nav adds latency and flash-of-unstyled-content with no meaningful maintenance benefit for a 4-page site.
- **No separate CSS file needed:** Tailwind CDN handles utility classes. Chat widget styles (~80 lines) should live in chat.js as dynamically injected `<style>` OR remain in each page's `<style>` block if copy-paste is tolerable.

## Architectural Patterns

### Pattern 1: Shared JS File for Widget Logic

**What:** Extract the chat widget's JavaScript into a single `chat.js` file at the root. Each HTML page includes `<script src="chat.js"></script>` before `</body>`. The HTML markup for the widget (bubble button + chat window div) is copied into each page's body — it is ~8 lines and rarely changes.

**When to use:** When logic is shared but the HTML container can be duplicated cheaply. Widget markup is stable once built; JS logic changes often during iteration.

**Trade-offs:**
- Pro: One place to fix bugs in `sendMessage()`, `addAssistantMessage()`, etc.
- Pro: Browser caches `chat.js` across page navigations (no re-download)
- Con: Widget HTML markup (8 lines) is still duplicated in all 4 pages — acceptable at this scale
- Con: Widget CSS (80 lines) still needs to be in each page's `<style>` OR injected from `chat.js`

**Preferred variant:** Inject the widget CSS from `chat.js` using `document.head.appendChild(style)`. This makes `chat.js` fully self-contained — pages only need the 8-line HTML stub and the script tag.

### Pattern 2: Non-Streaming Netlify Function Proxy

**What:** The Netlify Function receives `{ messages, systemPrompt }` in the POST body, calls `https://api.anthropic.com/v1/messages` with the API key from environment variables, awaits the full JSON response, extracts `content[0].text`, and returns it as `{ reply: "..." }`.

**When to use:** This project. Chat responses are short (portfolio Q&A), no SDK needed, no streaming complexity, no `package.json` required.

**Trade-offs:**
- Pro: Simplest possible implementation — plain `fetch()` in Node.js, no npm, no dependencies
- Pro: Works within Netlify's default 10-second function timeout for short responses
- Pro: No `package.json` required (no SDK = no `require('anthropic')`)
- Con: User sees no text until the full response arrives — tolerable for short answers
- Con: Timeout risk if `max_tokens` is very large — keep it at 1024 or below

**Example (ESM format, no SDK):**
```javascript
// netlify/functions/chat.js
export default async (req) => {
  const { messages, systemPrompt } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })
  });

  const data = await upstream.json();
  const reply = data.content[0].text;

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Pattern 3: Streaming (Alternative — Not Recommended Here)

**What:** Add `stream: true` to the Anthropic request body. Anthropic returns Server-Sent Events (SSE). The Netlify Function reads the response body as a `ReadableStream`, extracts `content_block_delta` events, and pipes text chunks back to the browser via a streaming `Response`.

**When to use:** When responses are long (many paragraphs) and perceived latency matters. Requires the browser to consume `ReadableStream` chunks and append text progressively.

**Trade-offs:**
- Pro: Text appears character-by-character, feels alive
- Con: Significantly more complex — SSE parsing, `TransformStream` piping, browser-side `ReadableStream` consumption
- Con: Netlify Functions have limited streaming support; requires `"type": "module"` and modern Node runtime
- Con: No npm means no SDK; raw SSE parsing in a Netlify Function is ~60 lines of non-trivial code

**Decision: Use non-streaming (Pattern 2).** The chat is for portfolio Q&A where answers are 2-4 sentences. Non-streaming is correct here. Streaming would add complexity with no user-visible benefit.

## Data Flow

### Chat Request Flow (Non-Streaming)

```
[User types message, hits Enter or clicks Send]
         |
         v
[chat.js] buildMessageHistory() — appends new message to conversationHistory[]
         |
         v
[chat.js] fetch('/.netlify/functions/chat', { method: 'POST', body: JSON.stringify({ messages, systemPrompt }) })
         |
         v
[Netlify CDN] routes /.netlify/functions/chat to the serverless runtime
         |
         v
[netlify/functions/chat.js]
  - reads ANTHROPIC_API_KEY from process.env
  - calls https://api.anthropic.com/v1/messages with messages[] and system prompt
  - awaits full JSON response
  - extracts content[0].text
  - returns { reply: "..." } as JSON
         |
         v
[chat.js] receives JSON, calls addAssistantMessage(data.reply)
         |
         v
[DOM] new message bubble appended, chat scrolls to bottom
```

### Page-to-Page Navigation Flow

```
[User clicks nav link e.g. "Basketball"]
         |
         v
[Browser] loads basketball.html from Netlify CDN (typically cached)
         |
         v
[basketball.html] parses inline nav, page-specific content, widget HTML stub
         |
         v
[<script src="chat.js">] browser loads chat.js (cached after first page)
         |
         v
[chat.js] DOMContentLoaded fires — attaches click listeners to #chat-bubble, #chat-close
         | Note: conversationHistory[] resets on each page load (stateless per session per page)
         v
[Page ready]
```

### Key Data Flows

1. **API key security:** Key never reaches the browser. Browser sends message text to `/.netlify/functions/chat`. The function injects the key server-side. The key is stored in Netlify's environment variable dashboard.
2. **Conversation state:** `conversationHistory[]` lives in `chat.js` memory in the browser tab. It accumulates during a session on one page but resets if the user navigates to a different page. This is acceptable for a portfolio site.
3. **System prompt:** The system prompt string is defined in `chat.js` and sent to the Netlify Function in each request body. The function passes it to Anthropic as the `system` field. This allows updating the prompt without touching the function code.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-1000 visitors/month | Current architecture is fine. Netlify free tier includes 125k function invocations/month. |
| 1k-10k visitors/month | Monitor Netlify function invocation count. Consider caching common answers. Still no architecture change needed. |
| 10k+ visitors/month | Evaluate Netlify Pro. Chat widget itself is stateless so horizontal scaling is automatic. |

### Scaling Priorities

1. **First bottleneck:** Netlify Function invocation limits on the free tier (125k/month). At ~5 chat messages per visitor this supports ~25k visitors. Not a concern for a personal portfolio.
2. **Second bottleneck:** Anthropic API rate limits. At portfolio traffic levels, this is not a concern.

## Anti-Patterns

### Anti-Pattern 1: Fetching Nav HTML via JavaScript

**What people do:** Store nav in `nav.html`, then `fetch('nav.html')` in every page and inject it with `innerHTML`. Promoted as DRY for static sites without a build tool.

**Why it's wrong:** Causes layout shift — the nav briefly doesn't exist while the fetch completes. Requires JavaScript to be working for basic navigation. Google's crawler may or may not see the nav. Adds a network round-trip per page load.

**Do this instead:** Copy-paste the nav block into all four pages. It is ~20 lines. When the nav changes, update all four files. At 4 pages this is a one-minute task. The nav also needs per-page active-link state (e.g., "Basketball" highlighted on basketball.html), which is harder to manage in a fetched template without extra logic.

### Anti-Pattern 2: Calling the Anthropic API Directly from the Browser

**What people do:** Put the API key in the JavaScript, call `https://api.anthropic.com/v1/messages` directly from `fetch()` in the browser.

**Why it's wrong:** The API key is visible in browser DevTools Network tab and in the page source if not obfuscated. Anyone can extract it and make API calls charged to the account. The existing `index.html` does this with `'x-api-key': 'your-api-key-here'` as a placeholder — this must be replaced with the Netlify Function proxy before going live.

**Do this instead:** Call `/.netlify/functions/chat` from the browser. The function reads the key from `process.env.ANTHROPIC_API_KEY`. The key is set in the Netlify dashboard under Project Settings > Environment Variables.

### Anti-Pattern 3: Using the Anthropic SDK in a Netlify Function Without npm

**What people do:** Add `const Anthropic = require('@anthropic-ai/sdk')` to the function, then wonder why it fails because there is no `node_modules/`.

**Why it's wrong:** The project has no `package.json` and no build step. Netlify Functions without a build step cannot resolve npm packages.

**Do this instead:** Use raw `fetch()` to call the Anthropic REST API directly. Node.js 18+ has native `fetch()`. The Anthropic REST API is simple enough that no SDK is needed for a single endpoint call. This keeps the function at ~25 lines with zero dependencies.

### Anti-Pattern 4: One Giant chat.js That Inlines All Widget HTML

**What people do:** Generate the entire widget DOM (nav + bubble + window + messages) from JavaScript, removing all HTML from the pages.

**Why it's wrong:** Pages show nothing until JS executes. Any JS error kills the entire page. Search engines may not index content. The 8-line widget HTML stub is not a maintenance burden.

**Do this instead:** Keep semantic HTML in each page. Use `chat.js` only for behavior (event listeners, API calls, DOM manipulation). Keep the HTML stub for the widget in each page body.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic API | REST POST via Netlify Function (server-side only) | Key in `process.env.ANTHROPIC_API_KEY`. Never called from browser. |
| Netlify | Static file hosting + Functions runtime | Functions at `netlify/functions/`. Called via `/.netlify/functions/chat`. |
| Google Fonts | CDN `<link>` in `<head>` of each page | Already present. Inline for each page. |
| Tailwind CSS | CDN `<script>` in `<head>` of each page | Already present. No config needed. |
| Imgur | Static image `src` URLs | Already present. No change required. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| HTML pages to chat.js | `chat.js` reads DOM by known IDs (`#chat-bubble`, `#chat-window`, etc.) | HTML pages must include widget stub with correct IDs |
| chat.js to Netlify Function | `fetch('/.netlify/functions/chat', { method: 'POST', body: JSON.stringify({...}) })` | Relative URL works on both localhost (Netlify Dev) and production |
| Netlify Function to Anthropic | `fetch('https://api.anthropic.com/v1/messages', ...)` | Server-side only. API key injected here. |

## Build Order

This is the correct sequencing for implementation. Each item depends on the one above it.

```
1. Netlify Function (netlify/functions/chat.js)
   └── Verify: can POST to /.netlify/functions/chat and get a reply

2. chat.js (shared widget script)
   └── Fetches /.netlify/functions/chat — requires step 1
   └── Verify: widget opens, sends message, displays reply

3. index.html (Home/About page)
   └── Loads chat.js — requires step 2
   └── Inline nav with working links to other pages
   └── Verify: nav links work, chat widget works on this page

4. book.html, basketball.html, contact.html
   └── Copy nav and widget stub from index.html
   └── Reference same chat.js
   └── Verify: chat works identically on each page, nav active states correct

5. End-to-end validation
   └── Deploy to Netlify
   └── Verify ANTHROPIC_API_KEY env var is set in Netlify dashboard
   └── Verify chat works on production domain
   └── Verify mobile layout on all four pages
```

**Rationale for this order:** The Netlify Function is the sole dependency of the chat widget. The chat widget must work before any page content is built around it. Once the widget works in isolation, it can be dropped into each page with confidence.

## Sources

- [Netlify Functions: Get Started](https://docs.netlify.com/build/functions/get-started/) — folder structure, URL convention `/.netlify/functions/<name>`, ESM vs CommonJS
- [Netlify Functions: Optional Configuration](https://docs.netlify.com/build/functions/optional-configuration/) — custom paths, `netlify.toml`
- [Anthropic Messages Streaming API](https://platform.claude.com/docs/en/api/messages-streaming) — SSE format, `stream: true`, non-streaming comparison

---
*Architecture research for: Zero-dependency static portfolio site with Netlify Function AI chat proxy*
*Researched: 2026-03-28*

# Phase 1: Netlify Function - Research

**Researched:** 2026-03-28
**Domain:** Netlify Functions (Node.js serverless) + Anthropic Messages API (raw fetch)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use raw `fetch` to call `https://api.anthropic.com/v1/messages` — no npm, no package.json, no build step. Manual headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`.
- **D-02:** This resolves the REQUIREMENTS.md / CLAUDE.md conflict in favor of FUNC-02: "no npm packages needed". The site remains zero-dependency static HTML.
- **D-03:** Use ESM format (file can be `.js` with ESM `export default` or `export const handler`). Per STATE.md and CLAUDE.md, the legacy CommonJS format is being deprecated by Netlify in 2025. The function file is `netlify/functions/chat.js` (per FUNC-01).
- **D-04:** Success response: HTTP 200 + `{ reply: "..." }` — a single string field with the assistant's message text. Chat widget reads `data.reply`.
- **D-05:** Error response: HTTP 500 + `{ error: "..." }` — standard REST convention. Chat widget checks for non-2xx status to display "Something went wrong — try again".
- **D-06:** OPTIONS preflight: HTTP 200 + empty body (per FUNC-06).
- **D-07:** Derive system prompt content by reading the existing HTML pages (index.html, book.html, basketball.html, contact.html). The key facts about Nathan's bio, book, and basketball career already exist there — no manual authoring needed.
- **D-08:** System prompt instructs the assistant to redirect off-topic questions back to Nathan-related topics (per FUNC-05).
- **D-09:** System prompt lives server-side only inside the function — never sent in client requests (per FUNC-04).
- **D-10:** Cap `max_tokens` at 500 to stay within the 10-second Netlify free-tier timeout (per FUNC-07).
- **D-11:** Use `claude-sonnet-4-20250514` (per PROJECT.md user-specified model).

### Claude's Discretion

- Exact system prompt wording (researcher derives from HTML page content)
- CORS headers to include on responses
- How to structure the messages array forwarded to Anthropic
- Exact error message text in `{ error: "..." }` responses

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FUNC-01 | A Netlify Function exists at `netlify/functions/chat.js` | ESM handler pattern, file structure documented below |
| FUNC-02 | The function calls the Anthropic API using raw fetch (no npm packages needed) | Raw fetch pattern with required headers documented below |
| FUNC-03 | The function reads the API key from `ANTHROPIC_API_KEY` environment variable (never exposed to client) | `process.env.ANTHROPIC_API_KEY` is the correct accessor for Node.js Netlify Functions |
| FUNC-04 | The system prompt lives server-side only in the function | System prompt placed in function body, never in request payload |
| FUNC-05 | The system prompt instructs the assistant to redirect off-topic questions | Redirect instruction pattern documented with derived content below |
| FUNC-06 | The function handles OPTIONS preflight requests with a 200 response | OPTIONS method check pattern documented below |
| FUNC-07 | The function caps max_tokens at 500 to stay within the 10-second Netlify free-tier timeout | `max_tokens: 500` in the Anthropic request body |
</phase_requirements>

---

## Summary

Phase 1 creates `netlify/functions/chat.js` — a serverless endpoint that accepts a JSON body containing a `messages` array, prepends a server-side system prompt about Nathan Rubin, calls the Anthropic Messages API using raw `fetch` (no npm), and returns `{ reply: "..." }` to the caller.

The function uses the modern Netlify ESM handler format: a default-exported async function that receives a Web Platform `Request` object and returns a Web Platform `Response` object. Environment variables are accessed via `process.env` (not `Netlify.env`, which is Edge Functions only). No `package.json`, no build step, and no npm install are needed because the only external call uses Node 18's built-in `fetch`.

The existing HTML pages contain all the content needed for the system prompt. The key facts are already present: Nathan is a UMass Boston student athlete and economist, author of the children's book "Chasing a Dream", community leader from Boston MA, 2024 graduate of Lexington Christian Academy with EIL and NEPSAC championships, contact via nathanrubin2004@gmail.com / (617) 840-0068. The function call is same-origin from the browser's perspective (both at *.netlify.app or nathanrubin617.com), so CORS headers should be included defensively but are not strictly required for same-origin use.

**Primary recommendation:** Write `netlify/functions/chat.js` as a single ESM file with no dependencies. Use `export default async function(req)` returning `new Response(...)`. Read `process.env.ANTHROPIC_API_KEY`. Call `https://api.anthropic.com/v1/messages` with raw `fetch`. Return `{ reply: text }` on success, `{ error: message }` on failure.

---

## Standard Stack

### Core

| Component | Version / Value | Purpose | Why Standard |
|-----------|----------------|---------|--------------|
| Netlify Functions (Node.js) | Node 18+ (Netlify default for sites created after 2023) | Serverless function runtime | Same domain as static site, AWS Lambda under the hood, 10s timeout on free tier |
| Web Platform `fetch` | Built into Node 18+ | Call Anthropic API without npm | Matches zero-dependency ethos; no install step |
| ESM `export default` handler | Modern format (2024–present) | Netlify function handler signature | Legacy CommonJS (`module.exports.handler`) deprecated starting 2025 |
| `process.env.ANTHROPIC_API_KEY` | Node.js standard | Access API key at runtime | Standard Node.js env var access; `Netlify.env` is Edge Functions only |

### No Supporting Libraries Needed

D-01 locks out npm entirely. Node 18 built-in `fetch` handles the Anthropic call. No `@anthropic-ai/sdk`, no `@netlify/functions`, no `node-fetch`.

### What NOT to Use

| Avoid | Why |
|-------|-----|
| `module.exports.handler = ...` (CommonJS) | Netlify deprecating this format in 2025 |
| `Netlify.env.get(...)` | Edge Functions syntax only; breaks in standard Node.js functions |
| `@anthropic-ai/sdk` | Conflicts with D-01/D-02 no-npm decision |
| Hardcoded API key in source | Key would be in Git; security violation |
| `netlify-lambda` build tool | Obsolete; Netlify uses esbuild natively |

---

## Architecture Patterns

### Recommended File Structure

```
netlify/
└── functions/
    └── chat.js       ← single file, no subdirectory needed
netlify.toml          ← optional but recommended for explicit config
```

Note: `netlify.toml` is optional for standard function detection (Netlify auto-detects `netlify/functions/`), but including it makes the configuration explicit and avoids surprises.

### Pattern 1: Modern ESM Handler (Locked by D-03)

**What:** Default export async function receiving Web Platform `Request`, returning Web Platform `Response`.

**When to use:** Always — this is the only format for this phase.

```javascript
// netlify/functions/chat.js
// Source: https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/

export default async function (req) {
  // Handle OPTIONS preflight (FUNC-06)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders()
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { messages } = await req.json();

  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages
    })
  });

  if (!anthropicResponse.ok) {
    return new Response(JSON.stringify({ error: 'Upstream API error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  const data = await anthropicResponse.json();
  const reply = data.content[0].text;

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
```

### Pattern 2: CORS Headers Helper

**What:** Return defensive CORS headers on all responses. Same-origin calls don't require them, but they enable local testing (`netlify dev`) and any future cross-origin use.

```javascript
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
```

### Pattern 3: Anthropic API Request/Response Shape

**Request body** (verified against Anthropic docs):
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 500,
  "system": "<system prompt string>",
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "Tell me about Nathan's book" }
  ]
}
```

**Response shape** (verified against Anthropic docs at docs.anthropic.com/en/api/messages):
```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The assistant's reply text here"
    }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": { "input_tokens": 12, "output_tokens": 6 }
}
```

Extract reply: `data.content[0].text`

### Pattern 4: System Prompt (Derived from HTML pages)

**Derived facts from site content:**

**About Nathan (from index.html):**
- Writer, athlete, economist, and storyteller with passion for inspiring the next generation
- Studies Economics, Community Relations, and Diaspora at Liberal Arts College of UMass Boston
- From Boston, MA
- Instagram: @nathanrubin24 | LinkedIn: nathan-rubin-7a747329a
- Publications: sites.google.com/view/nathanrubinportfolio/home
- Poetry: allpoetry.com/NathanRubin

**Book (from book.html):**
- Title: "Chasing a Dream" — debut children's book
- Theme: confidence, kindness, and self-belief; inspiring young readers to see greatness within themselves
- Availability: local libraries, community centers, youth organizations, Little Free Library locations
- Purchase link: buy.stripe.com/5kQ8wR1pRfD2dxV1wwgYU02
- Featured in UMass Boston news: umb.edu/news/recent-news/student-athlete-nathan-rubin-debuts-childrens-book-chasing-a-dream/
- Reviews: "Nathan genuinely cares about helping kids see their own potential... enormous impact on any child who reads it" / "valuable messages of hope, courage, and determination"
- Completed events: Mattapan School Tour (Feb 2026, Mildred Ave K-8 + Ellison Parks), Kilmer Elementary (Oct 2025), Back-2-School Drive (Aug 2025, Mildred Community Center, Mattapan), SNUG Program / Yonkers YMCA (Apr 2025)
- Upcoming: Winter 2026 Workshop, Reading & Signing in Boston, MA

**Basketball (from basketball.html):**
- 2024 graduate of Lexington Christian Academy
- Won Eastern Independent League (EIL) Championship and NEPSAC Championship at LCA
- Now playing collegiately at UMass Boston

**Contact (from contact.html):**
- Email: nathanrubin2004@gmail.com
- Phone: (617) 840-0068
- Resume: drive.google.com/file/d/19Ijth9llX_R3V4re77s4uNToNDg5QWoi/view

**Recommended system prompt structure:**
```
You are an AI assistant on Nathan Rubin's personal portfolio website (nathanrubin617.com). Your role is to help visitors learn about Nathan and his work.

ABOUT NATHAN:
Nathan Rubin is a writer, athlete, economist, and storyteller from Boston, MA. He studies Economics, Community Relations, and Diaspora at the Liberal Arts College of UMass Boston. He is passionate about inspiring the next generation through storytelling and community leadership.

HIS BOOK — "CHASING A DREAM":
Nathan's debut children's book, "Chasing a Dream," teaches confidence, kindness, and self-belief, encouraging young readers to see the greatness within themselves. It is available at local libraries, community centers, youth organizations, and Little Free Library locations. Visitors can purchase a copy at: https://buy.stripe.com/5kQ8wR1pRfD2dxV1wwgYU02. The book has been featured by UMass Boston and Nathan has done readings at schools in Mattapan and West Roxbury.

BASKETBALL:
Nathan is a 2024 graduate of Lexington Christian Academy, where he helped win an EIL Championship and a NEPSAC Championship. He now plays basketball at the collegiate level for UMass Boston.

CONTACT:
Email: nathanrubin2004@gmail.com | Phone: (617) 840-0068

BEHAVIOR:
- Answer warmly and enthusiastically about Nathan, his book, his basketball career, his community work, or how to contact him.
- If a visitor asks about something unrelated to Nathan, gently redirect: acknowledge the question briefly, then steer the conversation back to Nathan and what you can help with on this site.
- Keep responses concise and conversational — visitors are reading on a portfolio website, not a research paper.
```

### Anti-Patterns to Avoid

- **Calling `req.body` directly:** In the modern ESM handler, `req` is a Web Platform `Request` object. Parse the body with `await req.json()`, not `req.body`.
- **Using `event.body` (Lambda style):** That is the legacy CommonJS handler shape. The modern ESM handler does not receive a Lambda `event` object.
- **Returning a plain object from the handler:** The modern handler requires `new Response(...)`, not `{ statusCode, body }`.
- **Accessing `Netlify.env`:** This is Edge Functions syntax. In standard Node.js functions, use `process.env`.
- **Forwarding the client's system prompt:** The system prompt must originate in the function body, never from the request payload (D-09).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP client | Custom fetch wrapper with retries | Node 18 built-in `fetch` — it's sufficient for a single POST with no retry needed | This is a portfolio site with light traffic; raw fetch is all that's needed |
| CORS preflight handling | Complex middleware | Simple `if (req.method === 'OPTIONS') return 200` | CORS is same-origin in production; a one-liner suffices |
| Environment variable validation | Custom config module | `if (!process.env.ANTHROPIC_API_KEY)` guard at function start | One check is enough; no need for a config abstraction |

---

## Common Pitfalls

### Pitfall 1: Wrong env var accessor (`Netlify.env` vs `process.env`)

**What goes wrong:** Function throws `Netlify is not defined` or `Netlify.env.get is not a function` at runtime.
**Why it happens:** CLAUDE.md explicitly warns against `Netlify.env.get(...)` — it is Edge Functions syntax (Deno runtime). Standard Netlify Functions run Node.js.
**How to avoid:** Always use `process.env.ANTHROPIC_API_KEY` in `chat.js`.
**Warning signs:** Function invocation error in Netlify function logs immediately on first call, before any Anthropic request is made.

### Pitfall 2: Wrong handler shape (Lambda vs Web Platform)

**What goes wrong:** Function returns `{ statusCode: 200, body: '...' }` instead of `new Response(...)`, causing Netlify to return a malformed response or 502 error.
**Why it happens:** Most tutorials and Stack Overflow answers still show the legacy CommonJS Lambda format.
**How to avoid:** Use `export default async function(req)` and return `new Response(JSON.stringify(...), { status: 200, headers: {...} })`.
**Warning signs:** 502 Bad Gateway or empty response body in browser network tab even when function logs show success.

### Pitfall 3: API key scope not set to "Functions" in Netlify UI

**What goes wrong:** `process.env.ANTHROPIC_API_KEY` is `undefined` in production even though the variable is set in the Netlify UI.
**Why it happens:** Netlify environment variables have scope selectors (All scopes, Build, Functions, Runtime). If "Functions" scope is not checked, the variable is not injected into function runtime.
**How to avoid:** In Netlify UI → Site settings → Environment variables → `ANTHROPIC_API_KEY` → verify "Functions" scope is checked.
**Warning signs:** Function returns 500 with "API key not configured" message immediately (before any network call to Anthropic).

### Pitfall 4: Parsing the request body with `.body` instead of `await req.json()`

**What goes wrong:** `messages` is `undefined` and the Anthropic call fails with a 400 error about missing required field.
**Why it happens:** Web Platform `Request` is stream-based. The body must be consumed via `await req.json()`, `await req.text()`, or `await req.arrayBuffer()`.
**How to avoid:** Use `const { messages } = await req.json();` at the top of the POST handler.
**Warning signs:** Anthropic API returns 400 with a message about `messages` being required or invalid.

### Pitfall 5: Function file as `.js` without ESM signal

**What goes wrong:** Netlify treats `chat.js` as CommonJS, ignoring the ESM `export default` syntax, causing a syntax error at deploy time.
**Why it happens:** Node.js defaults to CommonJS for `.js` files unless signaled otherwise.
**How to avoid:** Either rename to `chat.mjs`, or add a root-level `package.json` with `"type": "module"`. Given D-02 (no npm/no package.json preference), using `.mjs` extension is cleaner — but FUNC-01 locks the filename to `chat.js`. Resolution: add a minimal `package.json` at repo root with `{ "type": "module" }`. This does not require any npm install or build step.
**Warning signs:** Netlify build log shows `SyntaxError: Cannot use import statement in a module` or similar ESM parse error.

### Pitfall 6: Anthropic API response parsing — wrong field access

**What goes wrong:** `reply` is `undefined` because the code accesses `data.text` instead of `data.content[0].text`.
**Why it happens:** The Anthropic API wraps text in a `content` array of block objects, each with a `type` and `text` field.
**How to avoid:** Extract as `const reply = data.content[0].text;`.
**Warning signs:** The chat widget displays "undefined" or blank bubbles; function logs show a successful 200 from Anthropic but the reply field is missing.

---

## Code Examples

### Complete `netlify/functions/chat.js`

```javascript
// Source: https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/
// Source: https://docs.anthropic.com/en/api/messages

const SYSTEM_PROMPT = `You are an AI assistant on Nathan Rubin's personal portfolio website (nathanrubin617.com). Your role is to help visitors learn about Nathan and his work.

ABOUT NATHAN:
Nathan Rubin is a writer, athlete, economist, and storyteller from Boston, MA. He studies Economics, Community Relations, and Diaspora at the Liberal Arts College of UMass Boston. He is passionate about inspiring the next generation through storytelling and community leadership.

HIS BOOK — "CHASING A DREAM":
Nathan's debut children's book teaches confidence, kindness, and self-belief, encouraging young readers to see the greatness within themselves. Available at local libraries, community centers, youth organizations, and Little Free Library locations. Purchase: https://buy.stripe.com/5kQ8wR1pRfD2dxV1wwgYU02

BASKETBALL:
Nathan is a 2024 graduate of Lexington Christian Academy (EIL Champion, NEPSAC Champion). He now plays basketball at UMass Boston.

CONTACT:
Email: nathanrubin2004@gmail.com | Phone: (617) 840-0068

BEHAVIOR:
Answer warmly about Nathan, his book, his basketball career, and how to contact him. If asked about unrelated topics, briefly acknowledge and redirect back to Nathan and what you can help with on this site. Keep responses concise and conversational.`;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  let messages;
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  let anthropicResponse;
  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages
      })
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach Anthropic API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  if (!anthropicResponse.ok) {
    return new Response(JSON.stringify({ error: 'Anthropic API error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  const data = await anthropicResponse.json();
  const reply = data.content[0].text;

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
```

### Root `package.json` (minimal — required to enable ESM for `chat.js`)

```json
{
  "type": "module"
}
```

This single-field package.json tells Node.js to treat `.js` files as ESM. No install, no dependencies.

### Optional `netlify.toml` (recommended for explicit config)

```toml
[functions]
  directory = "netlify/functions"
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Netlify Functions runtime | On Netlify servers automatically | 18+ (Netlify default) | None needed — Netlify manages this |
| `fetch` API | Anthropic API call (D-01) | Built into Node 18+ | Node 18+ | None needed |
| `ANTHROPIC_API_KEY` | FUNC-03 | Must be set in Netlify UI | — | None — blocks function if absent |
| Netlify CLI (`netlify dev`) | Local testing only | Not installed globally | — | Can test via deploy-preview; or `npx netlify-cli dev` without global install |

**Missing dependencies with no fallback:**
- `ANTHROPIC_API_KEY` must be set in Netlify UI → Site Settings → Environment Variables with "Functions" scope before first deploy. There is no fallback.

**Missing dependencies with fallback:**
- Netlify CLI not installed globally — use `npx netlify-cli dev` (no install required) or test via Netlify deploy preview.

---

## Open Questions

1. **ESM signal for `chat.js` (not `chat.mjs`)**
   - What we know: FUNC-01 locks the filename to `chat.js`. ESM requires either `.mjs` extension or `package.json` `"type": "module"`. D-02 says no npm, no build step.
   - What's unclear: Does a root `package.json` with only `"type": "module"` (and no dependencies) count as "no npm / no build step" in spirit?
   - Recommendation: Yes — a one-field `package.json` requires no `npm install`, no build step, and no dependencies. It only signals the module type to Node.js. This satisfies both FUNC-01 (filename unchanged) and D-02 (no npm install). The planner should include creating this file as Wave 0 task 1.

2. **CORS headers scope**
   - What we know: The site and function are on the same domain in production, so CORS is technically not required. CLAUDE.md says "CORS: Not Required for This Project."
   - What's unclear: Should CORS headers be included defensively for local `netlify dev` testing (which serves on localhost with a different port)?
   - Recommendation: Include permissive CORS headers (`Access-Control-Allow-Origin: *`) on all responses. This adds 3 lines of code and eliminates any local dev friction. The planner should treat this as standard.

---

## Sources

### Primary (HIGH confidence)
- [Netlify Functions: Get Started](https://docs.netlify.com/build/functions/get-started/) — ESM handler format, `.mjs` extension requirement, `process.env` access
- [Migrating to Modern Netlify Functions](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/) — Legacy vs modern format, `export default async function(req)` signature, `new Response(...)` return shape
- [Netlify Functions Environment Variables](https://docs.netlify.com/build/functions/environment-variables/) — Confirmed `process.env` is correct for Node.js runtime; `Netlify.env` is Edge Functions only
- [Anthropic Messages API Reference](https://docs.anthropic.com/en/api/messages) — Required headers (`x-api-key`, `anthropic-version: 2023-06-01`), request body shape, response shape (`content[0].text`)

### Secondary (MEDIUM confidence)
- [Netlify Functions Optional Configuration](https://docs.netlify.com/build/functions/optional-configuration/) — `netlify.toml` `[functions]` block, `node_bundler = "esbuild"` option
- WebSearch results (2025–2026) confirming `process.env` for Node.js standard functions and `Netlify.env` for Edge Functions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Confirmed against Netlify official docs (function format, env vars) and Anthropic official docs (API shape)
- Architecture patterns: HIGH — All patterns derived from official documentation; code example reflects verified API shapes
- System prompt content: HIGH — Extracted directly from live HTML files; no inference needed
- Pitfalls: HIGH — Pitfalls 1–4 verified against official docs; Pitfall 5 (ESM signal) confirmed by Node.js module system behavior

**Research date:** 2026-03-28
**Valid until:** 2026-09-28 (Netlify function format is stable; Anthropic API version `2023-06-01` is the current stable version)

# Pitfalls Research

**Domain:** Static HTML portfolio site + Netlify Functions + Anthropic API chat widget
**Researched:** 2026-03-28
**Confidence:** HIGH (verified against Netlify official docs, Anthropic API docs, and community forums)

---

## Critical Pitfalls

### Pitfall 1: Missing OPTIONS Preflight Handler in the Netlify Function

**What goes wrong:**
The chat widget sends a POST request with a JSON body. Browsers issue an HTTP OPTIONS preflight request first. If the Netlify Function does not explicitly handle `event.httpMethod === 'OPTIONS'` and return 200 with CORS headers, every chat message fails with a CORS error before it ever reaches the Claude API — even though the function itself would otherwise work fine.

**Why it happens:**
Developers write the happy-path POST handler and test it with curl or Postman (which do not send preflight requests). The widget appears to work in isolation but breaks when called from the browser.

**How to avoid:**
Add an early-return block at the top of `chat.js`:
```js
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: '',
  };
}
```
Then include the same CORS headers on every non-OPTIONS response — both success and error paths. Omitting them from the error path is a second common mistake.

**Warning signs:**
- Browser console shows: `has been blocked by CORS policy: Response to preflight request doesn't pass access control check`
- Network tab shows a 405 or no response on the OPTIONS request
- Curl to `/.netlify/functions/chat` succeeds but the widget fails

**Phase to address:** Netlify Function implementation phase (when `chat.js` is written)

---

### Pitfall 2: Netlify Function Timeout Kills Long Claude Responses

**What goes wrong:**
Netlify's default synchronous function timeout is 10 seconds on free/Starter plans (26 seconds on Pro). The Anthropic API — especially with a detailed system prompt and a verbose response — can take longer than 10 seconds to return. The function is killed mid-flight and the user sees a broken or empty response.

**Why it happens:**
Developers test with short prompts locally (no cold start, no network latency to Anthropic's servers). Production conditions — cold start + API latency + longer responses — regularly exceed the limit.

**How to avoid:**
- Keep `max_tokens` tight. For a simple personal-site chat, 400–600 tokens is sufficient and keeps responses fast.
- Set a server-side timeout on the `fetch` call to the Anthropic API that is shorter than 10 seconds (e.g., 8 seconds), so you can return a graceful error instead of a hard timeout.
- Avoid streaming (SSE) unless strictly necessary; streaming requires Edge Functions on Netlify and substantially increases implementation complexity for zero user-visible benefit on a portfolio site.

**Warning signs:**
- Netlify Function logs show `Task timed out after X seconds`
- Chat widget hangs indefinitely then fails silently
- Works fine locally but fails ~25% of the time in production

**Phase to address:** Netlify Function implementation phase; verify during integration testing with realistic prompts

---

### Pitfall 3: ANTHROPIC_API_KEY Not Available at Runtime — Wrong Scope

**What goes wrong:**
The `ANTHROPIC_API_KEY` is set in the Netlify UI but the function returns a 500 with `process.env.ANTHROPIC_API_KEY` being `undefined`. The key is present in the dashboard but not accessible to the function at runtime.

**Why it happens:**
Netlify environment variables have scopes: **Builds**, **Functions**, **Post processing**, and **Runtime**. When adding a variable in the UI, the default scope may not include **Functions**. Variables defined in `netlify.toml` are also NOT available to functions — they only apply to the build step.

Additionally, as of approximately March 27, 2026, a Netlify platform issue caused user-defined env vars to be missing from scheduled/background functions. For standard synchronous functions this is not affected, but it is worth monitoring.

**How to avoid:**
- Set `ANTHROPIC_API_KEY` via the Netlify UI (Site settings → Environment variables), not via `netlify.toml`.
- Explicitly confirm the variable has the **Functions** scope checked.
- Add a startup guard in `chat.js`:
  ```js
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }
  ```

**Warning signs:**
- Function logs show `undefined` or `anthropic.APIError: authentication_error`
- Works when the key is hardcoded (never do this) but not from env
- The Netlify UI shows the variable exists but function still fails

**Phase to address:** Netlify Function implementation phase; must be verified with a live deploy before integrating the widget

---

### Pitfall 4: Anchor-Based Navigation Links Break After Page Split

**What goes wrong:**
The current `index.html` uses in-page anchor links (e.g., `href="#book"`, `href="#basketball"`, `href="#contact"`) for navigation. When content is split into separate HTML files (`book.html`, `basketball.html`, `contact.html`), those anchor hrefs point to IDs that no longer exist on the page the user is currently viewing. Navigation silently does nothing or jumps to the wrong position.

**Why it happens:**
The nav bar HTML is copied from `index.html` without updating link targets. `#book` remains a hash-only link when it should become `book.html`. This is invisible during local preview if you only open `index.html`.

**How to avoid:**
- When splitting pages, do a full audit of every `href` attribute in every nav element across all four files.
- Hash-only links (`#section`) must become file-based links (`book.html`, `basketball.html`, etc.).
- Internal anchor links within a single page (e.g., jumping to a section on `book.html`) are fine, but cross-page anchors must include the filename: `book.html#chapter-one`.
- After splitting, test every nav link on every page.

**Warning signs:**
- Clicking a nav link does nothing (scrolls to top or stays put)
- Browser URL bar shows `#book` appended but page doesn't change
- Links work from `index.html` but not from `book.html` or `basketball.html`

**Phase to address:** Page-splitting phase (before the chat widget is added)

---

### Pitfall 5: Chat Widget Blocked or Clipped on Mobile

**What goes wrong:**
The floating chat bubble uses `position: fixed; bottom: 24px; right: 24px`. On mobile, three failure modes appear:
1. An ancestor element has `overflow: hidden`, which clips the fixed element in some browsers (known WebKit/Safari bug).
2. The expanded chat panel overflows the viewport width, causing horizontal scroll or content cut-off.
3. The mobile browser's bottom nav bar (Safari URL bar, Android gesture area) overlays the bubble, making it unreachable or requiring two taps.

**Why it happens:**
The widget is developed and tested on desktop. Mobile layout testing is skipped or done only with browser devtools, which does not replicate real Safari bottom-bar behavior.

**How to avoid:**
- Place the chat widget HTML as a direct child of `<body>`, not nested inside any section with `overflow: hidden`.
- Set the chat panel max-width to `min(360px, calc(100vw - 32px))` so it never overflows on small screens.
- Use `bottom: calc(24px + env(safe-area-inset-bottom))` on the bubble to clear iOS safe-area insets.
- Give the widget a z-index of at least 9999; ensure no ancestor has a stacking context that can override it.
- Test on a real iPhone Safari session (or BrowserStack), not just Chrome devtools.

**Warning signs:**
- Widget invisible or partially visible on iPhone Safari
- Horizontal scrollbar appears when chat panel opens on mobile
- Widget appears under the browser navigation bar

**Phase to address:** Chat widget UI phase; mobile verification must be an explicit acceptance criterion

---

### Pitfall 6: System Prompt Exposed via Client-Side JS or Network Tab

**What goes wrong:**
The system prompt (Nathan's bio, basketball career, book details) is passed from the frontend to the Netlify Function in the request body instead of being defined server-side in `chat.js`. This means any visitor can open DevTools, inspect the fetch call, and read the full system prompt — or send arbitrary system prompts to impersonate different contexts.

**Why it happens:**
Tutorials about chatbot proxies often show the system prompt as part of the request payload for flexibility. Developers copy this pattern without realising it is only appropriate for multi-tenant systems where each user legitimately owns their prompt.

**How to avoid:**
The system prompt must live entirely inside `chat.js` as a hardcoded constant. The client-side widget sends only the user's message text. The function constructs the full `messages` array server-side, prepending the system prompt.

**Warning signs:**
- The fetch call payload in DevTools includes a `systemPrompt` or `context` field
- Users can manipulate what persona the assistant adopts
- The function accepts arbitrary instruction overrides from the request body

**Phase to address:** Netlify Function implementation phase (non-negotiable security constraint)

---

### Pitfall 7: No Rate Limiting or Abuse Guard on the Public Function Endpoint

**What goes wrong:**
The Netlify Function URL (`/.netlify/functions/chat`) is publicly accessible. Without any guard, anyone — or any bot — can send unlimited requests, burning through the Anthropic API quota and generating unexpected billing. On free Anthropic tiers, a few hundred rapid requests can exhaust the daily token limit in minutes.

**Why it happens:**
Portfolio sites feel low-risk. Developers assume their personal site won't be targeted. Public serverless endpoints are trivially discoverable and scriptable.

**How to avoid:**
- Add a `max_tokens` cap in the function (400–600 tokens) to limit cost per request.
- Return a `429` status with a `Retry-After` header if you want to implement basic rate limiting (though stateless functions make this difficult without external storage).
- For a simple portfolio site, the pragmatic mitigation is: small `max_tokens`, monitor Anthropic usage dashboard, and set a billing alert on the Anthropic account.
- Do NOT implement rate limiting via client-side JS — it is trivially bypassed.

**Warning signs:**
- Anthropic usage dashboard shows unexpected spike in token consumption
- API key hits rate limit errors during normal use

**Phase to address:** Netlify Function implementation phase; Anthropic billing alert setup is a launch checklist item

---

### Pitfall 8: CommonJS/ESM Module Mismatch in chat.js

**What goes wrong:**
`chat.js` is written with `exports.handler = ...` (CommonJS) but the project or Netlify's modern functions runtime expects ES modules, or vice versa. The function deploys but fails at invocation with a cryptic error like `require() of ES Module not supported` or `exports is not defined`.

**Why it happens:**
Netlify's function runtime determines module format from: the file extension (`.mjs` = always ESM, `.cjs` = always CJS) or, for `.js` files, whether a `package.json` in scope has `"type": "module"`. A no-build-tool project has no `package.json` at all, which means `.js` defaults to CommonJS — but the Anthropic SDK (`@anthropic-ai/sdk`) ships as an ES module package. Using `require('@anthropic-ai/sdk')` fails.

**How to avoid:**
Since this project has no `package.json` and no npm (by constraint), the function must call the Anthropic API via plain `fetch()` to the REST API (`https://api.anthropic.com/v1/messages`) rather than importing the SDK. This sidesteps the ESM/CJS problem entirely and keeps the function a simple, self-contained `.js` file using CommonJS-compatible syntax or native `fetch`.

**Warning signs:**
- Function deploy succeeds but every invocation returns `502` or `Internal Server Error`
- Netlify function logs show `SyntaxError: Cannot use import statement` or `exports is not defined`
- Works locally but fails after deploy

**Phase to address:** Netlify Function implementation phase — the decision to use `fetch()` directly instead of the Anthropic SDK must be made upfront

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Wildcard CORS `Access-Control-Allow-Origin: *` | No CORS debugging needed | Any site can call your function and burn your API quota | Acceptable for a low-traffic personal portfolio with no sensitive data returned; not acceptable if function returns personal info |
| Hardcoding system prompt in client-side JS | Easier to iterate on the prompt | Prompt is fully visible to any visitor; can be overridden | Never — prompt must be server-side |
| No error state in chat widget UI | Faster to build | Users see a broken empty chat with no explanation when function fails | Never — always show a user-visible error message |
| No `max_tokens` limit | Longer potential responses | Unbounded cost per request; timeout risk increases | Never — always set a cap |
| Copying nav HTML manually to each page | No shared component system needed | One nav change requires editing 4 files; easy to diverge | Acceptable given the no-build-tool constraint; document the update procedure |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Anthropic API via Netlify Function | Importing `@anthropic-ai/sdk` with no package.json/npm | Call the REST API directly with `fetch()` — no SDK needed |
| Netlify env vars | Defining `ANTHROPIC_API_KEY` in `netlify.toml` | Set via Netlify UI with "Functions" scope checked |
| CORS on Netlify Function | Only handling POST, ignoring OPTIONS | Handle OPTIONS preflight first, include CORS headers on all response paths |
| Anthropic API response | Not parsing `response.content[0].text` correctly | Log the full API response during development to confirm the response shape |
| Netlify auto-deploy from GitHub | Forgetting `netlify/functions/` directory in the repo | The `netlify/functions/chat.js` file must be committed to the repo — Netlify reads it from source |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Cold start on first chat message | First message takes 2–6 seconds to respond | Show a "Thinking..." indicator immediately on submit; set user expectation | Every time the function hasn't been invoked in the last ~5 minutes |
| Unbounded `max_tokens` + long system prompt | Responses exceed 10-second function timeout | Cap `max_tokens` at 500; keep system prompt under 800 tokens | On any response where Claude generates more than ~600 tokens |
| Synchronous fetch with no timeout on the Anthropic call | Function hangs until Netlify kills it; user sees nothing | Set an 8-second `AbortController` timeout on the Anthropic fetch call | Any time Anthropic API is slow or rate-limited |
| Chat history sent with every message | Token usage grows linearly per conversation turn | For a stateless portfolio widget, send only the current message; do not accumulate history client-side | After ~5 turns of conversation |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| System prompt in client request payload | Visitor reads or overrides Nathan's persona context | System prompt hardcoded in `chat.js`; client sends only user message |
| API key in client-side JS (even in a `<script>` tag) | Key is publicly visible; can be scraped by bots | Key only in Netlify env var; only accessible inside the function |
| No input length validation on user messages | Extremely long inputs inflate token count and cost | Validate message length on the client (e.g., max 500 chars) and enforce server-side in the function |
| Returning verbose error details to the client | Internal errors (stack traces, key names) leak implementation details | Return generic error messages to the client; log details server-side only |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading indicator during API call | User thinks the widget is broken and clicks multiple times, triggering multiple API calls | Disable the send button and show a typing animation immediately on submit |
| No error message when function fails | User sees blank response; assumes the feature is broken | Show a fallback message: "Sorry, I'm having trouble right now. Try again in a moment." |
| Chat panel opens and covers all page content on mobile | User cannot read the page behind the chat and has no obvious close button | Ensure close button is visible and accessible; limit panel height to 65vh on mobile |
| Chat widget draws eye away from primary CTA | Visitors focus on the chat instead of buying the book or contacting Nathan | Position bubble bottom-right; don't auto-open on page load — let visitor discover it |
| Assistant answers off-topic questions (sports scores, news, etc.) | Widget becomes a general chatbot, diluting Nathan's brand | System prompt must explicitly instruct the assistant to redirect off-topic questions back to Nathan |

---

## "Looks Done But Isn't" Checklist

- [ ] **CORS:** Test the chat widget from the deployed Netlify URL, not `localhost` — CORS errors only appear in a real cross-origin context
- [ ] **Env var:** Trigger the function once via the live site and confirm the Netlify function log does NOT show `undefined` for the API key
- [ ] **Navigation:** Click every nav link from every page (4 pages x 4 links = 16 link tests) to confirm none are broken hash-only anchors
- [ ] **Mobile:** Open the deployed site on a real iPhone Safari session and tap the chat widget — not just Chrome devtools mobile emulation
- [ ] **Timeout guard:** Send a prompt designed to produce a long response (e.g., "Tell me everything about Nathan in detail") and confirm the function returns within 10 seconds or fails gracefully
- [ ] **System prompt security:** Open DevTools Network tab, send a chat message, inspect the request payload — confirm it contains ONLY the user's message text, not the system prompt
- [ ] **Error state:** Temporarily break the API key, send a message, and confirm the widget shows a user-friendly error instead of a blank response
- [ ] **No duplicate messages:** Rapidly click the send button twice — confirm the function is called only once (button disabled on first click)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CORS errors discovered post-launch | LOW | Add OPTIONS handler to `chat.js`, commit, push — Netlify redeploys in ~30 seconds |
| API key not accessible in function | LOW | Set correct scope in Netlify UI → re-deploy |
| Broken nav links after page split | LOW | Find/replace anchor hrefs across all 4 HTML files; test all 16 combinations |
| System prompt in client-side code | MEDIUM | Move prompt to `chat.js`, update client to send only user message, re-test |
| Function timeout on long responses | LOW | Add `max_tokens` cap and server-side abort timeout; re-deploy |
| Widget clips or hides on mobile Safari | MEDIUM | Restructure widget HTML to be direct child of `<body>`; add safe-area insets; real-device re-test |
| API key burned / quota exhausted | MEDIUM | Rotate key in Anthropic dashboard, update Netlify env var, set billing alerts |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Missing OPTIONS preflight handler | Netlify Function implementation | Send a POST from the browser; check Network tab for OPTIONS 200 |
| Function timeout | Netlify Function implementation | Send a verbose prompt; confirm response arrives in under 10 seconds |
| API key wrong scope | Netlify Function implementation | Check live function log for undefined key immediately after first deploy |
| Broken nav links after page split | Page-splitting phase | Click all 16 nav combinations across all 4 pages |
| Chat widget mobile clipping | Chat widget UI phase | Real iPhone Safari test before marking phase complete |
| System prompt in client payload | Netlify Function implementation | DevTools Network inspection of request body |
| No rate limiting / cost guard | Netlify Function implementation | Set `max_tokens` cap + Anthropic billing alert before launch |
| CommonJS/ESM mismatch | Netlify Function implementation | Use `fetch()` directly; verify function logs show no module errors after deploy |

---

## Sources

- Netlify Support: [Handling CORS on Netlify (Support Guide)](https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739)
- Netlify Support: [CORS issue with Netlify Functions](https://answers.netlify.com/t/cors-issue-with-netlify-functions/103443)
- Netlify Support: [Handling CORS preflight requests](https://answers.netlify.com/t/handling-cors-preflight-requests/42724)
- Netlify Docs: [Get started with functions (module formats, timeout limits)](https://docs.netlify.com/build/functions/get-started/)
- Netlify Docs: [Environment variables and functions](https://docs.netlify.com/build/functions/environment-variables/)
- Netlify Developers: [Migrating to the modern Netlify Functions](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/)
- Netlify Support: [API-Key exposed even though set as environment variable](https://answers.netlify.com/t/api-key-exposed-in-netlify-even-though-set-up-as-an-environment-variable/89616)
- Netlify Support: [Function timeout — 10 seconds](https://answers.netlify.com/t/timeout-10-seconds/83146)
- Netlify Support: [Frequent slow cold start for Function](https://answers.netlify.com/t/frequent-slow-cold-start-for-function-next-js-server-handler/148600)
- Anthropic Docs: [Rate limits](https://docs.anthropic.com/en/api/rate-limits)
- Anthropic Help: [Our approach to rate limits for the Claude API](https://support.anthropic.com/en/articles/8243635-our-approach-to-api-rate-limits)
- OWASP: [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- Floating UI Docs: [Misc — overflow clipping](https://floating-ui.com/docs/misc)
- WebKit Bug: [position:fixed clipped inside overflow:hidden ancestor](https://bugs.webkit.org/show_bug.cgi?id=160953)
- DEV Community: [Handling CORS with Netlify POST Requests](https://dev.to/weaponxii/handling-cors-with-netlify-post-requests-39ld)

---
*Pitfalls research for: Static HTML portfolio + Netlify Functions + Anthropic API chat widget*
*Researched: 2026-03-28*

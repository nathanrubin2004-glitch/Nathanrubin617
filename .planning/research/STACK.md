# Stack Research

**Domain:** Static portfolio site with Netlify serverless API proxy for Anthropic Claude
**Researched:** 2026-03-28
**Confidence:** HIGH (Netlify Functions API verified via official docs; Anthropic SDK verified via official GitHub; CORS behavior verified via Netlify support guides)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Netlify Functions (Node.js) | Runtime: Node 18+ | Serverless proxy to Anthropic API | Runs on same domain as the static site — no CORS headers needed for same-origin calls. AWS Lambda under the hood, 60s timeout, 1 GB memory. Straightforward ESM handler format. |
| `@anthropic-ai/sdk` | `^0.80.0` | Anthropic API client inside the function | Official SDK, actively maintained by Anthropic. Handles auth, retries, type-safe message construction, and streaming. Far less error-prone than raw fetch for multi-turn message arrays. |
| Vanilla JS `fetch` | Browser built-in (ES2015+) | Frontend calls `/.netlify/functions/chat` | No library needed. The browser fetch API is sufficient for a POST to the function endpoint. |
| Netlify environment variables | — | Stores `ANTHROPIC_API_KEY` | Injected at function runtime via `process.env`. Key is never sent to the browser. Set once in Netlify UI → Site settings → Environment variables. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@netlify/functions` | Latest | TypeScript types for `Context` object | Only needed if adding TypeScript. For plain `.mjs` files the types are optional. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Netlify CLI (`netlify dev`) | Local dev server that emulates functions and env vars | Run `npx netlify-cli dev` from repo root. Serves static files + functions together on one port. Reads `.env` for local secrets. No global install required. |

---

## Handler Format: The Right Answer for This Project

### Use ESM with the modern handler signature

Netlify has two function APIs. Use the **modern** one — it matches web platform standards and is what Netlify actively develops.

**File location:** `netlify/functions/chat.mjs`

Use `.mjs` extension. This forces Node to treat the file as ES modules regardless of whether a `package.json` with `"type": "module"` is present. It avoids ambiguity.

**Handler signature:**

```javascript
// netlify/functions/chat.mjs
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async (request) => {
  // Only accept POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await request.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: "You are a helpful assistant for Nathan Rubin's portfolio...",
    messages,
  });

  return new Response(
    JSON.stringify({ reply: response.content[0].text }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

**Why this signature, not the legacy one:**

The legacy format uses `module.exports.handler = async (event, context) => { return { statusCode: 200, body: ... } }`. That is a Lambda-specific API that Netlify is deprecating in 2025. The modern format uses the Web Platform `Request` / `Response` objects, which are the same APIs used in browsers and Deno. Prefer the modern format for all new functions.

---

## Dependency Management: Root `package.json`

For a static site with no frontend build step, put a single `package.json` at the repo root listing the Anthropic SDK as a dependency. Netlify's build system automatically runs `npm install` before deploying and then uses esbuild to bundle the function with its dependencies into a self-contained artifact.

**`package.json` (repo root):**

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.80.0"
  }
}
```

**`netlify.toml` (repo root):**

```toml
[functions]
  node_bundler = "esbuild"
```

Setting `node_bundler = "esbuild"` tells Netlify to use the faster, modern bundler. It performs tree-shaking so only the parts of `@anthropic-ai/sdk` actually used get included. This is especially important for a function-only project where there is no frontend build step — esbuild replaces the need for a manual webpack step.

Do not add a build command. Leave `build.command` absent or empty in `netlify.toml`. Netlify will still install dependencies and bundle functions even with no frontend build.

**No `node_modules` commit.** Netlify installs and bundles automatically. Add `node_modules/` to `.gitignore`.

---

## Frontend Fetch Pattern

The static HTML calls the function with a plain `fetch`. Because the function lives on the same Netlify domain as the HTML, this is a **same-origin request** — no CORS configuration needed.

```javascript
// In the chat widget script (inline or linked JS file)
async function sendMessage(conversationHistory) {
  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversationHistory }),
  });

  if (!response.ok) {
    throw new Error(`Function error: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}
```

**Why `/.netlify/functions/chat` (path-relative, not absolute URL):**

Using a relative path means the URL resolves to whatever domain the page is on — `nathanrubin617.com` in production, `localhost:8888` with `netlify dev` locally. No hardcoded domain to manage.

**Conversation history shape the function expects:**

```javascript
// conversationHistory is an array maintained by the widget
const conversationHistory = [
  { role: "user", content: "Tell me about Nathan's book" }
];

// After receiving a reply, push assistant turn before next call
conversationHistory.push({ role: "assistant", content: reply });
conversationHistory.push({ role: "user", content: nextUserMessage });
```

The Anthropic API requires alternating `user` / `assistant` turns. Maintain the array client-side and pass the full history on each call. The function is stateless.

---

## CORS: Not Required for This Project

When both the HTML page and the `/.netlify/functions/chat` endpoint are served from the same domain (`nathanrubin617.com`), the browser treats it as a same-origin request. No `Access-Control-Allow-Origin` headers are needed.

The only time CORS becomes relevant is if the function is called from a different domain (e.g., an embedded widget on a third-party site). That is out of scope for this project.

If you ever do need CORS headers, add them to the `Response`:

```javascript
return new Response(JSON.stringify({ reply: text }), {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://nathanrubin617.com",
  },
});
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Function runtime | Netlify Functions (Node.js) | Netlify Edge Functions (Deno) | Edge Functions run Deno, which uses HTTP imports (`esm.sh`) instead of npm. That introduces network-fetched dependencies, versioning risk, and a Deno-specific mental model. Node.js + npm is simpler for this use case and has no cold-start penalty that matters at chat-widget scale. |
| Module format | ESM `.mjs` (modern handler) | CommonJS `.js` with `module.exports.handler` | The CommonJS / Lambda-compatible handler is the legacy format. Netlify is deprecating it starting 2025. The modern ESM handler uses standard Web APIs and is what Netlify's own docs now demonstrate. |
| Anthropic client | `@anthropic-ai/sdk` | Raw `fetch` to `api.anthropic.com` | Raw fetch requires manually constructing request bodies, headers (`x-api-key`, `anthropic-version`), and parsing response shapes. The SDK handles all of this plus retries and TypeScript types. The 80 KB bundle overhead is negligible in a serverless context. |
| Dependency location | Root `package.json` + esbuild bundling | Per-function `package.json` in `netlify/functions/` | Both work. Root-level is simpler for a project with one function. Per-function package.json is better for monorepos with many functions that need different dependency sets. |
| API key handling | Netlify environment variable | Netlify AI Gateway (auto-credential injection) | AI Gateway is the right long-term solution if you need rate limiting, usage analytics, and spend controls. For a personal portfolio with light traffic, it adds unnecessary complexity. Direct env var is simpler and sufficient. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Legacy CommonJS handler (`module.exports.handler`) | Netlify is deprecating this format in 2025. It uses Lambda-specific response shapes that conflict with the modern Web Platform API direction. | ESM default export returning a `Response` object. |
| `netlify-lambda` (webpack-based build tool) | An older community tool that required a separate build step to compile functions. Netlify's built-in esbuild bundler replaced this. No longer needed. | `node_bundler = "esbuild"` in `netlify.toml`. |
| Committing `node_modules/` to the repo | Bloats the repo, creates merge conflicts, and Netlify will install and bundle dependencies automatically anyway. | Add `node_modules/` to `.gitignore`. Let Netlify handle it. |
| Hardcoded `ANTHROPIC_API_KEY` in function source | Exposes the key in the Git repository. Even private repos are a risk. | `process.env.ANTHROPIC_API_KEY` set in Netlify's environment variable UI. |
| `Netlify.env.get("ANTHROPIC_API_KEY")` syntax | This is Netlify Edge Functions syntax (Deno runtime). It does not work in standard Netlify Functions (Node.js runtime). | `process.env.ANTHROPIC_API_KEY` — standard Node.js environment variable access. |
| Calling the Anthropic API directly from the browser | Exposes the API key to every visitor via browser dev tools. | Always proxy through the Netlify Function. |

---

## File Structure

```
repo-root/
├── index.html
├── book.html
├── basketball.html
├── contact.html
├── package.json                  # @anthropic-ai/sdk dependency
├── netlify.toml                  # node_bundler = "esbuild"
├── .gitignore                    # includes node_modules/
└── netlify/
    └── functions/
        └── chat.mjs              # The proxy function
```

---

## Installation

```bash
# From repo root — initializes package.json if it doesn't exist
npm init -y

# Install the only runtime dependency
npm install @anthropic-ai/sdk

# Local dev (optional — emulates functions + env vars locally)
npx netlify-cli link   # links to your Netlify site
npx netlify-cli dev    # serves site + functions on localhost:8888
```

For local dev, create a `.env` file at repo root (gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Netlify CLI reads `.env` automatically when running `netlify dev`.

---

## Version Compatibility

| Package | Node.js | Notes |
|---------|---------|-------|
| `@anthropic-ai/sdk@^0.80.0` | 18+ | Requires native `fetch` (built into Node 18). Do not use Node 16. |
| Netlify Functions (modern) | 18+ | Node 18 is the minimum for the modern Web Platform handler format. Netlify defaults to Node 18 for new sites created after 2023. |

---

## Sources

- [Netlify Functions: Get Started (official docs)](https://docs.netlify.com/build/functions/get-started/) — Handler signature, module format rules, file extensions, env var access — HIGH confidence
- [Migrating to Modern Netlify Functions (official guide)](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/) — Legacy vs. modern format comparison — HIGH confidence
- [Netlify Functions Overview (official docs)](https://docs.netlify.com/build/functions/overview/) — Execution limits, memory, payload sizes — HIGH confidence
- [Anthropic TypeScript SDK (GitHub)](https://github.com/anthropics/anthropic-sdk-typescript) — `messages.create()` signature, current version `0.80.0`, Node 18 requirement — HIGH confidence
- [Netlify CORS Support Guide (official forum)](https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739) — Same-origin requests require no CORS headers — HIGH confidence
- [Modern, Faster Netlify Functions: esbuild (Netlify blog)](https://www.netlify.com/blog/2021/04/02/modern-faster-netlify-functions/) — esbuild bundler, `node_bundler = "esbuild"` in `netlify.toml` — HIGH confidence
- [Building AI Experiences on Netlify (official Netlify guide)](https://developers.netlify.com/guides/building-ai-experiences-on-netlify/) — Anthropic SDK usage in Netlify context — MEDIUM confidence (example used Edge Functions syntax; adapted for standard Functions)
- [Netlify Functions Deploy (official docs)](https://docs.netlify.com/build/functions/deploy/) — Automatic dependency bundling — HIGH confidence

---

*Stack research for: Static portfolio site with Netlify Function proxying Anthropic Claude API*
*Researched: 2026-03-28*

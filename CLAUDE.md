<!-- GSD:project-start source:PROJECT.md -->
## Project

**Nathan Rubin Portfolio Site**

A personal portfolio website at nathanrubin617.com, deployed on Netlify via GitHub auto-deploy. Built with pure HTML, Tailwind CSS, and vanilla JavaScript — no frameworks, no build tools. The site showcases Nathan Rubin's book, basketball career, and contact info, and includes an AI chat widget that helps visitors learn about him.

**Core Value:** Visitors can quickly learn who Nathan Rubin is and engage with his story through a clean, fast, mobile-friendly static site with an AI assistant as a personal guide.

### Constraints

- **Tech stack:** Pure HTML, Tailwind CSS (CDN), vanilla JS — no npm, no frameworks, no build tools
- **Compatibility:** Must work in modern browsers; no transpilation
- **Content preservation:** All existing text, images, and styles must be carried over exactly
- **Netlify Functions:** chat.js must be a simple CommonJS/ESM module in netlify/functions/
- **Mobile:** All pages and the chat widget must be responsive
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Handler Format: The Right Answer for This Project
### Use ESM with the modern handler signature
## Dependency Management: Root `package.json`
## Frontend Fetch Pattern
## CORS: Not Required for This Project
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Function runtime | Netlify Functions (Node.js) | Netlify Edge Functions (Deno) | Edge Functions run Deno, which uses HTTP imports (`esm.sh`) instead of npm. That introduces network-fetched dependencies, versioning risk, and a Deno-specific mental model. Node.js + npm is simpler for this use case and has no cold-start penalty that matters at chat-widget scale. |
| Module format | ESM `.mjs` (modern handler) | CommonJS `.js` with `module.exports.handler` | The CommonJS / Lambda-compatible handler is the legacy format. Netlify is deprecating it starting 2025. The modern ESM handler uses standard Web APIs and is what Netlify's own docs now demonstrate. |
| Anthropic client | `@anthropic-ai/sdk` | Raw `fetch` to `api.anthropic.com` | Raw fetch requires manually constructing request bodies, headers (`x-api-key`, `anthropic-version`), and parsing response shapes. The SDK handles all of this plus retries and TypeScript types. The 80 KB bundle overhead is negligible in a serverless context. |
| Dependency location | Root `package.json` + esbuild bundling | Per-function `package.json` in `netlify/functions/` | Both work. Root-level is simpler for a project with one function. Per-function package.json is better for monorepos with many functions that need different dependency sets. |
| API key handling | Netlify environment variable | Netlify AI Gateway (auto-credential injection) | AI Gateway is the right long-term solution if you need rate limiting, usage analytics, and spend controls. For a personal portfolio with light traffic, it adds unnecessary complexity. Direct env var is simpler and sufficient. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Legacy CommonJS handler (`module.exports.handler`) | Netlify is deprecating this format in 2025. It uses Lambda-specific response shapes that conflict with the modern Web Platform API direction. | ESM default export returning a `Response` object. |
| `netlify-lambda` (webpack-based build tool) | An older community tool that required a separate build step to compile functions. Netlify's built-in esbuild bundler replaced this. No longer needed. | `node_bundler = "esbuild"` in `netlify.toml`. |
| Committing `node_modules/` to the repo | Bloats the repo, creates merge conflicts, and Netlify will install and bundle dependencies automatically anyway. | Add `node_modules/` to `.gitignore`. Let Netlify handle it. |
| Hardcoded `ANTHROPIC_API_KEY` in function source | Exposes the key in the Git repository. Even private repos are a risk. | `process.env.ANTHROPIC_API_KEY` set in Netlify's environment variable UI. |
| `Netlify.env.get("ANTHROPIC_API_KEY")` syntax | This is Netlify Edge Functions syntax (Deno runtime). It does not work in standard Netlify Functions (Node.js runtime). | `process.env.ANTHROPIC_API_KEY` — standard Node.js environment variable access. |
| Calling the Anthropic API directly from the browser | Exposes the API key to every visitor via browser dev tools. | Always proxy through the Netlify Function. |
## File Structure
## Installation
# From repo root — initializes package.json if it doesn't exist
# Install the only runtime dependency
# Local dev (optional — emulates functions + env vars locally)
## Version Compatibility
| Package | Node.js | Notes |
|---------|---------|-------|
| `@anthropic-ai/sdk@^0.80.0` | 18+ | Requires native `fetch` (built into Node 18). Do not use Node 16. |
| Netlify Functions (modern) | 18+ | Node 18 is the minimum for the modern Web Platform handler format. Netlify defaults to Node 18 for new sites created after 2023. |
## Sources
- [Netlify Functions: Get Started (official docs)](https://docs.netlify.com/build/functions/get-started/) — Handler signature, module format rules, file extensions, env var access — HIGH confidence
- [Migrating to Modern Netlify Functions (official guide)](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/) — Legacy vs. modern format comparison — HIGH confidence
- [Netlify Functions Overview (official docs)](https://docs.netlify.com/build/functions/overview/) — Execution limits, memory, payload sizes — HIGH confidence
- [Anthropic TypeScript SDK (GitHub)](https://github.com/anthropics/anthropic-sdk-typescript) — `messages.create()` signature, current version `0.80.0`, Node 18 requirement — HIGH confidence
- [Netlify CORS Support Guide (official forum)](https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739) — Same-origin requests require no CORS headers — HIGH confidence
- [Modern, Faster Netlify Functions: esbuild (Netlify blog)](https://www.netlify.com/blog/2021/04/02/modern-faster-netlify-functions/) — esbuild bundler, `node_bundler = "esbuild"` in `netlify.toml` — HIGH confidence
- [Building AI Experiences on Netlify (official Netlify guide)](https://developers.netlify.com/guides/building-ai-experiences-on-netlify/) — Anthropic SDK usage in Netlify context — MEDIUM confidence (example used Edge Functions syntax; adapted for standard Functions)
- [Netlify Functions Deploy (official docs)](https://docs.netlify.com/build/functions/deploy/) — Automatic dependency bundling — HIGH confidence
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

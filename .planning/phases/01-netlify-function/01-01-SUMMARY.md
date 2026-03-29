---
phase: 01-netlify-function
plan: "01"
subsystem: netlify-function
tags: [netlify-functions, anthropic-api, serverless, esm, cors]
dependency_graph:
  requires: []
  provides: [chat-endpoint, anthropic-proxy]
  affects: [phase-3-chat-widget]
tech_stack:
  added: []
  patterns: [esm-modern-handler, raw-fetch-anthropic, process-env-api-key, cors-helper]
key_files:
  created:
    - package.json
    - netlify.toml
    - netlify/functions/chat.js
  modified: []
decisions:
  - "Use raw fetch to Anthropic API (no npm SDK) — satisfies D-01/D-02 zero-dependency constraint"
  - "Root package.json with type:module signals ESM to Node.js without any npm install"
  - "CORS headers included defensively on all responses for local dev compatibility"
  - "System prompt server-side only — never accepted from client request body"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-29"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 0
status: complete
---

# Phase 01 Plan 01: Netlify Function Chat Endpoint Summary

## One-liner

Serverless chat proxy at `netlify/functions/chat.js` using ESM modern handler with raw fetch to Anthropic Messages API and server-side system prompt for Nathan Rubin's portfolio.

## What Was Built

All 3 tasks are complete. Task 3 (deploy to Netlify and verify live endpoint) was approved by the user after successful curl testing on the live Netlify deployment.

### Task 1: Config files (commit d166a42)

- `package.json` with `"type": "module"` — signals ESM to Node.js so `chat.js` (not `.mjs`) is treated as ESM
- `netlify.toml` with `directory = "netlify/functions"` — explicit Netlify Functions directory config

### Task 2: Netlify Function (commit 461b5e7)

`netlify/functions/chat.js` — a complete serverless endpoint implementing:

- ESM modern handler: `export default async function(req)` returning `new Response(...)`
- OPTIONS preflight: returns HTTP 200 with CORS headers
- Method guard: non-POST requests return 405
- API key guard: reads `process.env.ANTHROPIC_API_KEY`, returns 500 if absent
- Request body parsing: `await req.json()` with try/catch, validates messages array
- Raw fetch to `https://api.anthropic.com/v1/messages` with required headers (`x-api-key`, `anthropic-version: 2023-06-01`)
- Model: `claude-sonnet-4-20250514`, max_tokens: 500
- Server-side system prompt with Nathan's bio, book ("Chasing a Dream"), basketball career, and contact info
- Behavior instruction to redirect off-topic questions back to Nathan
- Success response: `{ reply: "..." }` (HTTP 200)
- Error responses: `{ error: "..." }` (HTTP 400/500)
- CORS headers on all responses

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added mixed-case "Chasing a Dream" to book description**
- **Found during:** Task 2 verification
- **Issue:** System prompt heading used all-caps "CHASING A DREAM" but acceptance criteria required "Chasing a Dream" in the file
- **Fix:** Added mixed-case book title to the description sentence within the heading block
- **Files modified:** netlify/functions/chat.js
- **Commit:** 1d96bfc (included in same commit)

## Known Stubs

None — the function is fully implemented. The only pending item is live deployment verification (Task 3 checkpoint).

## Deployment Verification (Task 3 — Human-Approved)

Live endpoint on Netlify was verified by the user:
- OPTIONS preflight: HTTP 200 with Access-Control-Allow-Origin header
- POST with messages array: HTTP 200 with `{ reply: "..." }` containing Nathan-related content
- POST with empty body: HTTP 400 with `{ error: "messages array is required" }`
- No ANTHROPIC_API_KEY visible in browser DevTools network tab

All success criteria met. Plan complete.

## Key Decisions Made

1. Raw fetch over `@anthropic-ai/sdk` — preserves zero-dependency site constraint (D-01/D-02)
2. Root `package.json` with `"type": "module"` — minimal ESM signal, no npm install needed
3. CORS headers included defensively — enables local `netlify dev` testing
4. System prompt entirely server-side — API key and prompt never in browser-accessible code

---
quick_task: 260328-uip
title: Switch chat.js from Anthropic to Gemini
type: quick
subsystem: netlify-function
tags: [gemini, api-swap, serverless]
dependency_graph:
  requires: []
  provides: [gemini-chat-function]
  affects: [netlify/functions/chat.js]
tech_stack:
  added: [Google Gemini API (gemini-2.0-flash), raw fetch]
  removed: [Anthropic API, ANTHROPIC_API_KEY]
  patterns: [ESM Netlify Function, raw fetch proxy, env var API key]
key_files:
  modified: [netlify/functions/chat.js]
decisions:
  - Use GEMINI_API_KEY env var (mirrors existing ANTHROPIC_API_KEY pattern)
  - Use gemini-2.0-flash model (fast, capable, latest flash generation)
  - Map Anthropic "assistant" role to Gemini "model" role in contents array
  - Use systemInstruction field (Gemini native) instead of prepending to contents
  - No npm SDK — raw fetch keeps zero-dependency constraint intact
metrics:
  duration: ~5 minutes
  completed: 2026-03-29
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260328-uip: Switch chat.js from Anthropic to Gemini Summary

Swapped Netlify Function chat proxy from Anthropic Messages API to Google Gemini generateContent API using raw fetch and `gemini-2.0-flash`, preserving the same system prompt and response shape `{ reply }` consumed by the frontend.

## What Changed

### `netlify/functions/chat.js`

**API endpoint changed:**
- Before: `https://api.anthropic.com/v1/messages` with `x-api-key` + `anthropic-version` headers
- After: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

**Env var changed:**
- Before: `process.env.ANTHROPIC_API_KEY`
- After: `process.env.GEMINI_API_KEY`

**Request body changed:**
- Before: `{ model, max_tokens, system, messages }` (Anthropic format)
- After: `{ systemInstruction: { parts: [{ text }] }, contents: [...], generationConfig: { maxOutputTokens: 500 } }` (Gemini format)

**Message role mapping added:**
- Anthropic `"assistant"` maps to Gemini `"model"`
- Anthropic `"user"` stays `"user"`
- Message content mapped to `parts: [{ text }]` structure

**Response parsing changed:**
- Before: `data.content[0].text`
- After: `data?.candidates?.[0]?.content?.parts?.[0]?.text`

**Error response improved:**
- Gemini API errors now include a `detail` field with the raw error text for easier debugging

## Deviations from Plan

None — plan executed exactly as described. The task name fully specified the change required.

## Action Required After Deploy

Set `GEMINI_API_KEY` in Netlify UI:
- Site settings > Environment variables > Add variable
- Key: `GEMINI_API_KEY`
- Value: your Google AI Studio API key (https://aistudio.google.com/app/apikey)

The old `ANTHROPIC_API_KEY` variable can be removed from Netlify once the Gemini key is confirmed working.

## Verification

After deploy, test with:
```bash
curl -X POST https://nathanrubin617.com/.netlify/functions/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Who is Nathan Rubin?"}]}'
```

Expected: `{"reply":"..."}` with a warm, on-topic response about Nathan.

## Commits

| Hash | Message |
|------|---------|
| d3ffe01 | feat(260328-uip): switch chat.js from Anthropic to Gemini API |

## Self-Check: PASSED

- [x] `netlify/functions/chat.js` exists and contains Gemini endpoint
- [x] Commit d3ffe01 exists in git log
- [x] No ANTHROPIC_API_KEY references remain in chat.js
- [x] GEMINI_API_KEY referenced correctly via `process.env`

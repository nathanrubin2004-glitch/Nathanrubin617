---
status: resolved
trigger: "Chat widget showing 'Sorry, I couldn't reach the server' on live Netlify site"
created: 2026-03-28T00:00:00Z
updated: 2026-03-28T00:02:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — index.html fetch calls Anthropic API directly from browser with placeholder key instead of calling /.netlify/functions/chat
test: n/a — root cause confirmed by reading index.html line 252
expecting: n/a
next_action: fix index.html fetch to call /.netlify/functions/chat with correct request format

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Chat widget sends user messages to /.netlify/functions/chat and receives AI responses
actual: Widget displays "Sorry, I couldn't reach the server" — no response from the function
errors: "Sorry, I couldn't reach the server" (displayed in UI)
reproduction: Load the live Netlify site, open chat widget, send any message
started: Observed now; unclear if it ever worked in production

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: chat.js has wrong handler format or bad Gemini API call
  evidence: chat.js uses correct ESM default export, correct process.env.GEMINI_API_KEY, correct raw fetch to Gemini generateContent endpoint, correct response parsing
  timestamp: 2026-03-28T00:01:00Z

- hypothesis: netlify.toml missing functions directory config
  evidence: netlify.toml correctly sets directory = "netlify/functions"
  timestamp: 2026-03-28T00:01:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-28T00:01:00Z
  checked: index.html line 252
  found: fetch target is 'https://api.anthropic.com/v1/messages' — a direct browser call to Anthropic, not to /.netlify/functions/chat
  implication: cross-origin request blocked by browser CORS policy; also uses placeholder key 'your-api-key-here'

- timestamp: 2026-03-28T00:01:00Z
  checked: index.html lines 253-265
  found: request format uses Anthropic SDK shape (model, max_tokens, system, messages) not Gemini/function shape ({ messages: [...] })
  implication: even if URL were correct, the request body format mismatches what chat.js expects

- timestamp: 2026-03-28T00:01:00Z
  checked: netlify/functions/chat.js
  found: correctly written — ESM export, GEMINI_API_KEY env var, raw fetch to Gemini API, maps { messages } array to Gemini contents format
  implication: server function is fine; only the frontend call is broken

- timestamp: 2026-03-28T00:01:00Z
  checked: netlify.toml
  found: [functions] directory = "netlify/functions" — correct
  implication: function deployment config is fine

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: index.html chat widget fetches directly to https://api.anthropic.com/v1/messages with a placeholder API key instead of POSTing to /.netlify/functions/chat. The cross-origin request is blocked by CORS, surfacing as a network error caught in the catch block and displayed as "couldn't reach the server".
fix: update index.html fetch to POST to /.netlify/functions/chat with body { messages: conversationHistory }, and parse the response as { reply } instead of Anthropic SDK response shape
verification: self-checked — fetch URL changed to /.netlify/functions/chat, request body now { messages: [...] }, response parsed as data.reply
files_changed: [index.html]

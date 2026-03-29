# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## chat-widget-server-error — Chat widget fetching Anthropic API directly from browser instead of calling Netlify function
- **Date:** 2026-03-28
- **Error patterns:** couldn't reach server, chat widget, fetch, api.anthropic.com, CORS, placeholder key, your-api-key-here, netlify functions
- **Root cause:** index.html chat widget fetches directly to https://api.anthropic.com/v1/messages with a placeholder API key instead of POSTing to /.netlify/functions/chat. The cross-origin request is blocked by CORS, surfacing as a network error caught in the catch block and displayed as "couldn't reach the server".
- **Fix:** Update index.html fetch to POST to /.netlify/functions/chat with body { messages: conversationHistory }, and parse the response as { reply } instead of Anthropic SDK response shape.
- **Files changed:** index.html
---

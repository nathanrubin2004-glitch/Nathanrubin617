---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - netlify/functions/chat.js
autonomous: true
must_haves:
  truths:
    - "Chat function calls Gemini 2.0 Flash API instead of Anthropic"
    - "GEMINI_API_KEY env var is used instead of ANTHROPIC_API_KEY"
    - "Response still returns { reply: '...' } on success and { error: '...' } on failure"
    - "System prompt about Nathan Rubin is preserved exactly"
    - "CORS and OPTIONS handling unchanged"
  artifacts:
    - path: "netlify/functions/chat.js"
      provides: "Gemini-backed chat serverless function"
  key_links:
    - from: "netlify/functions/chat.js"
      to: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
      via: "raw fetch POST with API key query param"
      pattern: "generativelanguage.googleapis.com"
---

<objective>
Switch the chat Netlify Function from Anthropic Claude to Google Gemini 2.0 Flash.

Purpose: Replace the Anthropic API call with a Gemini API call while keeping everything else identical — same system prompt, same request/response contract ({ reply } / { error }), same CORS handling, same ESM handler format, no npm dependencies.

Output: Updated netlify/functions/chat.js using Gemini API
</objective>

<context>
@netlify/functions/chat.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite chat.js to use Gemini API</name>
  <files>netlify/functions/chat.js</files>
  <action>
Rewrite netlify/functions/chat.js to call Gemini instead of Anthropic. Preserve all structure:

1. **Keep unchanged:** SYSTEM_PROMPT constant (exact same text), corsHeaders() helper, OPTIONS handler, POST-only check, request body parsing, messages array validation, response shape { reply } / { error }.

2. **Change env var:** Replace `process.env.ANTHROPIC_API_KEY` with `process.env.GEMINI_API_KEY`. Update the error message to say "API key not configured" (same text is fine).

3. **Change API call:** Replace the Anthropic fetch with a Gemini fetch:
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
   - Method: POST
   - Headers: `{ 'Content-Type': 'application/json' }`
   - No auth header needed — key is in the query string

4. **Map message format:** Gemini expects a different body shape. Convert the incoming Anthropic-style messages array (each `{ role: "user"|"assistant", content: "..." }`) to Gemini format:
   - `system_instruction`: `{ parts: [{ text: SYSTEM_PROMPT }] }`
   - `contents`: Map each message to `{ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] }`
   - `generationConfig`: `{ maxOutputTokens: 500 }`

5. **Extract reply:** Gemini response shape is `{ candidates: [{ content: { parts: [{ text }] } }] }`. Extract: `data.candidates[0].content.parts[0].text`

6. **Error handling:** Keep the same try/catch pattern. Change error message strings from "Anthropic" to "Gemini" (e.g., "Failed to reach Gemini API", "Gemini API error").

7. **Update source comments** at top of file to reference Gemini API docs instead of Anthropic.
  </action>
  <verify>
    <automated>grep -q "generativelanguage.googleapis.com" netlify/functions/chat.js && grep -q "GEMINI_API_KEY" netlify/functions/chat.js && grep -q "system_instruction" netlify/functions/chat.js && grep -q "SYSTEM_PROMPT" netlify/functions/chat.js && grep -q "corsHeaders" netlify/functions/chat.js && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>
  - chat.js calls Gemini 2.0 Flash endpoint with API key in query string
  - GEMINI_API_KEY env var used
  - Incoming messages mapped from Anthropic format (role: user/assistant) to Gemini format (role: user/model with parts array)
  - System prompt passed via system_instruction field
  - Reply extracted from candidates[0].content.parts[0].text
  - Response contract unchanged: { reply } on success, { error } on failure
  - CORS headers and OPTIONS handling preserved
  - No npm dependencies
  </done>
</task>

</tasks>

<verification>
- `grep "ANTHROPIC" netlify/functions/chat.js` returns nothing (no Anthropic references remain)
- `grep "GEMINI_API_KEY" netlify/functions/chat.js` finds the env var usage
- `grep "generativelanguage.googleapis.com" netlify/functions/chat.js` finds the endpoint
- `grep "system_instruction" netlify/functions/chat.js` confirms system prompt mapping
- File still uses `export default async function` (ESM handler)
- File still returns `{ reply: "..." }` and `{ error: "..." }` response shapes
</verification>

<success_criteria>
netlify/functions/chat.js is a drop-in replacement that uses Gemini 2.0 Flash instead of Anthropic Claude, with identical external behavior (same request/response contract, same system prompt, same CORS handling). No npm dependencies added.
</success_criteria>

<output>
After completion, create `.planning/quick/260328-uip-switch-chat-js-from-anthropic-to-gemini-/260328-uip-SUMMARY.md`
</output>

# Phase 1: Netlify Function - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-netlify-function
**Areas discussed:** API call method, Response shape, System prompt content, Error behavior

---

## API Call Method

| Option | Description | Selected |
|--------|-------------|----------|
| Raw fetch | No npm, no package.json, no build step. Manual headers. Aligns with FUNC-02. | ✓ |
| Anthropic SDK + esbuild | npm install @anthropic-ai/sdk, esbuild bundler. Cleaner code but requires build config. | |
| You decide | Claude picks based on project constraints | |

**User's choice:** Raw fetch
**Notes:** Resolves the conflict between REQUIREMENTS.md (FUNC-02: "no npm packages needed") and CLAUDE.md/STATE.md (recommends SDK). Zero-dependency constraint wins.

---

## Response Shape

| Option | Description | Selected |
|--------|-------------|----------|
| { reply: "..." } | Simple, semantic field name. Chat widget reads data.reply. | ✓ |
| { message: "..." } | More generic field name | |
| { content: "..." } | Mirrors Anthropic's own API response shape | |

**User's choice:** `{ reply: "..." }`
**Notes:** Clean, semantic contract for Phase 3 chat widget to parse.

---

## System Prompt Content

| Option | Description | Selected |
|--------|-------------|----------|
| Derive from existing HTML pages | Researcher reads book.html, basketball.html, index.html and extracts key facts | ✓ |
| I'll provide talking points | User provides specific talking points to emphasize | |
| Minimal placeholder for now | Brief prompt now, full content added in Phase 4 | |

**User's choice:** Derive from existing HTML pages
**Notes:** Content already exists in the site. No manual authoring needed.

---

## Error Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| HTTP 500 + { error: "..." } | Standard REST convention. Non-2xx triggers chat widget error display. | ✓ |
| HTTP 200 + { error: "..." } | Always 200, error in body. Non-standard. | |
| You decide | Claude picks the standard approach | |

**User's choice:** HTTP 500 + `{ error: "..." }`
**Notes:** Standard REST convention; clean separation between success and failure paths.

---
*Discussion completed: 2026-03-28*

# Nathan Rubin Portfolio Site

## What This Is

A personal portfolio website at nathanrubin617.com, deployed on Netlify via GitHub auto-deploy. Built with pure HTML, Tailwind CSS, and vanilla JavaScript — no frameworks, no build tools. The site showcases Nathan Rubin's book, basketball career, and contact info, and includes an AI chat widget that helps visitors learn about him.

## Core Value

Visitors can quickly learn who Nathan Rubin is and engage with his story through a clean, fast, mobile-friendly static site with an AI assistant as a personal guide.

## Requirements

### Validated

- [x] Site is split into 4 separate HTML pages: index.html (home + about), book.html, basketball.html, contact.html — *Validated in Phase 2: Page Split & Navigation*
- [x] Navigation bar on every page has working links to all 4 pages — *Validated in Phase 2*
- [x] All existing content, styles, and images are preserved exactly — *Validated in Phase 2*
- [x] All image URLs (Imgur-hosted) remain unchanged — *Validated in Phase 2*
- [x] Site works correctly on mobile — *Validated in Phase 2*
- [x] AI chat widget (floating bubble, bottom-right) appears on every page — *Validated in Phase 3: Chat Widget*
- [x] Chat widget is powered by Anthropic API via a Netlify Function — *Validated in Phase 3*
- [x] Chat widget matches the site's blue color scheme (#3b82f6) — *Validated in Phase 3*
- [x] Chat panel is full-width on mobile with iOS safe-area insets — *Validated in Phase 3*
- [x] Widget logic lives in shared chat.js (not duplicated inline) — *Validated in Phase 3*

### Validated (continued)

- [x] Netlify Function lives at netlify/functions/chat.js and uses ANTHROPIC_API_KEY env var — *Validated in Phase 4: Polish & Launch*
- [x] Chat assistant is primed with Nathan's bio, book, and basketball content from the site — *Validated in Phase 4*
- [x] Chat assistant redirects off-topic questions back to Nathan-related topics — *Validated in Phase 4*
- [x] 3 starter question chips appear below greeting — *Validated in Phase 4 (CHAT-05)*
- [x] Chat panel opens/closes with smooth CSS animation — *Validated in Phase 4 (CHAT-14)*
- [x] Loading screen with NR logo on all 4 pages — *Validated in Phase 4*
- [x] Hero text entrance animation on index.html — *Validated in Phase 4*
- [x] Back-to-top button on all 4 pages — *Validated in Phase 4*
- [x] API key confirmed hidden in production DevTools — *Validated in Phase 4*

### Out of Scope

- npm, build tools, or frameworks — site must remain pure HTML/CSS/JS
- Changing the visual design or color scheme beyond the chat widget
- Adding new pages beyond the 4 specified
- User accounts or persistent chat history — stateless per session
- Video posts or media uploads

## Context

- **Stack:** Plain HTML files, Tailwind CSS (CDN), vanilla JavaScript — no build step, no package.json
- **Deployment:** Netlify auto-deploys from GitHub repo (Nathanrubin617) on push
- **Domain:** nathanrubin617.com (custom domain configured in Netlify)
- **Images:** All hosted on Imgur — URLs must not be changed
- **Current state:** v1.0 complete — all 4 phases shipped and human-verified on nathanrubin617.com (2026-03-30)
- **Color scheme:** Blue (#3b82f6), glassmorphism nav
- **API security:** Anthropic API key stored as Netlify environment variable ANTHROPIC_API_KEY; proxied through a Netlify Function to avoid client-side exposure

## Constraints

- **Tech stack:** Pure HTML, Tailwind CSS (CDN), vanilla JS — no npm, no frameworks, no build tools
- **Compatibility:** Must work in modern browsers; no transpilation
- **Content preservation:** All existing text, images, and styles must be carried over exactly
- **Netlify Functions:** chat.js must be a simple CommonJS/ESM module in netlify/functions/
- **Mobile:** All pages and the chat widget must be responsive

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Netlify Function for API proxy | Keeps ANTHROPIC_API_KEY secret; avoids client-side exposure | — Pending |
| claude-sonnet-4-20250514 | User-specified model | — Pending |
| System prompt derived from site content | Visitor-focused assistant; no manual prompt authoring needed | — Pending |
| No build tools | Site is deliberately zero-dependency static HTML | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 — Phase 3 complete (chat widget live on all 4 pages, mobile-responsive, iOS safe-area, shared chat.js)*

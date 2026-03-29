# Nathan Rubin Portfolio Site

## What This Is

A personal portfolio website at nathanrubin617.com, deployed on Netlify via GitHub auto-deploy. Built with pure HTML, Tailwind CSS, and vanilla JavaScript — no frameworks, no build tools. The site showcases Nathan Rubin's book, basketball career, and contact info, and includes an AI chat widget that helps visitors learn about him.

## Core Value

Visitors can quickly learn who Nathan Rubin is and engage with his story through a clean, fast, mobile-friendly static site with an AI assistant as a personal guide.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Site is split into 4 separate HTML pages: index.html (home + about), book.html, basketball.html, contact.html
- [ ] Navigation bar on every page has working links to all 4 pages
- [ ] AI chat widget (floating bubble, bottom-right) appears on every page
- [ ] Chat widget is powered by Anthropic API (claude-sonnet-4-20250514) via a Netlify Function
- [ ] Netlify Function lives at netlify/functions/chat.js and uses ANTHROPIC_API_KEY env var
- [ ] Chat assistant is primed with Nathan's bio, book, and basketball content from the site
- [ ] Chat assistant redirects off-topic questions back to Nathan-related topics
- [ ] Chat widget matches the site's blue color scheme (#3b82f6)
- [ ] All existing content, styles, and images are preserved exactly
- [ ] All image URLs (Imgur-hosted) remain unchanged
- [ ] Site works correctly on mobile

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
- **Current state:** Single index.html containing all content (home, about, book, basketball, contact)
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
*Last updated: 2026-03-28 after initialization*

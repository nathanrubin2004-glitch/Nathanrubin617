# Roadmap: Nathan Rubin Portfolio Site

## Overview

Starting from a single monolithic index.html, this project builds outward in four deliberate phases: first the API proxy that powers the chat widget, then the page split that gives the site its proper structure, then the chat widget itself, and finally the polish features that make the experience feel finished. Each phase delivers something independently testable before the next phase depends on it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Netlify Function** - API proxy exists, accepts messages, returns replies with API key secured server-side
- [ ] **Phase 2: Page Split & Navigation** - Four separate HTML pages with working nav, all content preserved
- [ ] **Phase 3: Chat Widget** - Floating chat bubble live on all four pages, connected to the API
- [ ] **Phase 4: Polish & Launch** - Starter chips, animation, and end-to-end production validation

## Phase Details

### Phase 1: Netlify Function
**Goal**: A working serverless API proxy exists that accepts visitor messages and returns AI replies, with the API key and system prompt fully secured server-side
**Depends on**: Nothing (first phase)
**Requirements**: FUNC-01, FUNC-02, FUNC-03, FUNC-04, FUNC-05, FUNC-06, FUNC-07
**Success Criteria** (what must be TRUE):
  1. A POST to `/.netlify/functions/chat` with a messages array returns a JSON reply from Claude about Nathan
  2. The ANTHROPIC_API_KEY is never visible in browser network requests or source code
  3. The system prompt containing Nathan's bio, book, and basketball details is only readable server-side
  4. The assistant responds to off-topic questions by redirecting to Nathan-related topics
  5. The function returns a 200 response to OPTIONS preflight requests
**Plans**: TBD

### Phase 2: Page Split & Navigation
**Goal**: Visitors can navigate a four-page site where all original content, images, and styles from the current index.html are preserved exactly
**Depends on**: Phase 1
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. Visitor can reach home/about at index.html, book content at book.html, basketball at basketball.html, and contact at contact.html
  2. Every nav link on every page leads to the correct destination (16 combinations, no broken anchors)
  3. All original text, images, and Imgur URLs appear identically to the current single-page site
  4. Nav bar is visible and all four links work correctly on a mobile screen
**Plans**: TBD
**UI hint**: yes

### Phase 3: Chat Widget
**Goal**: Visitors can open a chat panel on any of the four pages and have a real conversation with an AI assistant that knows Nathan's story
**Depends on**: Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11, CHAT-12, CHAT-13, CHAT-15, CHAT-16, CHAT-17, CHAT-18
**Success Criteria** (what must be TRUE):
  1. A blue chat bubble is visible in the bottom-right corner of all four pages; clicking it opens and closes the panel
  2. Visitor can type a question, send it, and receive a contextually appropriate reply from Claude about Nathan
  3. User and assistant messages are visually distinct; all messages from the current session remain visible while the panel is open
  4. A loading indicator appears while the API responds; an inline error message appears if the call fails
  5. The chat panel is full-width on mobile and does not overlap iOS browser chrome
**Plans**: TBD
**UI hint**: yes

### Phase 4: Polish & Launch
**Goal**: The experience feels polished and the production deployment is fully validated end-to-end
**Depends on**: Phase 3
**Requirements**: CHAT-05, CHAT-14
**Success Criteria** (what must be TRUE):
  1. Three starter question chips appear below the greeting when the chat panel opens; clicking a chip sends that question
  2. The chat panel opens and closes with a visible CSS animation
  3. No Anthropic API key or system prompt content is visible in browser DevTools network tab during a live chat session on the production Netlify URL
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Netlify Function | 0/? | Not started | - |
| 2. Page Split & Navigation | 0/? | Not started | - |
| 3. Chat Widget | 0/? | Not started | - |
| 4. Polish & Launch | 0/? | Not started | - |

# Requirements: Nathan Rubin Portfolio Site

**Defined:** 2026-03-28
**Core Value:** Visitors can quickly learn who Nathan Rubin is and engage with his story through a clean, fast, mobile-friendly static site with an AI assistant as a personal guide.

## v1 Requirements

### Site Structure

- [x] **SITE-01**: Visitor can access the home and about sections at index.html
- [x] **SITE-02**: Visitor can access the book, events, reviews, and purchase sections at book.html
- [x] **SITE-03**: Visitor can access the basketball section at basketball.html
- [x] **SITE-04**: Visitor can access the contact form at contact.html
- [x] **SITE-05**: All existing page content, styles, and images are preserved exactly as they appear in the current index.html

### Navigation

- [x] **NAV-01**: Visitor can navigate to all 4 pages from the nav bar on any page
- [x] **NAV-02**: Nav bar links use file-based hrefs (index.html, book.html, etc.) not anchor links (#section)
- [x] **NAV-03**: Nav bar is present and functional on all 4 pages
- [x] **NAV-04**: Nav bar works correctly on mobile

### Netlify Function

- [ ] **FUNC-01**: A Netlify Function exists at netlify/functions/chat.js
- [ ] **FUNC-02**: The function calls the Google Gemini API using raw fetch (no npm packages needed)
- [ ] **FUNC-03**: The function reads the API key from the GEMINI_API_KEY environment variable (never exposed to client)
- [ ] **FUNC-04**: The system prompt — containing Nathan's bio, book, and basketball context — lives server-side only in the function
- [ ] **FUNC-05**: The system prompt instructs the assistant to redirect off-topic questions back to Nathan-related topics
- [ ] **FUNC-06**: The function handles OPTIONS preflight requests with a 200 response
- [ ] **FUNC-07**: The function caps max_tokens at 500 to stay within the 10-second Netlify free-tier timeout

### Chat Widget

- [x] **CHAT-01**: A floating chat bubble is visible in the bottom-right corner on all 4 pages
- [x] **CHAT-02**: Visitor can click the bubble to open a chat panel
- [x] **CHAT-03**: Visitor can click a close button to dismiss the panel at any time
- [x] **CHAT-04**: The chat panel shows a warm greeting message when first opened
- [x] **CHAT-05**: The chat panel shows 3 starter question chips below the greeting (e.g., "Tell me about his book", "Basketball career", "How to contact him")
- [x] **CHAT-06**: Visitor can type a message and send it by clicking the send button or pressing Enter
- [x] **CHAT-07**: The send button is disabled and the input is locked while awaiting an API response
- [x] **CHAT-08**: A loading/typing indicator is visible while the assistant is generating a response
- [x] **CHAT-09**: The assistant's reply appears as a distinct message bubble
- [x] **CHAT-10**: User messages and assistant messages are visually distinct (different alignment/color)
- [x] **CHAT-11**: The chat panel auto-scrolls to the latest message after each exchange
- [x] **CHAT-12**: All messages from the current session remain visible while the panel is open
- [x] **CHAT-13**: A graceful inline error message appears if the API call fails ("Something went wrong — try again")
- [x] **CHAT-14**: The chat panel opens and closes with a smooth CSS animation
- [x] **CHAT-15**: The widget logic lives in a shared chat.js file loaded by all 4 pages (not duplicated inline)
- [x] **CHAT-16**: The widget uses the site's blue color scheme (#3b82f6) for assistant bubbles and the send button
- [x] **CHAT-17**: The chat panel displays full-width on mobile screens
- [x] **CHAT-18**: The widget respects iOS safe-area insets so it does not overlap the browser chrome

## v2 Requirements

### Analytics & Quality

- **OPT-01**: Auto-open widget after 30 seconds on first visit — risky UX, validate with analytics first
- **OPT-02**: Full keyboard tab/focus accessibility audit
- **OPT-03**: Conversation feedback (thumbs up/down) — needs a backend to be meaningful

## Out of Scope

| Feature | Reason |
|---------|--------|
| Persistent cross-session chat history | Requires a database; PROJECT.md explicitly excludes it |
| User authentication or named sessions | Incompatible with a pure static site |
| Streaming character-by-character responses | Adds significant complexity to both function and frontend; full response is acceptable |
| Voice input | Web Speech API is inconsistent; overkill for a portfolio context |
| Dark mode toggle inside widget | Tailwind CDN does not support dark: variants without a build step |
| npm, build tools, or frameworks | Site must remain zero-dependency static HTML |
| Additional pages beyond the 4 specified | Out of scope per PROJECT.md |
| Human handoff / live operator | Incompatible with static site; contact page handles this |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FUNC-01 | Phase 1 | Pending |
| FUNC-02 | Phase 1 | Pending |
| FUNC-03 | Phase 1 | Pending |
| FUNC-04 | Phase 1 | Pending |
| FUNC-05 | Phase 1 | Pending |
| FUNC-06 | Phase 1 | Pending |
| FUNC-07 | Phase 1 | Pending |
| SITE-01 | Phase 2 | Complete |
| SITE-02 | Phase 2 | Complete |
| SITE-03 | Phase 2 | Complete |
| SITE-04 | Phase 2 | Complete |
| SITE-05 | Phase 2 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| NAV-04 | Phase 2 | Complete |
| CHAT-01 | Phase 3 | Complete |
| CHAT-02 | Phase 3 | Complete |
| CHAT-03 | Phase 3 | Complete |
| CHAT-04 | Phase 3 | Complete |
| CHAT-06 | Phase 3 | Complete |
| CHAT-07 | Phase 3 | Complete |
| CHAT-08 | Phase 3 | Complete |
| CHAT-09 | Phase 3 | Complete |
| CHAT-10 | Phase 3 | Complete |
| CHAT-11 | Phase 3 | Complete |
| CHAT-12 | Phase 3 | Complete |
| CHAT-13 | Phase 3 | Complete |
| CHAT-15 | Phase 3 | Complete |
| CHAT-16 | Phase 3 | Complete |
| CHAT-17 | Phase 3 | Complete |
| CHAT-18 | Phase 3 | Complete |
| CHAT-05 | Phase 4 | Complete |
| CHAT-14 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

Note: Previous count of 29 was incorrect. Actual count is 34 (FUNC: 7, SITE: 5, NAV: 4, CHAT: 18).

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*

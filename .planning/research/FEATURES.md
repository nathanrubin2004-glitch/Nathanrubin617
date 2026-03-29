# Feature Research

**Domain:** AI floating chat widget on a personal portfolio/static site
**Researched:** 2026-03-28
**Confidence:** HIGH (well-established widget UX patterns; LOW on any mobile-edge specifics)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = widget feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Floating bubble toggle (open/close) | Standard pattern since Intercom era; users won't look elsewhere for a chat entry point | LOW | Fixed bottom-right, z-index above page content |
| Chat panel with message thread | Core reason widget exists; no thread = no widget | LOW | Scrollable, auto-scrolls to newest message |
| Distinct message bubbles (user vs assistant) | Users need to track who said what at a glance | LOW | Different colors/alignment per sender; site blue (#3b82f6) for assistant |
| Visible text input + send button | Users must know how to send a message; hidden or ambiguous input kills engagement | LOW | Keyboard submits on Enter; button submits on click |
| Loading/typing indicator while API responds | Without feedback, users assume the widget is broken and close it | LOW | Animated dots or spinner inside assistant bubble area |
| Graceful API error message | Network failures happen; silent failure creates confusion | LOW | Single inline error message: "Something went wrong — try again" |
| Auto-scroll to latest message | Users lose thread if they have to manually scroll down | LOW | Scroll on new message append, both user and assistant turns |
| Session-scoped message history | Users expect prior messages to remain visible while the panel is open | LOW | In-memory array; cleared on page reload (out-of-scope per PROJECT.md) |
| Mobile-responsive layout | Most traffic is mobile; a widget that covers content or has unclickable inputs kills engagement | MEDIUM | Bottom-right bubble; full-width panel on small screens; safe area insets for iOS |
| Accessible close button | Users who open by accident need a clear way out | LOW | X button visible in panel header at all times |
| Visible widget on all 4 pages | Visitors navigate; losing the widget mid-session breaks continuity | LOW | Shared snippet included in every HTML file |

### Differentiators (Competitive Advantage)

Features that make this widget memorable versus a generic contact form.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Persona-aware system prompt | Assistant answers as a knowledgeable guide to Nathan specifically, not a generic bot | LOW | System prompt in Netlify Function; pulls bio, book, basketball context |
| Topic-redirect behavior | Keeps off-topic questions from embarrassing Nathan or wasting the visitor's time | LOW | Handled in system prompt: "If asked about X, redirect to Nathan topics" |
| Warm, conversational greeting on open | First impression decides engagement; "Hi! Ask me anything about Nathan" outperforms a blank input | LOW | Hardcoded initial assistant bubble rendered on widget open |
| Suggested starter questions | Reduces blank-slate paralysis for first-time visitors; surfaces Nathan's key talking points | LOW | 2-3 chip buttons ("Tell me about his book", "Basketball career", "How to contact him") beneath input; clicking populates and submits |
| Smooth open/close animation | Signals polish; crude pop-in feels low quality next to the site's glassmorphism aesthetic | LOW | CSS transition on panel height/opacity; no JS animation library needed |
| Send button disabled during pending request | Prevents double-sends and signals that a response is in progress | LOW | Toggle disabled attribute on send button; re-enable after response |
| Keyboard accessibility (Enter to send) | Power users expect keyboard control; missing it is jarring | LOW | keydown handler on textarea |

### Anti-Features (Deliberately NOT Building These)

Features that look good on a spec list but create real problems for a zero-dependency static site.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Persistent cross-session chat history | "Visitors might want to pick up where they left off" | Requires a database or localStorage serialization with no way to sync across devices; PROJECT.md explicitly marks this out of scope; bloats scope for minimal visitor benefit | Session-only history (cleared on reload) is sufficient for a portfolio context |
| User authentication / named sessions | "Personalize the experience per visitor" | Requires auth system, session tokens, user management — incompatible with a pure static site | Anonymous session ID in memory is enough |
| Proactive auto-open on page load | "Increase engagement" | Baymard research shows this is one of the top three disruptive live chat behaviors; it blocks content and annoys visitors who didn't ask for help | Display bubble passively; maybe auto-open once after 30s on first visit only (still risky) |
| Human handoff / escalation flow | "What if the AI can't help?" | Requires a live operator, a ticketing backend, or at minimum a third-party integration — none compatible with a static site | Redirect to contact page ("For complex questions, reach Nathan directly at...") |
| Drag-to-reposition widget | "Power users like flexibility" | Non-trivial JS (drag constraints, touch events, viewport clamping); adds complexity with near-zero portfolio visitor benefit | Fixed bottom-right is the universal convention; don't deviate |
| Voice input / speech recognition | "Modern AI assistants support voice" | Web Speech API is inconsistent across browsers/mobile; adds significant UX surface area; overkill for a portfolio context | Text input only |
| Typing speed simulation (character-by-character streaming) | "Feels more human and alive" | Requires streaming API response handling (SSE or chunked transfer) through the Netlify Function, significantly complicating server and client code | Return full response at once; use a typing indicator while waiting |
| File/image upload | "Visitors might want to share something" | No use case for a portfolio assistant; adds security surface area and complexity | Text-only input |
| Conversation feedback (thumbs up/down) | "Collect quality signals" | No backend to store feedback on a static site; collected data goes nowhere | Skip entirely; improve system prompt based on manual review |
| Dark mode toggle inside widget | "Matches user system preference" | Adds UI surface; Tailwind `dark:` classes require configuration not available on Tailwind CDN without a build step | Match site background (#f7f3f0 light cream); no mode toggle needed |

---

## Feature Dependencies

```
[Floating bubble toggle]
    └──required-by──> [Chat panel with message thread]
                          └──required-by──> [Message bubbles]
                          └──required-by──> [Text input + send button]
                                                └──required-by──> [Send disabled during pending]
                                                └──required-by──> [Loading indicator]
                          └──required-by──> [Auto-scroll]
                          └──required-by──> [Session message history]

[Netlify Function (chat.js)]
    └──required-by──> [Persona-aware system prompt]
    └──required-by──> [Topic-redirect behavior]
    └──required-by──> [Graceful API error message]

[Warm greeting bubble]
    └──enhances──> [Suggested starter questions]

[Send button]
    └──conflicts-with──> [Streaming/character-by-character output]
        (streaming requires async chunk handling incompatible with simple button disable/enable pattern)
```

### Dependency Notes

- The floating bubble toggle is the entry point for everything; all chat UI depends on it existing first.
- The Netlify Function is a prerequisite for any AI response feature; it must exist before the widget can make real API calls.
- Session message history must be initialized when the widget opens (empty array) and appended to on every exchange — this is the simplest form of state and requires no external dependency.
- Starter question chips enhance the greeting bubble — they're a natural pair but can be deferred if scope is tight.

---

## MVP Definition

### Launch With (v1)

The minimum required for the widget to feel complete and non-embarrassing to a visitor.

- [ ] Floating bubble toggle (open/close) — core entry point
- [ ] Chat panel with scrollable message thread — core container
- [ ] Distinct message bubbles (user left/gray, assistant right/blue) — readability
- [ ] Text input + Enter/send button — interaction mechanism
- [ ] Loading indicator while awaiting API response — prevents "is this broken?" abandonment
- [ ] Graceful inline error message on API failure — trust preservation
- [ ] Auto-scroll to latest message — conversation usability
- [ ] Session-scoped in-memory message history — continuity within a page visit
- [ ] Warm greeting on panel open — reduces blank-slate friction
- [ ] Persona-aware system prompt with topic redirect — the actual value of the widget
- [ ] Mobile-responsive layout (full-width panel on small screens, safe area insets) — PROJECT.md requirement
- [ ] Widget appears on all 4 pages — PROJECT.md requirement
- [ ] Send button disabled during pending request — prevents double-sends

### Add After Validation (v1.x)

Features to add once the core widget is working and tested.

- [ ] Suggested starter question chips — add if user testing shows visitors stall at the blank input
- [ ] Smooth CSS open/close animation — add after functional validation; polish pass

### Future Consideration (v2+)

Defer until there is evidence of visitor demand.

- [ ] Keyboard accessibility audit (full tab/focus order) — valuable but not blocking for v1
- [ ] Auto-open after N seconds on first visit — risky UX; validate via analytics before enabling

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Floating bubble toggle | HIGH | LOW | P1 |
| Chat panel + message thread | HIGH | LOW | P1 |
| Message bubbles (visual distinction) | HIGH | LOW | P1 |
| Text input + send button | HIGH | LOW | P1 |
| Loading indicator | HIGH | LOW | P1 |
| Error message (graceful) | HIGH | LOW | P1 |
| Auto-scroll | HIGH | LOW | P1 |
| Session message history | HIGH | LOW | P1 |
| Warm greeting bubble | MEDIUM | LOW | P1 |
| Persona-aware system prompt | HIGH | LOW | P1 |
| Topic-redirect in prompt | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Send button disabled during pending | MEDIUM | LOW | P1 |
| Smooth open/close animation | MEDIUM | LOW | P2 |
| Suggested starter question chips | MEDIUM | LOW | P2 |
| Keyboard accessibility (Enter to send) | MEDIUM | LOW | P2 |
| Persistent cross-session history | LOW | HIGH | P3 — likely never |
| Voice input | LOW | HIGH | P3 — likely never |
| Streaming character-by-character output | LOW | HIGH | P3 — likely never |
| Drag to reposition | LOW | MEDIUM | P3 — likely never |

**Priority key:**
- P1: Must have for launch — widget is broken or embarrassing without it
- P2: Should have — adds polish; add in same milestone if bandwidth allows
- P3: Nice to have or out of scope — defer indefinitely

---

## Competitor Feature Analysis

Relevant comparisons are portfolio AI chat implementations, not SaaS support widgets (different context, different user intent).

| Feature | Generic SaaS Widget (Intercom/Drift) | DIY Portfolio Bot (common GitHub examples) | This Widget |
|---------|--------------------------------------|---------------------------------------------|-------------|
| Floating bubble | Yes | Yes | Yes |
| Message history | Persistent (database-backed) | Often localStorage or Supabase | Session-only (in-memory) — intentional |
| Loading state | Yes | Sometimes | Yes — required |
| Starter chips | Sometimes | Rarely | Yes — deferred to P2 |
| Error handling | Yes | Often absent | Yes — inline message |
| Human handoff | Yes | No | No — contact page redirect instead |
| Persona-specific prompt | No | Yes | Yes — core differentiator |
| Mobile layout | Yes | Often missing | Yes — PROJECT.md requirement |
| Streaming output | Yes | Sometimes | No — full response only, simpler Netlify Function |
| Voice input | Sometimes | No | No |

---

## Sources

- [AI Chatbot UX: 2026 Top Design Best Practices](https://www.letsgroto.com/blog/ux-best-practices-for-ai-chatbots) — MEDIUM confidence (not primary source, but consistent with patterns)
- [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn) — MEDIUM confidence
- [Baymard: Live Chat Usability Issues](https://baymard.com/blog/live-chat-usability-issues) — HIGH confidence (Baymard is authoritative on e-commerce UX; principle applies broadly)
- [Develop a Free Chatbot for Your Portfolio Website](https://dev.to/melvinprince/develop-a-free-chatbot-for-your-portfolio-website-a-step-by-step-guide-with-code-examples-2np6) — MEDIUM confidence (practitioner implementation guide)
- [Top 10 AI Chat Widgets to Boost Website Engagement (2026)](https://www.kommunicate.io/blog/best-chat-widgets/) — LOW confidence (vendor blog)
- [Agent UX in 2025: The New Table Stakes](https://medium.com/@Nexumo_/agent-ux-in-2025-the-new-table-stakes-dd189c7c2718) — LOW confidence (Medium post, no author attribution)

---

*Feature research for: AI chat widget on a static personal portfolio site*
*Researched: 2026-03-28*

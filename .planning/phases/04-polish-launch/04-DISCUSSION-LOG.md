# Phase 4: Polish & Launch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 04-polish-launch
**Areas discussed:** Chat panel animation, Starter chips, Site polish (loading screen, back-to-top, hero animation), Production validation

---

## Chat Panel Animation

| Option | Description | Selected |
|--------|-------------|----------|
| Slide up + fade | opacity + translateY(20px→0), 200ms ease | ✓ |
| Fade only | opacity fade, no directional motion | |
| Scale + fade | scale(0.95→1) + opacity, bottom-right origin | |

**User's choice:** Slide up + fade

---

| Option | Description | Selected |
|--------|-------------|----------|
| Snappy (200ms) | Matches existing bubble hover transition | ✓ |
| Smooth (300ms) | More leisurely, matches message slideIn animation | |

**User's choice:** Snappy (200ms)

---

## Starter Chips

| Option | Description | Selected |
|--------|-------------|----------|
| Book / Basketball / Contact | "Tell me about his book" / "Basketball career" / "How to contact him" | ✓ |
| More personal/specific | "What's the book about?" / "Did he play pro?" / "Where can I buy it?" | |
| You decide | Claude picks the 3 chips | |

**User's choice:** Book / Basketball / Contact (exact text as shown)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Disappear permanently | Chips hide after first click, never reappear | ✓ |
| Disappear until panel reopens | Chips restore each time panel opens | |

**User's choice:** Disappear permanently

---

| Option | Description | Selected |
|--------|-------------|----------|
| Outlined pill buttons | Blue border, blue text, white bg | ✓ |
| Filled blue pills | Solid blue bg, white text | |
| You decide | Claude picks chip styling | |

**User's choice:** Outlined pill buttons

---

## Site Polish (Deferred from Phase 3)

| Option | Selected |
|--------|----------|
| Back-to-top button | ✓ |
| Loading screen animation | ✓ |
| Hero text animation | ✓ |
| None — CHAT-05 + CHAT-14 only | |

**User's choice:** All 3 deferred features included in Phase 4

---

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-dismiss (window.onload) | No artificial delay | ✓ |
| Fixed 1.5s minimum | Always shows 1.5s | |
| Fixed 1s minimum | 1s guaranteed | |

**User's choice:** Auto-dismiss on window.onload

---

| Option | Description | Selected |
|--------|-------------|----------|
| Blue circle with ↑ arrow | Solid blue, white icon, matches chat bubble | ✓ |
| Minimal ghost button | Outlined, more subtle | |

**User's choice:** Blue circle with ↑ arrow

---

| Option | Description | Selected |
|--------|-------------|----------|
| After loading screen fades out | Coordinated reveal | ✓ |
| On page load directly | Immediate, simpler | |

**User's choice:** After loading screen fades out (coordinated with overlay)

---

## Production Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Manual DevTools checklist | Step-by-step against live Netlify URL | ✓ |
| Automated test via CLI | fetch-based function contract test | |
| Both | Automated + manual | |

**User's choice:** Manual DevTools checklist, logged in VERIFICATION.md

---

## Claude's Discretion

- JS technique for display/transition coordination
- CSS class names for chips
- Loading screen overlay exact colors and z-index
- Back-to-top z-index and exact sizing (must not clash with chat bubble)

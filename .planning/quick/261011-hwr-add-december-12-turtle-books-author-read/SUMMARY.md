# Turtle Books Author Reading Summary

Added the December 12, 2026 Turtle Books reading to Community Engagement’s existing Upcoming Events section, using its existing card styling and typography. The semantic article includes every requested detail and all three description paragraphs, a book.html title link, and the official event link with a new tab and noopener noreferrer.

The same article moves to the beginning of Completed Events at or after December 12, 2026, 4:30 PM EST on initial load and during an open session. The scheduling invitation remains present. No homepage duplication, book page changes, images, dependencies, or structured metadata were introduced.

## Files changed

- community-engagement.html
- tests/content-regression.mjs: replaced only the upcoming-section checksum with semantic assertions.
- tests/events-regression.mjs: event content, links, archive preservation, expiry boundary and repeat handling.

## Verification

- `node tests/events-regression.mjs`: passed.
- `node tests/site-regression.mjs`: passed before and after implementation.
- `node tests/content-regression.mjs`: retains the preexisting Completed Events checksum failure observed before edits. Expected `8b253e56c066e793fcd0000aee545d4d8ee1ef5e7be01e17a77ad6c9248653f9`; actual `4a3c6dae767a89f7ea779c1d6c7f16aaaf42a6a8ba0e220015657f4d6863d916`. The new targeted test confirms the actual archive baseline remains byte-identical.
- Lifecycle VM checks passed immediately before expiry, at expiry, after expiry, while open, and with repeated timer/visibility checks. The identical card object and content are retained.
- Safari desktop and responsive previews at 375px and 768px: event readable without visible overflow. Official CTA opened a new tab showing the Turtle Books listing with matching date, time and address; HTTP 200 also confirmed. Console contained no JavaScript errors, only the preexisting Tailwind CDN production warning. Browser plugin and local Playwright unavailable, so native Safari computer-use validation was used.

## Deviations

Per parent instructions, the stale archive checksum was preserved instead of altered. No git commits were attempted because repository metadata is read-only. State and deployment are managed by the parent agent.

## Deployment

Changes remain local; nothing pushed or deployed.

## Self-Check: PASSED

Created test and summary files exist. Targeted tests passed and verified archive content against the pre-change baseline. Commits are intentionally absent.

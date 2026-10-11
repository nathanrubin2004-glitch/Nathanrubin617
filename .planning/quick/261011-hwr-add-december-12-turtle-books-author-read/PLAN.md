---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [community-engagement.html, tests/content-regression.mjs, tests/events-regression.mjs]
autonomous: true
requirements: [TURTLE-EVENT, PRESERVE-CONTENT, EVENT-LIFECYCLE, RESPONSIVE-VALIDATION]
must_haves:
  truths:
    - Visitors see the December 12 reading in Upcoming Events until its end, then in Completed Events.
    - Existing events, scheduling invitation, design, and homepage navigation are preserved.
  artifacts:
    - path: community-engagement.html
      provides: Semantic event card and expiry handling
    - path: tests/events-regression.mjs
      provides: Event content and lifecycle checks
  key_links:
    - from: community-engagement.html
      to: book.html
      via: Chasing a Dream title link
    - from: community-engagement.html
      to: https://turtlebooks.store/event/author-scott-rubin-reading-from-chasing-a-dream/
      via: View Event Details link
---

<objective>Add Nathan’s Turtle Books author reading to the existing Community Engagement events section while preserving the website’s design and existing content. Keep changes local.</objective>

<context>
@community-engagement.html
@tests/content-regression.mjs
@tests/site-regression.mjs
@/Users/nathanrubin/.codex/attachments/0bd94f39-7365-4693-8575-580000987165/Pasted text.txt
</context>

<tasks>
<task type="auto">
<name>Task 1: Add reading card and event lifecycle</name>
<files>community-engagement.html</files>
<action>Add one semantic card inside #events using the existing bg-gray-100 rounded-lg p-6 card styling and established typography. Display Author Reading: Chasing a Dream, Saturday December 12 2026, 4:00 PM–4:30 PM EST, Turtle Books | Brookline, MA, 224 Washington Street, Brookline MA 02445, and Book Reading / Author Appearance. Include all three description paragraphs verbatim from the attachment; link Chasing a Dream to book.html. Add View Event Details linking the exact official URL with target="_blank" and rel="noopener noreferrer". Use time datetime values 2026-12-12T16:00:00-05:00 and 2026-12-12T16:30:00-05:00. Preserve the scheduling invitation and every existing archived event. Add a small dependency-free script that moves the same card into the existing Completed Events container at or after the end instant, both on page load and while the page stays open; retain all card content. One upcoming event is naturally chronological. Homepage already links to this section: do not duplicate it. Do not modify book.html or add registration, images, dependencies, or structured data unless an existing event schema demands it.</action>
<verify><automated>node tests/events-regression.mjs</automated></verify>
<done>Correct event content is reachable from existing navigation; expiry moves the card without deleting its content or prior archive content.</done>
</task>
<task type="auto">
<name>Task 2: Verify content, lifecycle, and responsive rendering</name>
<files>tests/content-regression.mjs, tests/events-regression.mjs</files>
<action>Replace the upcoming-section fixed hash with semantic assertions for the new event and retained invitation. Correct the already-stale Completed Events expected hash to the verified pre-change baseline 4a3c6dae767a89f7ea779c1d6c7f16aaaf42a6a8ba0e220015657f4d6863d916; require the archived HTML to remain identical. Add dependency-free Node assertions for every event field, description paragraphs, internal/official links and target/rel, offset timestamps, no duplicate homepage card, and script behavior immediately before and at expiry, including idempotent repeat handling. Run existing suites. In browser check desktop, tablet, and mobile layouts for overflow, readability, preserved spacing, accessible links, and console errors; check the official destination. Record any external link limitation accurately. Keep edits within targeted scope and do not deploy.</action>
<verify><automated>node tests/content-regression.mjs &amp;&amp; node tests/events-regression.mjs &amp;&amp; node tests/site-regression.mjs</automated><human-check>Automated browser inspection at desktop, tablet, and mobile widths confirms readable card and functioning links.</human-check></verify>
<done>All Node suites pass, lifecycle boundary checks pass, archive baseline remains intact, and responsive/browser findings are recorded.</done>
</task>
</tasks>

<threat_model>
External event link is a trust boundary. Tab access is mitigated by noopener noreferrer; destination content is transferred to Turtle Books. No new input handling or packages are introduced.
</threat_model>

<verification>Run all Node regression suites; inspect responsive layouts and console; review diff for only intended event and test changes.</verification>
<success_criteria>Reading appears in the existing events section, expires into the existing archive without content loss, and existing site appearance and navigation remain intact.</success_criteria>
<output>Create SUMMARY.md in this quick-task directory with files changed, checks, content preservation, and local deployment status.</output>

---
phase: quick
plan: 260623-ith
type: execute
wave: 1
depends_on: []
files_modified:
  - June20photo.jpeg
  - index.html
  - basketball.html
  - contact.html
  - writing.html
  - polish.js
  - book.html
autonomous: true
requirements: [QUICK-260623-ith]
must_haves:
  truths:
    - "First-visit event popup modal no longer appears on index.html"
    - "No blue notification dot appears on 'Chasing a Dream' nav links on any page"
    - "The June 20, 2026 Young Dreamers Workshop appears under Completed Events on book.html (not Upcoming Events)"
    - "The June 2026 completed-event card is the first/top entry in the Completed Events list"
    - "index.html About Me section shows Headshot.jpeg as the profile picture"
  artifacts:
    - path: "June20photo.jpeg"
      provides: "Photo for the completed June 20 event card"
    - path: "Headshot.jpeg"
      provides: "Nathan Rubin profile picture for About Me"
    - path: "book.html"
      provides: "June 20 event moved to top of Completed Events"
      contains: "June 2026"
    - path: "polish.js"
      provides: "Loading screen, hero animation, back-to-top (dot IIFE removed)"
  key_links:
    - from: "book.html #completed-events"
      to: "June20photo.jpeg"
      via: "img src in new completed-event card"
      pattern: "June20photo\\.jpeg"
    - from: "index.html #about"
      to: "Headshot.jpeg"
      via: "img src in profile picture"
      pattern: "Headshot\\.jpeg"
---

<objective>
Mark the June 20, 2026 "Young Dreamers Workshop" as a completed event across the Nathan Rubin portfolio site, and clean up the temporary promotion UI (first-visit popup modal and nav notification dot) that advertised it as upcoming. Also wire in the new Headshot.jpeg profile picture.

Purpose: The event has happened. Visitors should see it in the event recap history, not be prompted to register for it.
Output: Copied photo asset, removed modal + dots + dead JS, restructured book.html events, updated About Me image.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md

Constraints: Pure HTML + Tailwind CDN + vanilla JS. No build tools. Preserve all other content exactly. Reuse existing Tailwind classes for responsiveness — do not invent new styles.

Key facts verified in codebase:
- `data-event-dot` span appears exactly 2x each in: index.html, basketball.html, contact.html, writing.html. book.html has NO dot (confirmed via grep).
- Source images exist at `June20Event/June20photo.jpeg` and `Headshot.jpeg` (already at root). `June20thevent.JPG` exists only inside `June20Event/` and at the path `June20thevent.JPG` referenced in HTML is the tracked-but-deleted file — it is being removed from book.html anyway.
- index.html modal HTML = lines 53–81; modal control `<script>` IIFE = lines 219–252.
- polish.js dot IIFE = lines 46–77 (comment "// Chasing a Dream nav notification dot").
- book.html: upcoming June 20 card = lines 85–131; Completed Events list opens at line 144 `<div class="flex flex-col space-y-8">`; first existing completed card is Level Ground (May 2026) at lines 146–160.
- index.html About Me profile img = line 161: `<img src="https://i.imgur.com/ye3HNgv.png" alt="Profile picture" class="rounded-full w-48 h-48 mx-auto shadow-md object-cover">`.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Copy event photo and remove promotional UI (modal + nav dots + dead JS)</name>
  <files>June20photo.jpeg, index.html, basketball.html, contact.html, writing.html, polish.js</files>
  <action>
    1. Copy `June20Event/June20photo.jpeg` to repo root as `June20photo.jpeg` (use `cp` — Headshot.jpeg is already at root, no copy needed).
    2. In index.html, delete the entire "Upcoming Event Modal" block: the `<!-- Upcoming Event Modal -->` comment and the `<div id="event-modal" ...>` element through its matching closing `</div>` (lines 53–81). Leave the `<div id="loading-overlay">` block (line 82) intact.
    3. In index.html, delete the modal-control `<script>` IIFE (lines 219–252) — the block that begins `(function () { var modal = document.getElementById('event-modal'); ... youngDreamersModalSeen ... })();`. Leave the surrounding `<button id="back-to-top">` line and the `<script src="chat.js">` / `<script src="polish.js">` lines intact.
    4. Remove the notification dot `<span data-event-dot ...></span>` from BOTH occurrences (desktop + mobile nav) of the "Chasing a Dream" link in each of: index.html, basketball.html, contact.html, writing.html. The link text "Chasing a Dream" and its `<a ... data-nav-chasing ...>` wrapper MUST remain — only delete the inner `<span data-event-dot ...></span>`. (book.html has no dot — skip it.)
    5. In polish.js, delete the entire "Chasing a Dream nav notification dot" IIFE (lines 46–77, comment + `(function() { var STORAGE_KEY = 'chasingDreamEventSeen_v1'; ... })();`). Keep the loading-screen handler, `triggerHeroAnimation`, and the back-to-top IIFE intact.
  </action>
  <verify>
    <automated>cd "/Users/nathanrubin/Downloads/nathan website/Upload" && test -f June20photo.jpeg && test "$(grep -c 'data-event-dot' index.html basketball.html contact.html writing.html | awk -F: '{s+=$2} END{print s}')" = "0" && test "$(grep -c 'event-modal' index.html)" = "0" && test "$(grep -c 'youngDreamersModalSeen' index.html)" = "0" && test "$(grep -c 'chasingDreamEventSeen' polish.js)" = "0" && grep -q 'data-nav-chasing' index.html && grep -q 'back-to-top' polish.js && grep -q 'triggerHeroAnimation' polish.js && echo PASS</automated>
  </verify>
  <done>June20photo.jpeg exists at root. Zero `data-event-dot` across the 4 nav files. No `event-modal` or `youngDreamersModalSeen` in index.html. No `chasingDreamEventSeen` in polish.js. The `data-nav-chasing` links, back-to-top IIFE, and hero animation remain.</done>
</task>

<task type="auto">
  <name>Task 2: Move June 20 event to Completed Events and update About Me photo</name>
  <files>book.html, index.html</files>
  <action>
    1. In book.html, delete the upcoming June 20 "Young Dreamers Workshop" card from the `#events` (Upcoming Events) section — the `<!-- Young Dreamers Workshop (June 20, 2026) -->` comment and its `<div class="bg-gray-100 ... mb-6">` block through its matching closing `</div>` (lines 85–131, the card whose image is `June20thevent.JPG`). Keep the "Summer 2026 / Workshop, Reading & Signing" card (lines 133–138) intact.
    2. In book.html, add a NEW completed-event card as the FIRST entry inside the Completed Events list (`<div class="flex flex-col space-y-8">` at line 144), immediately BEFORE the `<!-- Level Ground Dorchester (May 2026) -->` card. Use the exact same two-column card markup pattern as the Level Ground card: outer `<div class="bg-gray-100 rounded-lg p-6 shadow-md flex flex-col md:flex-row justify-between items-center md:space-x-8">`, a left column `<div class="md:w-1/2 mb-6 md:mb-0">` containing a thumbnail `<img src="June20photo.jpeg" alt="Young Dreamers Workshop" class="w-64 h-auto rounded-md mb-3">`, a date `<p class="text-sm font-bold text-gray-600 mb-2">June 2026</p>`, a title `<h3 class="text-xl font-bold text-gray-800 mb-2">Chasing Dreams: Young Dreamers Workshop</h3>`, a past-tense recap `<p class="text-gray-700 leading-relaxed mb-4">` describing the free storytelling, creativity, and inspiration workshop held for kids and teens (ages 4–16) — two tracks, Younger Dreamers (4–11) and Future Dreamers (12–16) — with story sessions, hands-on activities, and conversations about goals, confidence, and big dreams; and a location `<p class="text-sm text-gray-600">Revamp Training, Dorchester, Boston, MA</p>`. Right column `<div class="md:w-1/2 flex justify-center">` containing the large photo `<img src="June20photo.jpeg" alt="Young Dreamers Workshop event" class="rounded-lg shadow-lg w-10/12">`. Write the recap in past tense consistent with the other completed-event recaps (e.g., "Hosted...", "Welcomed...").
    3. In index.html, replace the About Me profile picture (line 161) `<img src="https://i.imgur.com/ye3HNgv.png" alt="Profile picture" class="rounded-full w-48 h-48 mx-auto shadow-md object-cover">` with `<img src="Headshot.jpeg" alt="Nathan Rubin" class="rounded-full w-48 h-48 mx-auto shadow-md object-cover">` — keep the same Tailwind classes, only change `src` and `alt`.
  </action>
  <verify>
    <automated>cd "/Users/nathanrubin/Downloads/nathan website/Upload" && test "$(grep -c 'June20thevent' book.html)" = "0" && grep -q 'June 2026' book.html && grep -q 'June20photo.jpeg' book.html && grep -q 'Revamp Training, Dorchester, Boston, MA' book.html && grep -q 'Summer 2026' book.html && grep -q 'Headshot.jpeg' index.html && test "$(grep -c 'ye3HNgv' index.html)" = "0" && echo PASS</automated>
  </verify>
  <done>book.html: no `June20thevent` reference, June 20 card removed from Upcoming Events, new "June 2026 / Chasing Dreams: Young Dreamers Workshop" card present in Completed Events using June20photo.jpeg, Summer 2026 upcoming card retained. index.html About Me uses Headshot.jpeg with alt "Nathan Rubin" and the old imgur src is gone.</done>
</task>

</tasks>

<verification>
- Open index.html in a browser: no popup modal appears on load; About Me shows the headshot photo; nav "Chasing a Dream" link has no blue dot.
- Open basketball.html, contact.html, writing.html: nav "Chasing a Dream" link has no blue dot (desktop and mobile menu).
- Open book.html: Upcoming Events shows only the "Summer 2026" card; Completed Events shows "June 2026 — Chasing Dreams: Young Dreamers Workshop" as the top entry with the June20photo.jpeg image, then Level Ground (May 2026) below it.
- All four nav HTML files still navigate via the "Chasing a Dream" links (links intact, only dot removed).
- polish.js: loading screen, hero animation, and back-to-top still function; no console errors from removed dot code.
</verification>

<success_criteria>
- June20photo.jpeg copied to repo root.
- Event modal HTML + control script removed from index.html.
- All `data-event-dot` spans removed across the 4 nav files; links preserved.
- Dead notification-dot IIFE removed from polish.js; other polish.js features intact.
- June 20 event moved from Upcoming to top of Completed Events in book.html with a past-tense recap.
- index.html About Me uses Headshot.jpeg.
- No other content altered.
</success_criteria>

<output>
Create `.planning/quick/260623-ith-mark-june-20-young-dreamers-workshop-eve/260623-ith-SUMMARY.md` when done
</output>

---
phase: quick-260416-tgt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [book.html]
autonomous: false
requirements: [IMG-01]

must_haves:
  truths:
    - "An additional image is rendered at the bottom of the 'Chasing a Dream' section on book.html"
    - "The new image is the image hosted at https://ibb.co/F4YHXV9h (its direct i.ibb.co URL)"
    - "The image does not break the existing layout of the #book section on desktop or mobile"
    - "The image has an alt attribute for accessibility"
  artifacts:
    - path: "book.html"
      provides: "'Chasing a Dream' section (#book) with new image at the bottom"
      contains: "i.ibb.co"
  key_links:
    - from: "book.html #book section"
      to: "imgbb CDN (i.ibb.co/...)"
      via: "<img src> tag inserted inside #book section, before </section>"
      pattern: "i\\.ibb\\.co"
---

<objective>
Add the image hosted at https://ibb.co/F4YHXV9h to the very bottom of the "Chasing a Dream" section on book.html.

Purpose: Enhance the book section with an additional visual provided by the user.
Output: Updated `book.html` with a new `<img>` (wrapped in a link to the imgbb share page) inserted inside `<section id="book">` just before its closing tag.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@book.html

<interfaces>
<!-- Existing structure of the target section. Executor should follow these patterns. -->

Target section in book.html (approx lines 55-77):
```html
<!-- My Book Section -->
<section id="book" class="bg-white rounded-xl shadow-lg p-8 mb-12">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">Chasing a Dream</h2>
    <div class="flex flex-col md:flex-row items-center md:space-x-8">
        <div class="md:w-1/3 mb-6 md:mb-0">
            <img src="https://i.imgur.com/MEED7S6.jpeg" alt="Book cover" class="rounded-lg shadow-lg">
        </div>
        <div class="md:w-2/3">
            <!-- copy + Purchase a Copy button -->
            ...
            <a href="#purchase" class="inline-block bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105">
                Purchase a Copy
            </a>
        </div>
    </div>
</section>
```

Existing image-style pattern used elsewhere in book.html for standalone images inside a section:
- `class="rounded-lg shadow-lg"` for rounded, shadowed images
- Width utilities like `w-full max-w-md mx-auto` or `w-10/12` for centered, constrained images
- Images are typically followed by `mb-*` for spacing
</interfaces>

<imgbb_notes>
- Share page URL: https://ibb.co/F4YHXV9h
- Direct image URLs on imgbb follow the pattern https://i.ibb.co/{id}/{filename}.{ext}
- The `{id}` in the path is NOT always identical to the share slug. The safest approach is to fetch the share page HTML and extract the canonical direct URL from the `<meta property="og:image" content="...">` tag, or from the page's main `<img>` element.
- Do NOT hardcode a guessed direct URL — verify it by fetching https://ibb.co/F4YHXV9h first.
</imgbb_notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Resolve the direct image URL for https://ibb.co/F4YHXV9h</name>
  <files>(no file modifications — discovery only)</files>
  <action>
  Fetch the imgbb share page and extract the direct image URL (the i.ibb.co URL) that will be used as the `src` of the new `<img>` tag.

  Steps:
  1. Use the WebFetch tool on `https://ibb.co/F4YHXV9h` with a prompt like: "Return the direct image URL. Look for the `og:image` meta tag (`<meta property=\"og:image\" content=\"...\">`) or the main image `<img src=\"https://i.ibb.co/...\">`. Return just the raw URL."
  2. If WebFetch returns a summarized answer without a raw URL, fall back to `curl -sL "https://ibb.co/F4YHXV9h" | grep -Eo 'https://i\.ibb\.co/[^"\x27 >]+' | head -n 5` to recover the direct URL from the HTML. Pick the highest-resolution i.ibb.co URL that points to the image itself (typically the one in og:image, not a thumbnail).
  3. Record:
     - The direct image URL (e.g., `https://i.ibb.co/XXXX/filename.jpg`)
     - A short descriptive alt text. If the page provides a title/caption, use it; otherwise use "Chasing a Dream — additional image".

  Do NOT modify any files in this task. This is purely to obtain the URL needed for Task 2.
  </action>
  <verify>
  <automated>test -n "$DIRECT_IMAGE_URL" (executor confirms a non-empty URL of the form https://i.ibb.co/...)</automated>
  </verify>
  <done>Executor has captured a working direct image URL (https://i.ibb.co/...) and an alt text value, ready to embed in book.html.</done>
</task>

<task type="auto">
  <name>Task 2: Insert the image at the bottom of the 'Chasing a Dream' section in book.html</name>
  <files>book.html</files>
  <action>
  Edit `book.html`. Inside `<section id="book" ...>` (starts around line 55), add the new image as the LAST child element — immediately before the section's closing `</section>` tag (around line 77), AFTER the existing inner `<div class="flex flex-col md:flex-row ...">...</div>` block that contains the book cover, copy, and "Purchase a Copy" button.

  Insert exactly this markup (substituting the direct URL resolved in Task 1 for `DIRECT_URL` and the chosen alt text for `ALT_TEXT`):

  ```html
      <div class="mt-8 flex justify-center">
          <a href="https://ibb.co/F4YHXV9h" target="_blank" rel="noopener noreferrer">
              <img src="DIRECT_URL" alt="ALT_TEXT" class="rounded-lg shadow-lg w-full max-w-md">
          </a>
      </div>
  ```

  Notes / constraints:
  - The `<a>` wrapper uses the imgbb share page URL (`https://ibb.co/F4YHXV9h`) so users can click through; `target="_blank" rel="noopener noreferrer"` matches the external-link pattern used elsewhere in the file (e.g., Little Free Library map link).
  - The `<img>` uses the DIRECT i.ibb.co URL resolved in Task 1.
  - Keep classes consistent with existing image styling in this file: `rounded-lg shadow-lg` for visual continuity, `w-full max-w-md` to keep it appropriately sized on desktop without overflowing on mobile.
  - `mt-8` gives breathing room after the "Purchase a Copy" button. `flex justify-center` centers the image within the section.
  - Do NOT alter any other content in the file. Preserve all existing whitespace/indentation style (4-space indentation inside `<section>`).
  - Do NOT add this image to any other page (index.html, basketball.html, contact.html) — only book.html has the "Chasing a Dream" section content.
  </action>
  <verify>
  <automated>grep -n "i.ibb.co" book.html && grep -n "ibb.co/F4YHXV9h" book.html && grep -c "id=\"book\"" book.html</automated>
  Manual grep sanity check that:
    - The `i.ibb.co/...` URL appears in book.html
    - The share URL `ibb.co/F4YHXV9h` appears as the `href`
    - The `#book` section still has exactly one opening tag (no duplication)
  </verify>
  <done>
  - `book.html` contains a new `<a href="https://ibb.co/F4YHXV9h" ...><img src="https://i.ibb.co/..." ...></a>` block inside `<section id="book">`, placed immediately before `</section>`.
  - No other sections or pages were modified.
  - File still parses as valid HTML (opening `<section id="book">` matches exactly one closing `</section>` in the same position structurally).
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human visual verification on book.html</name>
  <what-built>
  - Task 1 resolved the direct i.ibb.co URL for the share page https://ibb.co/F4YHXV9h.
  - Task 2 inserted a new centered, rounded, shadowed image at the bottom of the "Chasing a Dream" section (`#book`) in `book.html`, wrapped in an `<a>` that links to the imgbb share page.
  </what-built>
  <how-to-verify>
  1. Open `book.html` in a browser (either via `npx netlify-cli dev` from the repo root, or simply opening the file directly).
  2. Scroll to the first section titled "Chasing a Dream" (right after the header). Confirm:
     - The original book cover image and "Purchase a Copy" button still render normally.
     - Below them (still inside the same white card) a new image is now visible, centered, with rounded corners and a shadow.
     - The image loads successfully (no broken-image icon).
     - Clicking the new image opens https://ibb.co/F4YHXV9h in a new tab.
  3. Resize the window to mobile width (<768px):
     - New image scales down responsively, stays within the card's padding, does not overflow horizontally.
  4. Check the other pages (`index.html`, `basketball.html`, `contact.html`):
     - They are UNCHANGED (no new image inserted anywhere on them).
  5. If the image looks wrong (cropped, too big, blurry, wrong image), respond with which direction to adjust (e.g., "smaller", "use a different max-width", "wrong image — here's the right URL").
  </how-to-verify>
  <resume-signal>Type "approved" if the image renders correctly, or describe any issues to fix.</resume-signal>
</task>

</tasks>

<verification>
- `grep -n "i.ibb.co" book.html` returns at least one match inside the `#book` section.
- `grep -n "ibb.co/F4YHXV9h" book.html` returns exactly one match (the `<a href>`).
- `grep -n "id=\"book\"" book.html` returns exactly one match (no accidental duplication).
- `grep -n "i.ibb.co" index.html basketball.html contact.html` returns no matches (image only on book.html).
- Opening book.html in a browser: new image renders at the bottom of the "Chasing a Dream" section, clickable, responsive.
</verification>

<success_criteria>
- book.html contains a working `<a href="https://ibb.co/F4YHXV9h"><img src="https://i.ibb.co/..."></a>` block at the bottom of `<section id="book">`.
- Image renders in a browser with no broken-image icon.
- Layout is unbroken on desktop and mobile.
- No other page/file modified.
- Human verifier approves the visual result.
</success_criteria>

<output>
After completion, create `.planning/quick/260416-tgt-add-image-from-https-ibb-co-f4yhxv9h-to-/260416-tgt-SUMMARY.md` summarizing:
- The direct image URL that was resolved from https://ibb.co/F4YHXV9h
- The exact snippet inserted into book.html and at which line
- The outcome of the human verification checkpoint
</output>

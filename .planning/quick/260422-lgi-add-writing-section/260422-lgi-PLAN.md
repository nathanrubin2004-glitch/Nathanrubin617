---
phase: quick-260422-lgi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - writing.html
  - assets/pdfs/.gitkeep
  - index.html
  - book.html
  - basketball.html
  - contact.html
autonomous: true
requirements: [WRITING-01]

must_haves:
  truths:
    - "Visitor can navigate to Writing page from any page via desktop and mobile nav"
    - "Writing page shows 5 cards: 4 with PDF links and 1 Coming Soon"
    - "PDF links open in a new tab"
    - "Coming Soon card is visually distinct (opacity-60, gray badge, no button)"
    - "assets/pdfs/ directory exists so Nathan can drop in PDF files without friction"
  artifacts:
    - path: "writing.html"
      provides: "Dedicated Writing page with 5 project cards"
    - path: "assets/pdfs/.gitkeep"
      provides: "Git-tracked placeholder for PDF uploads"
  key_links:
    - from: "index.html nav"
      to: "writing.html"
      via: "href anchor between Basketball and Contact"
    - from: "writing.html cards"
      to: "assets/pdfs/*.pdf"
      via: "target=_blank anchor tags"
---

<objective>
Add a Writing page (writing.html) showcasing Nathan's academic research, poetry, and creative work, and add the Writing nav link to all four existing pages.

Purpose: Gives visitors a dedicated place to read Nathan's intellectual work — papers, poetry, and creative projects — extending the site beyond book and basketball.
Output: writing.html with 5 project cards + assets/pdfs/ directory + Writing link in all 4 existing navs.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key patterns confirmed from codebase inspection:
  - Nav desktop: hidden lg:flex items-center space-x-6 text-sm font-semibold uppercase tracking-wider
  - Active link class: text-blue-600 font-semibold transition-colors
  - Inactive link class: text-gray-600 hover:text-blue-600 transition-colors
  - Mobile menu: block px-8 py-2 font-bold text-gray-800 hover:text-blue-600
  - Mobile active: block px-8 py-2 font-bold text-blue-600
  - Page boilerplate: loading-overlay > nav-glass header > main.max-w-7xl > footer.bg-gray-800 > chat widget > mobile-menu script > back-to-top button > chat.js > polish.js
  - Section: bg-white rounded-xl shadow-lg p-8 mb-12
  - Section heading: text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2
-->
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create writing.html</name>
  <files>writing.html, assets/pdfs/.gitkeep</files>
  <action>
Create `/Users/nathanrubin/Downloads/nathan website/Upload/writing.html` as a full page following the exact boilerplate of basketball.html. Writing is the active nav link.

Also create `/Users/nathanrubin/Downloads/nathan website/Upload/assets/pdfs/.gitkeep` as an empty file.

**Full page structure to implement:**

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Writing - Nathan Rubin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-blue-50">
    <div id="loading-overlay">
        <img src="https://i.imgur.com/sAcG2HQ.png" alt="NR" class="loading-logo">
    </div>

    <header class="nav-glass sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <nav class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-extrabold tracking-tight text-gray-900 group">
                NATHAN <span class="text-blue-600 group-hover:text-blue-700 transition-colors">RUBIN</span>
            </a>
            <div class="hidden lg:flex items-center space-x-6 text-sm font-semibold uppercase tracking-wider">
                <a href="index.html" class="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
                <a href="book.html" class="text-gray-600 hover:text-blue-600 transition-colors">Chasing a Dream</a>
                <a href="basketball.html" class="text-gray-600 hover:text-blue-600 transition-colors">Basketball</a>
                <a href="writing.html" class="text-blue-600 font-semibold transition-colors">Writing</a>
                <a href="contact.html" class="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
                <a href="book.html#purchase" class="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md">Get the Book</a>
            </div>
            <button id="mobile-menu-btn" aria-label="Open navigation menu" class="lg:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </nav>
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-gray-100 py-6 space-y-4 shadow-xl">
            <a href="index.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Home</a>
            <a href="book.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Chasing a Dream</a>
            <a href="basketball.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Basketball</a>
            <a href="writing.html" class="block px-8 py-2 font-bold text-blue-600">Writing</a>
            <a href="contact.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Contact</a>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 mt-8">
        <section id="writing" class="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">Writing</h2>
            <p class="text-gray-700 leading-relaxed mb-8">
                My writing spans academic research, poetry, and creative storytelling — rooted in Black culture, African history, and the lived textures of identity and belonging. Each piece is an attempt to think carefully, feel honestly, and contribute something meaningful to the conversations that matter most.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- Card 1: Jacob Zuma State Capture Research -->
                <!-- PDF: add file to assets/pdfs/zuma-state-capture.pdf -->
                <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                    <div class="mb-3 flex flex-wrap gap-2">
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Academic Research</span>
                    </div>
                    <p class="text-xs text-gray-500 font-medium mb-3">Sarah Lawrence College</p>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">Jacob Zuma State Capture Research</h3>
                    <p class="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                        An in-depth examination of how the Gupta family and allied private interests systematically dismantled governance in South Africa — looting public institutions like Eskom and Transnet and compromising state accountability. Explores elite patronage networks and the ongoing fight for democratic integrity in Africa.
                    </p>
                    <div class="mt-auto">
                        <a href="assets/pdfs/zuma-state-capture.pdf" target="_blank" rel="noopener noreferrer"
                           class="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            Read
                        </a>
                    </div>
                </div>

                <!-- Card 2: Fractals in African Culture -->
                <!-- PDF: add file to assets/pdfs/math-conference-paper.pdf -->
                <!-- PDF: add file to assets/pdfs/fractals-poster.pdf -->
                <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                    <div class="mb-3 flex flex-wrap gap-2">
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Academic Research</span>
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Ethnomathematics</span>
                    </div>
                    <p class="text-xs text-gray-500 font-medium mb-3">Sarah Lawrence College</p>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">Fractals in African Culture</h3>
                    <p class="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                        A research project exploring how fractal patterns — complex, self-similar recursive structures — are embedded in African music, architecture, art, and social organization. Argues that advanced mathematical thinking is not a European invention but is deeply rooted in African cultural heritage and ingenuity.
                    </p>
                    <div class="mt-auto flex flex-wrap gap-3">
                        <a href="assets/pdfs/math-conference-paper.pdf" target="_blank" rel="noopener noreferrer"
                           class="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            Read Paper
                        </a>
                        <a href="assets/pdfs/fractals-poster.pdf" target="_blank" rel="noopener noreferrer"
                           class="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            View Poster
                        </a>
                    </div>
                </div>

                <!-- Card 3: A Multi-Faceted Force -->
                <!-- PDF: add file to assets/pdfs/psychological-finance.pdf -->
                <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                    <div class="mb-3 flex flex-wrap gap-2">
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Independent Research</span>
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Behavioral Finance</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">A Multi-Faceted Force: The Systematic Influence of Emotion on Investor Behavior</h3>
                    <p class="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                        An independent research paper examining how emotional and psychological states shape investor decision-making through neuroeconomic and behavioral pathways. Draws on frameworks from Duxbury et al. (2020) and Kuhnen &amp; Knutson (2011) to build a more psychologically honest model of financial behavior.
                    </p>
                    <div class="mt-auto">
                        <a href="assets/pdfs/psychological-finance.pdf" target="_blank" rel="noopener noreferrer"
                           class="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            Read
                        </a>
                    </div>
                </div>

                <!-- Card 4: December 2025 Poetry Portfolio -->
                <!-- PDF: add file to assets/pdfs/poetry-portfolio.pdf -->
                <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                    <div class="mb-3 flex flex-wrap gap-2">
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Poetry</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">December 2025 Poetry Portfolio</h3>
                    <p class="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                        A collection of poems moving through identity, doubt, growth, and belonging — shaped by lived experience rather than certainty. Written to examine what we inherit, what we question, and what we carry forward. Intentional, quiet, and meant to be sat with.
                    </p>
                    <div class="mt-auto">
                        <a href="assets/pdfs/poetry-portfolio.pdf" target="_blank" rel="noopener noreferrer"
                           class="inline-block bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            Read
                        </a>
                    </div>
                </div>

                <!-- Card 5: Children's Book (Coming Soon) -->
                <div class="bg-white rounded-xl shadow-md p-6 flex flex-col opacity-60">
                    <div class="mb-3 flex flex-wrap gap-2">
                        <span class="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Creative Writing</span>
                        <span class="inline-block bg-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full">Coming Soon</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">Children's Book</h3>
                    <p class="text-gray-700 text-sm leading-relaxed flex-grow">
                        A children's book currently in development. More details coming soon.
                    </p>
                </div>

            </div>
        </section>
    </main>

    <footer class="bg-gray-800 text-white py-8 text-center">
        <p>© 2025 Nathan Rubin. All rights reserved.</p>
    </footer>

    <!-- Chat Widget -->
    <button class="chat-bubble" id="chat-bubble">💬</button>
    <div class="chat-window" id="chat-window">
        <div class="chat-header">
            <h3>Chat with Nathan's Assistant</h3>
            <button class="chat-close" id="chat-close">✕</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-chips" id="chat-chips">
            <button class="chat-chip" data-question="Tell me about Nathan's book">Tell me about Nathan's book</button>
            <button class="chat-chip" data-question="What's Nathan's basketball career?">What's Nathan's basketball career?</button>
            <button class="chat-chip" data-question="How can I contact Nathan?">How can I contact Nathan?</button>
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="chat-input" placeholder="Type a message...">
            <button class="chat-send" id="chat-send">→</button>
        </div>
    </div>

    <script>
        // Mobile menu toggle
        document.addEventListener('DOMContentLoaded', () => {
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');

            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    mobileMenu.classList.add('hidden');
                });
            });
        });
    </script>
    <button id="back-to-top" aria-label="Back to top">&#8593;</button>
    <script src="chat.js"></script>
    <script src="polish.js"></script>
</body>
</html>
```

The executor should copy this HTML exactly, preserving all class names, comments, and structure. Do not omit the `<!-- PDF: add file to ... -->` HTML comments — they guide Nathan when uploading PDFs.
  </action>
  <verify>
    <automated>ls /Users/nathanrubin/Downloads/nathan\ website/Upload/writing.html && ls /Users/nathanrubin/Downloads/nathan\ website/Upload/assets/pdfs/.gitkeep && grep -c 'assets/pdfs/' /Users/nathanrubin/Downloads/nathan\ website/Upload/writing.html</automated>
  </verify>
  <done>writing.html exists with 5 cards and 4 PDF href references; assets/pdfs/.gitkeep exists; Coming Soon card has no PDF anchor; all PDF anchors have target="_blank"</done>
</task>

<task type="auto">
  <name>Task 2: Add Writing nav link to all 4 existing pages</name>
  <files>index.html, book.html, basketball.html, contact.html</files>
  <action>
In each of the four pages, insert the Writing nav link in BOTH the desktop nav and the mobile menu. The link goes between Basketball and Contact in both locations.

**Desktop nav insertion** — after the Basketball link and before the Contact link:
```html
<a href="writing.html" class="text-gray-600 hover:text-blue-600 transition-colors">Writing</a>
```

**Mobile menu insertion** — after the Basketball link and before the Contact link:
```html
<a href="writing.html" class="block px-8 py-2 font-bold text-gray-800 hover:text-blue-600">Writing</a>
```

Do this in all four files:
- index.html
- book.html
- basketball.html
- contact.html

None of these pages should have Writing as the active link — they all use the inactive class above.
  </action>
  <verify>
    <automated>grep -l 'href="writing.html"' /Users/nathanrubin/Downloads/nathan\ website/Upload/index.html /Users/nathanrubin/Downloads/nathan\ website/Upload/book.html /Users/nathanrubin/Downloads/nathan\ website/Upload/basketball.html /Users/nathanrubin/Downloads/nathan\ website/Upload/contact.html | wc -l</automated>
  </verify>
  <done>All 4 files contain href="writing.html" in both desktop nav and mobile menu (8 total occurrences across the 4 files — 2 per file)</done>
</task>

</tasks>

<verification>
After both tasks complete, verify the full picture:

1. `writing.html` renders correctly in a browser — 5 cards visible, Coming Soon card faded
2. All 4 PDF anchor links have `target="_blank" rel="noopener noreferrer"`
3. Desktop nav on all pages shows: Home | Chasing a Dream | Basketball | Writing | Contact | [Get the Book]
4. Mobile menu on all pages shows the same order
5. `assets/pdfs/` directory is tracked (`.gitkeep` exists)
6. No existing page content was removed or altered
</verification>

<success_criteria>
- writing.html exists with correct boilerplate, 5 cards, inline PDF comments
- assets/pdfs/.gitkeep exists
- All 4 existing pages have Writing nav link in both desktop and mobile nav
- Writing link sits between Basketball and Contact in every nav
- Coming Soon card has no PDF button and uses opacity-60
- All PDF links open in a new tab
</success_criteria>

<output>
After completion, create `.planning/quick/260422-lgi-add-writing-section/260422-lgi-SUMMARY.md` with:
- What was built (writing.html, nav updates, assets/pdfs/)
- Files modified
- Any notes for Nathan about uploading PDFs to assets/pdfs/
</output>

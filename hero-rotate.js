/* Hero collage photo rotation — index.html only.
 *
 * Each hero collage cell slowly cycles through a small pool of photos with a
 * smooth crossfade. One cell changes at a time (round-robin), so the hero
 * never flashes or shifts layout. The existing hover zoom, overlay, and
 * entrance animations are untouched.
 *
 * Behavior notes:
 * - Disabled entirely when the user prefers reduced motion.
 * - Pauses while the tab is hidden, resumes when visible again.
 * - Pool images are preloaded up front to avoid flashes.
 * - A pool image that fails to load is skipped silently.
 */
(function () {
    'use strict';

    // Photo pools, one per collage cell in DOM order. The first entry in each
    // pool must match the <img> src already in index.html for that cell.
    var POOLS = [
        ['Basketball1.JPG', 'Basketball2.JPG', 'Headshot.jpeg'],
        ['assets/images/chasing-a-dream-cover.jpeg', 'assets/images/elephants-garden-cover.webp', 'June20photo.jpeg'],
        ['June20photo.jpeg', 'June20thevent.JPG', 'Mildred1.jpg'],
        ['Mildred1.jpg', 'Mildred3.jpeg', 'Mildred4.jpeg'],
        ['https://i.imgur.com/4QRYvm7.jpeg', 'Basketball1.JPG', 'Basketball2.JPG'],
        ['LevelGroundEvent.jpeg', 'Levelground.webp', 'June20thevent.JPG'],
        ['Mildred2.jpeg', 'Mildred3.jpeg', 'Mildred4.jpeg'],
        ['Basketball2.JPG', 'Headshot.jpeg', 'Basketball1.JPG']
    ];

    var ROTATE_EVERY_MS = 5000;  // one cell changes every 5 seconds
    var FADE_MS = 1400;          // crossfade duration (matches CSS)

    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // leave the static collage exactly as authored
        }
        var hero = document.getElementById('hero');
        if (!hero) return;
        var items = hero.querySelectorAll('.hero-collage-item');
        if (!items.length) return;

        var cells = [];
        for (var i = 0; i < items.length; i++) {
            var base = items[i].querySelector('img.hero-collage-img');
            if (!base) continue;

            // Invisible top layer used only for the crossfade.
            var fade = document.createElement('img');
            fade.className = 'hero-collage-img hero-collage-fade';
            fade.alt = '';
            fade.setAttribute('aria-hidden', 'true');
            items[i].appendChild(fade);

            var pool = POOLS[i % POOLS.length];
            // Preload every pool image so swaps never flash.
            pool.forEach(function (src) {
                var pre = new Image();
                pre.src = src;
            });

            cells.push({ base: base, fade: fade, pool: pool, idx: 0 });
        }
        if (!cells.length) return;

        var cursor = 0;
        var timer = null;

        function showNext(cell, attempts) {
            attempts = attempts || 0;
            if (attempts >= cell.pool.length) return; // all failed; give up quietly
            cell.idx = (cell.idx + 1) % cell.pool.length;
            var next = cell.pool[cell.idx];

            var probe = new Image();
            probe.onload = function () {
                cell.fade.src = next;
                // Force a reflow so the opacity transition restarts cleanly.
                void cell.fade.offsetWidth;
                cell.fade.style.opacity = '1';
                setTimeout(function () {
                    // Swap the base image underneath, then fade the top layer out.
                    cell.base.src = next;
                    cell.fade.style.opacity = '0';
                }, FADE_MS + 120);
            };
            probe.onerror = function () {
                showNext(cell, attempts + 1); // skip broken images
            };
            probe.src = next;
        }

        function advance() {
            showNext(cells[cursor % cells.length]);
            cursor++;
        }

        function start() {
            if (!timer) timer = setInterval(advance, ROTATE_EVERY_MS);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });

        start();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

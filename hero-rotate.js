/* Hero collage photo rotation — index.html only.
 *
 * Each hero collage cell slowly cycles through its own pool of photos with a
 * smooth crossfade. Pools are disjoint: no two cells ever show the same photo
 * at the same time. One cell changes at a time (round-robin), so the hero
 * never flashes or shifts layout. The existing hover zoom, overlay, and
 * entrance animations are untouched.
 *
 * Every visit gets a fresh lineup: on each page load every cell starts on a
 * random photo from its own pool, so the collage never opens with the same
 * arrangement twice. The starting photo is only applied after it loads
 * successfully; if it fails, the cell keeps its authored default image, so a
 * missing file can never leave a broken-image icon in the grid.
 *
 * Every photo carries its own focal point (object-position) so faces, titles,
 * and subjects stay framed as the crop changes. The focal point is applied to
 * both the base layer and the crossfade layer on every swap.
 *
 * Behavior notes:
 * - Disabled entirely when the user prefers reduced motion.
 * - Pauses while the tab is hidden, resumes when visible again.
 * - Pool images are preloaded up front to avoid flashes.
 * - A pool image that fails to load is skipped silently.
 */
(function () {
    'use strict';

    // Photo pools, one per collage cell in DOM order. Pools are disjoint.
    // The first entry in each pool must match the <img> src already in
    // index.html for that cell (including its inline object-position), since
    // it is the guaranteed-valid fallback.
    var POOLS = [
        [
            { src: 'Basketball1.JPG', pos: '50% 35%' },
            { src: 'Headshot.jpeg', pos: '50% 20%' }
        ],
        [
            { src: 'assets/images/chasing-a-dream-cover.jpeg', pos: '50% 40%' },
            { src: 'assets/images/elephants-garden-cover.webp', pos: '50% 20%' },
            { src: 'assets/images/young-dreamers-flyer.jpg', pos: '50% 35%' }
        ],
        [
            { src: 'June20photo.jpeg', pos: '50% 10%' },
            { src: 'assets/images/classroom-reading.jpg', pos: '50% 25%' }
        ],
        [
            { src: 'Mildred1.jpg', pos: '50% 38%' },
            { src: 'assets/images/backpack-giveaway.jpg', pos: '50% 18%' }
        ],
        [
            { src: 'https://i.imgur.com/4QRYvm7.jpeg', pos: '50% 50%' },
            { src: 'Basketball2.JPG', pos: '50% 50%' }
        ],
        [
            { src: 'LevelGroundEvent.jpeg', pos: '50% 50%' }
        ],
        [
            { src: 'Mildred2.jpeg', pos: '50% 55%' },
            { src: 'Mildred3.jpeg', pos: '50% 15%' }
        ],
        [
            { src: 'Mildred4.jpeg', pos: '50% 30%' },
            { src: 'June20thevent.JPG', pos: '50% 35%' }
        ]
    ];

    var ROTATE_EVERY_MS = 5000;  // one cell changes every 5 seconds
    var FADE_MS = 1400;          // crossfade duration (matches CSS)

    function applyPhoto(img, photo) {
        img.src = photo.src;
        img.style.objectPosition = photo.pos;
    }

    // Fisher-Yates shuffle, returns a new shuffled array.
    function shuffled(arr) {
        var copy = arr.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

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
            pool.forEach(function (photo) {
                var pre = new Image();
                pre.src = photo.src;
            });

            var cell = { base: base, fade: fade, pool: pool, idx: 0 };
            cells.push(cell);

            // Fresh lineup on every visit: start this cell on a random photo
            // from its pool, but only after verifying it loads. On failure,
            // try the next candidate; the authored pool[0] image is the final
            // fallback and always exists.
            (function (c) {
                var order = shuffled(c.pool.map(function (_, k) { return k; }));
                // Always end with index 0 (the authored default) as fallback.
                order = order.filter(function (k) { return k !== 0; });
                order.push(0);
                tryCandidate(c, order, 0);
            })(cell);
        }
        if (!cells.length) return;

        function tryCandidate(cell, order, pos) {
            if (pos >= order.length) return; // keep authored image
            var photo = cell.pool[order[pos]];
            // Skip re-probing the authored image already on screen.
            if (order[pos] === 0) {
                cell.idx = 0;
                return;
            }
            var probe = new Image();
            probe.onload = function () {
                applyPhoto(cell.base, photo);
                cell.idx = order[pos];
            };
            probe.onerror = function () {
                tryCandidate(cell, order, pos + 1);
            };
            probe.src = photo.src;
        }

        var cursor = Math.floor(Math.random() * cells.length);
        var timer = null;

        function showNext(cell, attempts) {
            attempts = attempts || 0;
            if (attacksGuard(cell, attempts)) return;
            cell.idx = (cell.idx + 1) % cell.pool.length;
            var next = cell.pool[cell.idx];

            var probe = new Image();
            probe.onload = function () {
                applyPhoto(cell.fade, next);
                // Force a reflow so the opacity transition restarts cleanly.
                void cell.fade.offsetWidth;
                cell.fade.style.opacity = '1';
                setTimeout(function () {
                    // Swap the base image underneath, then fade the top layer out.
                    applyPhoto(cell.base, next);
                    cell.fade.style.opacity = '0';
                }, FADE_MS + 120);
            };
            probe.onerror = function () {
                showNext(cell, attempts + 1); // skip broken images
            };
            probe.src = next.src;
        }

        function attacksGuard(cell, attempts) {
            return attempts >= cell.pool.length; // all failed; give up quietly
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

(function () {
    'use strict';
    var carousel = document.querySelector('[data-books-carousel]');
    if (!carousel) return;
    var slides = carousel.querySelectorAll('.books-carousel-slide');
    if (!slides.length) return;
    var count = carousel.querySelector('[data-count]');
    var playback = carousel.querySelector('[data-playback]');
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = motion.matches;
    var hovered = false;
    var focused = false;
    var index = 0;
    var timer = null;

    function show(next) {
        slides[index].hidden = true;
        index = (next + slides.length) % slides.length;
        slides[index].hidden = false;
        count.textContent = (index + 1) + ' / ' + slides.length;
    }

    function sync() {
        if (timer !== null) clearInterval(timer);
        timer = null;
        playback.textContent = paused ? 'Play' : 'Pause';
        playback.setAttribute('aria-label', paused ? 'Start automatic photo rotation' : 'Pause automatic photo rotation');
        if (!paused && !hovered && !focused && !document.hidden) {
            timer = setInterval(function () { show(index + 1); }, 4000);
        }
    }

    carousel.querySelector('[data-previous]').addEventListener('click', function () { show(index - 1); sync(); });
    carousel.querySelector('[data-next]').addEventListener('click', function () { show(index + 1); sync(); });
    playback.addEventListener('click', function () { paused = !paused; sync(); });
    carousel.addEventListener('mouseenter', function () { hovered = true; sync(); });
    carousel.addEventListener('mouseleave', function () { hovered = false; sync(); });
    carousel.addEventListener('focusin', function () { focused = true; sync(); });
    carousel.addEventListener('focusout', function (event) {
        focused = carousel.contains(event.relatedTarget);
        sync();
    });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', function () { if (motion.matches) paused = true; sync(); });
    sync();
})();

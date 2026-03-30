// Loading screen — dismiss on window load
window.addEventListener('load', function() {
    var overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    overlay.addEventListener('transitionend', function() {
        overlay.style.display = 'none';
        // Trigger hero animation after overlay hides (index.html only)
        if (document.getElementById('hero-heading')) {
            triggerHeroAnimation();
        }
    }, { once: true });
});

function triggerHeroAnimation() {
    var heading = document.getElementById('hero-heading');
    var subtext = document.getElementById('hero-subtext');
    if (heading) {
        requestAnimationFrame(function() {
            heading.classList.add('hero-animate-visible');
            if (subtext) {
                setTimeout(function() {
                    subtext.classList.add('hero-animate-visible');
                }, 100);
            }
        });
    }
}

// Back-to-top button
(function() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

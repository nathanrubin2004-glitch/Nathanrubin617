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

// Chasing a Dream nav notification dot — clears when user clicks the link or lands on book.html
(function() {
    var STORAGE_KEY = 'chasingDreamEventSeen_v1';
    var dots = document.querySelectorAll('[data-event-dot]');
    if (!dots.length) return;

    function hideDots() {
        dots.forEach(function(d) { d.style.display = 'none'; });
    }
    function markSeen() {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    }

    var seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}

    var path = window.location.pathname;
    var onBookPage = /(^|\/)book(\.html)?\/?$/i.test(path) || /Chasing a Dream/.test(document.title || '');

    if (seen || onBookPage) {
        hideDots();
        markSeen();
        return;
    }

    document.querySelectorAll('[data-nav-chasing]').forEach(function(a) {
        a.addEventListener('click', function() {
            markSeen();
            hideDots();
        });
    });
})();

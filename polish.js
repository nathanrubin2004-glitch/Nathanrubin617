// Content stays visible; this optional flourish never waits for remote assets.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", triggerHeroAnimation, { once: true });
} else {
    triggerHeroAnimation();
}

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

// Back-to-top button, sticky nav elevation, scroll progress, and scroll reveals
(function() {
    var btn = document.getElementById('back-to-top');
    var nav = document.querySelector('.nav-glass');
    var progressBar = document.getElementById('scroll-progress');

    function onScroll() {
        var scrollY = window.scrollY || window.pageYOffset || 0;

        // Back-to-top visibility
        if (btn) {
            if (scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        // Sticky nav compact & shadow depth
        if (nav) {
            if (scrollY > 30) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }

        // Top scroll progress bar
        if (progressBar) {
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                var progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
                progressBar.style.width = progress + '%';
            }
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn) {
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();

// Scroll-triggered reveal animations via IntersectionObserver
(function initScrollReveals() {
    function setupReveals() {
        var reveals = document.querySelectorAll('.reveal-on-scroll');
        if (!reveals.length) return;

        if (!('IntersectionObserver' in window)) {
            reveals.forEach(function(el) { el.classList.add('is-revealed'); });
            return;
        }

        var observer = new IntersectionObserver(function(entries, obs) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.1
        });

        reveals.forEach(function(el) {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupReveals, { once: true });
    } else {
        setupReveals();
    }
})();


// Close either existing mobile-menu style with Escape and return focus.
document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    var button = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!button || !menu || button.getAttribute('aria-expanded') !== 'true') return;
    if (menu.classList.contains('mobile-menu-drawer')) {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
    } else {
        menu.classList.add('hidden');
    }
    button.setAttribute('aria-expanded', 'false');
    button.focus();
});

// Automatically keep copyright year current across all pages
(function() {
    function updateCopyrightYear() {
        var yearEls = document.querySelectorAll('.copyright-year');
        if (yearEls.length) {
            var currentYear = new Date().getFullYear();
            yearEls.forEach(function(el) {
                el.textContent = currentYear;
            });
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCopyrightYear, { once: true });
    } else {
        updateCopyrightYear();
    }
})();


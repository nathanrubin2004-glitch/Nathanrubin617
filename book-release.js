// One announcement per visit, independent of remote images and window.load.
(function () {
    var sessionKey = 'chasing-a-dream-amazon-release-seen';
    function scheduleAnnouncement() {
        try {
            if (sessionStorage.getItem(sessionKey)) return;
            // If storage is unavailable, skip automatic announcements entirely.
            sessionStorage.setItem(sessionKey + '-probe', '1');
            sessionStorage.removeItem(sessionKey + '-probe');
        } catch (error) { return; }

        setTimeout(function () {
            if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
            var dialog = document.createElement('dialog');
            if (typeof dialog.showModal !== 'function') return;
            dialog.className = 'book-release';
            dialog.setAttribute('aria-labelledby', 'book-release-title');
            dialog.setAttribute('aria-describedby', 'book-release-description');
            dialog.innerHTML = '<button type="button" class="book-release-close" aria-label="Close announcement" autofocus>&times;</button>' +
                '<h2 id="book-release-title">Nathan Rubin’s Children’s Books</h2>' +
                '<p id="book-release-description">Stories to inspire young dreamers and make room for every feeling.</p>' +
                '<div class="book-release-grid">' +
                '<article class="book-release-card">' +
                '<img class="book-release-cover" src="assets/images/chasing-a-dream-cover.jpeg" alt="Cover of Chasing a Dream by Nathan Rubin">' +
                '<h3>Chasing a Dream</h3><p>A story of confidence, kindness, and self-belief.</p>' +
                '<a class="book-release-buy" href="book.html" aria-label="Explore Chasing a Dream">Explore the Book</a></article>' +
                '<article class="book-release-card">' +
                '<img class="book-release-cover" src="assets/images/elephants-garden-cover.webp" width="1391" height="1800" alt="Cover of The Elephant’s Garden by Nathan Rubin, showing a blue elephant watering flowers beside a turtle in a colorful garden.">' +
                '<h3>The Elephant’s Garden</h3><p>A gentle story about emotions and growing into who we are.</p>' +
                '<a class="book-release-buy" href="elephants-garden.html" aria-label="Explore The Elephant’s Garden">Explore the Book</a></article></div>';
            var previousFocus = document.activeElement;
            dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
            dialog.addEventListener('click', function (event) {
                if (event.target !== dialog) return;
                var bounds = dialog.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right ||
                    event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
            });
            dialog.addEventListener('close', function () {
                dialog.remove();
                if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
                    previousFocus.focus({ preventScroll: true });
                }
            });
            document.body.appendChild(dialog);
            try {
                sessionStorage.setItem(sessionKey, '1');
                dialog.showModal();
            } catch (error) { dialog.remove(); }
        }, 800);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleAnnouncement, { once: true });
    } else {
        scheduleAnnouncement();
    }
})();

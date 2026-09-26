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
                '<img class="book-release-cover" src="assets/images/chasing-a-dream-cover.jpeg" alt="Chasing a Dream book cover">' +
                '<h2 id="book-release-title">Chasing a Dream is Now Available on Amazon!</h2>' +
                '<p id="book-release-description">Chasing a Dream is now available on Amazon! This exclusive Amazon edition includes a few added pages and a full guided activity at the end of the book designed to spark goal-setting for young readers.</p>' +
                '<a class="book-release-buy" href="https://www.amazon.com/dp/B0HKGRP94Z?spcref=PRINT_LISTING" target="_blank" rel="noopener noreferrer">Buy Now</a>' +
                '<div class="book-release-review"><p>Already purchased? Please leave a review!</p>' +
                '<a href="https://www.amazon.com/review/create-review/edit?ie=UTF8&amp;channel=glance-detail&amp;asin=B0HKGRP94Z" target="_blank" rel="noopener noreferrer">Leave a Review</a></div>';
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

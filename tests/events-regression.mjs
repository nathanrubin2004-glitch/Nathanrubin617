import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const html = read('community-engagement.html');
const card = html.match(/<article id="turtle-books-reading"[\s\S]*?<\/article>/)[0];
const text = card.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
for (const expected of [
    'Author Reading: Chasing a Dream', 'Saturday, December 12, 2026',
    '4:00 PM – 4:30 PM EST', 'Turtle Books | Brookline, MA',
    '224 Washington Street, Brookline, MA 02445', 'Book Reading / Author Appearance',
    "Join children's book author Nathan Rubin at Turtle Books in Brookline for a special reading of his debut children's book, Chasing a Dream.",
    'Through storytelling, Nathan encourages young readers to believe in themselves, embrace their dreams, and understand the importance of perseverance.',
    'This event is an opportunity for families and young readers to connect with Nathan and experience the message behind Chasing a Dream.'
]) assert.ok(text.includes(expected), expected);
assert.match(card, /href="book\.html"[^>]*>Chasing a Dream<\/a>/);
const official = card.match(/<a href="https:[^>]*>View Event Details<\/a>/)[0];
assert.ok(official.includes('href="https://turtlebooks.store/event/author-scott-rubin-reading-from-chasing-a-dream/"'));
assert.match(official, /target="_blank"/);
assert.match(official, /rel="noopener noreferrer"/);
assert.match(card, /datetime="2026-12-12T16:00:00-05:00"/);
assert.match(card, /datetime="2026-12-12T16:30:00-05:00"/);
assert.equal((html.match(/id="turtle-books-reading"/g) || []).length, 1);
assert.ok(!read('index.html').includes('turtle-books-reading'));
assert.match(read('index.html'), /href="community-engagement\.html#events"/);
assert.match(html, /Upcoming school visits, book readings, and community workshops are currently being scheduled\./);
assert.match(html, /href="contact\.html"[^>]*>Invite Nathan to Your School or Organization<\/a>/);
const archived = html.match(/<section id="completed-events"[\s\S]*?<\/section>/)[0];
assert.equal(crypto.createHash('sha256').update(archived).digest('hex'), '4a3c6dae767a89f7ea779c1d6c7f16aaaf42a6a8ba0e220015657f4d6863d916', 'archive exactly matches verified pre-change baseline');

const script = html.match(/<script id="event-lifecycle">([\s\S]*?)<\/script>/)[1];
const end = Date.parse('2026-12-12T16:30:00-05:00');
function load(now) {
    let current = now;
    let interval;
    let visibility;
    let moves = 0;
    const upcoming = {};
    const event = { parentElement: upcoming, content: card, querySelector: selector => {
        assert.equal(selector, 'time:last-of-type');
        return { dateTime: '2026-12-12T16:30:00-05:00' };
    } };
    const completed = { prepend: node => { assert.equal(node, event); node.parentElement = completed; moves++; } };
    vm.runInNewContext(script, {
        Date: { parse: Date.parse, now: () => current },
        document: {
            getElementById: id => { assert.equal(id, 'turtle-books-reading'); return event; },
            querySelector: selector => { assert.equal(selector, '#completed-events > div'); return completed; },
            addEventListener: (name, callback) => { assert.equal(name, 'visibilitychange'); visibility = callback; }
        },
        setInterval: (callback, delay) => { assert.equal(delay, 1000); interval = callback; }
    });
    return { event, upcoming, completed, moves: () => moves, tick: value => { current = value; interval(); }, visibility: () => visibility() };
}
const before = load(end - 1);
assert.equal(before.event.parentElement, before.upcoming);
before.tick(end);
assert.equal(before.event.parentElement, before.completed);
assert.equal(before.event.content, card);
before.tick(end + 1000);
before.visibility();
assert.equal(before.moves(), 1, 'repeated checks never duplicate the card');
for (const now of [end, end + 1]) assert.equal(load(now).moves(), 1, 'expired on initial load');
console.log('PASS: event details, links, exact archived content, before/at/after expiry, persistent-page update and idempotence');

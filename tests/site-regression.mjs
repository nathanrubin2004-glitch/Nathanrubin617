import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const purchase = 'https://www.amazon.com/dp/B0HKGRP94Z?spcref=PRINT_LISTING';
for (const file of ['index.html', 'book.html', 'basketball.html', 'writing.html', 'contact.html', 'books.html', 'elephants-garden.html', 'community-engagement.html']) {
    const html = read(file);
    assert.ok(!html.includes('loading-overlay'), file + ': no blocking overlay even without JS');
    assert.ok(!html.includes('hero-animate-ready'), file + ': visible hero without JS');
    assert.match(html, /<script src="book-release.js"><\/script>/);
    for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
        if (/^(Get the Book|Buy Now|Buy It Now|Purchase a Copy)$/.test(match[2].trim())) {
            assert.ok(match[1].includes(`href="${purchase}"`), file + ': purchase URL');
            assert.match(match[1], /target="_blank"/);
            assert.match(match[1], /rel="noopener noreferrer"/);
        }
    }
}
assert.ok(!read('polish.js').includes("addEventListener('load'"));
assert.ok(!read('styles.css').includes('#loading-overlay'));
assert.ok(read('netlify/functions/chat.js').includes(purchase));
assert.match(read('netlify.toml'), /publish = "\."/);
for (const route of ['/chasing-a-dream', '/chasing-a-dream/']) {
    assert.ok(read('netlify.toml').includes(`from = "${route}"\n  to = "/book.html"\n  status = 301`));
}

function visit({ store = new Map(), blocked = false, otherModal = false, ready = 'complete' } = {}) {
    const events = {}, timers = [], dialogs = [];
    let restored = 0;
    const previousFocus = { isConnected: true, focus() { restored++; } };
    const document = {
        readyState: ready, activeElement: previousFocus,
        addEventListener(name, fn) { events[name] = fn; },
        querySelector() { return otherModal ? {} : null; },
        body: { appendChild(dialog) { dialogs.push(dialog); } },
        createElement() {
            const listeners = {}, button = {};
            return {
                listeners, button, open: false, removed: false,
                setAttribute() {},
                querySelector() { return { addEventListener(name, fn) { button[name] = fn; } }; },
                addEventListener(name, fn) { listeners[name] = fn; },
                getBoundingClientRect() { return { left: 20, right: 200, top: 20, bottom: 200 }; },
                showModal() { this.open = true; },
                close() { this.open = false; listeners.close(); },
                remove() { this.removed = true; }
            };
        }
    };
    const storage = {
        getItem(key) { if (blocked) throw Error('Storage blocked'); return store.get(key); },
        setItem(key, value) { if (blocked) throw Error('Storage blocked'); store.set(key, value); },
        removeItem(key) { store.delete(key); }
    };
    vm.runInNewContext(read('book-release.js'), { document, sessionStorage: storage, setTimeout(fn, delay) { assert.equal(delay, 800); timers.push(fn); } });
    return { dialogs, events, timers, flush() { timers.splice(0).forEach(fn => fn()); }, get restored() { return restored; } };
}
const store = new Map();
const first = visit({ store, ready: 'loading' });
assert.equal(first.timers.length, 0);
first.events.DOMContentLoaded();
first.flush();
const dialog = first.dialogs[0];
assert.equal(dialog.open, true);
assert.match(dialog.innerHTML, /Nathan Rubin’s Children’s Books/);
assert.match(dialog.innerHTML, /Chasing a Dream/);
assert.match(dialog.innerHTML, /The Elephant’s Garden/);
assert.match(dialog.innerHTML, /href="book.html"/);
assert.match(dialog.innerHTML, /href="elephants-garden.html"/);
assert.match(dialog.innerHTML, /assets\/images\/elephants-garden-cover.webp/);
dialog.listeners.click({ target: dialog, clientX: 100, clientY: 100 });
assert.equal(dialog.open, true, 'dialog padding clicks stay open');
dialog.listeners.click({ target: {}, clientX: 1, clientY: 1 });
assert.equal(dialog.open, true, 'content clicks stay open');
dialog.listeners.click({ target: dialog, clientX: 1, clientY: 1 });
assert.equal(dialog.removed, true, 'backdrop closes and removes dialog');
assert.equal(first.restored, 1, 'focus returns after dismissal');
const repeat = visit({ store }); repeat.flush();
assert.equal(repeat.dialogs.length, 0, 'same session suppresses repeat');
const fresh = visit(); fresh.flush(); fresh.dialogs[0].button.click();
assert.equal(fresh.dialogs[0].removed, true, 'close button works on new session');
const escape = visit(); escape.flush(); escape.dialogs[0].close();
assert.equal(escape.restored, 1, 'native Escape close lifecycle restores focus');
for (const options of [{ blocked: true }, { otherModal: true }]) {
    const state = visit(options); state.flush(); assert.equal(state.dialogs.length, 0);
}
assert.ok(!read('book-release.js').includes('overflow'), 'no body scroll lock');
console.log('PASS: visibility, routing, purchase links, first/session visits, close/backdrop, focus, storage failure, modal conflict');

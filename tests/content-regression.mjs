import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const pages = ['index.html', 'book.html', 'books.html', 'elephants-garden.html', 'community-engagement.html', 'basketball.html', 'writing.html', 'contact.html'];
const section = (html, id) => html.match(new RegExp('<section id="' + id + '"[\\s\\S]*?</section>'))?.[0];
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const community = read('community-engagement.html');
const book = read('book.html');
const expectedSections = {
    events: '55f6d9b7c5ef6e469c867bbdf7ca684b88b56467a904b64c16c96eb2a63c5bf0',
    'completed-events': '8b253e56c066e793fcd0000aee545d4d8ee1ef5e7be01e17a77ad6c9248653f9',
    news: 'dba45ec9d10c04fd36f9f963943a408832604fd24e33579adc2c4f1e11acb353'
};
for (const [id, hash] of Object.entries(expectedSections)) {
    assert.equal(digest(section(community, id)), hash, id + ': content preserved or updated properly');
    assert.ok(!section(book, id), id + ': removed from former location');
}
assert.ok(!section(community, 'events').includes('Summer 2026'), 'Summer 2026 event removed from upcoming events');
assert.ok(!section(community, 'events').includes('Workshop, Reading & Signing'), 'Workshop event removed from upcoming events');
assert.ok(community.indexOf('id="events"') < community.indexOf('id="completed-events"'));
assert.ok(community.indexOf('id="completed-events"') < community.indexOf('id="news"'));
assert.ok(community.includes('mildred-carousel-slides'));
assert.ok(community.includes('updateCarousel(currentIndex + 1)'));

for (const file of pages) {
    const html = read(file);
    const header = html.match(/<header[\s\S]*?<\/header>/)[0];
    assert.equal((header.match(/>Books<\/a>/g) || []).length, 2, file + ': desktop and mobile Books');
    assert.equal((header.match(/>Community Engagement<\/a>/g) || []).length, 2, file + ': desktop and mobile community');
    assert.ok(!header.includes('data-nav-chasing'));
    assert.match(html, /© <span class="copyright-year">2026<\/span> Nathan Rubin\. All rights reserved\./, file + ': 2026 copyright');
    for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
        if (/^(?:https?:|mailto:|tel:|data:)/.test(match[1])) continue;
        assert.ok(fs.existsSync(new URL('../' + match[1], import.meta.url)), file + ': local reference ' + match[1]);
    }
    for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1], { filename: file });
}
const elephant = read('elephants-garden.html');
assert.equal((elephant.match(/<h1\b/g) || []).length, 1);
assert.ok(elephant.includes('Written by Nathan Rubin'));
assert.ok(elephant.includes('Everyone knows the elephant is strong.'));
assert.ok(elephant.includes('there is room for every part of who we are.'));
assert.ok(elephant.includes('imperfect and still growing.'));
assert.match(elephant, /src="assets\/images\/elephants-garden-cover.webp"[^>]*width="1391"[^>]*height="1800"/);
const amazon = elephant.match(/<a[^>]*href="(https:\/\/www.amazon.com\/Elephants-Garden[^\"]*)"[^>]*>/)[0];
assert.match(amazon, /target="_blank"/);
assert.match(amazon, /rel="noopener noreferrer"/);
const expectedAmazon = 'https://www.amazon.com/Elephants-Garden-Nathan-Rubin/dp/B0HLPT36TX?ref_=ast_author_dp_rw&th=1&psc=1&dib=eyJ2IjoiMSJ9.wFBwYv4dg6j9IQMrGnfH2o7gTHkiMhFGp8rUxfiIV9U.mzYJLqLqXtFqAsQZMTDT0scgntXM4w9-R4BeWx6xYyc&dib_tag=AUTHOR';
assert.equal(amazon.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&'), expectedAmazon);
for (const file of ['books.html', 'elephants-garden.html', 'community-engagement.html']) {
    assert.match(read(file), /<meta name="description" content="[^"]+">/);
    const route = '/' + file.replace('.html', '');
    assert.ok(read('netlify.toml').includes('from = "' + route + '"'));
}
const indexHtml = read('index.html');
assert.match(indexHtml, /Author\. Student-Athlete\. Youth Speaker\. Community Builder\./);
assert.match(indexHtml, /Explore the Books/);
assert.match(indexHtml, /Bring Nathan to Your School\/Organization/);
assert.match(indexHtml, /See Community Work/);
assert.match(indexHtml, /Chasing a Dream/);
assert.match(indexHtml, /The Elephant’s Garden/);
assert.match(indexHtml, /href="community-engagement\.html#events"/);
const writingHtml = read('writing.html');
assert.ok(!writingHtml.includes('currently in development'));
assert.match(writingHtml, /The Elephant’s Garden/);
assert.match(writingHtml, /href="elephants-garden\.html"/);
assert.match(book, /review\/create-review\/edit/);
assert.equal(digest(section(book, 'reviews')), 'f311e98c750402d175c4163ff97143c419a48d6e4472601886ff7e14fec01260', 'existing book reviews preserved');
console.log('PASS: eight-page navigation, local assets, inline JS syntax, exact relocated content, metadata, book copy, routes and links');

// Previously shared bookmarks work on first load and same-page hash changes.
const redirectScript = book.match(/function redirectCommunityFragment\(\)[\s\S]*?window\.addEventListener\('hashchange', redirectCommunityFragment\);/)[0];
let hashHandler;
let destination;
const location = { hash: '#events', replace: value => { destination = value; } };
vm.runInNewContext(redirectScript, { window: { location, addEventListener: (_, handler) => { hashHandler = handler; } } });
assert.equal(destination, 'community-engagement.html#events');
location.hash = '#news';
hashHandler();
assert.equal(destination, 'community-engagement.html#news');
location.hash = '#reviews';
destination = undefined;
hashHandler();
assert.equal(destination, undefined);
console.log('PASS: legacy community bookmarks and same-page fragment navigation');

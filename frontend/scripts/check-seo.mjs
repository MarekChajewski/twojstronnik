import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Uruchom po `npm run build`: sprawdza rzeczywisty output Astro, nie tylko pliki źródłowe.
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const base = 'https://twojstronnik.pl';
const pages = [
  ['index.html', '/', ['WebSite', 'Organization']],
  ['dla-artystow/index.html', '/dla-artystow/', ['Service']],
  ['dla-przewodnikow/index.html', '/dla-przewodnikow/', ['Service']],
];
const legal = [
  'regulamin/index.html', 'polityka-prywatnosci/index.html',
  'polityka-cookies/index.html', 'odstapienie-od-umowy/index.html',
  'powierzenie-danych/index.html',
];
function read(name) {
  const path = join(root, name);
  assert.ok(existsSync(path), `Brak pliku: ${name}`);
  return readFileSync(path, 'utf8');
}
function getMeta(html, key, attr='name') {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (tag.includes(`${attr}="${key}"`)) return (tag.match(/content="([^"]*)"/i) || [])[1];
  }
  return undefined;
}
for (const [file, path, types] of pages) {
  const html = read(file);
  const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*>/i) || [''])[0];
  assert.ok(canonical.includes(`href="${base}${path}"`), `Błędny canonical: ${file}`);
  assert.ok(/<title>[^<]{20,}<\/title>/i.test(html), `Brak opisowego title: ${file}`);
  assert.ok(getMeta(html, 'description')?.length >= 70, `Brak description: ${file}`);
  assert.ok(!getMeta(html, 'robots')?.includes('noindex'), `Nieoczekiwane noindex: ${file}`);
  assert.equal(getMeta(html, 'og:url', 'property'), `${base}${path}`);
  assert.equal(getMeta(html, 'og:image', 'property'), `${base}/logo-ts.png`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `Wymagany jeden H1: ${file}`);
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length, `Brak JSON-LD: ${file}`);
  const data = scripts.flatMap((match) => {
    const item = JSON.parse(match[1]);
    return Array.isArray(item) ? item : [item];
  });
  for (const type of types) assert.ok(data.some((entry) => entry['@type'] === type), `Brak typu ${type}: ${file}`);
  console.log(`OK: ${file}`);
}
for (const file of legal) {
  assert.ok(getMeta(read(file), 'robots')?.includes('noindex'), `Brak noindex: ${file}`);
}
assert.ok(getMeta(read('404.html'), 'robots')?.includes('noindex'), 'Brak noindex na 404');
const robots = read('robots.txt');
assert.ok(robots.includes('Sitemap: https://twojstronnik.pl/sitemap.xml'));
assert.ok(!/Disallow:\s*\/\s*$/m.test(robots), 'robots.txt blokuje całą stronę');
const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(locs, pages.map(([, path]) => `${base}${path}`));
console.log('SEO: 3 strony ofertowe, 5 stron prawnych, 404, sitemap i robots.txt — OK');

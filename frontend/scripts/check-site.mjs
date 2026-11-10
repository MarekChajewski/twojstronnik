import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const site = 'https://twojstronnik.pl';
const paths = [
  '/',
  '/dla-artystow/',
  '/dla-przewodnikow/',
  '/polityka-prywatnosci/',
  '/polityka-cookies/',
  '/regulamin/',
  '/odstapienie-od-umowy/',
  '/powierzenie-danych/',
];

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const textFile = (path) => readFileSync(join(dist, path), 'utf8');

check(existsSync(join(dist, 'robots.txt')), 'Brakuje robots.txt');
check(existsSync(join(dist, 'sitemap.xml')), 'Brakuje sitemap.xml');
check(existsSync(join(dist, '404.html')), 'Brakuje strony 404');
check(!existsSync(join(dist, 'faq')), 'Usunięte FAQ nadal jest w katalogu dist');

if (!errors.length) {
  const sitemap = textFile('sitemap.xml');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  check(new Set(listed).size === listed.length, 'Zduplikowane adresy w sitemap.xml');
  check(listed.length === paths.length, 'Liczba adresów w mapie witryny nie zgadza się z liczbą stron');
  for (const url of paths) {
    const filename = join(url.slice(1), 'index.html');
    const path = join(dist, filename);
    check(existsSync(path), `Brak wygenerowanej strony: ${url}`);
    check(listed.includes(`${site}${url}`), `Brak adresu w sitemap.xml: ${url}`);
    if (!existsSync(path)) continue;

    const html = readFileSync(path, 'utf8');
    check(/<html\s+lang="pl"/.test(html), `Brak lang="pl": ${url}`);
    check(/<title>[^<]+<\/title>/.test(html), `Brak tytułu: ${url}`);
    check(/<meta\s+name="description"\s+content="[^"]+"/.test(html), `Brak opisu: ${url}`);
    check(html.includes(`href="${site}${url}"`), `Nieprawidłowy adres kanoniczny: ${url}`);
    check(/<h1\b/.test(html), `Brak nagłówka H1: ${url}`);
    check(!/href="\/faq\/"/.test(html), `Pozostał link do FAQ: ${url}`);
  }

  const notFound = textFile('404.html');
  check(/name="robots"\s+content="noindex,\s*follow"/.test(notFound), 'Strona 404 powinna mieć noindex');
  check(textFile('robots.txt').includes(`${site}/sitemap.xml`), 'robots.txt nie wskazuje mapy strony');
}

if (errors.length) {
  errors.forEach((error) => console.error(`✗ ${error}`));
  process.exitCode = 1;
} else {
  console.log(`SEO: sprawdzono ${paths.length} podstron, mapę witryny, robots.txt i 404.`);
}

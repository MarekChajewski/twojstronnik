// Szybka kontrola już uruchomionych kontenerów (bez wysyłania e-maili).
const origin = process.env.SITE_URL || 'http://localhost:8093';
const pages = [
  '/', '/dla-artystow/', '/dla-przewodnikow/', '/regulamin/',
  '/polityka-prywatnosci/', '/polityka-cookies/',
  '/odstapienie-od-umowy/', '/powierzenie-danych/',
];

let errors = 0;
async function check(path, expectedStatus, validate = () => true) {
  try {
    const response = await fetch(new URL(path, origin));
    const text = await response.text();
    if (response.status !== expectedStatus || !validate(text)) {
      throw new Error(`HTTP ${response.status}, oczekiwano ${expectedStatus}`);
    }
    console.log(`OK ${expectedStatus} ${path}`);
  } catch (error) {
    errors++;
    console.error(`BŁĄD ${path}: ${error.message}`);
  }
}

for (const page of pages) await check(page, 200, (body) => body.includes('<h1'));
await check('/robots.txt', 200, (body) => body.includes('sitemap.xml'));
await check('/sitemap.xml', 200, (body) => body.includes('twojstronnik.pl'));
await check('/healthz', 200);
await check('/faq/', 404);
await check('/api/contact', 405);

if (errors) process.exitCode = 1;
else console.log('Kontrola lokalnego Dockera zakończona pomyślnie.');

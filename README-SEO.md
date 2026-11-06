# Twój Stronnik — SEO i indeksowanie (v33)

## Co zostało dodane

- Osobne, opisowe meta title + description strony głównej, artystów i przewodników.
- Canonical wskazujący publiczne adresy `https://twojstronnik.pl/…`, także przy lokalnym buildzie.
- Open Graph i Twitter Card na podstawie **istniejącego** logo `/logo-ts.png` (bez generowania nowych grafik).
- JSON-LD: `WebSite` + `Organization` na stronie głównej oraz `Service` na stronach ofertowych. Nie deklarujemy ocen, recenzji, rejestracji firmy ani niezweryfikowanych danych.
- `frontend/public/robots.txt` — roboty mogą czytać strony, lecz nie `/api/`, plus link do mapy strony.
- `frontend/public/sitemap.xml` — wyłącznie trzy główne strony ofertowe, bez sztucznych dat `lastmod`.
- `meta robots=noindex,follow` dla pięciu podstron prawnych i strony błędu 404. Dokumenty nadal dostępne publicznie i dla robotów (aby zobaczyły `noindex`); nie są blokowane w robots.txt.
- Wewnętrzny Nginx wyświetla własną stronę 404 z kodem HTTP 404.
- Test `npm run seo:check` sprawdza wynik buildu; jest wykonywany też podczas `docker compose up -d --build`, aby błędne metadane zatrzymywały wdrożenie.
- Zachowany wygląd v31 i konfiguracja Docker v32, bez zmian backendu formularza.

## Przed wdrożeniem

1. Zakończ konfigurację `.env.docker` (nie kopiuj hasła do repozytorium).
2. Uruchom `docker compose --env-file .env.docker up -d --build`.
3. Lokalnie sprawdź `/`, `/dla-artystow/`, `/dla-przewodnikow/`, `/robots.txt`, `/sitemap.xml` i nieistniejący adres — ostatni musi zwracać 404.
4. Dopiero po przełączeniu prawdziwej domeny sprawdź przez `curl -I https://twojstronnik.pl/` i analogicznie `/robots.txt`, `/sitemap.xml`.
5. Skonfiguruj przekierowanie **www → bez www** oraz **HTTP → HTTPS** w istniejącym Nginx VPS (jeżeli jeszcze nie ma). Nie dodawaj drugiego vhosta bez sprawdzenia konfiguracji.
6. Dodaj i zweryfikuj domenę w Google Search Console, prześlij `https://twojstronnik.pl/sitemap.xml`. Zgłoś trzy podstrony przez Inspekcję URL; indeksowanie nie jest natychmiastowe ani gwarantowane.
7. Po wdrożeniu sprawdź w Google Search Console raport Indeksowanie stron i skuteczność wyszukiwania. Brak usług analitycznych nie blokuje raportów Search Console.

## Ważne

- Podstrony prawne **celowo** nie są indeksowane. Jeśli zechcesz, można je włączyć do indeksowania (`noindex` usunąć), lecz nie należy ich blokować przez robots.txt.
- Przy dodawaniu nowej podstrony ofertowej uzupełnij ręcznie `frontend/public/sitemap.xml` i ustaw indywidualny `<title>` / opis oraz dane strukturalne, jeśli pasują do treści.
- Lokalny test na `localhost:8093` *nie* indeksuje localhost w Google. Kanoniczne adresy wskazują produkcję, lecz publiczna indeksacja zależy od dostępności domeny i stanu strony.
- Nie dodajemy pustych `keywords`, wymyślonych opinii, FAQ bez treści ani automatycznych dat aktualizacji strony w sitemapie.
- Gotowe PNG logo ma 677×677 px; jest użyte do kart social typu `summary`, nie do dużych poziomych kart. Jeśli zechcesz, później można przygotować osobne zdjęcie 1200×630.
- Ponieważ projekt v32 nie miał pliku `frontend/package-lock.json`, Dockerfile nadal używa `npm install` bez lockfile i `npm ci` z lockfile. Jeśli w swoim lokalnym projekcie masz poprawny, zsynchronizowany `package-lock.json`, zachowaj go podczas aktualizacji.

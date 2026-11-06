# Obsługa formularza kontaktowego — Twój Stronnik

Ten serwer odbiera zgłoszenia z dwóch podstron statycznej strony Astro (`/api/contact`) i wysyła je poprzez **SMTP Outsidera** na `kontakt@twojstronnik.pl`. W polu `Reply-To` ustawia e-mail osoby, która wypełniła formularz. **Nie służy do wysyłania odpowiedzi do klientów** — to pozostaje zadaniem programu pocztowego.

## Uruchamianie lokalne

1. W panelu Outsidera utwórz działającą skrzynkę `kontakt@twojstronnik.pl` (samo przekierowanie na prywatny e-mail nie zapewnia danych logowania SMTP).
2. Skopiuj `.env.example` do `.env` i wpisz **hasło tej skrzynki** (nie hasło do Gmaila). Przy pracy lokalnej dodaj `http://localhost:4321` do `ALLOWED_ORIGINS`, po przecinku.
3. W katalogu `contact-server` uruchom `npm install` i `npm start`.
4. W osobnym terminalu wejdź do `frontend`, uruchom `npm install` i `npm run dev`. Astro lokalnie przekierowuje `/api/contact` na serwer port 3107.
5. Wyślij testowe zapytanie z `/dla-artystow/` lub `/dla-przewodnikow/`. Sprawdź, czy wiadomość dotarła na skrzynkę domenową i ewentualne przekierowanie.

Nie wrzucaj `.env` do repozytorium ani do katalogu publicznego! Hasło SMTP przechowywane jest tylko na serwerze.

## Wdrożenie na VPS z Nginx

1. Zbuduj statyczny frontend: `cd frontend && npm install && npm run build`; zawartość `frontend/dist/` podłącz do aktualnego Nginx jako wcześniej.
2. Skopiuj `contact-server` na ten sam VPS, na którym działa Nginx. Przejdź do katalogu serwera kontaktowego, uruchom `npm install`, utwórz `.env` na podstawie przykładu i zabezpiecz: `chmod 600 .env` (plik musi być czytelny dla użytkownika usługi).
3. W `ALLOWED_ORIGINS` pozostaw tylko `https://twojstronnik.pl` (oraz ewentualnie `https://www.twojstronnik.pl`, jeśli obsługujesz ten wariant bez przekierowania).
4. Dopasuj plik `deploy/twojstronnik-contact.service` — ścieżkę Node (`which node`), katalog i użytkownika. Wgraj go do `/etc/systemd/system/`, potem: `sudo systemctl daemon-reload && sudo systemctl enable --now twojstronnik-contact`.
5. Dodaj fragment `deploy/nginx-location.conf` do istniejącego HTTPS vhosta domeny; uruchom `sudo nginx -t && sudo systemctl reload nginx`.
6. Sprawdź `curl http://127.0.0.1:3107/healthz` (zwróci `{"ok":true}`), a potem **wyślij wiadomość przez formularz na produkcji**.

### SMTP

- `SMTP_HOST=outsider.mikr.us` — zgodnie z dokumentacją Mikrusa.
- Port `587` + STARTTLS (`SMTP_SECURE=false`) lub, jeśli dostępny, port `465` + TLS (`SMTP_SECURE=true`).
- `SMTP_FROM` i `SMTP_TO` mogą mieć wartość `kontakt@twojstronnik.pl`.
- `SMTP_USER` i `SMTP_PASSWORD` muszą odpowiadać faktycznie utworzonej skrzynce. Hasła nie zapisujemy w frontendzie.
- Dostarczenie e-maila do Gmaila wymaga osobnego przekierowania na Outsiderze; nie konfiguruje się go w kodzie strony.
- Sprawdź DNS MX, SPF, DKIM i DMARC, aby wiadomości trafiały do odbiorcy.

### Zabezpieczenia

- Pola obowiązkowe i limity długości walidowane w przeglądarce oraz na serwerze.
- Pole-pułapka (honeypot), weryfikacja nagłówka `Origin`, limit 5 wiadomości na 15 min z jednego IP i limit globalny 100/15 min (limity w pamięci procesu).
- Endpoint dostępny z sieci tylko przez Nginx, proces słucha `127.0.0.1`.
- Brak przechowywania formularzy w bazie. Treść jest przekazywana w e-mailu przez SMTP.
- Przy wielu instancjach API konieczny byłby współdzielony limiter, a przy większym ruchu warto dołożyć ochronę na poziomie reverse proxy.

### Testy

`npm test` — sprawdza walidację, CSRF, honeypot, limity, poprawne nagłówki maili i zachowanie przy błędzie SMTP (bez wysyłania prawdziwych wiadomości).

**Uwaga:** samo wgranie ZIP-a nie włącza serwera wysyłającego. Do faktycznego działania potrzebne są konfiguracja SMTP, usługa Node oraz reguła Nginx. Bez nich formularz pokaże błąd, zamiast udawać, że wiadomość została wysłana.

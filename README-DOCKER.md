# Twój Stronnik v32 — wdrożenie przez Docker Compose

Wersja v32 to **v31 bez zmian wyglądu strony**, uzupełniona o kontenery Docker. Nie uruchamiano jej na produkcyjnym VPS. Zawartość i API formularza pozostają bez zmian, poza bezpieczną obsługą połączeń przez proxy w Dockerze.

## Architektura

```text
Internet → HTTPS / Cloudflare (opcjonalnie) → Nginx na VPS :443
                                 ↓
                       127.0.0.1:8093 na VPS
                                 ↓
                  kontener web (Nginx + Astro dist)
                    /                       \
             statyczne strony           /api/contact
                                           ↓
                                   kontener contact (Node)
                                           ↓ SMTP TLS
                                   outsider.mikr.us
                                           ↓
                                kontakt@twojstronnik.pl
```

- `web`: buduje Astro, wystawia pliki przez Nginx w kontenerze. **Tylko** `127.0.0.1:8093` jest mapowane na hosta; port można zmienić przez `WEB_PORT`.
- `contact`: proces Node z Nodemailer, dostępny wyłącznie w prywatnej sieci Compose (port 3107 nie jest mapowany na hosta). Ma połączenie wychodzące do SMTP.
- Nginx hosta obsługuje HTTPS i certyfikaty, tak jak wcześniej. Nie uruchamiaj drugi raz Certbota i nie zmieniaj konfiguracji Cloudflare bez potrzeby.
- `.env.docker`: prywatne ustawienia SMTP, nigdy nie trafia do obrazów Dockera ani ZIP-a.

## 1. Wymagania

- VPS z Docker Engine oraz Docker Compose v2 (`docker compose version`).
- Wolny lokalny port 8093 lub inny nieużywany port. Sprawdź `sudo ss -lntp | grep ':8093'`.
- Działająca skrzynka `kontakt@twojstronnik.pl` z **hasłem SMTP** na Outsiderze, poprawne MX/SPF/DKIM/DMARC domeny.
- Aktualny blok HTTPS Nginx dla `twojstronnik.pl`. Najlepiej wykonać kopię jego konfiguracji przed zmianą.

## 2. Pliki na VPS

Przekopiuj rozpakowany katalog projektu na serwer, np. do `/var/www/twojstronnik/`.

```bash
cd /var/www/twojstronnik
cp .env.docker.example .env.docker
chmod 600 .env.docker
nano .env.docker
```

Wprowadź hasło skrzynki zamiast `TU_WPISZ_HASLO_SKRZYNKI`. Dla portu 587 używamy `SMTP_SECURE=false` (STARTTLS wymagany przez aplikację). Dla portu 465 należy ustawić `SMTP_SECURE=true`. Jeśli hasło zawiera znak `$` lub `#`, pozostaw pojedyncze apostrofy z przykładu. Nie wklejaj hasła do rozmowy ani do repozytorium.

`WEB_PORT=8093` może zostać zmieniony, jeżeli port jest już zajęty. Zmiana musi być zgodna z `proxy_pass` na hoście. Domyślny `ALLOWED_ORIGINS` to tylko `https://twojstronnik.pl`.

## 3. Uruchomienie, bez przełączania strony produkcyjnej

```bash
cd /var/www/twojstronnik
docker compose --env-file .env.docker config --quiet
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps
curl -I http://127.0.0.1:8093/
curl -I http://127.0.0.1:8093/dla-artystow/
```

Obie strony powinny zwrócić `200`. To jeszcze nie jest próba wysyłki wiadomości. Testy offline: `cd contact-server && npm test`.

**Nie używaj `docker compose config` bez `--quiet` przy pokazywaniu logów lub zrzutów ekranu:** może wypisać hasło SMTP.

## 4. Podłączenie istniejącego Nginx VPS

W istniejącym `server { ... }` dla `twojstronnik.pl` na porcie 443 zastąp dotychczasowe `location /` fragmentem z `deploy/nginx-vps-location.conf`. **Nie dodawaj drugiego `location /`**, gdy już istnieje. Zachowaj certyfikaty, Cloudflare, przekierowania z HTTP i pozostałe reguły.

Uwaga na starszą konfigurację `location = /api/contact`: jeżeli była wcześniej dodana, usuń ją lub ustaw tak, aby kierowała do tego samego portu `8093`, a nie do starego serwera Node na `3107`. Nowy kontener WWW sam kieruje `/api/contact` do właściwej usługi.

Po poprawieniu konfiguracji hosta:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -I https://twojstronnik.pl/
```

Przy korzystaniu z Cloudflare prawdziwy adres klienta wymaga poprawnej konfiguracji zaufanych zakresów Cloudflare w Nginx hosta; w przeciwnym razie limit będzie widział adres pośrednika. Nie należy ufać dowolnym nagłówkom `CF-Connecting-IP` z Internetu bez weryfikacji źródła.

## 5. Test formularza po podłączeniu domeny

1. Wejdź na `https://twojstronnik.pl/dla-artystow/` i wyślij wiadomość testową.
2. Powtórz na `https://twojstronnik.pl/dla-przewodnikow/`.
3. Sprawdź odbiór na `kontakt@twojstronnik.pl` (oraz przekierowanie, jeśli je włączyłeś).
4. Sprawdź, czy przycisk „Odpowiedz” kieruje na adres nadawcy (Reply-To).
5. Jeśli wiadomości nie dochodzą, sprawdź logi **bez ujawniania haseł**:

```bash
docker compose --env-file .env.docker logs --tail=80 contact
```

Jeśli nie ma skrzynki lub SMTP jest niepoprawne, serwis może działać, ale formularz nie wyśle maila. Healthcheck `/healthz` sprawdza tylko działanie procesu HTTP, nie poprawność SMTP ani dostarczania poczty.

## Aktualizacja

```bash
cd /var/www/twojstronnik
docker compose --env-file .env.docker up -d --build
```

Docker Compose wykorzysta zaktualizowany kod i pozostawi konfigurację SMTP w `.env.docker`. Nie kopiuj `.env.docker` do publicznego katalogu strony.

## Cofnięcie wdrożenia

Zachowaj kopię starej konfiguracji Nginx i stare pliki strony. W razie problemów odtwórz poprzednie `location /` w Nginx i wykonaj `sudo nginx -t && sudo systemctl reload nginx`. Kontenery możesz wyłączyć poleceniem:

```bash
docker compose --env-file .env.docker down
```

Nie uruchamiaj `down -v` bez potrzeby. W tym projekcie nie ma bazy danych ani wolumenów przechowujących zgłoszenia.

## Uwagi techniczne

- Port API `3107` ma **wyłącznie `expose`**, bez `ports`. Nie dodawaj mapowania portu API na hosta.
- Backend dopuszcza `BIND_HOST=0.0.0.0` tylko przy `CONTAINER_MODE=true`. Zaufany `X-Real-IP` jest dopuszczany tylko przy obu `CONTAINER_MODE=true` i `TRUST_PROXY=true`. Na hoście Nginx **musi nadpisywać** `X-Real-IP` adresem, który rzeczywiście widzi.
- Każdy serwis jest uruchamiany pojedynczo; ograniczenia liczby wysyłek są przechowywane w pamięci procesu i resetują się po restarcie. Nie skaluj API poziomo bez wspólnego limitera.
- Node 22 i obrazy `nginx:stable-alpine` pobierają się w czasie budowania. Projekt v31 nie zawierał `package-lock.json`, więc Dockerfile stosuje `npm install`, a jeżeli lockfile zostanie dodany w przyszłości — `npm ci`. Wersje transytywne mogą zmieniać się między buildami.
- Przy pierwszym buildzie potrzebny jest dostęp do rejestrów npm i obrazów Dockera. Nie wykonano tego builda w środowisku przygotowującym paczkę (brak dostępu do rejestru i brak działającego Dockera).
- Stare pliki systemd i fragmenty Nginx w `contact-server/deploy/` dotyczą wariantu **bez Dockera** i nie są potrzebne w tym wdrożeniu.

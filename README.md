# Twój Stronnik

Strona informacyjna [twojstronnik.pl](https://twojstronnik.pl), prezentująca dwa gotowe rozwiązania: galerię internetową dla artystów i stronę ofertową dla przewodników.

Frontend jest statyczną aplikacją Astro, a formularz kontaktowy obsługuje małe API Node.js. W repozytorium nie przechowujemy haseł pocztowych ani plików `.env`.

## Struktura projektu

```text
frontend/          Astro, grafiki, style, skrypty i testy przeglądarkowe
contact-server/    API formularza i testy jednostkowe
compose.yaml       lokalne uruchamianie w Docker Compose
.env.docker.example  przykładowe ustawienia środowiska
scripts/           prosta kontrola kontenerów po uruchomieniu
```

## Uruchamianie lokalne — Docker

Wymagany Docker Desktop z obsługą Compose.

1. Skopiuj `.env.docker.example` do `.env.docker` i zachowaj swoje dotychczasowe dane, jeżeli już masz ten plik. **Nie nadpisuj istniejącego `.env.docker` gotowym przykładem.**
2. W katalogu głównym uruchom:

```powershell
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps
```

3. Otwórz [http://localhost:8093](http://localhost:8093). Port można zmienić przez `WEB_PORT` w `.env.docker`.
4. Sprawdź działanie stron i proxy:

```powershell
node scripts/smoke-docker.mjs
docker compose --env-file .env.docker logs --tail=100 contact
```

**Brak hasła SMTP nie blokuje lokalnego uruchomienia strony.** Kontener `contact` zgłasza wtedy stan `healthy`, ponieważ działa jego serwer HTTP, ale poprawnie wypełniony formularz zwróci błąd 503. Aby sprawdzić rzeczywistą wysyłkę, należy skonfigurować pocztę na Outsiderze. Na produkcji ustaw `SMTP_REQUIRED=true`.

Dane SMTP nie są ujawniane przeglądarce. Kontener `contact` nie ma wystawionego portu na komputer gospodarza: Nginx kieruje `/api/contact` do kontenera po wewnętrznej sieci Compose.

Zatrzymanie:

```powershell
docker compose --env-file .env.docker down
```

Po zmianach w CSS i kodzie, w tej konfiguracji należy ponownie wykonać `up -d --build`. Na etapie pracy nad wyglądem wygodniejsze jest Astro Dev Server opisane poniżej.

## Uruchamianie frontendu bez Dockera

Wymagany Node.js 22 i npm:

```powershell
cd frontend
npm install
npm run dev
```

Strona pojawi się pod `http://localhost:4321`. Zmiany CSS aktualizują się automatycznie. Formularz korzysta wtedy z proxy Astro do API pod `127.0.0.1:3107`; aby faktycznie wysyłać wiadomości, uruchom także `contact-server`.

## Kontrola jakości

```powershell
cd frontend
npm run build
npm run seo:check
npx playwright install chromium
npm run test:e2e

cd ..\contact-server
npm install
npm test
```

- `seo:check` sprawdza istniejący build, adresy kanoniczne, opisy, mapę strony i brak FAQ.
- Testy Playwright sprawdzają stronę startową, układ mobilny, formularz z symulowaną odpowiedzią API, menu i dokumenty prawne. **Nie wysyłają prawdziwych maili**.
- Testy Node sprawdzają walidację API, limity i zachowanie przy braku SMTP.

Pliki `package-lock.json` dla obu aplikacji należy wygenerować przez `npm install` i dodać do repozytorium. Nie dodawaj `node_modules`, `dist`, `test-results` ani `.env.docker`.

## Wdrożenie produkcyjne

Lokalny `compose.yaml` udostępnia Nginx jedynie na `127.0.0.1`, dlatego na VPS potrzebny jest zewnętrzny reverse proxy kierujący domenę na właściwy port. W pliku `.env.docker` podaj publiczne adresy witryny w `ALLOWED_ORIGINS` i rzeczywiste dane SMTP. Jeśli serwer produkcyjny ma już własny `compose.yaml` lub konfigurację Nginx, **nie nadpisuj ich bez porównania** — sprawdź szczególnie porty, sieci, routing `/api/contact` oraz ścieżki do certyfikatów.

Na potrzeby wdrożenia bez Dockera można zbudować frontend do `frontend/dist/`, a serwer kontaktowy uruchomić osobno przez systemd. W folderze `contact-server/deploy/` znajdują się przykładowe pliki.

## Uwagi do aktualizacji

W tej wersji nie zmieniano treści ofert, dokumentów prawnych ani styli wizualnych. Zachowane są poprawki mobilne i animacje z v32.

Jeżeli zastępujesz starszą wersję projektu, pozostaw istniejące `.git` i prywatne pliki `.env`. W poprzednich wersjach usuwano nieużywane katalogi, np. `frontend/src/pages/faq/`; samo nadpisywanie nowszymi plikami ich nie kasuje. Z tego względu przed publikacją sprawdź wynik `npm run seo:check` oraz status usuniętych plików w Git.

# Serwer formularza

API Node.js przyjmuje `POST /api/contact` z dwóch podstron ofertowych i wysyła zgłoszenia przez SMTP. Nagłówek `Reply-To` wskazuje e-mail podany przez klienta. Serwer nie przechowuje wiadomości w bazie danych.

## Lokalnie bez Dockera

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Uzupełnij hasło SMTP w `.env`, jeżeli chcesz sprawdzać rzeczywiste wysyłanie. Dla Astro uruchomionego na porcie 4321 dodaj `http://localhost:4321` do `ALLOWED_ORIGINS`. Plik `.env` pozostaje prywatny.

Bez konfiguracji SMTP serwer nadal nasłuchuje, a `GET /healthz` zwróci `{"ok":true,"smtpConfigured":false}`. Formularz odpowie kodem HTTP 503. Ustaw `SMTP_REQUIRED=true`, aby wymusić kompletną konfigurację przy produkcyjnym uruchomieniu.

## Docker

Root projektu zawiera działający przykład `compose.yaml` i `.env.docker.example`. Docker ustawia `BIND_HOST=0.0.0.0`, ponieważ API musi być widoczne dla kontenera Nginx, ale **nie wystawia portu 3107 na hosta**. W trybie bez Dockera domyślnie używany jest bezpieczny adres `127.0.0.1`.

Adresy dozwolone do formularza są określane przez `ALLOWED_ORIGINS`. W Dockerze uwzględniane są też lokalne `http://localhost:8093` i `http://127.0.0.1:8093`. `TRUST_PROXY=true` można ustawić wyłącznie za zaufanym reverse proxy.

## Testy

```powershell
npm test
```

Testy obejmują: poprawne wysyłanie, walidację pól, zabezpieczenie nagłówka `Origin`, honeypot, rate limiting, błędy SMTP, brak danych pocztowych i działanie za proxy. Nie wysyłają prawdziwej poczty.

## Produkcja

Utwórz rzeczywistą skrzynkę `kontakt@twojstronnik.pl`, ustaw jej hasło w środowisku serwera i przetestuj wysyłkę. Skonfiguruj SPF, DKIM i DMARC u dostawcy domeny oraz zweryfikuj dostarczalność wiadomości. Same testy jednostkowe nie potwierdzają działania zewnętrznego serwera SMTP.

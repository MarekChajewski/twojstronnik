# Aktualizacja v33 — wyłącznie zmienione pliki

1. Zrób kopię obecnego projektu, w szczególności `compose.yaml`, plików Dockerfile oraz `.env.docker`.
2. Rozpakuj pliki w głównym katalogu repozytorium `twoj stronnik`, zachowując strukturę folderów. Nie usuwaj `.git`.
3. Plik `.env.docker` pozostaw bez zmian. W archiwum jest tylko przykładowy `.env.docker.example`.
4. Ponieważ frontend/package.json ma nową zależność testową, w katalogu `frontend` wykonaj `npm install`. Zaktualizowany `package-lock.json` zatwierdź później w Git.
5. Sprawdź lokalnie poleceniem `docker compose --env-file .env.docker up -d --build`.
6. Zweryfikuj działanie poleceniem `node scripts/smoke-docker.mjs`.

Uwaga: nowy `compose.yaml` jest przykładem spójnej konfiguracji lokalnej. Jeśli Twój obecny plik ma dodatkowe usługi albo reguły produkcyjne, porównaj go z nowym zamiast nadpisywać bez sprawdzenia.

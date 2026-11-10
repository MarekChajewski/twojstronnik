# Frontend

Statyczna strona Astro 5 z dwoma motywami graficznymi. Treści ofert i dokumenty prawne znajdują się w `src/pages/`. Wspólne elementy to komponenty z `src/components/`, zachowania przeglądarki z `src/scripts/`, a style z `src/styles/`.

## Start

```powershell
npm install
npm run dev
```

Adres podglądu: `http://localhost:4321`.

## Budowanie i testy

```powershell
npm run build
npm run seo:check
npx playwright install chromium
npm run test:e2e
```

`seo:check` czyta katalog `dist`, więc wymaga wcześniejszego buildu. Playwright uruchamia własny serwer developerski Astro i weryfikuje wygląd oraz działanie strony bez rzeczywistej wysyłki maili.

Formularz korzysta z `/api/contact`. Podczas pracy w Astro Dev Server żądania są przekierowywane na `http://127.0.0.1:3107`; w Dockerze routing zapewnia Nginx. Sam statyczny frontend nie obsługuje poczty.

Przy pierwszym `npm install` powstanie pełny `package-lock.json` — dodaj go do repozytorium. Nie dodawaj `node_modules`, `dist` ani raportów Playwright.

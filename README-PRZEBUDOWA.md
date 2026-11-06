# Twój Stronnik — v26 (aktualna wersja)

**Nowość:** formularze kontaktowe obu podstron korzystają z `/api/contact`, obsługiwanego przez osobny serwer Node.js `contact-server/`. Kod wysyła zapytania przez SMTP na `kontakt@twojstronnik.pl` (Reply-To = adres klienta), waliduje dane, blokuje podstawowy spam i pokazuje status wysyłki. Konfiguracja wymaga działającej skrzynki w Outsiderze, hasła SMTP w prywatnym `.env`, uruchomienia serwera API i reguły Nginx.

Instrukcja: [`contact-server/README.md`](contact-server/README.md). Szczegóły: [`README-WERSJA-26.md`](README-WERSJA-26.md). **Samo wdrożenie plików statycznych nie uruchomi wysyłki.**

---

## Historia starszych wersji

# Twój Stronnik — v22

Zmiany względem v21:
- Sekcja **Wycena** na obu podstronach ma jasne tło i nie zawiera już dodatkowego panelu, ramki, bordera ani dekoracyjnego cienia. Nagłówek i opis są bezpośrednio na tle sekcji.
- Dwie oddzielne karty cenowe wyróżniają się ciemniejszym beżem (artyści) lub ciemniejszą szałwią (przewodnicy). Ceny i teksty pozostawiono bez zmian.
- Karty **Realizacje** mają w obu wersjach jednolity jasny kolor na całej powierzchni. Usunięto pionowy podział kolorystyczny między treścią a grafiką. Zachowano margines wokół grafik, oryginalne obrazy/logo i linki.
- Pozostałe elementy, w tym strona główna, nawigacja i funkcjonalności, nie zostały zmienione.

**Uruchomienie:** `cd frontend && npm install && npm run dev`.

**Uwaga:** formularz kontaktowy nadal wymaga podłączenia mechanizmu wysyłania wiadomości.

---

# Twój Stronnik — wersja v18

Zmiany względem v17:
- Strona startowa: usunięto numery 01 i 02 z dwóch kafelków nawigacyjnych.
- Obie podstrony: usunięto dekoracyjną gwiazdkę nad sześcioma kaflami funkcjonalności.
- Realizacje: każda karta ma lewą połowę z nazwą/kategorią/przyciskiem i prawą połowę z lokalną grafiką nazwy marki. Użyto **autorskich grafik typograficznych zastępczych**, ponieważ oryginalne logotypy witryn nie były dostępne do pobrania. Pliki pod `frontend/public/project-*.svg` można podmienić na właściwe logo bez ruszania układu.
- Trzy kroki: widoczne duże cyfry 1, 2, 3 zamiast małej numeracji 01, 02, 03 w kółkach.
- Usunięto tekst „W cenie otrzymujesz gotową stronę…” z obu cenników, bez zmiany cen.
- Pozostałe sekcje, treści i odnośniki bez zmian.

**Uruchamianie:** `cd frontend && npm install && npm run dev`.

**Uwaga:** formularz kontaktowy nie ma jeszcze skonfigurowanego wysyłania; strony prawne wymagają finalizacji przed publikacją.

---

# Twój Stronnik — wersja v17

**Zmiany względem v16 (tylko strona główna `/`):**

- Neutralna, jasna kolorystyka tła i paska nawigacji zamiast technologicznych gradientów.
- Kafel **„Strona dla artysty”** otrzymał kremowe tło, szeryfowy nagłówek, brązowe akcenty i autorską ilustrację oprawionych obrazów (`frontend/public/artist-gallery.svg`).
- Kafel **„Strona dla przewodnika”** nawiązuje do zielonej podstrony przewodnickiej i korzysta z tej samej górskiej ilustracji (`frontend/public/guide-mountains.svg`).
- Pozostawiono dokładnie te same teksty i linki w kaflach. Nie dodano nowych sekcji, sloganów ani stopki do strony głównej.
- Zachowano układ dwóch pól obok siebie na szerokich ekranach i dwóch pól jeden pod drugim na telefonach w pionie, z możliwie pełną wysokością ekranu.
- Motywy oraz treść podstron `/dla-artystow/` i `/dla-przewodnikow/` **nie zostały zmienione**.

**Uruchomienie:** wejdź do `frontend`, następnie `npm install` i `npm run dev`, otwórz `http://localhost:4321/`.

**Uwaga:** Formularze kontaktowe pozostają prezentacyjne, bez mechanizmu wysyłania. Przed publikacją trzeba je podłączyć i uzupełnić strony prawne. Zmiany CSS można weryfikować w Chromium; pełny `astro build` jest zależny od dostępności instalacji Astro.

---

# Twój Stronnik — wersja v16

**Zmiany wprowadzone względem wersji v15:**

- Usunięto przyciski „Chcę własną galerię” i „Chcę własną stronę” z sekcji **Wycena** na obu podstronach. Ceny, opisy oraz formularze kontaktowe pozostały.
- Podstrona `/dla-przewodnikow/` otrzymała osobny motyw `guide-theme`: jasne tło, zieleń lasu, piaskowe akcenty, górską ilustrację w hero, czytelne karty, nowe kolory cennika, formularza i nawigacji.
- Wygenerowany lokalnie plik `frontend/public/guide-mountains.svg` jest elementem dekoracyjnym projektu, bez zewnętrznego pobierania zdjęć.
- Strona główna, treści ofertowe i projektowa sekcja dla artystów pozostają bez zmian. Obie podstrony korzystają z tego samego układu Astro.

**Uruchomienie:** w `frontend` wykonaj `npm install` oraz `npm run dev`. Podgląd przewodników: `http://localhost:4321/dla-przewodnikow/`.

**Ważne:** formularz kontaktowy nadal nie wysyła wiadomości. Przed publikacją trzeba podłączyć obsługę formularza i uzupełnić treści prawne. Test wykonany na statycznym podglądzie aktualnego CSS w Chromium (szerokości 1440, 390 i 320 px). Pełny build Astro nie był uruchamiany.

---

# Historia poprzedniej wersji — v15

**Motyw dla artystów:** jasne kremowe tło, klasyczne nagłówki, spokojne karty i brązowe akcenty. Od tej wersji artyści zachowują własny `artist-theme`, a przewodnicy mają `guide-theme`.

---

# Twój Stronnik — przebudowa kierunku strony

Ta wersja zmienia główną ideę serwisu z ogólnej strony ofertowej na markę z dwiema wyraźnymi specjalizacjami:

- `/dla-artystow/` — galerie, portfolio, sprzedaż i zapytania o dzieła,
- `/dla-przewodnikow/` — wycieczki, trasy, cennik, prezentacja przewodnika i kontakt.

## Co zostało przebudowane

1. Strona główna stała się krótkim wejściem do dwóch ścieżek.
2. Dotychczasowy układ strony głównej — hero, zalety, realizacje, proces, wycena i kontakt — został wykorzystany jako baza dwóch nowych podstron.
3. Sekcje są wspólnymi komponentami Astro, ale każda podstrona ma osobny zestaw treści. Dzięki temu nie ma niepotrzebnego kopiowania kodu.
4. Nawigacja została przebudowana pod nową architekturę informacji.
5. Zachowane zostały podstrony prawne. Zrezygnowano z FAQ.
6. CSS kontynuuje ciemny, nowoczesny kierunek z poprzedniej wersji, ale dodaje wizualne rozróżnienie artystów i przewodników.

## Uruchomienie lokalne

Wejdź do katalogu `frontend` i uruchom:

```bash
npm install
npm run dev
```

Następnie otwórz:

`http://localhost:4321`

## Ważne przed publikacją

Formularz kontaktowy ma obecnie warstwę prezentacyjną i nie jest podłączony do backendu ani zewnętrznej usługi wysyłkowej. Finalny mechanizm kontaktowy najlepiej podpiąć po ustaleniu, z jakiej skrzynki i sposobu wysyłki ma korzystać `twojstronnik.pl`.

Treści polityki prywatności, cookies i regulaminu są celowo oznaczone do finalnego uzupełnienia przed publikacją.

## Korekta strony głównej
Strona główna jest teraz celowo minimalistyczna: zawiera nawigację marki oraz wyłącznie dwa duże kafle wyboru — „Dla artystów” i „Dla przewodników”. Sekcje realizacji, procesu, wyceny i kontaktu znajdują się dopiero na właściwych podstronach branżowych.

## Zmiany v5

- Usunięto z nawigacji hasło „strony szyte pod działalność”.
- Usunięto z ekranu startowego hasło „Twoja pasja zasługuje na własne miejsce w sieci”.
- Na telefonie w pionie ekran startowy jest podzielony na dwa równe kafle jeden pod drugim, przy zachowaniu pełnych tekstów i odnośników. Na wyjątkowo małych ekranach lub przy dużym powiększeniu przeglądarka może wymagać przewinięcia strony.


## Zmiany v6 — podstrona dla artystów

- Zmieniono nagłówek i opis w hero na komunikat o gotowej, uruchamianej dla klienta galerii.
- Zmieniono sekcję funkcjonalności na „Twoja własna galeria internetowa. Pełna możliwości.” i uproszczono jej opis zgodnie z ustalonym tekstem.
- Zmieniono etykietę „Strona dla twórcy” na „Strona dla artysty”.
- Nie wprowadzono zmian w stronie głównej ani w podstronie dla przewodników.


## Zmiany v7 — kafle funkcjonalności dla artystów

- Sekcja „Twoja własna galeria internetowa” ma teraz 6 kafelków (po 3 w rzędzie na dużych ekranach).
- Na pierwszym miejscu jest samodzielne dodawanie i edycja prac, z krótszym opisem.
- Dodano filtrowanie dzieł, szczegółowe prezentowanie prac (w tym własne tło zdjęcia), własne podstrony i powiadomienia e-mail.
- Dotychczasowy kafelek „Kontakt albo sprzedaż” pozostaje bez zmian.
- Pozostałe strony i sekcje zachowano bez zmian.

## Zmiany v8 — realizacje i sposób działania galerii

- W sekcji funkcji „Kontakt albo sprzedaż” doprecyzowano możliwość przejścia między trybem galerii i sklepu bez tworzenia nowej strony.
- Sekcja realizacji dla artystów otrzymała tytuł „Nasz projekt w internecie. Sprawdź sam, jak działa.” oraz nowy opis.
- Pozostawiono wyłącznie dwie realizacje: „Czas na obraz” i „Opowieści Kolorem”.
- W kartach realizacji pozostały tylko kategorie, tytuły i przyciski; opisy oraz tagi zostały usunięte.
- Kafelki mają układ dwóch kolumn na desktopie i jednej na mniejszych ekranach.
- Podstrona przewodników oraz strona główna pozostają bez zmian.

## Zmiany v9 — trzy kroki do własnej galerii

- Sekcja procesu na podstronie artystów otrzymała nagłówek „Trzy kroki do własnej galerii” i trzy nowe, uzgodnione treści: wybór gotowego rozwiązania, przekazanie podstawowych informacji i uruchomienie strony.
- W kafelku „Kontakt albo sprzedaż” usunięto myślnik między opisem zmiany profilu galerii i sklepu, zachowując ustalony sens.
- Pozostałe podstrony oraz strona główna pozostają bez zmian.

## Zmiany v10 — stała cena dla artystów

- Zastąpiono sekcję indywidualnej wyceny na podstronie artystów ofertą: 600 zł jednorazowo za uruchomienie i 50 zł miesięcznie za utrzymanie.
- Dodano dwa czytelne pola cenowe i krótki opis świadczeń.
- Dodano przycisk „Chcę własną galerię” prowadzący do istniejącej sekcji kontaktu (`#kontakt`).
- Zgodnie z ustaleniem pominięto informację o osobnym rozliczaniu rejestracji i odnowienia domeny.
- Podstrona przewodników oraz strona główna pozostały bez zmian.
- Formularz kontaktowy jest nadal wyłącznie prezentacyjny, bez skonfigurowanej wysyłki.

## Zmiany v11 — kontakt, podpis i FAQ

- Na podstronie artystów zmieniono nagłówek i treść sekcji kontaktowej na „Zainteresowała Cię nasza oferta?” z krótkim zaproszeniem do kontaktu.
- Usunięto z niej blok „Nie musisz mieć gotowego projektu”.
- Placeholder imienia i nazwiska to „Jan Kowalski”, a wiadomości na podstronie artystów — przykład zapytania o uruchomienie galerii.
- W stopce podpis praw autorskich to teraz „Marek Chajewski”, a nazwa marki pozostaje „Twój Stronnik”.
- Usunięto stronę FAQ oraz link w stopce (zmiana dotyczy obu ścieżek).
- Usunięto publicznie wyświetlany komunikat deweloperski spod formularza. Formularz nie ma jeszcze działającej wysyłki.

## Zmiany v12 — podstrona dla przewodników

- Zastąpiono ogólną ofertę projektowania stron komunikatem o gotowym produkcie dla przewodników.
- Sekcja możliwości przedstawia teraz sześć konkretnych funkcjonalności w układzie 3 × 2 na komputerach (na węższych ekranach kafelki układają się jeden pod drugim).
- Sekcja realizacji pokazuje jedną działającą stronę APS-Arek, bez opisów i tagów.
- Zmieniono proces na „Trzy kroki do własnej strony”.
- Zastąpiono indywidualną wycenę ceną 600 zł za uruchomienie i 50 zł miesięcznie; przycisk „Chcę własną stronę” prowadzi do kontaktu.
- Zmieniono opis sekcji kontaktu i przykładową wiadomość, usunięto uwagę o konieczności posiadania własnego projektu.
- Strona główna i podstrona artystów pozostają bez zmian. Formularz nadal wymaga podłączenia mechanizmu wysyłki.

## Zmiany v13 — doprecyzowanie oferty i realizacji

- Usunięto z hero obu ścieżek zdanie sugerujące indywidualne dopasowywanie gotowego produktu.
- W obu sekcjach procesu „Przekazujesz podstawowe informacje” zmieniono sformułowanie „danych kontaktowych” na „danych”.
- Na podstronie przewodników zastąpiono podpis realizacji APS-Arek tekstem „Przewodnik Sudecki”.
- Karta APS-Arek ma teraz taki sam rozmiar jak pojedyncza karta z sekcji artystów; na małych ekranach nadal zajmuje całą szerokość kolumny.
- W pierwszym kroku sekcji przewodników użyto naturalnego nagłówka „Sprawdzasz stronę w działaniu” i krótszego opisu.
- Pozostałe sekcje oraz strona główna pozostają bez zmian.


## Aktualizacja v14 — nawigacja

- Link „Kontakt” w menu obu podstron korzysta z identycznej klasy/stylu i efektu podkreślenia jak pozostałe pozycje.
- Usunięto oddzielne reguły CSS wyróżniające link „Kontakt”.
- Pozostałe widoki i treści nie zostały zmienione.


Wersja v19: podmieniono grafiki realizacji na przesłane obrazy/logo oraz zmniejszono ramki po prawej stronie kart realizacji.


## Wersja v20 — nawigacja i mobilne grafiki

- Na podstronach (szerokość do 900 px) menu zwija się do przycisku burgera. Menu obsługuje kliknięcie, Escape oraz zamknięcie po wybraniu linku.
- Pasek nawigacji przy przewijaniu w dół chowa się, a przy pierwszym przewinięciu w górę natychmiast wraca.
- Na stronie głównej na telefonach do 760 px nawigacja jest całkowicie ukryta; pozostają dwa kafelki wyboru.
- Podglądy prac i logo na kartach realizacji zachowują proporcje w widoku mobilnym i desktopowym.


## Wersja v21 — naprzemienne tła sekcji

Na podstronie dla artystów sekcje układają się naprzemiennie na tle w kolorze jasnej kości słoniowej i ciepłego beżu. Na podstronie dla przewodników naprzemiennie stosowana jest leśna zieleń i jasna szałwia. Karty, treści i nawigacja pozostają bez zmian.


## Aktualizacja v23 — identyfikacja marki

- W głównym pasku nawigacji zastąpiono tekstowy kwadrat TS wybranym zielonym logo.
- Zachowano tekst „Twój Stronnik” obok znaku oraz istniejące zachowanie menu mobilnego.
- Znak zapisano lokalnie w `frontend/public/logo-ts.png`; dodano `favicon.png` i `apple-touch-icon.png`.
- Na stronie głównej na telefonie pasek nawigacji pozostaje ukryty, zgodnie z wcześniejszym projektem.


## Wersja v24 — dokumenty prawne (6.11.2026)

- Zastąpiono teksty tymczasowe na `/polityka-prywatnosci/`, `/polityka-cookies/`, `/regulamin/` pełnymi treściami.
- Dodano jasny, dostępny wizualnie styl dokumentów oraz właściwe linki w stopce.
- Zmieniono nawigację na podstronach prawnych, aby nie kierowała do nieistniejących kotwic na stronie głównej.
- Dokumenty zawierają dane: Marek Chajewski, ul. Męcińskiego 9/2, 53-209 Wrocław, kontakt@twojstronnik.pl.
- W regulaminie zastosowano proponowany model abonamentu bez minimalnego okresu: wypowiedzenie ze skutkiem na koniec opłaconego miesiąca. Przed publicznym wdrożeniem należy upewnić się, że odpowiada to faktycznym warunkom sprzedaży.
- **Uwaga wdrożeniowa**: formularz w tym projekcie nadal ma `action="#"` i nie wysyła e-maili. Dokumenty opisują kontakt przez e-mail i ewentualny działający formularz; przed publikacją formularz wymaga konfiguracji.
- **Uwaga wdrożeniowa**: polityka cookies odpowiada obecnemu kodowi strony bez trackerów, jednak faktyczne cookies z hostingu/Cloudflare należy sprawdzić po wdrożeniu.
- Przy rozpoczęciu utrzymywania stron klientów i obsługi danych ich odbiorców może być konieczna umowa powierzenia danych (art. 28 RODO).


## Wersja v25 — dokumenty umowne i rezygnacja (6.11.2026)

- Regulamin: domena jest rejestrowana i opłacana bezpośrednio przez klienta; Twój Stronnik wykonuje techniczne podłączenie domeny. Cena domeny nie jest zawarta w abonamencie.
- Regulamin: doprecyzowano rezygnację na koniec opłaconego miesiąca, dostęp do strony, eksport własnych materiałów w terminie zwykle 14 dni od zgłoszenia oraz usuwanie danych po 30 dniach z wyjątkami ustawowymi.
- Nie dodawano szczegółowego harmonogramu wykonywania kopii zapasowych do regulaminu.
- Polityka prywatności: usunięto wzmiankę o prywatnej skrzynce, Gmailu i przekierowaniu poczty. Pozostała zgodna z RODO ogólna kategoria odbiorców: operatorzy poczty i infrastruktury.
- Dodano stronę `/odstapienie-od-umowy/` z gotowym do uzupełnienia przez klienta wzorem oświadczenia, w stopce link do tego formularza.
- Dodano stronę `/powierzenie-danych/` zawierającą wzór umowy powierzenia przetwarzania danych osobowych na podstawie art. 28 RODO; link z regulaminu i polityki prywatności. Ten dokument wymaga odrębnego elektronicznego lub pisemnego przyjęcia przez klienta; sama publikacja nie zawiera umowy.
- Zmieniono mobilną i desktopową nawigację tak, by na obu nowych podstronach wyświetlała odpowiednie linki.
- **Istotne ograniczenie prawne:** nie dodano numeru telefonu zgodnie z życzeniem użytkownika, ale art. 12 ust. 1 pkt 3 ustawy o prawach konsumenta wymaga numeru telefonu do szybkiego kontaktu przy umowach konsumenckich zawieranych na odległość. Przed rozpoczęciem sprzedaży konsumentom należy rozwiązać tę kwestię, np. osobnym numerem służbowym.
- **Istotne ograniczenie organizacyjne:** przed zawarciem każdej umowy powierzenia należy przekazać rzeczywistą informację o podwykonawcach i lokalizacji danych; zapewnić realne stosowanie zadeklarowanych zabezpieczeń, eksportu, retencji i reakcji na zgłoszenia. W razie zmian podwykonawców należy postępować zgodnie z § 5 umowy powierzenia.
- **Inne:** produkcyjny formularz kontaktowy nadal wymaga podłączenia, cookies należy sprawdzić na docelowej infrastrukturze. Pełny build Astro zależy od instalacji node_modules.

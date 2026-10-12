# Contacts App — projekt referencyjny L06

Demo live-coding: **lista kontaktów** z pomiarem renderów, memoizacją, testami komponentów, dostępnością i buildem produkcyjnym.

Temat celowo inny niż lab 06 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
```

## Testy

```bash
npm run test       # tryb obserwowania (Vitest)
npm run test:run   # jednorazowo, 13 testów w czterech plikach
```

## Build produkcyjny

```bash
npm run build
npm run start
```

## Pliki i slajdy

| Plik | Slajd | Opis |
|------|-------|------|
| `lib/contacts.js` | 01 | Dane początkowe i czysta funkcja `filterContacts` |
| `components/SearchBar.jsx` | 01 | Pole wyszukiwania (pole kontrolowane) |
| `components/AddContactForm.jsx` | 01, 11 | Formularz z walidacją; przedmiot testów na slajdzie 11 |
| `components/ContactItem.jsx` | 01, 03, 09 | Wiersz kontaktu: wersja startowa, `memo`, `aria-label` |
| `components/ContactList.jsx` | 01, 05, 12 | Lista: wersja startowa, `memo`, `aria-label` |
| `components/ContactStats.jsx` | 01, 05, 12 | Statystyka kategorii: wersja startowa, `memo`, `aria-label` |
| `app/page.jsx` | 01, 04, 06, 12, 13 | Strona: stan, `useCallback`, `useMemo`, `aria-label` na `<main>`, nagłówek ze zmiennej środowiskowej |
| `app/layout.jsx`, `app/globals.css` | 01 | Layout z `lang="pl"` i pusty CSS |
| `next.config.mjs` | 07 | Pusta konfiguracja (wersja z `reactCompiler: true` tylko na pokaz) |
| `vitest.config.js`, `vitest.setup.js` | 08 | Konfiguracja Vitesta, jsdom i `jest-dom` |
| `__tests__/ContactItem.test.jsx` | 09 | Trzy testy wiersza (render, nazwa przycisku, atrapa `onDelete`) |
| `__tests__/ContactList.test.jsx` | 10, 12 | Dwa testy listy i test etykiety listy |
| `__tests__/SearchBar.test.jsx` | 10 | Trzy testy wyszukiwarki |
| `__tests__/AddContactForm.test.jsx` | 11 | Cztery testy formularza |

Slajd 02 (pomiar) i 13 (build, wdrożenie) nie dodają plików poza `.env.local` (poza repozytorium, `NEXT_PUBLIC_APP_NAME=Contacts`).

## Zgodność ze slajdami

Pliki są kodem ze slajdów w stanie końcowym; kontrola mechaniczna porównała bloki kodu ze slajdów 01–13 z plikami projektu.
Bloki pośrednie powstają etapami i różnią się od plików tak:

- `app/page.jsx` ma końcowy zestaw zmian: wersja ze slajdu 06 plus `aria-label` na `<main>` (slajd 12) i nagłówek `process.env.NEXT_PUBLIC_APP_NAME || 'Kontakty'` (slajd 13).
  Komentarze przy `useCallback` ze slajdu 04 zniknęły już na slajdzie 06, więc plik ich nie ma.
- Pliki `ContactItem`, `ContactList` i `ContactStats` łączą `memo` (slajdy 03 i 05) z nazwami dostępnymi (slajdy 09 i 12).
- Bloki ze slajdów 02 (`console.log`, pętla spowalniająca) i 07 (`reactCompiler: true`) są tymczasowe; projekt zawiera wersję po sprzątaniu.
- Pierwszy wiersz bloków z nazwą pliku w komentarzu (na przykład `// app/layout.jsx`) służy tylko do wskazania pliku i nie występuje w projekcie.
- Zestaw testów (13) i kolejne wyniki `npm run test:run` na slajdach 08–12: 1, 3, 5, 8, 9, 10, 12, 13 zaliczonych.

## Struktura

```
app/           # Next.js App Router
components/    # ContactItem, ContactList, SearchBar, AddContactForm, ContactStats
lib/           # contacts.js — dane i czyste funkcje
__tests__/     # testy Testing Library + Vitest
```

Kolejność kroków i czasy: `../PROWADZACY.md` (120 min).

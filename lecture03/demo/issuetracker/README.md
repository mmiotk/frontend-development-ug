# Issue Tracker — Demo L03

Projekt referencyjny do wykładu 03 kursu Frontend Development (React 19 + Next.js 16). Stan końcowy demo na 90 minut:
11 plików i 192 linie w `app/`. Aplikacja pokazuje routing w App Routerze (layouty, linki, trasa dynamiczna, `loading.jsx`,
`error.jsx`), dane w module oraz dwa formularze zgłoszenia: `<form action>` z `useActionState` i Zod oraz React Hook Form.

## Uruchomienie

```bash
npm install
npm run dev   # http://localhost:3000
```

Wszystkie dane i napisy interfejsu są po angielsku, komentarze w kodzie po polsku. Kod `app/` to stan końcowy ze slajdów
(`../../slides/`); wersje pośrednie (L0, L2, P1, P3, I4, F7, F8) stoją w scenariuszu `../PROWADZACY.md`. Plik `package.json`
ma od początku wszystkie zależności (`zod`, `react-hook-form`, `@hookform/resolvers`); na wykładzie są zainstalowane przed zajęciami.
Dane (`app/data/issues.js`) także są gotowe przed wykładem.

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Lista zgłoszeń (komponent kliencki, czyta ze store) |
| `/issue/[id]` | `app/issue/[id]/page.jsx` | Szczegóły zgłoszenia (komponent serwerowy, czeka 0,8 s) |
| `/new` | `app/new/page.jsx` | Formularz: `<form action>` + `useActionState` + Zod |
| `/new-rhf` | `app/new-rhf/page.jsx` | Formularz: React Hook Form + Zod |

## Mapa: slajd → plik

Kolejność i czasy: `../PROWADZACY.md` (90 min). Kod każdego kroku jest też na slajdach `../../slides/`.

| Krok | Slajd | Temat | Plik w `app/` |
|------|-------|-------|---------------|
| 1.1 | 01 | Dane i layout bez nawigacji (gotowe przed wykładem) | `data/issues.js`, `layout.jsx` (L0) |
| 1.2 | 01 | Statyczna lista | `page.jsx` (P1) |
| 2.1 | 02 | Nawigacja `Issues \| New` | `layout.jsx` (L2) |
| 2.2 | 02 | Layout zagnieżdżony | `issue/layout.jsx` |
| 3.1 | 03 | Linki do zgłoszeń | `page.jsx` (P3) |
| 3.2 | 03 | Pobieranie z wyprzedzeniem (tylko slajd) | bez zmian w projekcie |
| 4.1 | 04 | Trasa dynamiczna i `notFound()` | `issue/[id]/page.jsx` (I4) |
| 5.1 | 05 | „Przed”: opóźnienie 0,8 s | `issue/[id]/page.jsx` (wersja końcowa) |
| 5.2 | 05 | Ekran ładowania | `issue/[id]/loading.jsx` |
| 5.3 | 05 | Ekran błędu | `issue/[id]/error.jsx` |
| 6.1 | 06 | Magazyn w module | `lib/store.js` |
| 6.2 | 06 | Lista czyta magazyn | `page.jsx` (wersja końcowa) |
| 7.1–7.2 | 07 | `<form action>` i `FormData` | `new/page.jsx` (F7) |
| 8.1 | 08 | `useActionState` | `new/page.jsx` (F8) |
| 9.1 | 09 | `useFormStatus` i `SubmitButton` (tylko slajd) | bez zmian w projekcie |
| 10.1 | 10 | Schemat Zod | `lib/schema.js` |
| 10.2 | 10 | Walidacja w akcji | `new/page.jsx` (wersja końcowa) |
| 11.1 | 11 | React Hook Form + Zod | `new-rhf/page.jsx` |
| 11.2 | 11 | Trzeci link w nawigacji | `layout.jsx` (wersja końcowa) |
| 12.1 | 12 | Formik i TanStack Form (tylko slajd) | bez zmian w projekcie |
| 13.1 | 13 | Wybór podejścia | bez zmian w projekcie |

## Wersje

Wersje pośrednie nie leżą w katalogu; każda powstaje z wersji końcowej przez zmiany opisane w scenariuszu:

| Wersja | Plik | Czym różni się od końcowej |
|--------|------|----------------------------|
| L0 | `layout.jsx` | sama powłoka HTML, bez nawigacji i `metadata` |
| L2 | `layout.jsx` | nawigacja `Issues \| New`, bez linku `New (RHF)` |
| P1 | `page.jsx` | statyczna lista z `initialIssues`, bez linków |
| P3 | `page.jsx` | linki do zgłoszeń, nadal `initialIssues` |
| I4 | `issue/[id]/page.jsx` | bez linii z opóźnieniem 0,8 s |
| F7 | `new/page.jsx` | `<form action>`, `router.push`, bez `useActionState` |
| F8 | `new/page.jsx` | `useActionState` i ręczny `if`, bez Zod |

## Uwagi

- `app/lib/store.js` to demo store (moduł JS ze zmiennymi na poziomie modułu); dane resetują się po przeładowaniu strony.
  Prawdziwa persystencja: wykład 05.
- Trasa `/issue/[id]` odczytuje tylko `initialIssues` (dane statyczne); nowo dodane zgłoszenia widać wyłącznie na liście `/`
  (komponent kliencki z dostępem do store), a klik w nie kończy się widokiem 404.
- Brak stylowania (`className`, CSS) i brak `app/globals.css`. Brak też `app/favicon.ico` i `public/` z kreatora.
  `.gitignore`, `jsconfig.json` i `next.config.mjs` są kopią plików z `create-next-app@16.4.0`.
- Demo nie ma celowo zepsutego kodu. Wersje „przed” (opóźnienie bez `loading.jsx`, formularz bez wyniku) działają poprawnie,
  tylko gorzej. Pomiary: `../POMIARY.md`, sekcja „Demo 90 min (2026-11-08)”.

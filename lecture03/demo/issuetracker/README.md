# Issue Tracker — Demo L03

Projekt referencyjny do wykładu 03 kursu Frontend Development (React 19 + Next.js 16).

## Uruchomienie

```bash
npm install
npm run dev   # http://localhost:3000
```

Wszystkie dane i napisy interfejsu są po angielsku, komentarze w kodzie po polsku. Kod jest identyczny z kodem slajdów
(`../../slides/`): projekt odtworzony wyłącznie ze slajdów 01→13 ma w `app/` ten sam kod co ten katalog (sprawdzenie w
`../POMIARY.md`, sekcja „Test odtworzenia”). Plik `package.json` ma od początku wszystkie zależności; na slajdach
instalacja Zod i React Hook Form jest dopiero w slajdach 10 i 11.

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Lista zgłoszeń (Client Component, czyta ze store) |
| `/issue/[id]` | `app/issue/[id]/page.jsx` | Szczegóły zgłoszenia (Server Component) |
| `/new` | `app/new/page.jsx` | Formularz: React 19 Actions + useActionState + Zod |
| `/new-rhf` | `app/new-rhf/page.jsx` | Formularz: React Hook Form + Zod |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (120 min, segment = slajd); kod każdego etapu jest też na slajdach `../../slides/`.

| Etap | Slajd | Temat | Kluczowe pliki |
|------|-------|-------|----------------|
| 1 | 01 | Projekt + statyczny szkielet | `app/data/issues.js`, `app/layout.jsx`, `app/page.jsx` |
| 2 | 02 | Układy | `app/layout.jsx`, `app/issue/layout.jsx` |
| 3 | 03 | Linki, prefetch | `app/page.jsx` |
| 4 | 04 | Trasa `/issue/[id]` | `app/issue/[id]/page.jsx` |
| 5 | 05 | `loading` + `error` | `app/issue/[id]/loading.jsx`, `error.jsx`, `page.jsx` |
| 6 | 06 | Dane w module | `app/lib/store.js`, `app/page.jsx` |
| 7 | 07 | `<form action>` | `app/new/page.jsx` |
| 8 | 08 | `useActionState` | `app/new/page.jsx` |
| 9 | 09 | `useFormStatus` | `app/components/SubmitButton.jsx`, `app/new/page.jsx` |
| 10 | 10 | Walidacja Zod | `app/lib/schema.js`, `app/new/page.jsx` |
| 11 | 11 | React Hook Form + Zod | `app/new-rhf/page.jsx`, `app/layout.jsx` |
| — | 12–13 | Formik i TanStack Form, wybór podejścia | bez zmian w projekcie |

## Uwagi

- `app/lib/store.js` — demo store (moduł JS z tablicą mutowalną);
  dane resetują się po przeładowaniu strony. Prawdziwa persystencja: wykład 05.
- Trasa `/issue/[id]` odczytuje tylko `initialIssues` (dane statyczne);
  nowo dodane zgłoszenia widać wyłącznie na liście `/` (Client Component z dostępem do store).
- Brak stylowania (`className`, CSS) — celowe; skupiamy się na logice.
- Katalog nie zawiera artefaktów kreatora, których nie zmieniono: `app/favicon.ico` i `public/`.
  `.gitignore`, `jsconfig.json` i `next.config.mjs` są kopią plików z `create-next-app@16.4.0`.
- Demo nie ma celowo zepsutego kodu; zachowania opisane na slajdach prozą (np. brak `await` przy `params`)
  potwierdza `../POMIARY.md`.

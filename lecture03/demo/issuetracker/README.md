# Issue Tracker — Demo L03

Projekt referencyjny do wykładu 03 kursu Frontend Development (React 19 + Next.js 16).

## Uruchomienie

```bash
npm install
npm run dev   # http://localhost:3000
```

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Lista zgłoszeń (Client Component, czyta ze store) |
| `/issue/[id]` | `app/issue/[id]/page.jsx` | Szczegóły zgłoszenia (Server Component) |
| `/new` | `app/new/page.jsx` | Formularz: React 19 Actions + useActionState + Zod |
| `/new-rhf` | `app/new-rhf/page.jsx` | Formularz: React Hook Form + Zod |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (120 min); kod każdego etapu jest też na slajdach `../../slides_nowe/`.

| Etap | Slajd | Temat | Kluczowe pliki |
|------|-------|-------|----------------|
| 0 | 01 | Projekt + statyczny szkielet | `app/data/issues.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | 02–03 | Układy i linki, prefetch | `app/layout.jsx`, `app/issue/layout.jsx`, `app/page.jsx` |
| 2 | 04–05 | Trasa `/issue/[id]` + `loading` + `error` | `app/issue/[id]/page.jsx`, `loading.jsx`, `error.jsx` |
| 3 | 06–07 | Dane w module + `<form action>` | `app/lib/store.js`, `app/page.jsx`, `app/new/page.jsx` |
| 4 | 08 | `useActionState` | `app/new/page.jsx` |
| 5 | 09 | `useFormStatus` | `app/components/SubmitButton.jsx` |
| 6 | 10 | Walidacja Zod | `app/lib/schema.js`, `app/new/page.jsx` |
| 7 | 11–13 | React Hook Form + Zod, wybór podejścia | `app/new-rhf/page.jsx`, `app/layout.jsx` |

## Uwagi

- `app/lib/store.js` — demo store (moduł JS z tablicą mutowalną);
  dane resetują się po przeładowaniu strony. Prawdziwa persystencja: wykład 05.
- Trasa `/issue/[id]` odczytuje tylko `initialIssues` (dane statyczne);
  nowo dodane zgłoszenia widać wyłącznie na liście `/` (Client Component z dostępem do store).
- Brak stylowania (`className`, CSS) — celowe; skupiamy się na logice.

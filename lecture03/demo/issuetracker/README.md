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

| Etap | Temat | Kluczowe pliki |
|------|-------|----------------|
| 0 | Setup + statyczny szkielet | `app/data/issues.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | Zagnieżdżone layouty + nawigacja | `app/layout.jsx`, `app/issue/layout.jsx` |
| 2 | Trasa `/issue/[id]` + `loading` + `error` | `app/issue/[id]/page.jsx`, `loading.jsx`, `error.jsx` |
| 3 | `<form action>` + FormData + store | `app/new/page.jsx`, `app/lib/store.js` |
| 4 | `useActionState` | `app/new/page.jsx` |
| 5 | `useFormStatus` | `app/components/SubmitButton.jsx` |
| 6 | Walidacja Zod | `app/lib/schema.js`, `app/new/page.jsx` |
| 7 | React Hook Form + Zod | `app/new-rhf/page.jsx` |

## Uwagi

- `app/lib/store.js` — demo store (moduł JS z tablicą mutowalną);
  dane resetują się po przeładowaniu strony. Prawdziwa persystencja: wykład 05.
- Trasa `/issue/[id]` odczytuje tylko `initialIssues` (dane statyczne);
  nowo dodane zgłoszenia widać wyłącznie na liście `/` (Client Component z dostępem do store).
- Brak stylowania (`className`, CSS) — celowe; skupiamy się na logice.

# Articles Viewer — projekt referencyjny L05

Gotowa wersja aplikacji budowanej na żywo podczas Wykładu 05.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz `http://localhost:3000`.

## Wymagana zmienna środowiskowa (opcjonalnie)

Domyślnie `BASE_URL=http://localhost:3000`. Aby zmienić port:

```bash
BASE_URL=http://localhost:3001 npm run dev
```

Lub utwórz `.env.local`:

```
BASE_URL=http://localhost:3000
```

## Trasy

| Trasa | Opis | Typ |
|-------|------|-----|
| `/` | lista artykułów | Server Component + fetch |
| `/articles/[id]` | szczegóły artykułu | Server Component + import store |
| `/suspend` | demo `use()` + Suspense | Server + Client Component |
| `/new` | formularz dodawania (Server Action) | Client Component |
| `/swr-demo` | lista przez SWR | Client Component |
| `/api/articles` | GET lista, POST nowy | Route Handler |
| `/api/articles/[id]` | GET jeden artykuł | Route Handler |

## Dane

`lib/store.js` — in-memory store, działa offline, zeruje się przy restarcie serwera dev.

## Zależności

- `next ^16.3` (`retry` w `app/error.jsx`), `react ^19`, `react-dom ^19`
- `swr ^2.3` — klienckie pobieranie danych
- `zod ^3.22` — walidacja schematu w Server Action

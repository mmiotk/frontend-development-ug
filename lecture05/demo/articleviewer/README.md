# Articles Viewer — projekt referencyjny L05

Demo live-coding: **przeglądarka artykułów** (własne API, lista pobierana na serwerze, formularz z Server Action, strona z SWR).

Temat celowo inny niż lab 05 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
```

Domyślnie `BASE_URL=http://localhost:3000`. Przy innym porcie `BASE_URL` musi wskazywać ten sam port co serwer:

```bash
BASE_URL=http://localhost:3001 npm run dev -- --port 3001
```

## Trasy

| Trasa | Plik | Slajd | Opis |
|-------|------|-------|------|
| `/` | `app/page.jsx` | 03 | Komponent serwerowy `async`, lista przez `fetch` do własnego API |
| `/articles/[id]` | `app/articles/[id]/page.jsx` | 04 | Komponent serwerowy, odczyt wprost z `lib/store.js` |
| `/suspend` | `app/suspend/` | 05 | Promise z serwera odczytywany w komponencie klienckim przez `use` |
| `/new` | `app/new/page.jsx` | 07 | Formularz z `useActionState` i Server Action |
| `/swr-demo` | `app/swr-demo/page.jsx` | 11 | Lista pobierana w przeglądarce przez SWR |
| `/api/articles` | `app/api/articles/route.js` | 02 | Route Handler: `GET` lista, `POST` nowy artykuł |
| `/api/articles/[id]` | `app/api/articles/[id]/route.js` | 02 | Route Handler: `GET` jeden artykuł |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (120 min); kod każdego etapu jest też na slajdach `../../slides/`.
Projekt zawiera stan końcowy (po kroku 6.3), pliki pośrednie powstają na zajęciach.

| Etap | Slajd | Temat | Kluczowe pliki |
|------|-------|-------|----------------|
| 0 | 01 | Projekt i magazyn artykułów | `lib/store.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | 02 | Route Handler | `app/api/articles/route.js`, `app/api/articles/[id]/route.js` |
| 2 | 03–04 | Strona `async`, `loading`, `error`, strona artykułu | `app/layout.jsx`, `app/page.jsx`, `app/loading.jsx`, `app/error.jsx`, `app/articles/[id]/` |
| 3 | 05 | Promise z serwera i `use` | `app/suspend/ArticleListClient.jsx`, `app/suspend/page.jsx` |
| 4 | 06 | Pamięć podręczna `fetch` | `app/page.jsx` (doświadczenie z `force-cache`, potem `revalidate: 60` z `connection()`) |
| 5 | 07–10 | Server Action, walidacja, rewalidacja, przekierowanie | `lib/validate.js`, `lib/actions.js`, `app/new/page.jsx` |
| 6 | 11–12 | SWR (TanStack Query tylko na slajdzie) | `app/swr-demo/page.jsx` |

## Zgodność ze slajdami

Pliki są kodem ze slajdów w stanie końcowym; kontrola mechaniczna porównała bloki kodu ze slajdów 01–12 z plikami projektu
i nie znalazła rozbieżności. Bloki pośrednie różnią się od plików tym, że powstają etapami:

- `app/page.jsx` i `app/layout.jsx` w slajdzie 01 są wersjami minimalnymi; wersje końcowe stoją na slajdzie 03.
- `lib/actions.js` w slajdzie 07 kończy się `return { success: true }`; wersja końcowa z `redirect` stoi na slajdzie 10.
- `app/swr-demo/page.jsx` w slajdzie 11 ma trzy wersje (`useSWR`, z `refreshInterval`, z `mutate`); projekt zawiera ostatnią.

Slajd 12 (TanStack Query) jest fragmentem poglądowym: biblioteki nie ma w `package.json`.

## Uwagi

- Dane: `lib/store.js`, magazyn w pamięci procesu na `globalThis`; działa offline, zeruje się przy restarcie serwera.
- Po `next build` stronę `/` oznacza `ƒ`, czyli renderowaną przy każdym żądaniu, bo `HomePage` wywołuje `await connection()`; build nie wymaga więc działającego serwera. Odpowiedź `/api/articles` żyje w pamięci `fetch` 60 s (`next: { revalidate: 60 }`): artykuł dodany przez `POST /api/articles` pojawia się na `/` dopiero po wygaśnięciu wpisu, a dodany formularzem `/new` od razu, dzięki `revalidatePath("/")` w akcji.
- Wersje przypięte w `package.json`: Next.js 16.4.0 (`retry` w `app/error.jsx`), React 19.3.0, SWR 2.5.1, Zod 3.25.76; Node.js >= 20.9.

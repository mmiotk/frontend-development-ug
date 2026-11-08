# Articles Viewer — projekt referencyjny L05

Demo live-coding: **przeglądarka artykułów**. Własne API (Route Handler), lista pobierana na serwerze z pamięcią `fetch`,
strona z `use` i `Suspense`, formularz z Server Action, walidacją, `revalidatePath` i `redirect`. Artykuł ma pola `id`, `title` i `body`.

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

Pamięć `fetch` w `next dev` leży w `.next/dev/cache/fetch-cache` i przeżywa restart serwera, a magazyn artykułów nie. Gdy po restarcie
lista pokazuje artykuły, których magazyn nie ma, usunąć katalog `.next`.

## Trasy

| Trasa | Plik | Slajd | Opis |
|-------|------|-------|------|
| `/` | `app/page.jsx` | 03, 06 | Komponent serwerowy `async`, lista przez `fetch` do własnego API, odpowiedź zapamiętana na 60 s |
| `/articles/[id]` | `app/articles/[id]/page.jsx` | 04 | Komponent serwerowy, odczyt wprost z `lib/store.js`, `notFound()` |
| `/suspend` | `app/suspend/` | 05 | Promise z serwera odczytywany w komponencie klienckim przez `use` |
| `/new` | `app/new/page.jsx` | 07, 10 | Formularz z `useActionState` i Server Action |
| `/api/articles` | `app/api/articles/route.js` | 02 | Route Handler: `GET` lista (po 1 s), `POST` nowy artykuł |

## Mapa slajd → plik

| Slajd | Temat | Pliki |
|-------|-------|-------|
| 01 | Projekt i magazyn artykułów | `lib/store.js`, `app/layout.jsx` |
| 02 | Route Handler | `app/api/articles/route.js` |
| 03 | Komponent `async` z `fetch` | `app/page.jsx` |
| 04 | `loading.jsx`, `error.jsx`, strona artykułu | `app/loading.jsx`, `app/error.jsx`, `app/articles/[id]/page.jsx` |
| 05 | Promise z serwera i `use` | `app/suspend/ArticleList.jsx`, `app/suspend/page.jsx` |
| 06 | Pamięć `fetch` | `app/page.jsx` (`connection()` i `next: { revalidate: 60 }`) |
| 07 | Server Action i formularz | `lib/validate.js`, `lib/actions.js`, `app/new/page.jsx` |
| 08 | Bezpieczeństwo zapisu | `lib/actions.js` (walidacja w akcji) |
| 09 | `revalidatePath` | `lib/actions.js` |
| 10 | `redirect` | `lib/actions.js`, `app/new/page.jsx` |
| 11–12 | SWR i TanStack Query | przykłady na slajdach, poza projektem |

## Wersje kodu

Projekt zawiera stan końcowy: 12 plików i 195 linii w `app/` i `lib/`. Kilka plików powstaje etapami, więc bloki na slajdach bywają wcześniejsze:

- `app/page.jsx` ma na slajdzie 03 `cache: "no-store"`; wersja końcowa (slajd 06) dodaje `connection()` i `next: { revalidate: 60 }`.
- `lib/actions.js` na slajdzie 07 kończy się `return { success: true }`; slajd 09 dodaje `revalidatePath("/")`, a slajd 10 zastępuje `return` przez `redirect("/")`.
- `app/new/page.jsx` na slajdzie 07 ma linię `{state?.success && <p>Article saved.</p>}`; po dodaniu `redirect` jej nie ma.

Slajdy 11–12 (SWR, TanStack Query) pokazują kod spoza projektu: tych bibliotek nie ma w `package.json`.

## Uwagi

- Dane: `lib/store.js`, magazyn w pamięci procesu na `globalThis`; startuje z dwoma artykułami, działa offline, zeruje się przy restarcie serwera.
- `GET /api/articles` czeka 1 s (udawana wolna baza), dzięki czemu widać `loading.jsx`, `Suspense` i korzyść z pamięci `fetch`.
- Strona `/` wywołuje `await connection()`, więc jest renderowana przy każdym żądaniu, a `next build` nie wymaga działającego serwera. Odpowiedź API żyje w pamięci `fetch` 60 s: artykuł dodany przez `POST /api/articles` pojawia się na `/` dopiero po wygaśnięciu wpisu, a dodany formularzem `/new` od razu, dzięki `revalidatePath("/")` w akcji.
- Wersje przypięte w `package.json`: Next.js 16.4.0 (`retry` w `app/error.jsx`), React 19.3.0, Zod 3.25.76; Node.js >= 20.9.

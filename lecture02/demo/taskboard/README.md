# Task Board — Demo Wykład 02

Projekt referencyjny do wykładu 02 (React 19 + Next.js 16).
Temat: Task Board (lista zadań) — **inny niż lab 02 (Pokédex)**.

## Jak uruchomić

```bash
npm install
npm run dev
# http://localhost:3000
```

## Struktura

```
app/
  layout.jsx              — root layout (html + body, bez stylowania)
  page.jsx                — Server Component: punkt wejścia, przekazuje dane
  globals.css             — domyślny, nie modyfikowany
  data/
    initialTasks.js       — statyczne dane startowe (bez fetch)
  components/
    TaskBoard.jsx         — główny Client Component (wersja końcowa)
  hooks/
    useLocalStorage.js    — własny hook: persystencja w localStorage
    useTasks.js           — własny hook: cała logika zadań (CRUD, filtr, liczniki)
```

## Pojęcia i pliki

| Etap | Pojęcie | Plik |
|------|---------|------|
| 1 | `useState` (CRUD, formularz kontrolowany) | `TaskBoard.jsx` |
| 2 | `useEffect` (tytuł, localStorage, cleanup) | `TaskBoard.jsx` |
| 3 | `useRef` (focus, licznik bez re-renderu) | `TaskBoard.jsx` |
| 4 | filtr i liczniki jako wartości pochodne | `TaskBoard.jsx` |
| 5 | własne hooki | `hooks/useLocalStorage.js`, `hooks/useTasks.js` |
| 6 | reguły hooków (przycisk „Clear done” → `clearDone`) | `hooks/useTasks.js`, `TaskBoard.jsx` |

## Uwagi

- Brak CSS: zero `className`, zero `style={{}}` — demonstracja logiki, nie wyglądu.
- Kod po angielsku; treść UI (teksty zadań) po polsku.
- `node_modules` i `.next` są w `.gitignore`.

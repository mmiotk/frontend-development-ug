# Rozszerzenia do slajdu 02: Ramka, która zostaje na miejscu przy nawigacji

Powrót: [`slide_02_layouty.md`](../slide_02_layouty.md)

## Rozszerzenie: tytuł karty składany przez layout

Metadane Next.js scala od korzenia w dół, a wartość bliższa strony wygrywa. Layout może jednak zamiast nadpisywanego tytułu podać **wzór tytułu** (`title.template`), do którego strony poniżej wstawią swój tytuł. Dokumentacja `generateMetadata` opisuje jego działanie.

> **„`title.template` służy do dodania przedrostka albo przyrostka do tytułów zdefiniowanych w podrzędnych segmentach trasy.”**
>
> *„`title.template` can be used to add a prefix or a suffix to `titles` defined in **child** route segments.”*
>
> — dokumentacja Next.js, *generateMetadata*

Przykład spoza demo pokazuje oba pola:

```jsx
// Przykład spoza demo: szablon tytułu w app/issue/layout.jsx
export const metadata = { title: { template: "%s | Issues", default: "Issues" } };

// a w app/issue/new/page.jsx strona podaje tylko swój człon:
export const metadata = { title: "New" };
```

Strona `/issue/new` dostaje tytuł karty „New | Issues”, bo `%s` zastępuje tytuł strony. Strona `/issue/2` nie ustawia tytułu, więc dostaje wartość z pola `default`, czyli „Issues”. Dokumentacja wymaga tego pola zawsze, gdy layout podaje szablon. Wzór nie działa w segmencie, w którym go zdefiniowano, tylko w segmentach podrzędnych. Demo z niego nie korzysta.

## Rozszerzenie: ten sam pomysł w routerze konfiguracyjnym

W React Routerze trasy opisuje się obiektami w kodzie zamiast katalogami. Odpowiednikiem layoutu zagnieżdżonego jest w nim **trasa layoutu** (*layout route*). Schwarzmüller pokazuje ją na przykładzie: obiekt trasy `/` dostaje komponent `Root` i tablicę `children` z trasami podrzędnymi. Komponent `Root` wskazuje miejsce na treść podrzędną specjalnym komponentem `<Outlet />`.

> **„Element zastępczy `<Outlet />` jest potrzebny, bo React Router musi wiedzieć, gdzie wyrenderować komponenty tras przekazanych we właściwości `children`.”**
>
> *„The `<Outlet />` placeholder is needed since React Router must know where to render the route components of the routes passed to the `children` property.”*
>
> — Maximilian Schwarzmüller, *React Key Concepts*

```jsx
// Przykład spoza demo: layout zgłoszeń w React Routerze (react-router 7.18.4)
import { createBrowserRouter, RouterProvider, Outlet, Link, useParams } from "react-router";

function IssueLayout() {                       // komponent trasy layoutu
  return (
    <section>
      <p><Link to="/">← Back to issues</Link></p>
      <Outlet />                               {/* tu trafia trasa podrzędna */}
    </section>
  );
}

function IssueDetail() {
  const { id } = useParams();                  // segment :id z adresu
  return <h1>Issue #{id}</h1>;
}

const router = createBrowserRouter([           // trasy jako tablica obiektów
  { path: "/", element: <h1>Issue Tracker</h1> },
  {
    path: "/issue",
    element: <IssueLayout />,
    children: [{ path: ":id", element: <IssueDetail /> }],  // /issue/2 w ramce IssueLayout
  },
]);

export default function App() {
  return <RouterProvider router={router} />;   // → /issue/2: „← Back to issues” i „Issue #2”
}
```

Adres `/issue` też tu istnieje i pokazuje sam link powrotu, bo trasa layoutu bez trasy podrzędnej `index` zostawia `<Outlet />` pusty.

W React Routerze relację „layout otacza trasę” zapisuje się dwa razy: w tablicy tras i w komponencie przez `<Outlet />`. W App Routerze relację wyznacza położenie pliku w katalogu, a miejscem na treść jest zwykły prop `children`.

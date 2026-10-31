# Rozszerzenia do slajdu 03: Linki do zgłoszeń i trasy pobierane z wyprzedzeniem

Powrót: [`slide_03_linki-i-prefetch.md`](../slide_03_linki-i-prefetch.md)

## Rozszerzenie: który link jest aktywny, czyli `usePathname`

Hook `usePathname` zwraca bieżącą ścieżkę, na przykład `/issue/2`. Maximilian Schwarzmüller zauważa, że Next.js nie ma odpowiednika komponentu `NavLink` z React Routera, który sam oznacza aktywny link. Ścieżkę porównuje się z `href` samodzielnie:

```jsx
// Przykład spoza demo: nawigacja z podświetleniem aktywnego linku.
"use client";                                   // hook działa tylko w przeglądarce
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();               // np. "/new"
  return (
    <nav>
      <Link href="/" className={pathname === "/" ? "active" : ""}>Issues</Link>
      {" | "}
      <Link href="/new" className={pathname === "/new" ? "active" : ""}>+ New Issue</Link>
    </nav>
  );
}
```

Pod `/new` klasę `active` dostaje drugi link, a pod `/` pierwszy. Nawigacja `issuetracker` siedzi w `RootLayout`, a ten jest komponentem serwerowym, w którym hooków wywołać nie wolno. Schwarzmüller pokazuje drogę, która nie przenosi całego layoutu do przeglądarki. Nawigację wydziela się do osobnego pliku z dyrektywą `"use client"`, a layout tylko go importuje i sam dyrektywy nie potrzebuje. W demo tego komponentu nie ma.

## Rozszerzenie: część adresu po znaku zapytania, czyli `useSearchParams`

Hook `useSearchParams` zwraca obiekt `URLSearchParams` tylko do odczytu. Ten sam obiekt da się zbudować w czystym JavaScripcie:

```js
const sp = new URLSearchParams("?priority=high");
sp.get("priority");  // → "high"
sp.get("status");    // → null: parametru nie ma w adresie
```

Pod adresem `/?priority=high` wywołanie `searchParams.get("priority")` w komponencie da `"high"`, a pod `/` wartość `null`. Przy buildzie obowiązuje jednak warunek, którego serwer deweloperski nie sprawdza.

> **„Podczas budowania produkcyjnego statyczna strona, która wywołuje `useSearchParams` w komponencie klienckim, musi być owinięta w granicę `Suspense`. Inaczej build kończy się błędem.”**
>
> *„During production builds, a static page that calls `useSearchParams` from a Client Component must be wrapped in a `Suspense` boundary, otherwise the build fails with the Missing Suspense boundary with useSearchParams error.”*
>
> — dokumentacja Next.js, *useSearchParams*

Strona statyczna powstaje podczas `next build`, gdy nikt jeszcze nie wysłał żądania, więc parametrów zapytania nie ma. Komponent, który ich potrzebuje, czeka za granicą `Suspense`, a reszta strony trafia do HTML od razu.

Brak granicy wychodzi dopiero przy budowaniu. Strona `/filter` z `useSearchParams` bez tej granicy zatrzymuje build komunikatem `useSearchParams() should be wrapped in a suspense boundary at page "/filter"`. Z granicą build przechodzi, a strona dostaje symbol `○`:

```jsx
import { Suspense } from "react";
import PriorityFilter from "./PriorityFilter";  // komponent kliencki z useSearchParams

export default function FilterPage() {
  return (
    <Suspense fallback={<p>...</p>}>             {/* treść zastępcza w statycznym HTML */}
      <PriorityFilter />
    </Suspense>
  );
}
```

## Rozszerzenie: wskaźnik przejścia `useLinkStatus`

Przy wolnej sieci dokumentacja proponuje hook `useLinkStatus` z `next/link`, który zwraca `pending` na czas trwającego przejścia. Gdy trasa leży już w pamięci klienta, faza oczekiwania jest pomijana, dlatego hook jest najprzydatniejszy przy `prefetch={false}`. Dokumentacja traktuje go jako rozwiązanie tymczasowe:

> **„`useLinkStatus` stosuje się jako szybką łatkę po wykryciu wolnego przejścia, a potem usuwa się przyczynę przez pobieranie z wyprzedzeniem albo treść zastępczą z `loading.js`.”**
>
> *„Use `useLinkStatus` as a quick patch when you identify a slow transition, then iterate to fix the root cause with prefetching or a `loading.js` fallback.”*
>
> — dokumentacja Next.js, *useLinkStatus*

```jsx
// Przykład spoza demo: dopisek przy linku do zgłoszenia na liście
"use client";
import Link, { useLinkStatus } from "next/link";

function PendingHint() {
  const { pending } = useLinkStatus();         // stan przejścia najbliższego <Link> powyżej
  return pending ? " (opening...)" : null;    // → [medium] Page loads slowly on mobile (opening...)
}

export default function IssueLink({ issue }) {
  return (
    <Link href={`/issue/${issue.id}`} prefetch={false}>
      [{issue.priority}] {issue.title}
      <PendingHint />                          {/* hook działa tylko wewnątrz <Link> */}
    </Link>
  );
}
```

Przy opóźnieniu sieci 500 ms dopisek stoi przy linku ok. 1 s, aż pojawi się ekran z `loading.jsx`.

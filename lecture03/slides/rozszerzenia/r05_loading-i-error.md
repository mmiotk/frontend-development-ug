# Rozszerzenia do slajdu 05: Ekran ładowania i ekran błędu dla jednej trasy

Powrót: [`slide_05_loading-i-error.md`](../slide_05_loading-i-error.md)

## Rozszerzenie: ekran ładowania na kształt strony

Napis „Loading issue...” zajmuje jedną linię. Gotowa strona ma nagłówek i dwa akapity, więc w chwili podmiany treść pod linkiem powrotu nagle rośnie. Dokumentacja `loading.js` proponuje w miejsce napisu szkielet albo „mały, ale znaczący fragment przyszłego ekranu” (*„a small but meaningful part of future screens”*). **Szkielet** (*skeleton*) to ekran ładowania o kształcie docelowej strony, ale bez danych. Kształt ma znaczenie z powodu miary, którą Bugl omawia przy czasie ładowania. **Skumulowane przesunięcie układu** (*Cumulative Layout Shift*, CLS) mierzy stabilność wizualną aplikacji. Zgłasza przy tym nieoczekiwany ruch na stronie podczas ładowania (*„reporting unexpected movement on the page during loading”*).

```jsx
// Przykład spoza demo: szkielet o tej samej strukturze co IssueDetailPage.
export default function IssueLoading() {
  return (
    <article>
      <h1>#… Loading issue...</h1>
      <p>Priority: …</p>
      <p>Status: …</p>
    </article>
  );
}
```

Szkielet ma granicę wynikającą z API. Według dokumentacji komponenty z `loading.js` nie przyjmują żadnych parametrów. `IssueLoading` nie zna więc numeru z adresu i nie pokaże „#2” przed nadejściem danych. Odtworzyć da się tylko to, co wspólne dla wszystkich zgłoszeń.

## Rozszerzenie: granica dla fragmentu strony

Plik `error.jsx` zawsze obejmuje cały segment trasy. Awaria jednego fragmentu, na przykład panelu komentarzy pod zgłoszeniem, nie musi jednak zabierać reszty strony. Next.js ma do tego funkcję `catchError` z modułu `next/error`, dodaną w wersji 16.2 jako `unstable_catchError` i stabilną od 16.3. Dokumentacja nazywa ją programową alternatywą dla konwencji pliku `error.js` (*„a programmatic alternative to the `error.js` file convention”*). Wyjątki, którymi `redirect()` i `notFound()` sterują przebiegiem strony, przechodzą dalej, więc granica nie przechwyci ich przez pomyłkę. Stan błędu znika sam po nawigacji do innej trasy.

```jsx
// Przykład spoza demo: granica wokół panelu komentarzy pod zgłoszeniem
// app/issue/[id]/CommentsBoundary.jsx
"use client";                                      // granica błędów działa w przeglądarce
import { catchError } from "next/error";

function CommentsError(props, { retry }) {         // drugi argument: error, retry i reset
  return <p>Comments unavailable. <button onClick={() => retry()}>Try again</button></p>;
}

export default catchError(CommentsError);          // komponent, który owija dzieci w granicę

// app/issue/[id]/Comments.jsx: symulacja awarii usługi komentarzy
export default async function Comments({ issueId }) {
  throw new Error(`Comments for #${issueId} failed`);
}

// app/issue/[id]/page.jsx, w <article> pod akapitem ze statusem:
<CommentsBoundary>
  <Comments issueId={issue.id} />
</CommentsBoundary>
// → /issue/2: „#2 — Page loads slowly on mobile”, „Priority: medium”, „Status: open”, „Comments unavailable. Try again”
```

Granica jest komponentem klienckim, a `Comments` w środku zostaje komponentem serwerowym, tak jak `IssueDetailPage` wewnątrz granicy z `error.jsx`.

# Zapis, który wykonuje się na serwerze

## Formularz w przeglądarce, magazyn na serwerze

Formularz na `/new` działa w przeglądarce, a tablica artykułów z `lib/store.js` leży w pamięci serwera. Zapis musi więc przejść przez sieć. Bez Server Action trzeba napisać do tego `POST` w Route Handlerze, w komponencie klienckim zamienić pola na JSON, wysłać go przez `fetch`, odczytać odpowiedź i sprawdzić kod statusu. Do tego dochodzą stan wysyłania i stan błędu, każdy z własną flagą. Server Action zamienia całą tę drogę na wywołanie funkcji, która wykonuje się na serwerze, tam gdzie leży magazyn.

## Opis poprawnego artykułu

Zanim powstanie formularz, powstaje opis poprawnych danych. Schemat w bibliotece Zod działa tak samo jak przy formularzach z akcjami w przeglądarce, w tej samej przypiętej wersji 3.25.76. Tak wygląda plik `lib/validate.js`.

```js
// lib/validate.js
import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(3, "Title: at least 3 characters"),
  body: z.string().min(10, "Body: at least 10 characters"),
});
```

Schemat leży w osobnym pliku, bo z tego samego opisu może korzystać każde miejsce, które przyjmuje artykuł. Plik nie importuje niczego z serwera, więc da się go użyć także w przeglądarce.

## Najmniejsza funkcja serwerowa

Zapis ma się wykonać na serwerze, bo tam leży magazyn. Komponent kliencki nie ma do niego dostępu, ale może wywołać funkcję, która wykona się po drugiej stronie sieci. Taką funkcję oznacza dyrektywa `"use server"`. Najmniejszy przykład spoza demo wygląda tak.

```js
// Przykład spoza demo: lib/ping.js
"use server"; // każdy eksport tego pliku wykonuje się na serwerze
export async function ping(name) {
  return `pong: ${name}`;
}
```

```jsx
// Przykład spoza demo: komponent kliencki importuje funkcję serwerową jak zwykłą funkcję
"use client";
import { ping } from "@/lib/ping";

export default function PingButton() {
  return <button onClick={async () => alert(await ping("Ann"))}>ping</button>;
}
```

Kliknięcie wysyła żądanie, które da się zapisać w kilku liniach. Przycisk stoi w tym przykładzie na stronie głównej, więc żądanie idzie pod jej adres, a nagłówek `Next-Action` niesie identyfikator funkcji.

```text
POST /
Next-Action: 4051dec969faafcb8afae660872b527071fde1ed27
Content-Type: text/plain;charset=UTF-8

["Ann"]                      ← argumenty wywołania, zserializowane

odpowiedź:  1:"pong: Ann"    ← wartość zwrócona przez funkcję
```

Argumenty jadą w treści żądania jako tablica, a wynik wraca w formacie, z którego React odtwarza wartość.

## Server Function i Server Action

Dokumentacja Next.js używa dwóch nazw. Pierwszą definiuje w przewodniku *Mutating Data*.

> **„Server Function to funkcja asynchroniczna, która wykonuje się na serwerze. Można ją wywołać z klienta przez żądanie sieciowe, dlatego musi być asynchroniczna.”**
>
> *„A Server Function is an asynchronous function that runs on the server. You can call them from the client through a network request, which is why they must be asynchronous.”*
>
> — dokumentacja Next.js, *Mutating Data*

**Server Action** to według tego samego przewodnika funkcja serwerowa użyta w określony sposób: do obsługi formularzy i zmian danych, czyli przekazana do `<form action>` albo `<button formAction>`. Przewodnik nazywa Server Function pojęciem szerszym. `ping` wywołany w procedurze `onClick` jest więc funkcją serwerową, a `createArticle` w formularzu będzie Server Action. Wywołanie spoza formularza działa, ale React nie śledzi wtedy jego trwania. Dokumentacja Reacta zaleca zamknąć je w przejściu, czyli w `startTransition`, które oznacza aktualizację jako niepilną i daje stan oczekiwania. Schwarzmüller w *React Key Concepts* podkreśla wymóg asynchroniczności: „nie ma synchronicznych Server Actions” (*„There are no synchronous Server Actions”*).

Dyrektywę `"use server"` stawia się na dwa sposoby. Na początku pliku zamienia każdy eksport w funkcję serwerową. W pierwszej linii ciała funkcji `async` zdefiniowanej w komponencie serwerowym oznacza tylko tę funkcję. Komponent kliencki nie może definiować funkcji serwerowych. Importuje je z pliku z dyrektywą na górze albo dostaje w propsach od komponentu serwerowego.

## Co robi build

Przewodnik Next.js *Server Actions and Mutations* opisuje mechanizm, który zostawia kod funkcji na serwerze.

> **„W czasie budowania dyrektywa `'use server'` każe kompilatorowi zastąpić w paczkach klienta implementację funkcji odnośnikiem (identyfikatorem akcji i dyspozytorem), który wysyła żądanie POST z powrotem na serwer.”**
>
> *„At build time, the `'use server'` directive tells the compiler to swap the function's implementation in client bundles for a reference (an action ID plus a dispatcher) that POSTs back to the server.”*
>
> — dokumentacja Next.js, *Server Actions and Mutations*

Kumar w *Fluent React* opisuje to od strony paczki. Funkcja akcji według niego „nie jest dołączana do paczki klienta” (*„is not included in the client bundle”*) i wykonuje się na serwerze. W paczce JavaScriptu przykładu z `ping` nie ma ani ciała funkcji, ani napisu `pong:`. Pod nazwą `ping` stoi wywołanie `createServerReference("4051dec9…", callServer, …, "ping")`, czyli odnośnik z identyfikatorem. <u>Przeglądarka nie zna kodu funkcji, zna tylko jej identyfikator.</u> Razem z ciałem funkcji na serwerze zostają jej importy: magazyn, schemat i sekrety.

## Argumenty przychodzą z sieci

Tablica `["Ann"]` z żądania jest jedynym źródłem argumentów funkcji. Kto wyśle to samo żądanie z inną tablicą, ten wywoła funkcję z innymi argumentami, więc argumenty są danymi od nieznanego nadawcy. Lista typów dozwolonych w kierunku **klient → serwer** jest węższa od listy propsów. Przechodzą wartości proste, tablice, `Map`, `Set`, `Date`, `FormData`, zwykłe obiekty, obiekty Promise i inne funkcje serwerowe. Dokumentacja Reacta wymienia wyjątki.

> **„Nie są obsługiwane w szczególności: elementy Reacta, czyli JSX.”**
>
> *„Notably, these are not supported: React elements, or JSX”*
>
> — dokumentacja React, *'use server'*

Na liście nieobsługiwanych stoją też zwykłe funkcje, klasy, instancje klas i obiekty zdarzeń. Element `<b>hi</b>` przekazany do akcji nie daje błędu w przeglądarce. Serwer nie potrafi odtworzyć elementu Reacta z treści żądania, więc akcja dostaje w jego miejscu obiekt zastępczy. Taki obiekt nie ma żadnych danych elementu i przy pierwszej próbie odczytu rzuca wyjątek „Cannot access constructor on the server…”. Odwrotny kierunek, **serwer → klient**, rządzi się listą propsów, więc wartość zwrócona przez akcję może zawierać JSX.

## Akcja `createArticle`

Zapis artykułu wykonuje funkcja w pliku `lib/actions.js`.

```js
// lib/actions.js
"use server"; // każdy eksport tego pliku wykonuje się na serwerze

import { addArticle } from "./store";
import { articleSchema } from "./validate";

export async function createArticle(prevState, formData) {
  // walidacja na serwerze: danym z przeglądarki się nie ufa
  const result = articleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  addArticle(result.data);
  return { success: true };
}
```

Ciało funkcji ma układ znany z akcji formularza w przeglądarce: odczyt pól z `FormData`, `safeParse`, zwrot błędów pól jako wartości i zapis `result.data`. Nowa jest dyrektywa na górze pliku. Dzięki niej `addArticle` i schemat wykonują się po stronie, na której leży magazyn. Akcja zmienia tylko magazyn. Lista na stronie głównej ma własną pamięć odpowiedzi, więc po zapisie dalej pokazuje „Articles (2)”, choć `/articles/3` już działa.

## Komponent serwerowy czyta, akcja zapisuje

Dokumentacja Reacta wyjaśnia, do czego akcje służą.

> **„Funkcje serwerowe są zaprojektowane do zmian stanu po stronie serwera; nie zaleca się ich do pobierania danych. Dlatego frameworki, które je implementują, zwykle przetwarzają jedną akcję naraz i nie mają sposobu na zapamiętanie zwróconej wartości.”**
>
> *„Server Functions are designed for mutations that update server-side state; they are not recommended for data fetching. Accordingly, frameworks implementing Server Functions typically process one action at a time and do not have a way to cache the return value.”*
>
> — dokumentacja React, *'use server'*

Przewodnik Next.js potwierdza to dla swojego frameworka: „Next.js wysyła Server Actions po jednej na klienta” (*„Next.js dispatches Server Actions one at a time per client.”*). Druga akcja z tej samej karty czeka na koniec pierwszej, więc odświeżony widok zgadza się z wynikiem akcji, która go wywołała. Dwie akcje zebrane w `Promise.all` i tak trafiają do tej kolejki, więc wykonają się jedna po drugiej, a nie równolegle. <u>Komponent serwerowy czyta, a Server Action zapisuje.</u>

## Rysunek 5.7 — od pola formularza do komunikatu

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    B["przeglądarka /new<br/>odnośnik: ID akcji"] -- "POST /new<br/>Next-Action + FormData" --> A["createArticle<br/>(prevState, formData)"]
    A --> V{"safeParse"}
    V -- "błąd" --> E["return { error }"]
    V -- "ok" --> S["addArticle"]
    E -. "zwykły obiekt" .-> ST["state w NewArticlePage"]
    S -. "{ success: true }" .-> ST
    ST --> M["komunikat pod polem<br/>albo „Article saved.”"]
```

Rysunek 5.7 dodaje do kodu format przesyłki: dane jadą na serwer jako `FormData` w treści typu `multipart/form-data`, a wracają jako zwykły obiekt. Akcja sama odczytuje pola po nazwach i sama wybiera kształt odpowiedzi, a komponent musi znać ten kształt, żeby wyświetlić `state.error.title`. Wyjątek rzucony w akcji omija `state` i trafia do najbliższej granicy błędów, w tej aplikacji `app/error.jsx`. Wszystko, co da się opisać użytkownikowi, akcja zwraca więc jako wartość.

## Formularz `/new`

Akcję wywołuje strona z `useActionState`. Hook działa tak samo jak przy akcji wykonywanej w przeglądarce, a jego trzeci element, `pending`, jest `true`, dopóki akcja trwa na serwerze, i wyłącza przycisk. Nowe w `app/new/page.jsx` są import akcji i podłączenie jej do formularza.

```jsx
// app/new/page.jsx
"use client";
import { useActionState } from "react";
import { createArticle } from "@/lib/actions";

export default function NewArticlePage() {
  // pending: true, dopóki akcja trwa na serwerze
  const [state, action, pending] = useActionState(createArticle, null);

  return (
    <main>
      <h1>New article</h1>
      {state?.success && <p>Article saved.</p>}
      <form action={action}>
        <p>Title: <input name="title" /> {state?.error?.title}</p>
        <p>Body: <textarea name="body" /> {state?.error?.body}</p>
        <button disabled={pending}>Add article</button>
      </form>
    </main>
  );
}
```

**`import { createArticle } from "@/lib/actions"`** wygląda jak zwykły import, ale daje odnośnik do funkcji serwerowej. Tytuł „ab” wraca z komunikatem „Title: at least 3 characters” pod polem. Poprawny artykuł daje napis „Article saved.” i puste pola, a w narzędziach przeglądarki żądanie `POST /new` z nagłówkiem `Next-Action`.

## Plik akcji bez dyrektywy

Usunięcie `"use server"` z `lib/actions.js` robi z pliku zwykły moduł, który bundler dokleja do kodu przeglądarki razem z importami. Budowanie przechodzi bez błędu, a formularz wygląda na sprawny: pokazuje „Article saved.” i czyści pola. W narzędziach przeglądarki nie ma jednak żadnego żądania `POST`, a `/api/articles` dalej zwraca dwa artykuły, bo funkcja zapisała dane do kopii magazynu w przeglądarce. Brak dyrektywy nie kończy się więc komunikatem, tylko cichym zapisem w złym miejscu.

## Zalety i koszty Server Action

Server Action zastępuje ręcznie pisany punkt końcowy wywołaniem funkcji. Przez sieć nadal idzie zwykłe żądanie.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Wywołanie jak zwykłej funkcji, bez adresu i JSON-u; kod funkcji i jej importy (magazyn, schemat, sekrety) zostają na serwerze, w paczce tylko identyfikator | Akcja to publiczny punkt końcowy `POST`, a jej argumenty kontroluje klient | Odczyt danych: komponent serwerowy, bo akcje nie są przeznaczone do pobierania danych |
| Błędy pól wracają jako wartość do `useActionState` i trafiają pod pola; `pending` wyłącza przycisk | Akcje z jednej karty wykonują się po kolei, nie równolegle | Klient spoza aplikacji, na przykład `curl` albo aplikacja mobilna: Route Handler |
| Formularz z akcją działa przed załadowaniem skryptów, a `useActionState` pokazuje odpowiedź serwera przed hydratacją | Brak `"use server"` nie daje błędu, tylko cichy zapis w przeglądarce (pomiar powyżej) | Zmiana wywołana zdarzeniem `onClick`: działa, ale trzeba ją zamknąć w `startTransition`, żeby React śledził jej trwanie |

> 💡 **Zapamiętaj:** Server Action to funkcja `async` z `"use server"`, którą build zamienia w przeglądarce na odnośnik wysyłający `POST` pod adres strony. Argumenty przychodzą z treści tego żądania, więc kontroluje je klient.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r07_server-action-i-formularz.md`](rozszerzenia/r07_server-action-i-formularz.md)

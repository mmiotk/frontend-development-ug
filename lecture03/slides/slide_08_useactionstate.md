# Akcja, która oddaje wynik: `useActionState`

## Czego brakuje pierwszemu formularzowi

Formularz z akcją działa, ale nie umie odpowiedzieć użytkownikowi. Pusty tytuł jest przyjmowany bez sprzeciwu i użytkownik nie dostaje informacji o błędzie. Nie ma stanu oczekiwania, więc przycisk „Submit” można kliknąć wiele razy. Nawigacja na listę następuje natychmiast, bez potwierdzenia, że coś zapisano.

Te braki mają wspólną przyczynę. Funkcja `action` wykonuje pracę i znika, a jej wynik nigdzie nie trafia. Komponent nie wie, czy zgłoszenie dodano, ani czy tytuł był pusty. Brakuje drogi od akcji z powrotem do komponentu. Zwykły `useState` mógłby ją zapewnić, ale wymagałby ręcznego wywoływania settera w kilku miejscach akcji, a setter wywołany w akcji i tak zadziała dopiero po jej końcu.

## Czym jest `useActionState`

Dokumentacja React definiuje hook tak:

> **„`useActionState` to hook Reacta, który pozwala aktualizować stan z efektami ubocznymi za pomocą akcji.”**
>
> *„`useActionState` is a React Hook that lets you update state with side effects using Actions.”*
>
> — dokumentacja React, *useActionState*

Hook przyjmuje stan początkowy i akcję w kształcie reducera, czyli funkcję `(poprzedni stan, dane) → nowy stan`. To, co akcja zwróci, staje się nowym stanem, a komponent renderuje się z tym stanem. Schwarzmüller ujmuje to porównaniem: `useActionState()` to w gruncie rzeczy `useState()` dostrojony do wyprowadzania stanu z akcji (*„essentially like `useState()`, fine-tuned to derive state from actions”*). Przy `useState` stan ustawia ręczne wywołanie settera, a przy `useActionState` wartość zwrócona z akcji.

Hook ma krótką historię nazwy. Bugl w *Modern Full-Stack React Projects*, pisanej dla React 18, używa hooka `useFormState` z pakietu `react-dom` i zaznacza, że w wydaniu React 19 zmieni on nazwę na `useActionState`. Starsze poradniki pokazują więc ten sam mechanizm pod inną nazwą i z innym importem. W React 19 hook importuje się z pakietu `react`.

## Najmniejszy formularz z `useActionState`

Reducer liczący próby wystarczy, żeby zobaczyć wszystkie trzy wartości zwracane przez hook (przykład spoza projektu):

```jsx
// Akcja w postaci reducera: dostaje poprzedni stan i FormData.
async function countAttempts(prevState, formData) {
  await new Promise((r) => setTimeout(r, 100)); // symulacja wolnej operacji
  return { attempts: prevState.attempts + 1 };  // nowy stan
}

function Counter() {
  // [bieżący stan, akcja do podpięcia w form, czy akcja trwa]
  const [state, formAction, isPending] = useActionState(countAttempts, { attempts: 0 });
  return (
    <form action={formAction}>
      <p>Attempts: {state.attempts}{isPending && " (pending)"}</p>
      <button type="submit">Go</button>
    </form>
  );
}
```

Pierwszy render daje „Attempts: 0”. Przy dwóch wysłaniach jedno po drugim akapit pokazuje „Attempts: 0 (pending)”, dopóki trwają akcje, a po zakończeniu obu „Attempts: 2”. Druga akcja startuje dopiero po pierwszej i dostaje `prevState` z liczbą 1. Pośredniego „Attempts: 1” nie widać, bo React pokazuje stan oczekiwania, dopóki nie skończą się wszystkie akcje z kolejki, i dopiero wtedy renderuje stan końcowy.

## Dlaczego wywołania czekają w kolejce

Kolejka wynika z sygnatury akcji. Każde wywołanie potrzebuje wyniku poprzedniego jako `prevState`, więc nie może wystartować, zanim tamto się skończy. Dokumentacja ujmuje to tak.

> **„`useActionState` można traktować jak `useReducer` dla efektów ubocznych akcji użytkownika. Ponieważ następną akcję wylicza na podstawie poprzedniej, musi wykonywać wywołania po kolei. Akcje równoległe wymagają bezpośredniego użycia `useState` i `useTransition`.”**
>
> *„You can think of `useActionState` as `useReducer` for side effects from user Actions. Since it computes the next Action to take based on the previous Action, it has to order the calls sequentially. If you want to perform Actions in parallel, use `useState` and `useTransition` directly.”*
>
> — dokumentacja React, *useActionState*

Ta sama strona dokumentacji odróżnia oba hooki jednym warunkiem: reducer w `useReducer` musi być czysty, a akcja w `useActionState` może wykonywać efekty uboczne, na przykład wysłać dane. Kolejka ma cenę, którą dokumentacja liczy na swoim przykładzie z opóźnieniem 1 s: cztery kliknięcia trwają razem mniej więcej cztery sekundy (*„4 clicks will take ~4 seconds to complete”*). Autorzy nazywają to zamierzoną cechą projektu hooka.

Z kolejki wynika też, skąd bierze się stan. Hook nie daje settera, który mógłby zmienić ten stan z boku, w trakcie akcji. Stan zmienia się wyłącznie przez wartość zwróconą z akcji. <u>Stan po serii wysłań zależy tylko od stanu początkowego i kolejnych danych z formularza</u>. Dwa szybkie kliknięcia nie uruchomią więc dwóch akcji równolegle na tym samym stanie i żadna nie nadpisze wyniku drugiej.

## Formularz zgłoszenia z wynikiem i stanem oczekiwania

Strona `app/new/page.jsx` przechodzi na `useActionState`. Importy tracą `useRouter`, a zyskują hook i komponent linku. Stan początkowy i akcja leżą poza komponentem. W komponencie dochodzą wywołanie hooka, dwa komunikaty nad formularzem i przycisk sterowany flagą:

```jsx
// app/new/page.jsx: zastąpić całą zawartość
// Formularz nowego zgłoszenia: wynik akcji przechowuje useActionState.
// "use client": hook i akcja działają w przeglądarce,
// a addIssue zapisuje do kopii magazynu w przeglądarce.
"use client";
import { useActionState } from "react"; // React 19
import Link from "next/link";
import { addIssue } from "../lib/store";

const INITIAL_STATE = { success: false, error: null, issue: null };

// Sygnatura: (prevState, formData), prevState wstawia useActionState.
// prevState = wynik poprzedniego wywołania (albo INITIAL_STATE przy pierwszym).
async function submitIssue(prevState, formData) {
  // Symulacja operacji asynchronicznej (np. wywołania API).
  await new Promise((r) => setTimeout(r, 600));

  // FormData powstaje automatycznie ze wszystkich pól z atrybutem name.
  const title = formData.get("title");
  const priority = formData.get("priority");

  // Ręczna walidacja: tytuł nie może być pusty.
  if (!title || title.trim() === "") {
    return { success: false, error: "Title must not be empty.", issue: null };
  }

  const issue = addIssue({ title: title.trim(), priority: priority || "medium" });
  return { success: true, error: null, issue };
}

export default function NewIssuePage() {
  // useActionState zwraca [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(submitIssue, INITIAL_STATE);

  return (
    <div>
      <h1>New Issue</h1>

      {state.success && (
        <p>
          Issue #{state.issue.id} added!{" "}
          <Link href="/">View all issues</Link>
        </p>
      )}
      {state.error && <p>Error: {state.error}</p>}

      <form action={formAction}>
        <div>
          {/* htmlFor łączy etykietę z polem o id="title" */}
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" />
        </div>
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
```

Na czas trwania akcji, w demo 0,6 s, przycisk jest wyłączony i ma napis „Submitting...”. Pusty tytuł kończy się komunikatem „Error: Title must not be empty.”. Poprawny daje „Issue #5 added! View all issues”. `!title` łapie `null` z pola bez nazwy, a `trim()` odrzuca tytuł złożony z samych spacji. `INITIAL_STATE` i `submitIssue` leżą poza komponentem, bo nie zależą od żadnego renderu. `router.push("/")` zniknęło, więc po sukcesie formularz zostaje na ekranie, a na listę prowadzi link.

![Rysunek 3.16 — formularz z błędem przy pustym tytule i z potwierdzeniem po sukcesie](../figures/out/rys_03_16.png)

Rysunek 3.16 zestawia dwa wyniki tej samej akcji. W obu stanach formularz zostaje na ekranie, a po sukcesie pole tytułu jest puste.

## Opakowana akcja zamiast akcji programisty

Formularz dostaje `formAction`, a nie `submitIssue`. Schwarzmüller wyjaśnia, po co ta druga wartość w ogóle istnieje:

> **„Zaktualizowana funkcja akcji formularza to w istocie funkcja programisty opakowana przez Reacta. Jest to konieczne, żeby React miał dostęp do wartości zwracanej przez akcję, czyli do nowego stanu.”**
>
> *„An updated form action function, which is essentially your action function, wrapped by React. This is necessary so that React gets access to the value returned by your action function (which is the new state).”*
>
> — Maximilian Schwarzmüller, *React Key Concepts*

Gdyby formularz dostał `submitIssue` bezpośrednio, React wywołałby funkcję i zignorował jej wynik. Opakowanie przejmuje wynik i zapisuje go jako stan. Dokumentacja nazywa tę funkcję `dispatchAction`, a demo przypisuje ją do zmiennej `formAction`. Z atrybutem przycisku o tej samej nazwie, który kieruje wysłanie do innej akcji, łączy ją tylko nazwa. Działa bez dodatkowej pracy w atrybucie `action` formularza, bo React uruchamia ją wtedy w przejściu. Wywołana z kodu, na przykład z `onClick`, wymaga owinięcia w `startTransition`, czyli funkcję Reacta, która uruchamia aktualizację jako przejście. Wywołanie poza przejściem w trybie deweloperskim zapisuje błąd w konsoli.

## Dlaczego akcja dostaje `prevState`

Opakowana akcja wywołuje funkcję programisty z dwoma argumentami. Dokumentacja opisuje pierwszy z nich: `previousState` to ostatni stan, na początku równy `initialState`, a po pierwszym wywołaniu równy ostatniej zwróconej wartości. Drugi argument to dane przekazane do `dispatchAction`, czyli przy formularzu obiekt `FormData`.

Kolejność argumentów jest sztywna. Akcja ze starą sygnaturą `submitIssue(formData)` dostanie w parametrze `formData` poprzedni stan, czyli obiekt `INITIAL_STATE`. Ten obiekt nie ma metody `get`, więc wywołanie `formData.get("title")` rzuca `TypeError` z komunikatem `formData.get is not a function`. Dane formularza w ogóle do funkcji nie trafiają, a zamiast formularza pojawia się domyślny ekran Next.js „This page couldn’t load”. Demo z `prevState` nie korzysta, ale musi go przyjąć. Licznik nieudanych prób albo lista zgłoszeń dodanych w tej sesji wymagałyby już poprzedniej wartości.

## Rysunek 3.17 — poprzedni stan i dane formularza dają nowy stan

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    S0["INITIAL_STATE<br/>albo ostatni wynik"] --> F["submitIssue<br/>(prevState, formData)"]
    D["FormData<br/>title, priority"] --> F
    F -->|"pusty tytuł"| S1["success: false<br/>error"]
    F -->|"dane poprawne"| S2["success: true<br/>issue"]
    S1 --> R["render<br/>NewIssuePage"]
    S2 --> R
```

Na Rysunku 3.17 do funkcji `submitIssue` wchodzą dwie strzałki. Pierwsza niesie poprzedni stan, przy pierwszym wysłaniu równy `INITIAL_STATE`. Druga niesie dane formularza. Wychodzą dwie drogi zależnie od wyniku walidacji i obie kończą się renderem strony. Przy następnym wysłaniu wynik tego renderu wraca do lewego górnego prostokąta jako `prevState`.

## Stały kształt stanu

Akcja zwraca zawsze obiekt `{ success, error, issue }`. Gdyby przy błędzie zwracała napis, a przy sukcesie obiekt, każdy render musiałby najpierw sprawdzać typ stanu. Przy stałym kształcie JSX czyta pola wprost: `state.success && …` i `state.error && …`. Komunikat błędu jest więc zwykłą wartością zwróconą z akcji. Wyjątek działa inaczej, bo akcja wykonuje się w przejściu, a błąd przejścia React kieruje do najbliższej granicy błędów. Dokumentacja `useActionState` opisuje to wprost:

> **„Jeśli `dispatchAction` zgłosi wyjątek, React anuluje wszystkie oczekujące akcje i pokaże najbliższą granicę błędów.”**
>
> *„If `dispatchAction` throws an error, React cancels all queued actions and shows the nearest Error Boundary.”*
>
> — dokumentacja React, *useActionState*

W Next.js najbliższą granicą jest plik `error.jsx`. Strona `/new` i korzeń `app/` takiego pliku nie mają, więc wyjątek w `submitIssue` kończy się domyślnym ekranem Next.js „This page couldn’t load”, a formularz znika razem z wpisanymi danymi. <u>Błąd, który użytkownik może poprawić w formularzu, zwraca się jako stan</u>, a wyjątek zostawia się na awarie, na które formularz nie ma wpływu.

## Akcja synchroniczna i asynchroniczna

Akcja w tej wersji ma słowo `async`, ale nie musi go mieć. Schwarzmüller zwraca uwagę, że akcje formularzy mogą być synchroniczne albo asynchroniczne. Przykładem akcji synchronicznej jest u niego zapis do `localStorage`, bo to API przeglądarki działa synchronicznie. Akcja asynchroniczna zwraca obiekt Promise, na przykład po wysłaniu żądania `fetch` do serwera. `useActionState` przyjmuje oba rodzaje. Przy akcji asynchronicznej stanem staje się wartość, do której spełni się Promise. Funkcja `addIssue` w demo działa synchronicznie. Słowo `async` i opóźnienie są tu po to, żeby akcja zachowywała się jak prawdziwy zapis na serwerze i żeby stan oczekiwania był widoczny.

## Stan akcji żyje tak długo jak komponent

Stan z `useActionState` należy do komponentu, który wywołał hook, tak samo jak stan z `useState`. Minimalny licznik wysłań pokazuje, co to znaczy dla wyniku akcji:

```jsx
import { useActionState } from "react";

function Counter() {
  // akcja dostaje poprzedni stan i zwraca następny
  const [count, formAction] = useActionState((prev) => prev + 1, 0);
  return <form action={formAction}><button>Sent {count}</button></form>;
}
// <Counter /> pod warunkiem albo z kluczem: {show && <Counter key={k} />}
```

Po dwóch wysłaniach przycisk pokazuje „Sent 2”. Gdy rodzic ukryje komponent i pokaże go ponownie, przycisk wraca do „Sent 0”, bo nowy egzemplarz zaczyna od stanu początkowego. Ten sam skutek daje zmiana atrybutu `key`, która każe Reactowi potraktować komponent jak nowy. Dwa wywołania hooka w różnych komponentach mają osobne stany: wysłanie jednego formularza nie zmienia licznika drugiego.

W `issuetracker` ma to praktyczny skutek. Komunikat „Issue #5 added!” znika po przejściu na listę i powrocie na `/new`, bo strona formularza montuje się od nowa. Stan akcji przechowuje więc wynik ostatniego wysłania. Dane, które mają przetrwać nawigację, leżą w magazynie `store.js`, poza komponentem.

## Rozszerzenie: błąd powiązany z polem

Komunikat „Error: Title must not be empty.” stoi nad formularzem i nic nie łączy go z polem tytułu, więc czytnik ekranu, program odczytujący stronę głosem, nie powie, którego pola dotyczy. Do tego powiązania służą dwa atrybuty ARIA, czyli atrybuty opisujące stronę dla technologii wspomagających. **`aria-invalid="true"`** oznacza pole jako niepoprawne. **`aria-errormessage`** wskazuje przez `id` element z treścią błędu. MDN stawia przy drugim atrybucie warunek:

> **„Atrybut `aria-errormessage` powinien być używany tylko wtedy, gdy wartość obiektu jest niepoprawna, czyli gdy `aria-invalid` ma wartość `true`.”**
>
> *„The `aria-errormessage` attribute should only be used when the value of an object is not valid; when `aria-invalid` is set to `true`.”*
>
> — MDN, *ARIA: aria-errormessage attribute*

Demo tych atrybutów nie ma. W poniższym fragmencie komunikat przenosi się pod pole i dostaje `id`.

```jsx
<input
  id="title"
  name="title"
  aria-invalid={state.error ? "true" : undefined}           // undefined: brak atrybutu
  aria-errormessage={state.error ? "title-error" : undefined}
/>
{state.error && <p id="title-error">{state.error}</p>}
```

Wartość `undefined` sprawia, że React w ogóle nie wstawia atrybutu do HTML-u, więc poprawne pole nie wskazuje komunikatu, którego nie ma. MDN dodaje, że element z treścią błędu musi być widoczny, gdy atrybut obowiązuje.

> 💡 **Zapamiętaj:** `useActionState(akcja, stanPoczątkowy)` zwraca `[state, formAction, isPending]`. Akcja to reducer `(prevState, formData)`: to, co zwróci, staje się nowym stanem, a kolejne wywołania czekają w kolejce. Błędy do poprawienia zwraca się jako stan.


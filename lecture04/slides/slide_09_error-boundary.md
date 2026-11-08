# Granica błędów: awaria jednej sekcji zamiast całej strony

## Co React robi z wyjątkiem w renderze

Promise z rekomendacjami może zostać odrzucony. Wtedy `use` w komponencie `RecommendedList` zamiast danych rzuci wyjątek w trakcie renderu. Bez żadnej ochrony skutek obejmuje całą aplikację:

> **„Domyślnie, jeśli aplikacja rzuci wyjątek w trakcie renderowania, React usunie jej interfejs z ekranu. Żeby temu zapobiec, fragment interfejsu można owinąć w granicę błędów.”**
>
> *„By default, if your application throws an error during rendering, React will remove its UI from the screen. To prevent this, you can wrap a part of your UI into an Error Boundary.”*
>
> — dokumentacja React, *Component*

W sklepie oznaczałoby to, że awaria jednej sekcji z polecanymi produktami zabiera ze sobą koszyk, katalog i nawigację. Użytkownik zostaje z pustą stroną, choć zepsuł się fragment, bez którego da się kupować.

Ta reguła jest decyzją projektową. Dokumentacja starszej wersji Reacta, przy wprowadzaniu tej zasady w React 16, uzasadnia ją tak:

> **„Dyskutowaliśmy nad tą decyzją, ale z naszego doświadczenia wynika, że gorzej jest zostawić na ekranie uszkodzony interfejs, niż usunąć go całkowicie.”**
>
> *„We debated this decision, but in our experience it is worse to leave corrupted UI in place than to completely remove it.”*
>
> — dokumentacja React, *Error Boundaries* (wersja archiwalna)

Ta sama strona podaje przykłady. W komunikatorze uszkodzony interfejs mógłby sprawić, że ktoś wyśle wiadomość do niewłaściwej osoby. W aplikacji płatniczej gorzej jest pokazać złą kwotę niż nie pokazać nic. **Granica błędów**, czyli komponent pokazujący treść zastępczą w miejscu poddrzewa, które rzuciło wyjątek, zawęża to usunięcie do jednego fragmentu. Alex Banks i Eve Porcello w *Learning React* zwracają uwagę, że granice da się składać. Jedna obejmuje całą aplikację, a w jej wnętrzu osobne chronią menu, ramkę z informacją i główną treść.

W Next.js granicę wokół całego segmentu trasy stawia plik `error.jsx`. Sekcja rekomendacji jest jednak tylko fragmentem strony głównej, więc potrzebuje granicy w kodzie komponentów. Taką granicę pisze się jako klasę.

## Klasa w JavaScripcie

Komponent klasowy to starszy zapis komponentu, który w nowym kodzie zastąpiły funkcje z hookami. Granica błędów nadal wymaga klasy, więc potrzebne są cztery elementy składni klas JavaScriptu. **Klasa** to wzór obiektów: opisuje pola i metody, a każde wywołanie `new` tworzy z niej nowy **egzemplarz** (*instance*).

```js
class Counter {
  value = 0;                                           // pole klasy: każdy egzemplarz ma własne
  increment() { this.value += 1; }
  static describe(c) { return `counter: ${c.value}`; } // metoda klasy, a nie egzemplarza
}
class StepCounter extends Counter {                    // dziedziczy pola i metody po Counter
  step = 5;                                            // dodatkowe pole klasy pochodnej
  increment() { this.value += this.step; }             // zastępuje metodę z Counter
}
const c = new StepCounter();
c.increment(); c.increment();
Counter.describe(c);  // → 'counter: 10'
c.describe;           // → undefined (egzemplarz nie ma metody statycznej)
```

**Pole klasy** (*class field*) to zapis `nazwa = wartość;` w ciele klasy. Wyrażenie po prawej wykonuje się przy każdym `new` i daje nowemu egzemplarzowi własną kopię pola. Słowo **`this`** wewnątrz metod wskazuje egzemplarz, na którym metoda została wywołana, więc `this.value` jest polem tego egzemplarza.

**`extends`** sprawia, że `StepCounter` ma wszystkie pola i metody `Counter`, a własna metoda `increment` zastępuje odziedziczoną. Metoda oznaczona **`static`** należy do samej klasy. Wywołuje się ją przez nazwę klasy (`Counter.describe(c)`), a egzemplarz jej nie ma, stąd `undefined` w ostatniej linii. Metoda statyczna nie ma też dostępu do pól egzemplarza przez `this`. Wszystko, czego potrzebuje, dostaje w argumentach.

Pola można ustawić też w **konstruktorze** (`constructor`), czyli metodzie wykonywanej raz, przy `new`. Klasa pochodna musi w nim wywołać `super(...)`, czyli konstruktor klasy bazowej, przed pierwszym użyciem `this`. Granica błędów w sklepie obchodzi się bez konstruktora, więc pełny przykład z `super` stoi w rozszerzeniu.

## Komponent klasowy w Reakcie

Komponent klasowy to klasa dziedzicząca po `Component` z pakietu `react`. Najmniejszy przykład ze stanem liczy kliknięcia:

```jsx
class Clicker extends Component {
  state = { count: 0 };            // stan to pole o nazwie state, React go odczytuje
  render() {                       // React wywołuje tę metodę przy każdym renderze
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.props.label}: {this.state.count}
      </button>
    );
  }
}
```

Po dwóch kliknięciach przycisk `<Clicker label="Clicks" />` pokazuje „Clicks: 2”. React tworzy egzemplarz klasy raz, przy montowaniu, a potem przy każdym renderze wywołuje tylko jego metodę `render`. Stan jest jednym obiektem w `this.state`, a propsy leżą w `this.props`, które klasa bazowa `Component` wypełnia sama. Metoda `this.setState` przyjmuje obiekt z polami do zmiany, według dokumentacji `Component` łączy go płytko z bieżącym stanem i planuje render. Funkcja strzałkowa w `onClick` przejmuje `this` z metody `render`, więc wskazuje ten sam egzemplarz.

## Klasa `ErrorBoundary` w sklepie

Sklep dostaje własną granicę w nowym pliku `app/components/ErrorBoundary.jsx`:

```jsx
'use client';

import { Component } from 'react';

// Granice błędów są w React 19 nadal komponentami klasowymi.
export default class ErrorBoundary extends Component {
  state = { error: null };

  // React wywołuje ją w trakcie renderu, gdy któreś dziecko rzuci wyjątek.
  // Musi być czystą funkcją: dostaje błąd i zwraca nowy stan.
  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) return <p>Something went wrong: {this.state.error.message}</p>;
    return this.props.children;
  }
}
```

Pole `state` i `render` działają tak jak w liczniku. Nowa jest metoda statyczna, którą React wywołuje sam, gdy któryś potomek rzuci wyjątek. `getDerivedStateFromError` zwraca stan z obiektem błędu, a `render` pokazuje wtedy komunikat z jego treścią. Dopóki nic się nie psuje, `state.error` ma wartość `null`, więc granica jest niewidoczna i oddaje `this.props.children` bez zmian. Warunek `if (this.state.error)` zakłada, że rzucono obiekt `Error`, a nie `null` albo napis. Kod sklepu rzuca tylko `Error`, więc to założenie wystarcza.

Plik zaczyna się od `'use client'`, bo granica trzyma stan i przełącza widok w przeglądarce, a stan mają tylko komponenty klienckie. Metoda statyczna nie widzi `this`, więc `getDerivedStateFromError` nie może niczego zapisać ani wysłać. Może tylko wyliczyć nowy stan z błędu.

## Dlaczego nadal klasa

Dokumentacja zaleca pisanie komponentów jako funkcji. Granica błędów jest wyjątkiem:

> **„Obecnie nie da się napisać granicy błędów jako komponentu funkcyjnego. Nie trzeba jednak pisać tej klasy samodzielnie. Można na przykład użyć zamiast niej biblioteki `react-error-boundary`.”**
>
> *„There is currently no way to write an Error Boundary as a function component. However, you don’t have to write the Error Boundary class yourself. For example, you can use react-error-boundary instead.”*
>
> — dokumentacja React, *Component*

Dokumentacja przy obu metodach granicy zaznacza, że w komponentach funkcyjnych nie ma jeszcze ich bezpośredniego odpowiednika. Hooki nie mają więc sposobu, żeby przechwycić wyjątek z renderu potomka. Sklep pisze klasę samodzielnie, żeby było widać, co robi każda metoda.

## Dwie metody, dwie fazy

Granica ma do dyspozycji dwie metody, bo React pracuje w dwóch fazach: najpierw render, czyli wyliczenie nowego drzewa, potem zatwierdzenie, czyli zmiana DOM. Dokumentacja opisuje `getDerivedStateFromError` jako metodę, która powinna być **czystą funkcją**. Działa w trakcie renderowania, więc dostaje błąd i zwraca stan, na podstawie którego `render` pokaże komunikat. Render może zostać przerwany i powtórzony, dlatego nie wolno w nim wysyłać żądań ani zapisywać czegokolwiek na zewnątrz.

Jeśli potrzebny jest efekt uboczny, na przykład wysłanie raportu do serwisu analitycznego, trzeba według dokumentacji zaimplementować także `componentDidCatch(error, info)`. Działa po zatwierdzeniu zmian, więc efekty uboczne są w niej dozwolone. Obiekt `info` ma pole `componentStack`, czyli listę komponentów od tego, który rzucił wyjątek, w górę drzewa. Granica w sklepie niczego nie raportuje, więc tej metody nie pisze. Uruchomiony przykład z nią stoi w rozszerzeniu.

## Rysunek 4.9 — co granica łapie, a czego nie

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    R["wyjątek w renderze potomka"] --> EB{"ErrorBoundary"}
    P["odrzucony Promise<br/>czytany przez use()"] --> EB
    T["wyjątek w przejściu<br/>z useTransition"] --> EB
    EB --> FB["Something went wrong: {message}"]
    G["wyjątek w samodzielnym<br/>startTransition"] -. "✗" .-> EB
    H["wyjątek w onClick"] -. "✗" .-> EB
    A["setTimeout"] -. "✗" .-> EB
    S["render na serwerze"] -. "✗" .-> EB
```

Na Rysunku 4.9 ciągłe strzałki to błędy, które granica przejmuje i zamienia na komunikat. Przerywane strzałki to błędy, których granica nie widzi. Dwie strzałki z przejściami wyglądają podobnie, a kończą się inaczej. O wyniku decyduje to, skąd pochodzi funkcja `startTransition`.

## Przejście związane z komponentem

Przejście (*Transition*) oznacza aktualizację, którą React śledzi i może odłożyć. Funkcję `startTransition` daje się wziąć z dwóch miejsc: z hooka `useTransition` albo bezpośrednio z pakietu `react`. Tylko pierwsza wersja należy do konkretnego komponentu, więc tylko jej błąd ma gdzie trafić w drzewie:

```jsx
import { useTransition } from 'react';

// Symulowany zapis, który zawsze się nie udaje (odrzucenie po 100 ms).
const save = () => new Promise((_, reject) => setTimeout(() => reject(new Error('Save failed')), 100));

function SaveButton() {
  const [isPending, startTransition] = useTransition(); // przejście związane z tym komponentem
  function handleClick() {
    startTransition(async () => {
      await save(); // odrzucony Promise rzuca wyjątek tutaj
    });
  }
  return <button onClick={handleClick}>{isPending ? 'Saving...' : 'Save'}</button>;
}
```

Gdy `save()` zwraca odrzucony Promise, `<ErrorBoundary><SaveButton /></ErrorBoundary>` pokazuje „Something went wrong: Save failed”. React zgłasza błąd przejścia w renderze komponentu, do którego przejście należy, więc wyjątek trafia do drzewa w tym samym miejscu co błąd renderu i przejmuje go najbliższa granica nad przyciskiem. Ten sam przycisk z `startTransition` zaimportowanym z `react` zostaje na ekranie, a wyjątek dociera do przeglądarki jako niezłapany błąd strony. Dokumentacja `useTransition` podaje przyczynę:

> **„Ponieważ samodzielna funkcja nie jest związana z żadnym komponentem, granica błędów nie może obsłużyć błędów z jej przejścia.”**
>
> *„Because the standalone function is not associated with a component, an Error Boundary cannot handle errors from its Transition.”*
>
> — dokumentacja React, *useTransition*

`AddToCartButton` w sklepie używa samodzielnej funkcji `startTransition`. <u>Jedynym miejscem, które obsługuje odmowę serwera przy dodawaniu do koszyka, jest blok `try/catch` w samym przycisku</u>. Bez niego wyjątek nie trafiłby do żadnej granicy, a kawa zniknęłaby z koszyka bez komunikatu.

## Czego granica nie widzi

Granica chroni to, co React wykonuje w trakcie renderu, bo tylko wtedy nie wie, co narysować. Dokumentacja `Component` wymienia cztery wyjątki od tej reguły: procedury obsługi zdarzeń, renderowanie po stronie serwera, błędy rzucone w samej granicy oraz kod asynchroniczny, jak `setTimeout`. Procedura `onClick` wykonuje się już po renderze, więc jej błąd łapie zwykły `try/catch` w jej kodzie. Na serwerze rolę granicy przejmuje najbliższa granica Suspense, która wstawia do HTML swoją treść zastępczą.

Granica nie chroni samej siebie. Błąd w jej komunikacie zastępczym trafia do granicy wyżej, a w sklepie wyżej żadnej granicy nie ma. Komunikat zastępczy powinien więc być najprostszym kodem w całej sekcji.

Zwykły `try/catch` nie zastąpi granicy także w komponencie nadrzędnym. Blok `try` wokół `return <RecommendedList … />` nie złapie błędu dziecka, bo zwrócenie elementu niczego jeszcze nie renderuje. Dziecko renderuje się później, a jego błąd idzie w górę drzewa komponentów, omijając ten blok. <u>Błąd renderu dziecka łapie tylko granica błędów nad nim.</u>

## Zalety i koszty granicy błędów

Granica zamienia awarię całej strony w awarię jednej sekcji. Za tę ochronę płaci się klasą w kodzie i ograniczonym zasięgiem: łapie tylko to, co React wykonuje w trakcie renderu.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Awaria sekcji rekomendacji nie zabiera koszyka, katalogu i nawigacji, a użytkownik widzi komunikat w miejscu sekcji. | Granica to klasa, bo hooki nie przechwytują wyjątku z renderu potomka. Żeby klasy nie pisać, można użyć `react-error-boundary`. | Błąd całej trasy: plik `error.jsx` z Next.js (L03). |
| Przejmuje odrzucony Promise z `use` oraz wyjątek z przejścia z `useTransition`. | Nie widzi wyjątków z procedur obsługi zdarzeń, z samodzielnego `startTransition` ani z kodu asynchronicznego, jak `setTimeout`. Stąd `try/catch` w `AddToCartButton`. | Błąd w `onClick` lub po `await`: zwykły `try/catch` w tym kodzie. |
| Granice da się składać i zawężać do fragmentów interfejsu. | Po awarii granica nie wraca sama (potrzebuje nowego `key`) i trzeba zdecydować o jej rozmiarze. | Komunikat zastępczy ma być najprostszym kodem sekcji, bo granica nie chroni samej siebie. |

> 💡 **Zapamiętaj:** granica błędów to klasa z `getDerivedStateFromError` (czysta, zwraca stan) i opcjonalnie z `componentDidCatch` (logowanie). Łapie błędy renderu poddrzewa i przejść z `useTransition`, ale nie błędy z procedur obsługi zdarzeń ani z samodzielnej funkcji `startTransition`. Po awarii granica nie wraca sama, potrzebuje nowego `key`.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r09_error-boundary.md`](rozszerzenia/r09_error-boundary.md)

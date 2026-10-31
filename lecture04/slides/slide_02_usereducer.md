# `useReducer`: strona wysyła akcje, reducer liczy stan

## Hook, który podłącza reducer

Reducer z pliku `app/lib/cartReducer.js` sam niczego nie wyświetla. Podłącza go do komponentu hook `useReducer`. Dokumentacja definiuje go jednym zdaniem.

> **„`useReducer` to hook Reacta, który pozwala dodać do komponentu reducer.”**
>
> *„useReducer is a React Hook that lets you add a reducer to your component.”*
>
> — dokumentacja React, *useReducer*

Hook przyjmuje reducer i stan początkowy, a zwraca parę: bieżący stan i funkcję `dispatch`. Najmniejszy przykład spoza projektu to licznik:

```jsx
import { useReducer } from 'react';

function counter(state, action) {
  switch (action.type) {
    case 'inc': return state + 1;
    default: throw new Error('Unknown action');
  }
}

function Counter() {
  const [n, dispatch] = useReducer(counter, 0);   // [stan, funkcja wysyłająca akcje]
  return <button onClick={() => dispatch({ type: 'inc' })}>n={n}</button>;
}
```

Dwa kliknięcia dają napis „n=2”. Komponent nie liczy nowej wartości. Wysyła tylko akcję, a wynik oblicza reducer.

Pełna sygnatura to `useReducer(reducer, initialArg, init?)`, gdzie trzeci argument jest opcjonalny. Schwarzmüller w *React Key Concepts* podkreśla, że hook zwraca tablicę z dokładnie dwoma elementami. Drugi to funkcja `dispatch`, której jedynym argumentem jest akcja trafiająca do reducera. Obie nazwy wybiera programista, ale `dispatch` jest nazwą przyjętą powszechnie. Dokumentacja dodaje, że `dispatch` nie zwraca żadnej wartości.

Alex Banks i Eve Porcello w *Learning React* wskazują, kiedy ten hook się przydaje.

> **„Ten wzorzec jest użyteczny, gdy stan ma wiele wartości podrzędnych albo gdy następny stan zależy od poprzedniego.”**
>
> *„This pattern is useful when state has multiple subvalues or when the next state depends on a previous state.”*
>
> — Alex Banks, Eve Porcello, *Learning React*

Koszyk spełnia oba warunki. Ma tablicę pozycji z osobnymi ilościami, a wynik dodania produktu zależy od tego, czy produkt już w koszyku jest.

## Strona sklepu z koszykiem

Strona główna sklepu staje się właścicielem koszyka. Hooki stanu wymagają komponentu klienckiego, dlatego pierwsza linia `app/page.jsx` to `'use client'`. Nowe są początek pliku i sekcja koszyka:

```jsx
'use client';

import { useReducer } from 'react';
import { products } from './data/products';
import { cartReducer, initialCartState } from './lib/cartReducer';

export default function HomePage() {
  // Reducer i pusty koszyk; hook oddaje stan i funkcję wysyłającą akcje.
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
```

```jsx
      <section>
        <h2>Cart ({cart.items.length} items)</h2>
        <ul>
          {cart.items.map(item => (
            <li key={item.id}>
              {item.name} × {item.qty} = {(item.price * item.qty).toFixed(2)} PLN
              {/* Przycisk tylko opisuje zdarzenie; regułę zna reducer. */}
              <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear cart</button>
      </section>
```

Lista produktów dostaje przycisk, który wysyła `ADD_ITEM` z całym obiektem produktu:

```jsx
          {products.map(p => (
            <li key={p.id}>
              {p.name} — {p.price.toFixed(2)} PLN
              <button onClick={() => dispatch({ type: 'ADD_ITEM', product: p })}>
                Add to cart
              </button>
            </li>
          ))}
```

Sekcja koszyka czyta `cart.items`, liczy pozycje przez `length`, a wartość każdej jako `item.price * item.qty`. Żaden fragment strony nie zmienia tablicy pozycji: komponent tylko opisuje kliknięcia, a reguły koszyka zostają w reducerze.

## Droga jednego kliknięcia

Kliknięcie „Add to cart” przy kawie wywołuje `dispatch({ type: 'ADD_ITEM', product: p })`. Funkcja `dispatch` nie zmienia stanu od razu. **Kolejkuje akcję** i prosi Reacta o nowy render. Dopiero w tym renderze React wywołuje `cartReducer` z bieżącym stanem i akcją, a wynik staje się nową wartością `cart`.

W tej samej procedurze obsługi zmienna stanu ma więc nadal wartość sprzed kliknięcia, tak samo jak przy setterze z `useState`. Pokazuje to licznik, który po wysłaniu akcji zapisuje bieżącą wartość:

```jsx
function Counter() {
  const [n, dispatch] = useReducer(counter, 0);
  function handleClick() {
    dispatch({ type: 'inc' });
    console.log(n);   // 0 przy pierwszym kliknięciu, 1 przy drugim: migawka z tego renderu
  }
  return <button onClick={handleClick}>n={n}</button>;
}
```

Kolejka ma drugą, mniej oczywistą konsekwencję. Dwie akcje wysłane w jednej procedurze obsługi nie widzą tej samej migawki. React stosuje je po kolei i każdej podaje wynik poprzedniej, a cały ekran renderuje się raz. Setter z `useState` wywołany dwa razy z wartością z migawki zachowuje się inaczej:

```jsx
function Both() {
  const [n, dispatch] = useReducer(counter, 0);
  const [m, setM] = useState(0);
  function handleClick() {
    dispatch({ type: 'inc' });   // reducer dostaje 0, zwraca 1
    dispatch({ type: 'inc' });   // reducer dostaje 1, zwraca 2
    setM(m + 1);                 // m + 1 liczone z migawki: 1
    setM(m + 1);                 // znowu 1, bo m w tym renderze to nadal 0
  }
  return <button onClick={handleClick}>n={n} m={m}</button>;
}
// Po jednym kliknięciu: n=2, m=1, jeden render.
```

Reducer działa więc jak aktualizator przekazany do settera, czyli funkcja w rodzaju `(m) => m + 1`. Różnica polega na tym, że aktualizator pisze się przy każdym wywołaniu od nowa, a reducer raz, w jednym miejscu. Ta sama seria akcji zawsze daje ten sam koszyk, bo każda gałąź liczy wynik wyłącznie z poprzedniego stanu i akcji.

Gdy procedura potrzebuje następnego stanu od razu, dokumentacja podsuwa proste wyjście.

> **„Jeśli trzeba przewidzieć następną wartość stanu, można ją obliczyć ręcznie, wywołując reducer samodzielnie.”**
>
> *„If you need to guess the next state value, you can calculate it manually by calling the reducer yourself”*
>
> — dokumentacja React, *useReducer*

W koszyku wyglądałoby to tak: `const next = cartReducer(cart, action)`, a potem `dispatch(action)`. Wywołanie jest bezpieczne tylko dlatego, że reducer jest czysty. Policzenie wyniku na boku nie zmienia koszyka ani niczego poza nim.

Każdy przycisk dostaje w `onClick` funkcję strzałkową, więc `dispatch` wykona się dopiero po kliknięciu. Zapis `onClick={dispatch({ type: 'CLEAR_CART' })}` wywołałby `dispatch` już w trakcie renderu. Każdy render wysyłałby wtedy akcję, która żąda kolejnego renderu. React przerywa tę pętlę wyjątkiem „Too many re-renders. React limits the number of renders to prevent an infinite loop.”

## Rysunek 4.2 — tekst z pola ilości w drodze do stanu

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    I["pole type=number<br/>e.target.value: tekst"] --> N["Number(...)<br/>'3' → 3, '' → 0"]
    N --> D["dispatch UPDATE_QTY<br/>{ id, qty }"]
    D --> R["cartReducer<br/>Math.max(1, qty)"]
    R --> S["item.qty w stanie<br/>3 albo 1"]
    S --> V["value={item.qty}<br/>pole pokazuje stan"]
    V -. "następna zmiana" .-> I
```

Na Rysunku 4.2 wartość z pola przechodzi przez trzy miejsca, z których każde coś zmienia. Przeglądarka oddaje tekst, `Number` zamienia go na liczbę, a reducer pilnuje dolnej granicy. Strzałka kropkowana zamyka obieg: pole pokazuje to, co zostało w stanie, a nie to, co wpisano. Dlatego jedyną regułą, która obowiązuje, jest reguła w reducerze.

## Zmiana ilości wpisana w pole

Przeglądarka oddaje zawartość pola zawsze jako tekst. Funkcja `Number` zamienia tekst na liczbę, a pusty tekst zamienia na zero:

```js
Number('3');     // 3
Number('');      // 0: pusty tekst to zero
Number('1.5');   // 1.5: ułamek przechodzi
```

Wiersz koszyka dostaje pole liczbowe. Wyrażenie `{cart.items.map(…)}` wewnątrz `<ul>` dostaje rozbudowany element `<li>`:

```jsx
{cart.items.map(item => (
  <li key={item.id}>
    {item.name}
    {' — '}
    {item.price.toFixed(2)} PLN
    {' × '}
    <input
      type="number"
      value={item.qty}
      min="1"
      onChange={e =>
        // Tekst z pola zamieniony na liczbę; granicę 1 pilnuje reducer.
        dispatch({ type: 'UPDATE_QTY', id: item.id, qty: Number(e.target.value) })
      }
    />
    {' = '}
    {(item.price * item.qty).toFixed(2)} PLN
    <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}>Remove</button>
  </li>
))}
```

Pole jest kontrolowane, a każda zmiana wysyła akcję `UPDATE_QTY` zamiast wywołania settera. Ilość 3 przy kawie daje „= 149.97 PLN”, a zero reducer zamienia na 1, więc pole znów pokazuje 1. Atrybut `min="1"` blokuje strzałkę w dół na wartości 1, ale nie powstrzyma wpisania zera z klawiatury. <u>Prawdziwą granicę wyznacza `Math.max(1, action.qty)` w reducerze</u>. Wstawki `{' — '}` i `{' × '}` to zwykłe napisy w JSX, które rozdzielają liczby spacjami.

## Suma pod listą

Pod listą, przed przyciskiem „Clear cart”, pojawia się suma:

```jsx
{/* Wartość pochodna: liczona przy każdym renderze, bez osobnego stanu. */}
{cart.items.length > 0 && (
  <p>Total: {cart.items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} PLN</p>
)}
```

Suma to wartość pochodna, liczona przy każdym renderze z tablicy pozycji. `reduce` zaczyna od zera i dodaje wartość kolejnych pozycji, więc kawa z herbatą dają „Total: 68.49 PLN”, a zmiana ilości kawy na 3 daje „Total: 168.47 PLN”. Akapit pokazuje się tylko przy niepustym koszyku dzięki operatorowi `&&`.

## Co robi zmiana w miejscu

Gdyby gałąź `ADD_ITEM` zrobiła `existing.qty += 1; return state;`, oddałaby Reactowi ten sam obiekt. React porównuje stary i nowy stan przez `Object.is`, które dla obiektów sprawdza tylko, czy to ten sam obiekt w pamięci. Ten sam obiekt oznacza pominięty render, więc ekran by się nie zmienił.

W trybie deweloperskim dochodzi drugi skutek. Tryb ścisły wywołuje reducer dwa razy na każdą akcję, więc mutacja wykonuje się dwukrotnie. Pierwsze dodanie kawy daje `qty: 1`, każde następne podnosi ilość o 2: do 3, potem do 5. Ekran pokazuje cały czas `× 1`, bo ten sam obiekt nie wywołuje renderu. Wartość `× 5` odsłania dopiero render z innego powodu, na przykład dodanie herbaty.

Gałąź z kopią `{ ...i, qty: i.qty + 1 }` przy dwóch wywołaniach dostaje dwa razy ten sam stan i dwa razy zwraca ten sam wynik. Podwójne wywołanie jest więc nieszkodliwe dla czystego reducera i widoczne dla każdego, który zmienia argument. Z tego powodu tryb ścisły pomaga znaleźć mutację, zanim trafi do wersji produkcyjnej, w której reducer wykonuje się raz.

> 💡 **Zapamiętaj:** `dispatch` tylko zgłasza akcję. Nowy stan liczy reducer w następnym renderze i obowiązują w nim wyłącznie reguły zapisane w reducerze.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r02_usereducer.md`](rozszerzenia/r02_usereducer.md)

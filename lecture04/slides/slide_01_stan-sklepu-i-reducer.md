# Sklep kawowy i reducer: wszystkie zmiany koszyka w jednej funkcji

## Jeden koszyk, wiele miejsc

Sklep kawowy ma pięć produktów i koszyk. Ten sam koszyk zmienia lista produktów, nagłówek z sumą i osobna strona `/cart`, a każda zmiana musi przestrzegać tych samych reguł. Dodanie produktu wymaga odpowiedzi serwera, która przychodzi po półtorej sekundy. Sekcja z rekomendacjami ładuje się dwie sekundy i może się nie załadować wcale. Aplikacja ma mimo to reagować od razu i nie tracić koszyka ani reszty strony przez jedną wolną albo zepsutą sekcję.

## Pięć klas problemów stanu

Te wymagania to pięć osobnych kłopotów. Bez odpowiedniego narzędzia każdy kończy się kodem, który działa, ale jest trudny do zmiany, a błąd w nim łatwo przeoczyć. Wykład idzie po kolei przez te klasy, a każde narzędzie wchodzi dopiero wtedy, gdy jego problem widać w sklepie.

| Klasa problemu | Co działa źle w sklepie | Narzędzie | Slajdy |
|---|---|---|---|
| Reguły jednego stanu rozsiane po procedurach obsługi | reguła „ten sam produkt zwiększa ilość” żyje w jednej z trzech funkcji | reducer i `useReducer` | 01–03 |
| Ten sam stan w wielu miejscach drzewa i na wielu trasach | nagłówek, lista i `/cart` mają widzieć jeden koszyk, a layout nie przekaże stronie propsów | propsy, kontekst, dostawca w layoucie | 04–06 |
| Zmiana czeka na serwer | po kliknięciu nic się nie dzieje przez 1,5 s | `useOptimistic` | 07 |
| Dane przychodzą później albo wcale | rekomendacje ładują się 2 s i mogą nie przyjść | `use`, `Suspense`, granica błędów | 08–10 |
| Koszt rozprowadzania stanu | zmiana koszyka renderuje także przyciski, które go nie czytają | pomiar renderów, podział kontekstu | 11–12 |

Każde z tych narzędzi ma cenę. Dlatego slajdy z nowym narzędziem kończą się sekcją „Zalety i koszty”, a w niej wskazaniem, kiedy lepiej wybrać coś prostszego. Pierwszą klasę pokazuje sekcja „Koszyk ma trzy rodzaje zmian”: trzy procedury `useState` z tą samą regułą w jednej z nich.

## Katalog produktów, layout i pierwsza strona

Projekt `cart-app` powstaje z kreatora `create-next-app` 16.4.0 bez TypeScriptu, Tailwinda, ESLinta i kompilatora Reacta (flagi kreatora i porządki w plikach opisuje `demo/PROWADZACY.md`). Wersje `next` 16.4.0 oraz `react` i `react-dom` 19.3.0 są przypięte w `package.json`. Bez kompilatora, który sam dopisuje memoizację, liczba renderów zależy tylko od kodu ze slajdów.

Katalog produktów leży w pliku `app/data/products.js`:

```js
// Statyczny katalog produktów (gotowy przed wykładem).
export const products = [
  { id: 1, name: 'Arabica coffee beans 1kg', price: 49.99 },
  { id: 2, name: 'Earl Grey tea 100g', price: 18.5 },
  { id: 3, name: 'Ceramic mug 350ml', price: 34.0 },
  { id: 4, name: 'Tea infuser', price: 22.0 },
  { id: 5, name: 'Cane sugar 500g', price: 8.99 },
];
```

Każdy produkt ma trzy pola. **`id`** posłuży jako klucz listy i jako sposób rozpoznania produktu w koszyku. **`name`** to nazwa na stronie. **`price`** jest liczbą, bo będzie mnożona przez ilość i sumowana. Liczbę na ekranie formatuje metoda `toFixed`, która zwraca napis z podaną liczbą cyfr po przecinku:

```js
(18.5).toFixed(2);        // → "18.50": napis, a nie liczba
(49.99 * 3).toFixed(2);   // → "149.97": zaokrąglenie do dwóch miejsc
```

Layout główny obejmuje każdą stronę aplikacji, a stronę dostaje jako `children`. Eksport `metadata` ustawia tytuł karty przeglądarki. Komponent `Link` z `next/link` jest linkiem, który przechodzi na inną trasę bez przeładowania całej strony. Layout dostaje od razu nawigację z dwoma linkami:

```jsx
import Link from 'next/link';

export const metadata = { title: 'Coffee shop' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Shop</Link> | <Link href="/cart">Cart</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

Strona główna `app/page.jsx` na tym etapie ma tylko nagłówek `<main><h1>Coffee shop</h1></main>`. Plik nie ma dyrektywy `'use client'`, więc strona jest komponentem serwerowym. Nic na niej się nie zmienia, bo nie ma jeszcze stanu. Link „Cart” prowadzi na razie do strony 404, bo trasa `/cart` powstanie dopiero po wprowadzeniu kontekstu.

## Koszyk ma trzy rodzaje zmian

Koszyk przyjmuje trzy operacje. Produkt można **dodać**, a gdy już jest w koszyku, rośnie jego ilość. Pozycję można **usunąć**. Cały koszyk można **wyczyścić**. Pozycja ma kształt `{ id, name, price, qty }`, czyli dane produktu z dopisaną ilością.

Reguła dodawania opiera się na metodzie `find`, która zwraca pierwszy element spełniający warunek albo `undefined`:

```js
[{ id: 1 }, { id: 2 }].find(i => i.id === 2);  // → { id: 2 }
[{ id: 1 }].find(i => i.id === 9);             // → undefined: brak takiego elementu
```

Najprostsza droga to jedna tablica w `useState` i osobna funkcja dla każdej operacji. Poniższy kod nie należy do projektu. Pokazuje, czego kolejne kroki unikają:

```jsx
'use client';
import { useState } from 'react';

export default function HomePage() {
  const [items, setItems] = useState([]);

  // Reguła „ten sam produkt zwiększa ilość” żyje tylko tutaj.
  function handleAdd(product) {
    const existing = items.find((i) => i.id === product.id);
    setItems(
      existing
        ? items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { ...product, qty: 1 }]
    );
  }

  function handleRemove(id) {
    setItems(items.filter((i) => i.id !== id));
  }

  function handleClear() {
    setItems([]);
  }
  // ...JSX z przyciskami
}
```

Każda funkcja z osobna jest poprawna, kłopot leży w miejscu reguły. Każda musi też pamiętać, że nową tablicę buduje się z kopii (`map`, `filter`, rozwinięcie), a nie przez zmianę starej. Zasada „ten sam produkt zwiększa ilość” istnieje tylko w `handleAdd`, a stan zmieniają trzy osobne funkcje. <u>Nowy przycisk „+1” przy pozycji musiałby skopiować tę regułę</u>, a każda kolejna procedura obsługi powtarzałaby to samo ryzyko. Przy większej liczbie reguł rozsianych po funkcjach żadna z nich nie pokazuje, jakie zmiany koszyka w ogóle są dozwolone.

> **„Komponenty z wieloma aktualizacjami stanu rozsianymi po wielu procedurach obsługi zdarzeń mogą stać się przytłaczające. W takich przypadkach całą logikę aktualizacji stanu można zebrać poza komponentem, w jednej funkcji nazywanej »reducerem«.”**
>
> *„Components with many state updates spread across many event handlers can get overwhelming. For these cases, you can consolidate all the state update logic outside your component in a single function, called “reducer”.”*
>
> — dokumentacja React, *Managing State*

## Rysunek 4.1 — gdzie mieszkają reguły koszyka

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    subgraph A["useState: reguły w procedurach obsługi"]
        B1["handleAdd<br/>reguła: ten sam produkt → qty + 1"] --> S1["setItems(...)"]
        B2["handleRemove"] --> S1
        B3["handleClear"] --> S1
    end
    subgraph R["reducer: reguły w jednej funkcji"]
        C1["przyciski<br/>tylko opisują zdarzenie"] --> F["cartReducer(state, action)<br/>wszystkie reguły"]
    end
    A -. "ten sam koszyk, inny podział pracy" .-> R
```

Na Rysunku 4.1 lewa ramka odpowiada kodowi powyżej. Trzy procedury obsługi same liczą nową tablicę, a jedna z nich niesie regułę, której pozostałe nie znają. W prawej ramce przyciski tylko opisują, co się stało, a jedyne miejsce znające reguły to funkcja `cartReducer`.

## Czym jest reducer

**Reducer** to czysta funkcja, która z bieżącego stanu i akcji wylicza stan następny: `(stan, akcja) => nowy stan`. Schwarzmüller tłumaczy nazwę tym, że funkcja „redukuje stary stan (w połączeniu z akcją) do nowego stanu” (*„reduces the old state (combined with an action) to a new state”*). Dokumentacja wiąże ją z operacją na tablicach.

> **„Choć reducery mogą »zredukować« ilość kodu w komponencie, w rzeczywistości nazwano je od operacji `reduce()`, którą wykonuje się na tablicach.”**
>
> *„Although reducers can “reduce” the amount of code inside your component, they are actually named after the reduce() operation that you can perform on arrays.”*
>
> — dokumentacja React, *Extracting State Logic into a Reducer*

Metoda `reduce` przechodzi po tablicy i za każdym razem podaje funkcji wynik dotychczasowy oraz bieżący element. Drugi argument `reduce` to wynik startowy:

```js
// (wynik dotychczasowy, element) => wynik następny; startujemy od 0
[1, 2, 3].reduce((acc, x) => acc + x, 0);   // → 6
```

Reducer Reacta działa tak samo, tylko elementami są akcje, a wynikiem stan. Koszyk po dziesięciu kliknięciach jest więc wynikiem przepuszczenia dziesięciu akcji przez tę samą funkcję, zaczynając od pustego koszyka. Ten sam wynik daje `akcje.reduce(cartReducer, initialCartState)`, bo `cartReducer` ma dokładnie kształt funkcji, której oczekuje `reduce`.

Tejas Kumar w *Fluent React* nazywa to podejście modelem opartym na zdarzeniach (*event sourced*): zapisuje się, co się wydarzyło, a nie tylko wynik.

> **„`useReducer` to model oparty na zdarzeniach. Można nim modelować zdarzenia zachodzące w aplikacji, a potem śledzić je w czymś w rodzaju dziennika audytu.”**
>
> *„`useReducer` is an _event sourced_ model, meaning it can be used to model events that happen in our application, which we can then keep track of in some type of audit log.”*
>
> — Tejas Kumar, *Fluent React*

Dziennik audytu to zapis zdarzeń w kolejności. Według Kumara pozwala odtworzyć je przy szukaniu błędu. Reducer nie czyta propsów ani niczego spoza swoich argumentów, więc może leżeć w osobnym module, bez Reacta.

## Akcja opisuje, co się stało

**Akcja** (*action*) to zwykły obiekt opisujący zdarzenie. Według dokumentacji może mieć dowolny kształt. Zwyczajowo dostaje tekstowe pole `type`, które opisuje, co się stało (*„it is common to give it a string type that describes what happened”*). Koszyk zna trzy akcje i każda niesie tylko swoje dane. `ADD_ITEM` niesie produkt w polu `product`, `REMOVE_ITEM` niesie `id`, a `CLEAR_CART` nie niesie nic. Słowo „akcja” ma w React 19 także drugie znaczenie: funkcję asynchroniczną wykonywaną w przejściu, na przykład przekazaną do `<form action>`. W reducerze akcja jest zawsze obiektem z `type`, a o tym, które znaczenie chodzi, rozstrzyga kontekst.

> **„Powinna zawierać minimum informacji potrzebnych reducerowi do obliczenia następnego stanu.”**
>
> *„It should include the minimal necessary information that the reducer needs to compute the next state.”*
>
> — dokumentacja React, *useReducer*

Nazwy akcji w koszyku, `ADD_ITEM` i `CLEAR_CART`, brzmią jak polecenia. Dokumentacja woli nazwy w czasie przeszłym, jak `'added'` i `'deleted'` (*„Choose a name that says what happened!”*), ale obie konwencje działają. Ważniejsza jest reguła o liczbie akcji. Jedna interakcja to jedna akcja, nawet jeśli zmienia wiele danych, dlatego „Clear cart” wysyła jedno `CLEAR_CART`, a nie pięć `REMOVE_ITEM`. Dziennik akcji czyta się wtedy jak historię zakupów.

## Instrukcja `switch`, klamry i `return`

Reducer wybiera gałąź według pola `type`, a do takiego wyboru służy instrukcja `switch`. Porównuje wartość z kolejnymi etykietami `case` i zaczyna wykonywać kod od pierwszej pasującej. Bez `return` albo `break` wykonanie nie zatrzymuje się na końcu gałęzi, tylko przechodzi do następnej:

```js
function noBreak(t) {
  const out = [];
  switch (t) {
    case 'a': out.push('a');          // brak break: wykonanie spada niżej
    case 'b': out.push('b'); break;
    default:  out.push('d');
  }
  return out;
}
noBreak('a');   // → ['a', 'b']: gałąź 'a' przeszła do 'b'
noBreak('b');   // → ['b']
```

Dokumentacja zaleca dwa nawyki, które usuwają ten problem w reducerze.

> **„Zalecamy zamykanie każdego bloku `case` w klamrach `{` i `}`, żeby zmienne zadeklarowane w różnych gałęziach ze sobą nie kolidowały. Gałąź powinna też zwykle kończyć się instrukcją `return`. Bez niej kod »przejdzie« do następnej gałęzi, co może prowadzić do błędów!”**
>
> *„We recommend wrapping each case block into the { and } curly braces so that variables declared inside of different cases don’t clash with each other. Also, a case should usually end with a return. If you forget to return, the code will “fall through” to the next case, which can lead to mistakes!”*
>
> — dokumentacja React, *Extracting State Logic into a Reducer*

## Plik z regułami koszyka

Reguły trafiają do pliku `app/lib/cartReducer.js`. Plik nie importuje Reacta i nie zawiera JSX. Pierwsza część to stan początkowy i gałąź dodawania:

```js
// Wszystkie zmiany koszyka w jednej czystej funkcji: (state, action) → nowy stan.
export const initialCartState = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        // Produkt już jest w koszyku: rośnie tylko jego ilość.
        return {
          items: state.items.map(i =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      // Nowy produkt: dopisana pozycja z ilością 1.
      return { items: [...state.items, { ...action.product, qty: 1 }] };
    }
```

Pozostałe gałęzie zamykają funkcję:

```js
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

Stan jest obiektem `{ items: [] }`, a nie gołą tablicą. Każda gałąź zwraca nowy obiekt z samą tablicą `items`, bo to jedyne pole stanu. Przy stanie z kilkoma polami każda gałąź musiałaby dopisać `...state`, żeby nie zgubić pozostałych. W koszyku tylko `ADD_ITEM` deklaruje zmienną (`existing`), więc tylko ta gałąź potrzebuje klamer. Każda gałąź kończy się `return`, więc żadna nie przechodzi do następnej.

Reducer jest zwykłą funkcją, więc działa także poza komponentem. Dwa wywołania z produktem, który drugim razem niesie inną cenę, pokazują jedną regułę, której nikt nie zapisał wprost:

```js
const coffee = { id: 1, name: 'Coffee', price: 49.99 };
let s = cartReducer(initialCartState, { type: 'ADD_ITEM', product: coffee });
s = cartReducer(s, { type: 'ADD_ITEM', product: { ...coffee, price: 59.99 } });
s.items;   // → [{ id: 1, name: 'Coffee', price: 49.99, qty: 2 }]
```

`ADD_ITEM` niesie cały obiekt produktu, bo reducer nie ma dostępu do katalogu. Gałąź dla produktu, który już jest w koszyku, zmienia jednak tylko `qty`. **Koszyk zapamiętuje dane produktu z chwili pierwszego dodania.** W sklepie z cenami zmienianymi w trakcie sesji tę regułę trzeba by zapisać świadomie.

## Kopia w każdej gałęzi i czystość reducera

<u>Reducer zwraca nowy obiekt zbudowany z kopii i nigdy nie modyfikuje argumentu `state`</u>. Wyjątkiem jest akcja, która niczego nie zmienia: wtedy wolno oddać ten sam obiekt. Każda gałąź `cartReducer` buduje nowy obiekt `{ items: … }`, więc z wyjątku nie korzysta.

Reducer obowiązują te same zasady co funkcję komponentu, bo działa w trakcie renderowania.

> **„Reducery muszą być czyste. Podobnie jak aktualizatory stanu, reducery działają w trakcie renderowania! (Akcje są kolejkowane do następnego renderu). Oznacza to, że reducery muszą być czyste: te same dane wejściowe zawsze dają ten sam wynik. Nie powinny wysyłać żądań, planować timerów ani wywoływać efektów ubocznych.”**
>
> *„Reducers must be pure. Similar to state updater functions, reducers run during rendering! (Actions are queued until the next render.) This means that reducers must be pure—same inputs always result in the same output. They should not send requests, schedule timeouts, or perform any side effects”*
>
> — dokumentacja React, *Extracting State Logic into a Reducer*

W `cartReducer` nie ma `fetch`, `Date.now()` ani zapisu do `document.title`. Czystość daje dwie korzyści. Reducer da się wywołać na próbę, bez skutków dla aplikacji. Tryb ścisły (*Strict Mode*) sprawdza czystość podwójnym wywołaniem, więc React może wywołać reducer dwa razy dla tej samej akcji i dostanie ten sam wynik.

## Nieznana akcja to błąd programisty

Ostatnia gałąź rzuca wyjątek `Unknown action`, a literał szablonowy w odwrotnych apostrofach wstawia do komunikatu nazwę typu przez `${action.type}`. Literówka w typie, na przykład `'ADD_ITM'`, kończy się od razu czytelnym błędem z nazwą złego typu. Bez tej gałęzi funkcja zwróciłaby `undefined`, które zostałoby nowym stanem. Następny render przerwałby wtedy wyjątek `Cannot read properties of undefined (reading 'items')`, wskazujący na odczyt `cart.items`, a nie na literówkę.

Daniel Bugl w *Learn React Hooks* zauważa, że w Reduxie, czyli zewnętrznej bibliotece trzymającej stan całej aplikacji w jednym magazynie, reducer w przypadku domyślnym zwykle zwraca bieżący stan. Hook reducera nie trzyma całego stanu aplikacji. Każdy reducer obsługuje tylko akcje swojego kawałka stanu, więc akcja spoza listy jest błędem.

## Zalety i koszty reducera

Reducer nie robi niczego, czego nie zrobiłby `useState`. Zmienia miejsce, w którym leżą reguły, i to miejsce jest jego jedyną zaletą. Ma ona cenę widoczną już w tym slajdzie.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Wszystkie reguły koszyka w jednym pliku, a nowa zmiana to nowa gałąź `case` | Więcej kodu niż przy `useState`: 22 linie reducera wobec 14 linii trzech procedur (kryterium „Rozmiar kodu” w następnej części) | Stan zmieniany w jednym miejscu, bez reguły, która musi działać zawsze: `useState` (następna część) |
| Czysta funkcja, którą da się sprawdzić bez Reacta, wywołaniem ze stanem i akcją (`node:assert`, następna część) | Typ akcji to napis: literówka wychodzi dopiero przy uruchomieniu, jako wyjątek z gałęzi `default` | Pole wyszukiwania w reducerze wymagałoby akcji `SET_QUERY` bez żadnej reguły do scentralizowania (następna część) |
| Akcja opisuje zdarzenie, więc jedno `console.log(action)` pokazuje każdą zmianę koszyka z przyczyną (następna część) | Kod jednej funkcji komponentu rozdziela się na dwa pliki: reducer i stronę | Flaga „panel koszyka otwarty”: `useState` obok reducera w tym samym komponencie (następna część) |

> 💡 **Zapamiętaj:** reducer zna wszystkie dozwolone zmiany stanu, a akcja tylko opisuje zdarzenie. Nieznany typ akcji kończy się wyjątkiem.


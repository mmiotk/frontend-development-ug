# Osobne konteksty: koszyk osobno, funkcje osobno

## Wartości, które zmieniają się w różnym tempie

Przy jednym kontekście `{ cart, dispatch, addOptimistic }` każde dodanie produktu renderuje wszystkie pięć przycisków, choć żaden z nich nie potrzebuje koszyka. Wartości w obiekcie zmieniają się jednak w różnym tempie. Koszyk jest nowym obiektem po każdej akcji, także optymistycznej, a obie funkcje pozostają tymi samymi funkcjami przez cały czas życia dostawcy. Skoro React porównuje wartość kontekstu w całości, rozwiązaniem jest danie każdej z nich osobnego kontekstu. Poniższy podział nie należy do demo i służy jako przykład. W `app/context/CartContext.jsx` jeden kontekst zamieniłby się na trzy:

```jsx
// Przykład spoza demo: trzy konteksty zamiast jednego
const CartStateContext = createContext(null);      // zmienia się przy każdej akcji
const CartDispatchContext = createContext(null);   // stała tożsamość: dispatch z useReducer
const CartOptimisticContext = createContext(null); // stała tożsamość: setter z useOptimistic

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  // Koszyk na ekranie = prawdziwy koszyk + akcje, które czekają na serwer.
  // Ten sam reducer liczy oba.
  const [optimisticCart, addOptimistic] = useOptimistic(cart, cartReducer);

  return (
    <CartStateContext value={optimisticCart}>
      <CartDispatchContext value={dispatch}>
        <CartOptimisticContext value={addOptimistic}>
          {children}
        </CartOptimisticContext>
      </CartDispatchContext>
    </CartStateContext>
  );
}
```

`CartProvider` nadal trzyma jeden reducer i jeden hook optymistyczny, ale ich wyniki rozdziela między trzy konteksty. Każdy dostawca dostaje w `value` jedną wartość, a nie obiekt sklejany w JSX. Obu funkcji nie wkłada się do wspólnego obiektu: taki obiekt powstawałby od nowa przy każdym renderze dostawcy i zmieniałby wartość kontekstu tak samo jak koszyk. Pod dostawcą stoją trzy hooki zamiast `useCart`, każdy z własnym strażnikiem:

```jsx
// Hook do wysyłania akcji koszyka.
export function useCartDispatch() {
  const ctx = useContext(CartDispatchContext);
  if (ctx === null) throw new Error('useCartDispatch must be used inside <CartProvider>');
  return ctx;
}
```

`useCartState()` i `useCartOptimistic()` wyglądają tak samo, tylko czytają własny kontekst i mają w komunikacie własną nazwę. Komponent poza dostawcą zgłosi więc na przykład `useCartState must be used inside <CartProvider>`. Layout się nie zmienia, bo `CartProvider` ma tę samą nazwę i przyjmuje te same `children`.

## Komponenty wybierają kontekst

Podział zmienia interfejs pliku: zamiast `useCart` są trzy hooki, a każdy konsument bierze tylko te, których potrzebuje. Przycisk dodawania korzysta z obu stałych funkcji, więc importuje dwa hooki.

```jsx
// Przykład spoza demo: AddToCartButton po podziale
import { useCartDispatch, useCartOptimistic } from '../context/CartContext';

const dispatch = useCartDispatch();
const addOptimistic = useCartOptimistic();
```

`CartSummary` tylko wyświetla koszyk, więc wystarczy mu stan. Strona `app/cart/page.jsx` pokazuje koszyk i ma przyciski usuwania oraz czyszczenia, więc bierze stan i `dispatch`.

```jsx
// Przykład spoza demo: CartSummary po podziale
import { useCartState } from '../context/CartContext';

const cart = useCartState();
```

```jsx
// Przykład spoza demo: app/cart/page.jsx po podziale
import { useCartState, useCartDispatch } from '../context/CartContext';

const cart = useCartState();
const dispatch = useCartDispatch();
```

Komponent, który czyta stan, subskrybuje jego kontekst, więc po zmianie koszyka renderuje się tak jak przed podziałem. Zysk pojawia się tylko w komponentach, które czytają same funkcje.

## Wynik drugiego pomiaru

Ten sam pomiar co przy jednym kontekście, z `console.log` w `AddToCartButton` i `CartSummary` oraz jednym dodaniem kawy, daje po podziale inny wynik:

| Komponent | Jeden kontekst | Trzy konteksty |
|---|---|---|
| `AddToCartButton render 1` (kliknięty) | 4 wpisy | 0 |
| `AddToCartButton render 2` … `5` | po 4 wpisy | 0 |
| `CartSummary render` | 4 wpisy | 4 wpisy |

Żaden przycisk nie pojawia się już w konsoli, także kliknięty. Ich konteksty niosą dwie funkcje, a `value` każdego z nich po kliknięciu i po odpowiedzi serwera wskazuje na tę samą funkcję co wcześniej. Dla Reacta wartość jest więc niezmieniona. Własny stan przycisku, `error`, przy sukcesie zostaje `null`, więc i on nie daje renderu. Liczba wpisów `CartSummary` jest w obu kolumnach równa, bo koszyk, który pokazuje, zmienia się w obu wersjach dwa razy: przy kliknięciu na optymistyczny i po 1,5 s na prawdziwy.

## Rysunek 4.12 — kto słucha którego kontekstu

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    R["CartProvider<br/>useReducer, useOptimistic"] --> S["CartStateContext<br/>value = optimisticCart, zmienia się"]
    R --> D["CartDispatchContext<br/>value = dispatch, stały"]
    R --> O["CartOptimisticContext<br/>value = addOptimistic, stały"]
    S --> CS["CartSummary<br/>render po każdej akcji"]
    S --> CP["strona /cart<br/>render po każdej akcji"]
    D --> CP
    D --> AB["AddToCartButton<br/>bez renderu przez kontekst"]
    O --> AB
```

Na Rysunku 4.12 stan koszyka powstaje tylko w `CartProvider`. Stan i obie funkcje rozchodzą się do trzech kontekstów. `CartSummary` czyta wyłącznie kontekst stanu, a strona `/cart` stan i `dispatch`, bo wyświetla koszyk i ma przyciski usuwania. `AddToCartButton` czyta tylko konteksty z funkcjami, których wartość nigdy się nie zmienia. Zmiana koszyka nie dociera do niego przez kontekst w ogóle, a rodzica, który mógłby go wyrenderować od nowa, nie ma: listę produktów układa serwerowa strona główna.

## Ten sam podział w dokumentacji

Dwa osobne konteksty to układ, który dokumentacja Reacta pokazuje jako podstawowy przy łączeniu reducera z kontekstem:

> **„Żeby przekazać je w dół drzewa, tworzy się dwa osobne konteksty: `TasksContext` dostarcza bieżącą listę zadań, a `TasksDispatchContext` dostarcza funkcję, która pozwala komponentom wysyłać akcje.”**
>
> *„To pass them down the tree, you will create two separate contexts: TasksContext provides the current list of tasks. TasksDispatchContext provides the function that lets components dispatch actions.”*
>
> — dokumentacja React, *Scaling Up with Reducer and Context*

Wariant z trzema kontekstami dokłada do tego układu trzeci, bo sklep ma drugą stałą funkcję, setter koszyka optymistycznego. Dokumentacja nie uzasadnia podziału liczbą renderów. Uzasadnienie wynika z pomiaru i z mechanizmu porównania wartości. Podział ma też drugi zysk: z importów widać od razu, który komponent coś zmienia, a który tylko wyświetla.

## Dlaczego `dispatch` się nie zmienia

Dokumentacja `useReducer` podaje, że funkcja `dispatch` ma stałą tożsamość (*„The dispatch function has a stable identity”*). React tworzy ją raz, gdy komponent z `useReducer` się montuje, i przy każdym kolejnym renderze oddaje ten sam obiekt funkcji. Funkcja zapisana w ciele komponentu zachowuje się inaczej:

```jsx
function CartProbe() {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const clear = () => dispatch({ type: 'CLEAR_CART' }); // nowa funkcja przy każdym wykonaniu ciała
  // → po ADD_ITEM: dispatch ten sam co przy montowaniu, clear już inny
}
```

Po jednym `ADD_ITEM` komponent ma za sobą dwa rendery. `dispatch` z pierwszego i z drugiego renderu to ta sama funkcja, a dwa egzemplarze `clear` są różne. Wyrażenie strzałkowe w ciele komponentu wykonuje się przy każdym renderze i za każdym razem daje świeży obiekt funkcji. React przechowuje `dispatch` poza ciałem komponentu, razem z jego stanem, i dlatego może oddawać ten sam egzemplarz. Tak samo zachowuje się setter z `useOptimistic`: przyciski, które go czytają, po zmianie koszyka się nie renderują, więc jego tożsamość też się nie zmienia.

Stąd bierze się przewaga reducera przy podziale kontekstu. Dostawca zbudowany na `useState` z funkcjami `addItem`, `removeItem` i `clearCart`, zapisanymi w jego ciele, tworzyłby je przy każdym renderze od nowa. Kontekst z takimi funkcjami zmieniałby wartość tak samo jak kontekst ze stanem i przyciski znów renderowałyby się po każdej akcji. Takie funkcje da się zapamiętać między renderami hookiem `useCallback`, ale memoizacja to osobna technika, z własną tablicą zależności do pilnowania. <u>Reducer daje stałą funkcję bez memoizacji, bo wszystkie zmiany koszyka idą przez jedno `dispatch` o stałej tożsamości</u>, a ich logika siedzi w `cartReducer` poza komponentem.

Ta sama reguła działa w drugą stronę dla stanu. `cartReducer` zwraca nowy obiekt także wtedy, gdy akcja niczego nie zmienia: `CLEAR_CART` na pustym koszyku daje `{ items: [] }`, czyli inny obiekt niż poprzedni. Konsumenci stanu renderują się wtedy mimo braku zmiany. Widać to po kliknięciu „Clear cart” na stronie `/cart` przy pustym koszyku: w konsoli pojawia się jedna para wpisów `CartSummary render`.

## Gdzie koszyk mieszka na końcu

Koszyk żyje w stanie `CartProvider`, czyli w pamięci jednej karty przeglądarki: przeładowanie strony na `/cart` pokazuje „Cart: 0 pcs — 0.00 PLN”. Funkcje `fakeAddToCart` i `fetchRecommended` tylko udają serwer opóźnieniem, a nic poza kartą nie wie o zawartości koszyka. Trwały koszyk wymaga zapisu w miejscu, które przeżyje przeładowanie i będzie wspólne dla urządzeń użytkownika.

## Zalety i koszty podziału kontekstu

Podział usuwa zbędne rendery przycisków za cenę większej liczby kontekstów i hooków. Opłaca się tam, gdzie pomiar z poprzedniego slajdu pokazał rendery, których nikt nie potrzebuje.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Przyciski bez renderów po zmianie koszyka: 0 wpisów w konsoli zamiast 4 na każdy z pięciu. | Trzy konteksty i trzy hooki zamiast jednego. Konsument musi wiedzieć, który wybrać. | Rendery nie spowalniają aplikacji (pięć przycisków to koszt pomijalny): zostać przy jednym kontekście. Najpierw mierzyć, potem dzielić. |
| Z importów widać od razu, który komponent coś zmienia, a który tylko wyświetla. | Zmiana interfejsu pliku: `useCart` znika, więc na czas przepisywania konsumentów potrzebny jest adapter (rozszerzenie). | Komponent ma się renderować po zmianie jednego pola: wbudowany kontekst nie wystarcza, potrzebny jest selektor z biblioteki. |
| Stała funkcja daje się rozdzielić bez memoizacji, bo `dispatch` z `useReducer` ma stałą tożsamość. | Stan nadal zmienia się przy każdej akcji, także takiej, która niczego nie zmienia (`CLEAR_CART` na pustym koszyku), więc jego konsumenci renderują się mimo to. | Dostawca na `useState` z funkcjami w ciele: powstają od nowa przy każdym renderze, więc podział nie pomoże bez `useCallback` (osobna technika, z tablicą zależności). |

> 💡 **Zapamiętaj:** koszyk i każda stała funkcja trafiają do osobnych kontekstów. Komponent, który tylko wysyła akcje, czyta konteksty z funkcjami i nie renderuje się po zmianie koszyka, bo `dispatch` z `useReducer` i setter z `useOptimistic` mają stałą tożsamość. Gdy potrzebny jest render po zmianie jednego pola, wbudowany kontekst nie wystarcza i potrzebny jest selektor z biblioteki.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r12_podzial-kontekstu.md`](rozszerzenia/r12_podzial-kontekstu.md)

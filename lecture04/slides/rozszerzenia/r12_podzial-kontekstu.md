# Rozszerzenia do slajdu 12: Osobne konteksty: koszyk osobno, funkcje osobno

Powrót: [`slide_12_podzial-kontekstu.md`](../slide_12_podzial-kontekstu.md)

## Rozszerzenie: czego kontekstowi brakuje, czyli selektor

Dalsze dzielenie, na przykład na kontekst pozycji i kontekst sumy, w sklepie nic by nie dało. Suma i liczba sztuk wynikają z tej samej tablicy `items`, więc oba konteksty zmieniałyby się zawsze razem. Potrzebny byłby **selektor**, czyli funkcja wybierająca z wartości jeden fragment, przy czym komponent renderuje się tylko po zmianie tego fragmentu. Barklund w *React in Depth* pisze, że wbudowany kontekst tego nie potrafi.

> **„Niestety nie da się powiedzieć Reactowi, żeby renderował ponownie tylko wybrany komponent, gdy zmienią się określone pola kontekstu.”**
>
> *„Unfortunately, we cannot tell React to re-render only a specific component when specific properties of a context update.”*
>
> — Morten Barklund, *React in Depth*

Selektor jest podstawowym narzędziem bibliotek stanu. W React Redux, bibliotece stanu aplikacji, hook `useSelector` wybiera fragment stanu z magazynu i po każdej wysłanej akcji porównuje przez referencję poprzedni i bieżący wynik selektora. Dokumentacja dopowiada: „jeśli są różne, komponent zostanie zmuszony do ponownego renderu” (*„If they are different, the component will be forced to re-render”*). Dokumentacja Zustand, innej biblioteki stanu, ujmuje to krócej. Wybiera się fragment stanu, a komponent go czytający renderuje się, gdy ten fragment się zmieni (*„Select your state and the consuming component will re-render when that state changes”*).

Barklund dodaje, że selektor kontekstu miał pojawić się w wersji beta React 19, ale do niej nie wszedł. Jako obejście podaje zewnętrzny pakiet `use-context-selector` z hookiem `useContextSelector`. Pakiet wymaga utworzenia kontekstu jego własną funkcją `createContext`, więc zmienia także zapis dostawcy.

```jsx
// Przykład spoza demo: use-context-selector 2.0.0, jeden kontekst { cart, dispatch, addOptimistic }
import { createContext, useContextSelector } from 'use-context-selector';
const CartContext = createContext(null);   // funkcja z pakietu; dostawca: <CartContext.Provider value={…}>

// w AddToCartButton, zamiast useContext:
const dispatch = useContextSelector(CartContext, v => v.dispatch);
// jedno dodanie kawy (next build + next start) → AddToCartButton render 1 … 5: po 2 wpisy, jak z useContext
```

W React 19.3.0 pakiet nie zmniejszył liczby wywołań funkcji przycisków: także po `dispatch` wysłanym bez przejścia każdy z pięciu przycisków wywołał się raz. W sklepie dwa wbudowane konteksty wystarczają.

## Rozszerzenie: kiedy kontekst przestaje wystarczać

Biblioteki stanu też korzystają z kontekstu Reacta, ale wkładają do niego **magazyn**, czyli stały obiekt, który trzyma stan i sam powiadamia subskrybentów o zmianach. Według dokumentacji React Redux do kontekstu trafia magazyn i wewnętrzne obiekty subskrypcji (*„the Redux store and internal subscription wrappers”*). Bieżący stan dociera do komponentu przez selektor, który subskrybuje magazyn. To ta sama idea co `CartDispatchContext`. <u>Kontekst niesie stałą referencję, a selektor decyduje o renderze</u>.

Z tej różnicy wynikają sygnały, które da się sprawdzić w kodzie. Pierwszy pojawia się, gdy wiele niezależnych fragmentów stanu czyta wiele komponentów, a podział na konteksty rozrasta się w stos zagnieżdżonych dostawców. Drugi to wartość zmieniana przy każdym zdarzeniu i czytana przez wielu konsumentów. Trzeci to potrzeba wspólnej obsługi efektów ubocznych dla wszystkich akcji, którą w Reduxie, bibliotece stanu z jednym magazynem, realizuje **middleware**, czyli funkcje pośredniczące między wysłaniem akcji a reducerem. Barklund ocenia Zustand, małą bibliotekę stanu, jako prostą, ale trudniejszą w dużej skali:

> **„Jest tak prosty w użyciu, że nie da się go zepsuć. Trudniej go jednak używać w dużej skali, bo nie ma wbudowanych narzędzi ani wzorców organizowania wielu niezależnych magazynów.”**
>
> *„It’s so simple to use that you can’t screw it up. It’s a bit trickier to use at scale, however, because it doesn’t come with any built-in tools or patterns for organizing multiple unrelated data stores.”*
>
> — Morten Barklund, *React in Depth*

Koszyk sklepu nie spełnia żadnego z sygnałów: ma jeden reducer, cztery akcje i cztery rodzaje konsumentów. Do kontekstu nie trafiają też wartości wyliczane, jak suma, ani komunikat błędu, który żyje w przycisku. Magazyn Zustand może być zmienną modułu, a zmienna modułu na serwerze jest wspólna dla wszystkich żądań. Dokumentacja Zustand dla Next.js zastrzega więc, że magazyn nie powinien być współdzielony między żądaniami (*„the store should not be shared across requests”*). Dlatego powstaje osobno dla każdego żądania, na przykład w dostawcy.

```jsx
// Przykład spoza demo: magazyn Zustand 5.0.16 w kontekście, osobny dla każdego egzemplarza dostawcy
const createCartStore = () => createStore(set => ({
  items: [],
  add: product => set(s => ({ items: [...s.items, product] })),
}));
const CartStoreContext = createContext(null);

function CartStoreProvider({ children }) {
  const [store] = useState(createCartStore);         // magazyn powstaje raz na egzemplarz
  return <CartStoreContext value={store}>{children}</CartStoreContext>;
}
const useCart = selector => useStore(use(CartStoreContext), selector);

// AddButton: const add = useCart(s => s.add);   ItemCount: const count = useCart(s => s.items.length);
// jedno dodanie kawy (next start) → ItemCount render: 1 wpis, AddButton render 1 … 5: 0 wpisów
```

Wartość kontekstu, czyli magazyn, nie zmienia się wcale, a o renderze decyduje selektor. Przyciski czytają stałą funkcję `add`, więc dodanie kawy renderuje tylko licznik.

## Rozszerzenie: zmiana interfejsu przez adapter

Usunięcie eksportu `useCart` od razu przerywa budowanie komunikatem „Export useCart doesn't exist in target module” w każdym z czterech plików, które go importują. Na czas przepisywania konsumentów plik może więc eksportować dawną nazwę jako **adapter**. To cienka funkcja, która składa stary kształt wartości z nowych części:

```jsx
// Tymczasowo: dawny interfejs zostaje, dopóki każdy komponent nie przejdzie na nowe hooki.
export function useCart() {
  return { cart: useCartState(), dispatch: useCartDispatch(), addOptimistic: useCartOptimistic() };
}
```

Adapter czyta wszystkie trzy konteksty, więc komponenty, które go używają, renderują się tak jak przed podziałem. Gdy żaden plik nie importuje już `useCart`, adapter znika, a aplikacja przez cały czas zmiany daje się zbudować.

# Rozszerzenia do slajdu 04: Koszyk potrzebny w wielu miejscach naraz

Powrót: [`slide_04_prop-drilling.md`](../slide_04_prop-drilling.md)

## Rozszerzenie: jedno źródło prawdy dla każdego stanu

Podnoszenie stanu wynika z ogólniejszej zasady. Według dokumentacji Reacta każdy osobny kawałek stanu ma komponent, który jest jego właścicielem (*„For each unique piece of state, you will choose the component that "owns" it”*). Zasada nazywa się **jednym źródłem prawdy** (*single source of truth*). Dokumentacja zastrzega, że nie chodzi o trzymanie całego stanu w jednym miejscu. Chodzi o to, żeby każdy kawałek stanu miał dokładnie jednego właściciela.

Ta sama strona dokumentacji opisuje też proces. Stan przenosi się w dół albo z powrotem w górę, dopóki nie wiadomo, gdzie ma mieszkać. Dokumentacja pisze, że to zwykła część pracy (*„This is all part of the process!”*).

W sklepie właścicieli jest więcej niż jeden. Koszyk należy do komponentu na samej górze, a liczba wpisywana w wierszu przed zatwierdzeniem może należeć do samego wiersza:

```jsx
// Przykład spoza demo: ilość do zatwierdzenia należy do wiersza koszyka
function QtyEditor({ item }) {
  const dispatch = useCartDispatch();
  const [draft, setDraft] = useState(item.qty);  // stan wiersza: nikt wyżej go nie czyta
  return (
    <>
      <input type="number" min="1" value={draft} onChange={e => setDraft(Number(e.target.value))} />
      <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: draft })}>Set</button>
    </>
  );
}
// kawa w koszyku, w polu wpisane 3 → nagłówek: Cart: 1 pcs — 49.99 PLN
// po kliknięciu „Set”              → nagłówek: Cart: 3 pcs — 149.97 PLN
```

Koszyk dowiaduje się o nowej liczbie dopiero z akcji `UPDATE_QTY`. Podniesienie `draft` wyżej dodałoby tylko pośredników, bo nikt poza wierszem go nie czyta.

## Rozszerzenie: druga alternatywa, kompozycja

Zanim sięgnie się po kontekst, dokumentacja proponuje kompozycję: rodzic buduje dzieci sam i przekazuje je przez `children`, więc pośrednik znika z łańcucha propsów.

```jsx
// Przykład spoza demo: ProductList przyjmuje gotowe wiersze przez children
function ProductList({ children }) {
  return <ul>{children}</ul>;                    // lista nie zna dispatch ani przycisków
}

export default function HomePage() {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  return (
    <main>
      <p>Items: {cart.items.length}</p>
      <ProductList>
        {products.map(product => (
          <li key={product.id}>
            <AddButton product={product} dispatch={dispatch} />  {/* prop idzie wprost z HomePage */}
          </li>
        ))}
      </ProductList>
    </main>
  );
}
// → 5 przycisków; kliknięcie pierwszego → Items: 1
```

Metoda ma dwie granice: `HomePage` przejmuje wiedzę o przyciskach i budowie wierszy, która wcześniej należała do listy. Kompozycja skraca też łańcuch tylko w obrębie jednej strony, a `/cart` leży poza nią.

# Rozszerzenia do slajdu 04: Koszyk potrzebny w wielu miejscach naraz

Powrót: [`slide_04_prop-drilling.md`](../slide_04_prop-drilling.md)

## Rozszerzenie: jedno źródło prawdy dla każdego stanu

Podnoszenie stanu wynika z ogólniejszej zasady. Według dokumentacji Reacta każdy osobny kawałek stanu ma komponent, który jest jego właścicielem (*„For each unique piece of state, you will choose the component that "owns" it”*). Zasada nazywa się **jednym źródłem prawdy** (*single source of truth*). Dokumentacja zastrzega, że nie chodzi o trzymanie całego stanu w jednym miejscu. Chodzi o to, żeby każdy kawałek stanu miał dokładnie jednego właściciela.

Ta sama strona dokumentacji opisuje też proces. Stan przenosi się w dół albo z powrotem w górę, dopóki nie wiadomo, gdzie ma mieszkać. Dokumentacja pisze, że to zwykła część pracy (*„This is all part of the process!”*).

W sklepie właścicieli jest więcej niż jeden. Koszyk należy do komponentu na samej górze. Liczba wpisywana przy produkcie przed dodaniem może należeć do samego przycisku:

```jsx
// Przykład spoza demo: ilość do dodania należy do przycisku, nie do koszyka.
function AddMany({ product }) {
  const { dispatch } = useCart();
  const [n, setN] = useState(1);   // stan przycisku: nikt wyżej go nie czyta
  return (
    <>
      <input type="number" min="1" value={n} onChange={e => setN(Number(e.target.value))} />
      <button
        onClick={() => {
          for (let i = 0; i < n; i++) dispatch({ type: 'ADD_ITEM', product });
        }}
      >
        Add {n}
      </button>
    </>
  );
}
// przy kawie wpisane 3, przed kliknięciem → nagłówek: Cart: 0 pcs — 0.00 PLN
// po kliknięciu „Add 3”             → nagłówek: Cart: 3 pcs — 149.97 PLN
```

Koszyk dowiaduje się o nowej liczbie dopiero z kilku akcji `ADD_ITEM`, które reducer już zna. Podniesienie `n` wyżej dodałoby tylko pośredników, bo nikt poza przyciskiem go nie czyta.

## Rozszerzenie: druga alternatywa, kompozycja

Zanim sięgnie się po kontekst, dokumentacja proponuje kompozycję: rodzic buduje dzieci sam i przekazuje je przez `children`, więc pośrednik znika z łańcucha propsów.

```jsx
// Przykład spoza demo: ProductList przyjmuje gotowe wiersze przez children
// AddToCartButton, products, cartReducer i initialCartState jak na slajdzie 04
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
            <AddToCartButton product={product} dispatch={dispatch} />  {/* prop idzie wprost z HomePage */}
          </li>
        ))}
      </ProductList>
    </main>
  );
}
// → 5 przycisków; kliknięcie pierwszego → Items: 1
```

Metoda ma dwie granice: `HomePage` przejmuje wiedzę o przyciskach i budowie wierszy, która wcześniej należała do listy. Kompozycja skraca też łańcuch tylko w obrębie jednej strony, a `/cart` leży poza nią.

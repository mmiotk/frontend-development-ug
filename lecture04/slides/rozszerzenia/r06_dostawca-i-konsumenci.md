# Rozszerzenia do slajdu 06: Dostawca w layoucie, komponenty z koszykiem

Powrót: [`slide_06_dostawca-i-konsumenci.md`](../slide_06_dostawca-i-konsumenci.md)

## Rozszerzenie: dostawca w layoucie grupy tras

Przewodnik Next.js o aplikacjach jednostronicowych zaleca, żeby dane potrzebne tylko części aplikacji dostarczać w poddrzewie tej części zamiast w layoucie głównym. Gdyby sklep miał też blog, koszyk mógłby trafić do layoutu grupy tras, czyli katalogu w nawiasach:

```jsx
// Przykład spoza demo: app/(shop)/layout.jsx; page.jsx i cart/ przeniesione do app/(shop)/,
// a app/layout.jsx już bez CartProvider
import { CartProvider } from '../context/CartContext';

export default function ShopLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;  // app/blog/page.jsx leży poza grupą
}
// kawa w koszyku, potem / → /cart → /  → Cart: 1 pcs — 49.99 PLN
// kawa w koszyku, potem / → /blog → /  → Cart: 0 pcs — 0.00 PLN
```

Blog nie znajduje się wtedy pod dostawcą koszyka. Ceną jest czas życia stanu: przejście na trasę spoza grupy usuwa layout grupy razem z `CartProvider`, więc po powrocie koszyk jest pusty.

## Rozszerzenie: kilku dostawców obok siebie

Layout może osadzić więcej niż jednego dostawcę. Schwarzmüller podaje przykład, który pasuje do sklepu.

> **„Sklep internetowy może używać jednego kontekstu do koszyka, drugiego do stanu uwierzytelnienia i jeszcze innego do śledzenia analityki strony.”**
>
> *„For example, an online shop could use one context for managing the shopping cart, another context for the user authentication status, and yet another context value for tracking page analytics.”*
>
> — Maximilian Schwarzmüller, *React Key Concepts*

Dostawców zagnieżdża się wtedy w sobie wokół `children`. Kolejność nie ma znaczenia, dopóki żaden z nich nie czyta wartości innego. Dokumentacja Reacta (*useContext*) pisze, że „piramida” kontekstów przy korzeniu rosnącej aplikacji jest czymś oczekiwanym i nie ma w niej nic złego. Komu przeszkadza samo zagnieżdżenie, może zebrać dostawców w jednym komponencie:

```jsx
// Przykład spoza demo: dwóch dostawców zebranych w komponencie Providers
const AuthContext = createContext(null);

function UserCartProvider({ children }) {         // koszyk, który czyta zalogowanego użytkownika
  const user = useContext(AuthContext);
  console.log('cart owner:', user?.name ?? null);
  return <CartProvider>{children}</CartProvider>;
}

export function Providers({ children }) {
  return (
    <AuthContext value={{ name: 'anna' }}>
      <UserCartProvider>{children}</UserCartProvider>
    </AuthContext>
  );
}
// → cart owner: anna
// kolejność odwrócona (AuthContext wewnątrz UserCartProvider) → cart owner: null
```

Koszyk zależny od użytkownika widzi go tylko wtedy, gdy dostawca uwierzytelnienia stoi wyżej. Layout owija wtedy `children` jednym znacznikiem `<Providers>`.

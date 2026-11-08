# cart-app — projekt referencyjny wykładu 04

Demo live-coding: **Sklep kawowy** (koszyk): `useReducer` + kontekst + `useOptimistic` + `use` z `Suspense` + granica błędów.

Temat celowo inny niż lab 04 (Pokédex), by student przenosił pojęcia, a nie kopiował demo.

## Uruchomienie

```bash
npm install
npm run dev
# http://localhost:3000
```

## Trasy

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `app/page.jsx` | Komponent serwerowy: podsumowanie koszyka, lista produktów z przyciskami, rekomendacje |
| `/cart` | `app/cart/page.jsx` | Komponent kliencki: podsumowanie, pozycje koszyka, usuwanie, „Clear cart” |

## Etapy budowy aplikacji

Kolejność i czasy: `../PROWADZACY.md` (90 min, kod pisany ręcznie); kod każdego etapu jest też na slajdach `../../slides/`.
Projekt zawiera stan końcowy (po kroku 5.3): 11 plików w `app/`, 228 linii. Pliki pośrednie powstają na zajęciach.
Segment 6 (rendery kontekstu i podział, slajdy 11–12) jest tylko pokazem i nie zmienia kodu.

| Etap | Slajd | Temat | Nowe pliki |
|------|-------|-------|------------|
| 0 | 01 | Projekt i nawigacja (projekt i `products.js` gotowe przed wykładem) | `app/data/products.js`, `app/layout.jsx`, `app/page.jsx` |
| 1 | 01–03 | Reducer i `useReducer` | `app/lib/cartReducer.js` |
| 2 | 04–05 | Prop drilling i kontekst | `app/context/CartContext.jsx` |
| 3 | 06 | Dostawca w layoucie, komponenty z koszykiem | `app/components/CartSummary.jsx`, `AddToCartButton.jsx`, `app/cart/page.jsx` |
| 4 | 07 | `useOptimistic`: koszyk optymistyczny | `app/lib/fakeApi.js` (zmiany w `CartContext.jsx` i `AddToCartButton.jsx`; krok 4.2 to przejściowy przycisk bez `useOptimistic`) |
| 5 | 08–10 | `use`, `Suspense`, granica błędów | `app/components/Recommended.jsx`, `ErrorBoundary.jsx` |
| 6 | 11–12 | Rendery kontekstu i jego podział (tylko pokaz) | brak |

## Zgodność ze slajdami

Pliki są kodem ze slajdów w stanie końcowym. Różnią się od bloków na slajdach tylko komentarzami (kontrola mechaniczna
porównaniem bloków kodu ze slajdów z plikami) oraz tym, że bloki pośrednie z `useCart()` (slajdy 05–07) są teraz stanem
końcowym: demo kończy się na jednym kontekście `useCart()`. Slajd 12 (trzy konteksty z hookami `useCartState`, `useCartDispatch`
i `useCartOptimistic`) to przykład spoza demo, w `app/` go nie ma.

## Uwagi

- Napis „Loading recommendations...” widać tylko pod `npm run dev`; po `next build` strona `/` jest statyczna.
- Stan koszyka żyje w pamięci otwartej strony; po F5 koszyk jest pusty (trwałość to wykład 05).
- Wersje przypięte w `package.json`: Next.js 16.4.0, React 19.3.0; Node.js >= 20.9.

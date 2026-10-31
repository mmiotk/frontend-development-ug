# Rozszerzenia do slajdu 01: Projekt, który ma własne dane

Powrót: [`slide_01_projekt-i-magazyn.md`](../slide_01_projekt-i-magazyn.md)

## Rozszerzenie: granice magazynu w pamięci

Pamięć procesu ma dwie granice. Pierwsza to restart: wszystko, co dodano, znika. Druga to liczba procesów, bo obiekt globalny jest wspólny tylko w obrębie jednego procesu Node.js. Dwa serwery uruchomione z jednego buildu, tak jak dwie instancje za jednym adresem, mają dwa magazyny i dwa liczniki.

```bash
# Przykład spoza demo: dwa procesy next start z jednego buildu, każdy z własnym magazynem
npx next start -p 3001 & npx next start -p 3002 &
curl -s -X POST localhost:3001/api/articles -H "Content-Type: application/json" \
  -d '{"title":"Sent to 3001","author":"Alice","body":"Each process has its own store."}'
# → {"id":4,"title":"Sent to 3001",…}
curl -s -X POST localhost:3002/api/articles -H "Content-Type: application/json" \
  -d '{"title":"Sent to 3002","author":"Alice","body":"Each process has its own store."}'
# → {"id":4,"title":"Sent to 3002",…}
```

Każdy serwer ma potem cztery artykuły, ale inny czwarty, więc aplikacja uruchamiana w wielu kopiach potrzebuje bazy danych poza procesem.

Obiekt globalny ma też koszt. Każdy moduł w procesie może go odczytać i nadpisać, więc nazwa `articleStore` musi być unikalna, a cała logika zostaje w funkcjach modułu. Kod spoza `lib/store.js` nie sięga do `globalThis.articleStore` bezpośrednio.

## Rozszerzenie: kiedy wraca Webpack

Starszy bundler, **Webpack**, włącza się flagą `--webpack` przy `next dev` albo `next build`. Dokumentacja wymienia dwie sytuacje, w których jest potrzebny. Pierwsza to platforma bez natywnych modułów Turbopacka, na przykład FreeBSD. Druga to projekt z własną funkcją `webpack()` w `next.config.js`, którą dopisują też niektóre wtyczki.

```js
// Przykład spoza demo: next.config.js z funkcją webpack(), bez opcji turbopack
const nextConfig = {
  webpack: (config) => config, // np. dopisane przez wtyczkę
};
module.exports = nextConfig;
```

```text
$ next build
⨯ ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
$ next build --webpack
✓ Compiled successfully in 1696ms
```

Przewodnik aktualizacji do wersji 16 opisuje to przerwanie jako celowe, a komunikat podpowiada jawną flagę albo pusty obiekt `turbopack: {}`. Bundler zmienia też liczbę kopii modułów serwera: `lib/store.js` z logiem przy imporcie wczytuje się pod Turbopackiem dwa razy, a pod Webpackiem raz.

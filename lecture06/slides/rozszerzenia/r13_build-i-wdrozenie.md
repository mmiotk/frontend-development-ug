# Rozszerzenia do slajdu 13: Build, zmienne środowiskowe i wdrożenie na Vercel

Powrót: [`slide_13_build-i-wdrozenie.md`](../slide_13_build-i-wdrozenie.md)

## Rozszerzenie: czego w raporcie już nie ma

Starsze raporty miały przy każdej trasie kolumny `Size` i `First Load JS`. Przewodnik aktualizacji podaje powód ich usunięcia:

> **„Next.js 16 usuwa z wyniku `next build` metryki `size` i `First Load JS`. Uznaliśmy je za niedokładne w architekturach sterowanych przez serwer, opartych na React Server Components.”**
>
> *„Next.js 16 removes the size and First Load JS metrics from the next build output. We found these to be inaccurate in server-driven architectures using React Server Components.”*
>
> — dokumentacja Next.js, *Upgrading: Version 16*

Ten sam przewodnik wskazuje następców. Rzeczywistą wydajność trasy najskuteczniej mierzą według niego narzędzia oparte na Core Web Vitals i rozmiarze pobranych zasobów, takie jak Chrome Lighthouse albo Vercel Analytics. Do analizy samych paczek służy od wersji 16.1 polecenie `next experimental-analyze`. Z flagą `--output` zapisuje wynik na dysk bez uruchamiania przeglądarkowego interfejsu:

```text
// Przykład spoza demo: rozmiar paczek tras contacts-app
$ npx next experimental-analyze --output
✓ Analyze completed in 1951ms. Results written to …/.next/diagnostics/analyze.
$ cat .next/diagnostics/analyze/data/route-summaries.json
[{"route":"/","size":2413090,"compressed_size":765342,"client":{"size":570436,"compressed_size":211658}},
 {"route":"/_not-found","size":2405139,"compressed_size":761389,"client":{"size":566915,"compressed_size":209851}}, …]
```

Pole `client` to kod wysyłany do przeglądarki, w bajtach: dla `/` 570 436 przed kompresją i 211 658 po niej. Lintera build nie uruchamia.

## Rozszerzenie: zmienne czytane przy każdym żądaniu

Zmienna serwerowa też nie zawsze jest czytana na żywo. Strona statyczna wykonuje swój kod w `next build`, więc odczytana tam wartość zostaje w gotowym HTML-u. Dokumentacja wskazuje drogę do wartości z chwili żądania: zmienne środowiskowe można bezpiecznie czytać na serwerze podczas renderowania dynamicznego (*„You can safely read environment variables on the server during dynamic rendering”*). Trasę dynamiczną, oznaczaną w raporcie symbolem `ƒ` i renderowaną przy każdym żądaniu, wymusza wywołanie `await connection()` z `next/server`. Poniższe dwie strony nie należą do `contacts-app` i różnią się tylko tym wywołaniem:

```jsx
// app/frozen/page.jsx: strona statyczna, kod wykonuje się w next build
export default function FrozenPage() {
  return <p>Region: {process.env.APP_REGION || 'brak'}</p>;
}
```

```jsx
// app/runtime/page.jsx: connection() czeka na żądanie, więc strona jest dynamiczna
import { connection } from 'next/server';

export default async function RuntimePage() {
  await connection();
  return <p>Region: {process.env.APP_REGION || 'brak'}</p>;
}
```

Build z `APP_REGION=build-eu` oznacza w Next.js 16.4.0 trasy jako `○ /frozen` i `ƒ /runtime`. Serwer uruchomiony potem z `APP_REGION=start-us` pokazuje pod `/frozen` napis „Region: build-eu”, a pod `/runtime` napis „Region: start-us”. Według dokumentacji odczyt przy żądaniu pozwala przenosić jeden obraz Dockera, czyli spakowaną aplikację razem ze środowiskiem uruchomieniowym, między środowiskami z różnymi wartościami.

## Rozszerzenie: Instant Rollback i jego granice

Gdy po wdrożeniu produkcja przestaje działać, cofnięcie jest szybsze od poprawki. Dokumentacja Vercela opisuje **Instant Rollback** jako powrót do wcześniejszego wdrożenia produkcyjnego bez nowego buildu, uruchamiany z panelu albo poleceniem `vercel rollback`. Vercel kieruje domeny z powrotem na wybrane wdrożenie. Dokumentacja wymienia granice:

- **Konfiguracja może być nieaktualna.** Przywrócony build ma wartości zmiennych z chwili, gdy powstał.
- **Plan Hobby cofa tylko o jeden krok**, do bezpośrednio poprzedniego wdrożenia. Plany to poziomy konta na Vercelu; Pro i Enterprise pozwalają wybrać dowolne wcześniejsze wdrożenie produkcyjne.
- **Automatyczne przypisywanie domen zostaje wyłączone.** Nowe zmiany na gałęzi produkcyjnej nie zastępują przywróconej wersji, dopóki rollback nie zostanie cofnięty.

Rollback cofa kod, ale nie cofa danych. Jeśli nowa wersja zmieniła format zapisanych rekordów, stary kod może ich nie odczytać, więc wersję Preview sprawdza się także pod kątem tego, co aplikacja zapisuje.

## Rozszerzenie: poza Vercelem, tryb `standalone`

Na własnym serwerze z Node.js wystarczą `next build` i `next start`, ale `next start` wymaga całego katalogu `node_modules`. Ustawienie `output: 'standalone'` tworzy folder `.next/standalone` tylko z plikami potrzebnymi do uruchomienia:

```js
// next.config.mjs: build przygotowuje samodzielny folder do wdrożenia
/** @type {import('next').NextConfig} */
const nextConfig = { output: 'standalone' };

export default nextConfig;
```

Dla `contacts-app` folder ma 39 MB, wobec 406 MB całego `node_modules`. W środku leży minimalny `server.js`, uruchamiany poleceniem `node server.js` zamiast `next start`. Build nie kopiuje do tego folderu `public` ani `.next/static`, bo według dokumentacji powinien je obsługiwać CDN, czyli sieć serwerów dostarczających pliki statyczne. Serwer uruchomiony bez nich odpowiada na `/` kodem 200, ale plik skryptu z `/_next/static/chunks/` dostaje 404, więc strona nie ożywa. Oba foldery kopiuje się ręcznie obok `server.js`. Bugl buduje w tym trybie obraz Dockera i odsyła do przykładu `with-docker` w repozytorium Next.js. Projekt `contacts-app` z tego trybu nie korzysta.

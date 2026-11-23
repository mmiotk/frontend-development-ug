# Rozszerzenia do slajdu 08: Środowisko testowe: Vitest, jsdom i Testing Library

Powrót: [`slide_08_vitest-konfiguracja.md`](../slide_08_vitest-konfiguracja.md)

## Rozszerzenie: happy-dom i potok CI

Jsdom nie jest jedyną imitacją przeglądarki. Dokumentacja Vitesta wymienia obok niego **happy-dom**. Według niej uchodzi on za szybszy od jsdom, ale brakuje mu części API (*„considered to be faster than jsdom, but lacks some API”*). Środowisko da się zmienić dla jednego pliku komentarzem na jego początku:

```jsx
// Przykład spoza demo: __tests__/ContactList.test.jsx w happy-dom 20.14.6
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
// reszta pliku bez zmian

console.log(navigator.userAgent); // → Mozilla/5.0 (X11; Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) HappyDOM/20.14.6
```

Trzy testy `ContactList` przechodzą w obu środowiskach, a w trzech przebiegach faza testów trwa 40–41 ms w happy-dom wobec 94–103 ms w jsdom. `contacts-app` zostaje przy jsdom, które wskazuje przewodnik Next.js, bo brak API w happy-dom wyszedłby dopiero w teście, który go użyje.

Skrypt `test` zachowuje się inaczej w potoku CI (*continuous integration*), czyli przy automatycznym uruchamianiu testów po każdym wysłaniu kodu do repozytorium. Vitest 2.1.9 włącza obserwowanie tylko wtedy, gdy nie jest ustawiona zmienna środowiskowa `CI`:

```text
// Przykład spoza demo: skrypt test (vitest) z ustawioną zmienną CI
$ CI=true npm test
 Test Files  4 passed (4)
      Tests  13 passed (13)
$ echo $?
0
```

Bez zmiennej to samo polecenie po testach wypisuje „Waiting for file changes...” i czeka. Skrypt `test:run` zapisuje intencję jednego przebiegu jawnie, bez zależności od zmiennej ustawianej przez dostawcę CI.

## Rozszerzenie: pokrycie kodu i jego granica

Banks i Porcello definiują **pokrycie kodu** (*code coverage*) jako raport o liczbie linii faktycznie sprawdzonych testami (*„the process of reporting on how many lines of code have actually been tested”*). Vitest liczy je po dodaniu flagi `--coverage`. Dokumentacja wymienia dwóch dostawców, `v8` (domyślny) i `istanbul`, a każdy wymaga osobnego pakietu. `contacts-app` go nie instaluje, więc `vitest run --coverage` kończy się komunikatem `MISSING DEPENDENCY  Cannot find dependency '@vitest/coverage-v8'`.

Z pakietem `@vitest/coverage-v8` 2.1.9 przykład z `sign` daje dla `sign.js` 100% instrukcji i 50% rozgałęzień. Test sprawdza tylko liczbę dodatnią, więc gałąź `n < 0` nie wykonała się ani razu. Drugi przykład pokazuje granicę miary:

```js
test('bez asercji', () => {
  sign(-1); // obie gałęzie się wykonują...
  sign(1);  // ...ale żaden wynik nie jest sprawdzany
});
```

Ten test daje 100% we wszystkich kolumnach i przechodzi, choć niczego nie porównuje. <u>Pokrycie mówi, które linie się wykonały, a nie, czy ktoś sprawdził ich wynik</u>. Banks i Porcello piszą, że ta miara pomaga zdecydować, kiedy testów jest dość (*„It provides a metric that can help you decide when you've written enough tests”*). Decyzję podejmuje jednak człowiek, który wie, które zachowania są ważne dla użytkownika.

# Rozszerzenia do slajdu 06: Od czego zależy efekt

Powrót: [`slide_06_tablica-zaleznosci.md`](../slide_06_tablica-zaleznosci.md)

## Rozszerzenie: funkcja jako zależność

Te same reguły obowiązują funkcje. Schwarzmüller przypomina, że za każdym razem, gdy wykonuje się kod z definicją funkcji, w pamięci powstaje nowy obiekt funkcji. Jego przykład to komponent `Alert`, w którym efekt wywołuje funkcję zadeklarowaną w ciele komponentu, a tablica jest pusta.

```jsx
// Przykład spoza demo: komponent Alert z funkcją wywoływaną w efekcie
import { useState, useEffect } from "react";

function Alert() {
  const [alertMsg, setAlertMsg] = useState("Expired!");

  function handleChangeAlertMsg(event) {
    setAlertMsg(event.target.value); // każda litera: nowy stan i nowy render
  }

  // w każdym renderze powstaje NOWA funkcja setAlert z alertMsg z tego renderu
  function setAlert() {
    setTimeout(function () {
      console.log(alertMsg); // wartość zamknięta w tej konkretnej wersji funkcji
    }, 2000);
  }

  useEffect(function () {
    setAlert(); // efekt używa setAlert, a tablica jej nie wymienia
  }, []); // efekt raz: wywoła tylko pierwszą wersję setAlert

  return <input type="text" onChange={handleChangeAlertMsg} />;
}
```

Niezależnie od wpisanej treści konsola po dwóch sekundach wypisuje jeden raz „Expired!”. Efekt wykonał się tylko po pierwszym renderze i wywołał pierwszą wersję funkcji, w której zamknięta jest pierwsza wartość stanu. Schwarzmüller wyciąga z tego wniosek: do tablicy należy dodawać wszystkie wartości, zmienne i funkcje używane w efekcie, bo nawet funkcje mogą się zmieniać (*„Even functions can change.”*).

Dopisanie funkcji do tablicy zmienia jedną linię:

```jsx
// Przykład spoza demo: komponent Alert z funkcją w tablicy zależności
useEffect(function () {
  setAlert();
}, [setAlert]); // nowa funkcja w każdym renderze, więc efekt po każdym renderze
```

Tablica `[setAlert]` ma jednak ten sam problem co `[activeTasks]`. W React 19.3.0, z opóźnieniem skróconym do 300 ms, trzy litery wpisane w pole dają cztery wpisy: „Expired!”, „H”, „Hi”, „Hi!”. Każdy render przyniósł nową funkcję, więc efekt wykonał się po każdym i za każdym razem ustawił kolejny timer. Dokumentacja Reacta wskazuje, że najprościej jest przenieść taką funkcję do wnętrza efektu albo poza komponent. W pierwszym przypadku zależnością zostaje sam `alertMsg`.

## Rozszerzenie: obiekt jako zależność

Dokumentacja (*Removing Effect Dependencies*) opisuje ten sam problem na obiekcie. Komponent czatu buduje w renderze obiekt `options` i przekazuje go efektowi, który łączy się z serwerem. W skrócie, z umowną funkcją `connect`:

```jsx
// Przykład spoza demo: na wzór dokumentacji React, w ciele komponentu czatu:
// serverUrl i roomId to jego propsy (napisy), connect to umowna funkcja łącząca z serwerem.
const options = { serverUrl, roomId }; // nowy obiekt przy każdym renderze
useEffect(() => {
  connect(options);
}, [options]); // każda litera w polu wiadomości: render, nowy obiekt, nowe połączenie

useEffect(() => {
  connect({ serverUrl, roomId }); // obiekt powstaje dopiero wewnątrz efektu
}, [serverUrl, roomId]); // dwa napisy, porównywane po wartości
```

Dokumentacja ujmuje przyczynę tak:

> **„Ten problem dotyczy tylko obiektów i funkcji. W JavaScripcie każdy nowo utworzony obiekt i każda nowo utworzona funkcja są uważane za różne od wszystkich pozostałych. Nie ma znaczenia, że ich zawartość może być taka sama.”**
>
> *„This problem only affects objects and functions. In JavaScript, each newly created object and function is considered distinct from all the others. It doesn't matter that the contents inside of them may be the same!”*
>
> — dokumentacja React, *Removing Effect Dependencies*

Zalecana poprawka, druga wersja w kodzie wyżej, korzysta z porównania element po elemencie. Efekt połączy się ponownie tylko wtedy, gdy zmieni się któryś z dwóch napisów. Dokumentacja przyznaje, że kod trochę się powtarza, bo obiekt powstaje wewnątrz efektu. Zyskiem jest jawność: tablica pokazuje, od jakich informacji efekt naprawdę zależy.

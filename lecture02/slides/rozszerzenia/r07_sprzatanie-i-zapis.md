# Rozszerzenia do slajdu 07: Sprzątanie po efekcie i zapis listy w przeglądarce

Powrót: [`slide_07_sprzatanie-i-zapis.md`](../slide_07_sprzatanie-i-zapis.md)

## Rozszerzenie: kod asynchroniczny w efekcie

Z umowy o funkcji sprzątającej wynika, że funkcja efektu nie może być asynchroniczna. Banks i Porcello wyjaśniają, że funkcja `async` zawsze zwraca obiekt Promise, czyli wynik dostępny dopiero później, więc zapis `useEffect(async () => {})` jest niepoprawny. React uznaje zwróconą wartość za funkcję sprzątającą. Ostrzega wtedy w konsoli, że efekt „must not return anything besides a function, which is used for clean-up”, a przy usunięciu komponentu zgłasza `TypeError: destroy is not a function`. Kod asynchroniczny umieszcza się w funkcji wewnętrznej, wywoływanej w setupie:

```jsx
// Przykład spoza demo: kod asynchroniczny w efekcie
"use client";
import { useState, useEffect } from "react";

// zaślepka źródła danych: Promise, który po 500 ms daje tablicę
function fetchData() {
  return new Promise((resolve) => setTimeout(() => resolve(["a", "b"]), 500));
}

export default function Loader() {
  const [data, setData] = useState([]);
  useEffect(() => {
    async function load() {           // funkcja asynchroniczna zdefiniowana wewnątrz setupu
      const result = await fetchData(); // await czeka na wynik Promise
      setData(result);
    }
    load(); // setup niczego nie zwraca, więc React nie ma czego wziąć za sprzątanie
  }, []);
  return <p>{data.length} items</p>;
}
```

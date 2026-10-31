# Rozszerzenia do slajdu 08: Odczyt zapisanej listy i dwa miejsca renderowania

Powrót: [`slide_08_leniwy-inicjalizator.md`](../slide_08_leniwy-inicjalizator.md)

## Rozszerzenie: dwie inne drogi omijania niezgodności

Dokumentacja Next.js wymienia jeszcze dwie drogi. Pierwsza wyłącza renderowanie na serwerze dla wybranego komponentu przez `dynamic(() => import(...), { ssr: false })`. Druga to atrybut `suppressHydrationWarning`, który wycisza ostrzeżenie dla jednego elementu.

```jsx
// Przykład spoza demo: dwie drogi omijania niezgodności
"use client"; // ssr: false wolno użyć tylko w komponencie klienckim
import dynamic from "next/dynamic";

// Clock ładuje się dopiero w przeglądarce: nie ma go w HTML z serwera
const Clock = dynamic(() => import("./Clock"), { ssr: false });

export default function Page() {
  return (
    <div>
      <Clock />
      {/* treść musi się różnić: React nie zgłosi niezgodności dla tego elementu */}
      <time suppressHydrationWarning>{new Date().toISOString()}</time>
    </div>
  );
}
```

HTML z serwera zawiera tu element `<time>`, a nie zawiera zegara, który pojawia się dopiero w przeglądarce. Niezgodności nie ma w obu miejscach, ale komponent `Clock` nie ma też gotowej treści przed wczytaniem skryptu. Dokumentacja zastrzega, że `suppressHydrationWarning` działa tylko jeden poziom w głąb i jest wyjściem awaryjnym dla treści, która musi się różnić, jak znacznik czasu. Lista zadań do tej kategorii nie należy.

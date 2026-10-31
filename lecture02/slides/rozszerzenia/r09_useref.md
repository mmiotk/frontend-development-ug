# Rozszerzenia do slajdu 09: Ref: pamięć, której React nie śledzi

Powrót: [`slide_09_useref.md`](../slide_09_useref.md)

## Rozszerzenie: wartość początkowa refa

Argument `useRef` zachowuje się podobnie jak argument `useState`. Dokumentacja pisze, że React zapisuje początkową wartość refa raz i ignoruje ją przy kolejnych renderach (*„React saves the initial ref value once and ignores it on the next renders”*). Samo wyrażenie w nawiasie wykonuje się jednak przy każdym renderze. `useRef(0)` nic nie kosztuje, ale `useRef(new VideoPlayer())` z przykładu w dokumentacji tworzyłby kosztowny obiekt przy każdym renderze i od razu go wyrzucał. Dokumentacja podaje na to wzorzec z pustym refem i warunkiem:

```jsx
// Przykład spoza demo: wartość początkowa refa
import { useRef } from "react";

class VideoPlayer {} // zaślepka kosztownego obiektu z przykładu w dokumentacji

function Video() {
  const playerRef = useRef(null); // tani argument: null
  if (playerRef.current === null) {
    playerRef.current = new VideoPlayer(); // obiekt powstaje tylko w pierwszym renderze
  }
  return <p>player ready</p>;
}
```

Zapis do `current` w renderze jest tu wyjątkiem od zakazu odczytu i zapisu refa w trakcie renderu. Dokumentacja dopuszcza go, bo wynik jest zawsze ten sam, a warunek wykonuje się tylko przy inicjalizacji (*„the result is always the same, and the condition only executes during initialization”*).

# Rozszerzenia do slajdu 02: Najpierw pomiar: podświetlanie, konsola i Profiler

Powrót: [`slide_02_pomiar-profiler.md`](../slide_02_pomiar-profiler.md)

## Rozszerzenie: czego Profiler Reacta nie widzi

Profiler mierzy komponenty. Użytkownik odczuwa czas od naciśnięcia klawisza do chwili, w której ekran pokazuje reakcję. Między renderem komponentu a klatką na ekranie przeglądarka przelicza jeszcze układ strony i maluje piksele. Tę część widać w panelu *Performance* narzędzi deweloperskich Chrome. React dokłada do tego panelu własne ścieżki:

> **„Ścieżki wydajności Reacta to wyspecjalizowane wpisy, które pojawiają się na osi czasu panelu Performance w narzędziach deweloperskich przeglądarki.”**
>
> *„React Performance tracks are specialized custom entries that appear on the Performance panel’s timeline in your browser developer tools.”*
>
> — dokumentacja Reacta, *React Performance tracks*

Według tej strony w buildzie deweloperskim ścieżki są włączone domyślnie. Ścieżka *Scheduler* dzieli każdy przebieg na fazy *Update*, *Render*, *Commit* i *Remaining Effects*, a ścieżka *Components* rysuje czasy komponentów obok żądań sieciowych i reszty JavaScriptu.

Czas reakcji z perspektywy użytkownika mierzy metryka **INP** (*Interaction to Next Paint*) z zestawu Web Vitals. Next.js raportuje ją hookiem `useReportWebVitals` z modułu `next/web-vitals`. Hook działa tylko w komponencie klienckim, dlatego umieszcza się go w osobnym, małym komponencie renderowanym w głównym layoucie:

```jsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => console.log(metric.name, metric.value));  // np. INP i jego wartość
  return null;                                                             // komponent niczego nie rysuje
}
```

Ten komponent również nie należy do `contacts-app`. Starsze poradniki podają w tym miejscu funkcję `reportWebVitals` z Pages Routera, która w App Routerze nie działa. Profiler wskazuje, **który komponent** kosztuje, a INP pokazuje, **czy użytkownik to odczuwa**. Poprawka, która skraca render z 10 ms do 1 ms, ale nie zmienia INP, może poczekać.

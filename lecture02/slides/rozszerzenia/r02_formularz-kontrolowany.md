# Rozszerzenia do slajdu 02: Pole tekstowe, którym steruje stan

Powrót: [`slide_02_formularz-kontrolowany.md`](../slide_02_formularz-kontrolowany.md)

## Rozszerzenie: delegowanie zdarzeń

Zapis `onChange={...}` przypomina atrybut HTML, ale React nie dopina tej funkcji do węzła `<input>`. Mechanizm opiera się na tym, że zdarzenie przechodzi od elementu, który je zgłosił, kolejno przez jego przodków w drzewie DOM, aż do korzenia dokumentu. To przejście w górę nazywa się **bąbelkowaniem** (*bubbling*). Procedura przy rodzicu dostaje więc także kliknięcia jego dzieci:

```jsx
// Przykład spoza demo: kliknięcie „Add” dociera do procedury rodzica
<div onClick={(e) => console.log("div:", e.target.textContent)}> {/* e.target: kliknięty element */}
  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New task..." />
  <button>Add</button>                                            {/* przycisk bez własnej procedury */}
</div>
// → kliknięcie „Add”: div: Add
```

Kumar w *Fluent React* opisuje, jak React z tego korzysta. Zamiast słuchacza przy każdym przycisku React trzyma słuchacze każdego typu zdarzenia w korzeniu aplikacji. Gdy zdarzenie tam dotrze, React ustala, z którego komponentu pochodzi, i wywołuje zdefiniowane w nim procedury. Takie rozwiązanie nazywa się **delegowaniem zdarzeń** (*event delegation*). Kumar uzasadnia je mniejszym zużyciem pamięci i krótszym przygotowaniem strony. Słuchaczy widać w konsoli Chrome DevTools:

```js
// Przykład spoza demo: gdzie wiszą słuchacze zdarzeń pola „New task...”
Object.keys(getEventListeners(document.querySelector("input"))); // → ["invalid"]: invalid nie bąbelkuje
getEventListeners(document).input.length; // → 2: jeden dla zejścia zdarzenia w dół drzewa, drugi dla bąbelkowania
```

W Next.js korzeniem aplikacji jest cały dokument. Pole z `onChange` nie ma własnego słuchacza zdarzeń `input` ani `change`.

Z delegowania wynika niski koszt strzałek. Nowa strzałka w każdym renderze nie oznacza nowego słuchacza w przeglądarce. Kumar zauważa, że przy elementach wbudowanych, takich jak `button` czy `input`, React po prostu podmienia starą funkcję na nową i niczego nie porównuje.

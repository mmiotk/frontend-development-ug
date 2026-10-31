# Rozszerzenia do slajdu 11: Ten sam formularz z biblioteką React Hook Form

Powrót: [`slide_11_react-hook-form.md`](../slide_11_react-hook-form.md)

## Rozszerzenie: biblioteka i akcja w jednym formularzu

Czasem potrzebne są oba mechanizmy naraz: walidacja React Hook Form w trakcie pisania i stan wyniku z `useActionState`. Funkcję zwróconą przez `useActionState` wywołuje się wtedy w `onSubmit` wewnątrz `startTransition`, czyli jako przejście, bo tylko wtedy React śledzi jej status. Kod jest rozszerzeniem spoza demo:

```jsx
// Hybryda: RHF waliduje, useActionState trzyma wynik (poza demo)
import { startTransition } from "react";

function onSubmit(data) {
  const formData = new FormData(); // akcja oczekuje FormData, biblioteka oddaje obiekt
  formData.set("title", data.title);
  formData.set("priority", data.priority);
  startTransition(() => formAction(formData)); // poza przejściem isPending się nie zmieni
}
```

Taki formularz ma dwa mechanizmy stanu i obiekt `FormData` budowany ręcznie z danych biblioteki. Opłaca się dopiero wtedy, gdy walidacja w trakcie pisania jest potrzebna, a akcja ma pracować na serwerze.

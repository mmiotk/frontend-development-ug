# Rozszerzenia do slajdu 08: Akcja, która oddaje wynik: `useActionState`

Powrót: [`slide_08_useactionstate.md`](../slide_08_useactionstate.md)

## Rozszerzenie: błąd powiązany z polem

Komunikat „Title must not be empty.” stoi obok pola tytułu, ale nic nie łączy go z tym polem programowo, więc czytnik ekranu, program odczytujący stronę głosem, nie powie, którego pola dotyczy. Do tego powiązania służą dwa atrybuty ARIA, czyli atrybuty opisujące stronę dla technologii wspomagających. **`aria-invalid="true"`** oznacza pole jako niepoprawne. **`aria-errormessage`** wskazuje przez `id` element z treścią błędu. MDN stawia przy drugim atrybucie warunek:

> **„Atrybut `aria-errormessage` powinien być używany tylko wtedy, gdy wartość obiektu jest niepoprawna, czyli gdy `aria-invalid` ma wartość `true`.”**
>
> *„The `aria-errormessage` attribute should only be used when the value of an object is not valid; when `aria-invalid` is set to `true`.”*
>
> — MDN, *ARIA: aria-errormessage attribute*

Demo tych atrybutów nie ma. W poniższym fragmencie komunikat przenosi się pod pole i dostaje `id`. Sprawdzenie na formularzu z kroku demo: po wysłaniu pustego tytułu pole ma `aria-invalid="true"` i `aria-errormessage="title-error"`, a po poprawnym wysłaniu oba atrybuty znikają.

```jsx
// Przykład spoza demo: pole z powiązanym komunikatem błędu
<input
  name="title"
  aria-invalid={state?.errors?.title ? "true" : undefined}           // undefined: brak atrybutu
  aria-errormessage={state?.errors?.title ? "title-error" : undefined}
/>
{state?.errors?.title && <p id="title-error">{state.errors.title}</p>}
```

Wartość `undefined` sprawia, że React w ogóle nie wstawia atrybutu do HTML-u, więc poprawne pole nie wskazuje komunikatu, którego nie ma. MDN dodaje, że element z treścią błędu musi być widoczny, gdy atrybut obowiązuje.

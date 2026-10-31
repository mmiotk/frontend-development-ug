# Rozszerzenia do slajdu 13: Akcje czy biblioteka: jak wybrać sposób obsługi formularza

Powrót: [`slide_13_wybor-podejscia.md`](../slide_13_wybor-podejscia.md)

## Rozszerzenie: formularz edycji, czyli wartości z serwera

Formularz zgłoszenia zaczyna od pustego tytułu. Formularz edycji istniejącego zgłoszenia startuje od danych, które trzeba najpierw pobrać, a podejścia różnią się tym, jak te dane przyjmują. W wariancie z akcją wartość trafia do atrybutu `defaultValue` pola niekontrolowanego, na przykład `defaultValue={issue.title}`. Reset po udanej akcji przywraca pole właśnie do tej wartości.

React Hook Form zapamiętuje wartości początkowe przy pierwszym renderze. Dokumentacja `useForm` mówi wprost, że `defaultValues` są zapamiętywane, a zmienić je można funkcją `reset`. Dla danych, które przychodzą później, biblioteka ma od wersji 7.41.0 opcję `values`:

> **„Opcja `values` reaguje na zmiany i aktualizuje wartości formularza, co przydaje się, gdy formularz ma być aktualizowany przez zewnętrzny stan albo dane z serwera.”**
>
> *„The `values` prop will react to changes and update the form values, which is useful when your form needs to be updated by external state or server data.”*
>
> — dokumentacja React Hook Form, *useForm*

Każda taka aktualizacja wywołuje wewnętrznie `reset`. Ustawienie `resetOptions: { keepDirtyValues: true }` zachowuje przy tym pola, które użytkownik zdążył zmienić.

```jsx
// Przykład spoza demo: formularz edycji zgłoszenia w React Hook Form.
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueSchema } from "../lib/schema";

// issue: undefined, dopóki dane nie przyjdą z serwera, potem { title, priority }
export default function EditIssueForm({ issue, onSave }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(issueSchema),
    values: issue, // każda nowa wartość issue trafia do pól
    resetOptions: { keepDirtyValues: true }, // pola zmienione przez użytkownika zostają
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <input {...register("title")} />
      <select {...register("priority")}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">Save</button>
    </form>
  );
}
```

```text
zgłoszenie #1 przychodzi po 1 s         → title „Login button does not work on Safari”, priority „high”
„Fixed title” wpisane przed danymi      → title „Fixed title”, priority „high”
defaultValues: issue zamiast values     → po 1 s title puste, priority „low” (pierwsza opcja)
```

Opcja `errors` z wersji 7.49.0 działa podobnie dla błędów zwróconych przez serwer. Formularz edycji, który dostaje dane z opóźnieniem albo odświeża je w tle, jest więc kolejnym powodem, by wybrać bibliotekę.

## Rozszerzenie: pola dodawane w trakcie pracy i formularze w kilku krokach

Formularz zgłoszenia ma stałą liczbę pól. Lista kroków do odtworzenia błędu, z przyciskiem „dodaj krok”, już nie. React Hook Form ma do tego hook `useFieldArray`, który zwraca tablicę `fields` i funkcje `append`, `remove` oraz `insert`. Dokumentacja stawia przy nim jeden twardy warunek:

> **„Jako klucz komponentu trzeba podać `field.id` (a nie `index`), żeby ponowne rendery nie psuły pól.”**
>
> *„The `field.id` (and not `index`) must be added as the component key to prevent re-renders breaking the fields”*
>
> — dokumentacja React Hook Form, *useFieldArray*

Dokumentacja podaje też ograniczenie. Każdy element tablicy pól musi być obiektem, więc lista kroków ma postać `[{ text: "..." }]`, a nie tablicy napisów.

```jsx
// Przykład spoza demo: lista kroków do odtworzenia błędu w React Hook Form.
import { useForm, useFieldArray } from "react-hook-form";

// w komponencie formularza:
const { register, control, handleSubmit } = useForm({
  defaultValues: { title: "", steps: [{ text: "" }] }, // każdy krok to obiekt
});
const { fields, append, remove } = useFieldArray({ control, name: "steps" });

// w JSX, wewnątrz <form onSubmit={handleSubmit(onCreate)}>:
{fields.map((field, index) => (
  <div key={field.id}> {/* id nadany przez hook, nie index */}
    <input {...register(`steps.${index}.text`)} />
    {/* type="button": przycisk nie wysyła formularza */}
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}
<button type="button" onClick={() => append({ text: "" })}>Add step</button>
```

```text
trzy kroki, usunięty drugi, Create → onCreate dostaje { title: "Login fails", steps: [{ text: "Open the login page" }, { text: "See error 500" }] }
```

`field.id` to napis w formacie UUID, nadany przy dodaniu wiersza. Po usunięciu środkowego wiersza dwa pozostałe zachowują swoje `id`, choć indeks trzeciego zmienia się z 2 na 1. W wariancie z akcjami lista pól o tej samej nazwie trafia do `FormData`, a akcja odczytuje ją przez `formData.getAll("steps")`. Dodawanie i usuwanie wierszy wymaga jednak stanu z listą identyfikatorów, który trzeba napisać samemu.

Formularz w kilku krokach, na przykład zgłoszenie rozłożone na trzy strony, ma inny problem: dane z poprzedniego kroku muszą gdzieś przetrwać zmianę trasy. Dokumentacja React Hook Form, w części *Advanced Usage*, zaleca na to bibliotekę zarządzania stanem, bo sam `useForm` żyje tylko w komponencie jednej strony. W wariancie z akcjami taką rolę pełni magazyn podobny do `store.js` albo akcja na serwerze, która zapisuje każdy krok osobno.

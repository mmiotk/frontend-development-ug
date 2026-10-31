# Rozszerzenia do slajdu 12: Formik i TanStack Form: dwie biblioteki z polami kontrolowanymi

Powrót: [`slide_12_formik-i-tanstack-form.md`](../slide_12_formik-i-tanstack-form.md)

## Rozszerzenie: wysyłanie i błędy z serwera

Przykład Formika ma `onSubmit` ze słowem `async` i to ma znaczenie dla przycisku. Dokumentacja zastrzega:

> **„Jeśli `onSubmit` jest asynchroniczne, Formik sam ustawi `isSubmitting` na `false`, gdy Promise się rozwiąże. […] Jeśli jednak funkcja `onSubmit` jest synchroniczna, trzeba samemu wywołać `setSubmitting(false)`.”**
>
> *„IMPORTANT: If `onSubmit` is async, then Formik will automatically set `isSubmitting` to `false` on your behalf once it has resolved. […] However, if your `onSubmit` function is synchronous, then you need to call `setSubmitting(false)` on your own.”*
>
> — dokumentacja Formik, *&lt;Formik /&gt;*

Synchroniczne `onSubmit` bez tego wywołania zostawiłoby `isSubmitting` z wartością `true`, a przycisk „Create” zablokowany. Błąd zgłoszony przez serwer trafia do formularza funkcjami z drugiego argumentu `onSubmit`. W przykładzie serwer zastępuje funkcja `checkTitle`. Po 300 ms odpowiada ona, czy zgłoszenie o takim tytule już istnieje.

```jsx
// Przykład spoza demo: błąd z serwera w formularzu Formika.
import { getIssues } from "../lib/store";

// zamiast serwera: odpowiedź po 300 ms, komunikat albo null
function checkTitle(title) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const taken = getIssues().some((issue) => issue.title === title);
      resolve(taken ? "An issue with this title already exists." : null);
    }, 300),
  );
}

// w useFormik zamiast dotychczasowego onSubmit:
onSubmit: async (values, { resetForm, setFieldError, setStatus }) => {
  const error = await checkTitle(values.title);
  if (error) {
    setFieldError("title", error); // komunikat jednego pola, pod polem tytułu
    setStatus("Issue not saved."); // dowolna wartość dla całego formularza
    return; // onCreate się nie wykonuje
  }
  await onCreate(values);
  resetForm(); // czyści też status
},

// w JSX, nad polem tytułu:
{formik.status && <p>{formik.status}</p>}
```

Dla tytułu „Login button does not work on Safari” formularz pokazuje nad polem „Issue not saved.”, a pod nim „An issue with this title already exists.”. Następna litera uruchamia `validate` od nowa i błąd pola znika, a status zostaje do `resetForm()`.

TanStack Form przenosi taki błąd do walidatora `onSubmitAsync` na poziomie formularza. Sprawdza on wszystkie pola jednym zapytaniem do API.

```jsx
// Przykład spoza demo: ten sam błąd z serwera w TanStack Form.
// w useForm zamiast dotychczasowego validators:
validators: {
  onChange: issueSchema,
  onSubmitAsync: async ({ value }) => {
    const error = await checkTitle(value.title); // checkTitle jak wyżej
    // klucz fields: błąd trafia do meta.errors pola title;
    // obiekt z message, bo pole wyświetla issue.message, jak przy błędach schematu
    return error ? { fields: { title: { message: error } } } : undefined;
  },
},
```

Ten sam tytuł daje pod polem „An issue with this title already exists.”, a `onSubmit` się nie wykonuje. Dokumentacja zastrzega, że walidator pola ma pierwszeństwo i może nadpisać błąd z poziomu formularza.

## Rozszerzenie: komponenty `<Formik>` i `<Field>`

W starszym kodzie częściej niż `useFormik` spotyka się wariant z komponentami `<Formik>`, `<Form>`, `<Field>` i `<ErrorMessage>`.

```jsx
// Przykład spoza demo: formularz zgłoszenia z komponentami Formika.
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { issueSchema } from "../lib/schema";

// function validate(values) { … } bez zmian, jak w wariancie z useFormik

export default function NewIssueFormik({ onCreate }) {
  return (
    <Formik
      initialValues={{ title: "", priority: "medium" }}
      validate={validate}
      onSubmit={async (values, { resetForm }) => {
        await onCreate(values); // po „abc”: values → { title: "abc", priority: "medium" }
        resetForm();
      }}
    >
      {/* render-prop: Formik oddaje swój stan funkcji w children */}
      {({ isSubmitting }) => (
        <Form>
          <label>
            Title
            {/* samo name wystarcza: value, onChange i onBlur podpina Field */}
            <Field name="title" />
          </label>
          {/* akapit tylko przy touched.title i errors.title */}
          <ErrorMessage name="title" component="p" />
          <button type="submit" disabled={isSubmitting}>Create</button>
        </Form>
      )}
    </Formik>
  );
}
```

Zachowanie jest takie samo jak w wersji z `useFormik`. Po „ab” akapitu jeszcze brak. Po opuszczeniu pola `<ErrorMessage>` renderuje `<p>Title must be at least 3 characters.</p>`. `<Form>` to zwykły element `<form action="#">` z podpiętym `handleSubmit`, a każde `<Field>` jest polem kontrolowanym, którego wartość leży w stanie Formika pod kluczem równym atrybutowi `name`.

## Rozszerzenie: walidacja na serwerze w trakcie pisania

Biblioteka umie też sprawdzać pole na serwerze w trakcie pisania, czego akcje nie mają. Strona *Form and Field Validation* opisuje walidator `onChangeAsync` z opóźnieniem `onChangeAsyncDebounceMs`. Opóźnienie (*debounce*) to odczekanie, aż zdarzenia przestaną napływać, zanim kod zareaguje. Walidator ustawia się przy polu tytułu w `NewIssueTanStack`.

```jsx
// Przykład spoza demo: sprawdzenie tytułu na serwerze w trakcie pisania.
<form.Field
  name="title"
  validators={{
    onChangeAsyncDebounceMs: 500, // zapytanie dopiero po 500 ms bez nowego znaku
    onChangeAsync: async ({ value }) => {
      const error = await checkTitle(value); // checkTitle: odpowiedź po 300 ms
      return error ? { message: error } : undefined;
    },
  }}
  children={(field) => (
    <label>
      Title
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors.map((issue) => (
        <p key={issue.message}>{issue.message}</p>
      ))}
    </label>
  )}
/>
```

```text
„Page loads slowly on mobile” (27 znaków), 100 ms między znakami  → 1 wywołanie checkTitle
ten sam tytuł, 600 ms między znakami                              → 25 wywołań
bez onChangeAsyncDebounceMs, 100 ms między znakami                → 25 wywołań
po ostatnim wywołaniu pod polem: An issue with this title already exists.
```

Dwie pierwsze litery nie wysyłają zapytania, bo walidator asynchroniczny rusza tylko wtedy, gdy schemat w `onChange` formularza nie zgłosił błędu.

# Rozszerzenia do slajdu 07: React Compiler: memoizacja dopisywana w czasie budowania

Powrót: [`slide_07_react-compiler.md`](../slide_07_react-compiler.md)

## Rozszerzenie: opcja `panicThreshold`

Za brak przerwanego buildu odpowiada opcja `panicThreshold`. Jej domyślna wartość `'none'` każe pominąć komponent, którego nie da się skompilować, i budować dalej. Wartości `'critical_errors'` i `'all_errors'` przerywają build, a dokumentacja zaleca je tylko chwilowo, do szukania problemów.

```js
// Przykład spoza demo: next.config.mjs z progiem, który przerywa build
const nextConfig = {
  reactCompiler: { panicThreshold: 'critical_errors' }, // zamiast reactCompiler: true
};

export default nextConfig;
```

```jsx
// Przykład spoza demo: components/BadStats.jsx, komponent kliencki łamiący reguły
'use client';
export default function BadStats({ contacts }) {
  contacts.total = contacts.length; // zmiana propsa podczas renderu
  return <p>Total: {contacts.total}</p>;
}
```

```text
$ npx next build
ReactCompilerError: Found 1 error:
Error: This value cannot be modified
Modifying component props or hook arguments is not allowed. Consider using a local variable instead.
```

Z `'none'` ten sam build kończy się sukcesem, a `BadStats` trafia do paczki bez pamięci `c(N)`. Bez `'use client'` build przechodzi nawet z `'all_errors'`, bo Next.js nie przepuszcza przez kompilator kodu komponentów serwerowych.

## Rozszerzenie: biblioteki, które psują memoizację

Część bibliotek powstała, zanim zasady memoizacji Reacta zostały spisane. Dokumentacja wymienia funkcję `watch` z React Hook Form i hook `useReactTable` z TanStack Table. Wspólny problem nazywa **wewnętrzną zmiennością** (*interior mutability*). Obiekt albo funkcja trzyma ukryty stan, który się zmienia, choć referencja zostaje ta sama.

Skutek opisuje przykład z `watch`. Wartość zapamiętana przez `useMemo(() => watch('name'), [watch])` nigdy się nie zaktualizuje, bo `watch` ma przez cały czas tę samą referencję. Interfejs wygląda wtedy na zamrożony. Ten sam mechanizm da się odtworzyć bez biblioteki:

```jsx
// Przykład spoza demo: obiekt z ukrytym stanem, jak watch z React Hook Form
const draft = { name: 'Anna Kowalska' };
draft.get = () => draft.name; // ta sama funkcja, zmienia się tylko draft.name

function Preview({ form }) {
  const name = useMemo(() => form.get(), [form.get]); // zależność się nie zmienia
  return <p>{name}</p>;
}

const { rerender } = render(<Preview form={draft} />);
draft.name = 'Piotr Nowak';
rerender(<Preview form={draft} />);
console.log(screen.getByRole('paragraph').textContent); // → Anna Kowalska
console.log(draft.get());                               // → Piotr Nowak
```

Komponenty z API tych bibliotek kompilator pomija sam. W projekcie z ESLintem takie wywołania wskazuje też reguła `incompatible-library` z pakietu `eslint-plugin-react-hooks`, a `contacts-app` lintera nie ma.

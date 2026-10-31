# Rozszerzenia do slajdu 04: Jedna strona dla każdego zgłoszenia

Powrót: [`slide_04_trasa-dynamiczna.md`](../slide_04_trasa-dynamiczna.md)

## Rozszerzenie: nazwa stała obok dynamicznej

Na jednym poziomie segment dynamiczny może stać obok zwykłego katalogu. Gdyby formularz trafił pod `app/issue/new/page.jsx`, adres `/issue/new` pasowałby do dwóch katalogów: `new` i `[id]`. Router wybiera wtedy katalog o nazwie zapisanej wprost. Strona z `app/issue/new/` odpowiada pod `/issue/new` własną treścią, a `/issue/2` nadal pokazuje zgłoszenie. Nazwa stała ma pierwszeństwo, bo opisuje adres dokładniej niż wzorzec.

Dwa segmenty dynamiczne na tym samym poziomie to błąd. Katalog `app/issue/[slug]/` dodany obok `[id]` zatrzymuje build komunikatem:

```text
Error: Ambiguous app routes detected:

Ambiguous route pattern "/issue/[*]" matches multiple routes:
  - /issue/[id]
  - /issue/[slug]
```

Dla adresu `/issue/2` nie da się rozstrzygnąć, czy `2` jest numerem, czy nazwą, bo oba wzorce pasują do każdej wartości. Wyjściem są odrębne segmenty stałe przed nimi, na przykład `app/issue/[id]` i `app/issue/by-slug/[slug]`.

## Rozszerzenie: polskie znaki w segmencie

Przeglądarka koduje polskie znaki i spację procentowo. Słowo `żółw` trafia do serwera jako `%C5%BC%C3%B3%C5%82w`, a spacja jako `%20`. W tej zakodowanej postaci wartość trafia też do `params`, więc porównanie z napisem `"żółw"` w danych nie znajdzie niczego. Wartość z adresu dekoduje funkcja wbudowana w JavaScript:

```js
encodeURIComponent("żółw");               // → "%C5%BC%C3%B3%C5%82w"
decodeURIComponent("%C5%BC%C3%B3%C5%82w"); // → "żółw"
decodeURIComponent("%C5");                 // → wyjątek URIError: URI malformed (niepełny kod znaku)
```

Dekodowanie stawia się w jednym miejscu, zaraz po `await params`, żeby reszta kodu pracowała już na zwykłym napisie. Adres z niepełnym kodem, jak końcówka `%C5`, nie dociera zresztą do strony, bo serwer Next.js w trybie produkcyjnym odpowiada na niego kodem 500. Numer zgłoszenia składa się z samych cyfr, więc `issuetracker` tego kroku nie potrzebuje.

## Rozszerzenie: segmenty „łap wszystko”

Nawias z trzema kropkami, `[...slug]`, przechwytuje wszystkie kolejne segmenty naraz, a wartość przychodzi jako tablica napisów. Wersja w podwójnym nawiasie, `[[...slug]]`, pasuje dodatkowo do adresu bez żadnego segmentu. Strona w katalogu `app/shop/[[...slug]]/` dostaje takie wartości:

| Adres | `params` |
|---|---|
| `/shop` | `{}`, czyli `slug` ma wartość `undefined` |
| `/shop/a` | `{ slug: ['a'] }` |
| `/shop/a/b` | `{ slug: ['a', 'b'] }` |

Wersja z pojedynczym nawiasem nie pasuje do samego `/shop` i daje tam 404. Wariant opcjonalny wymaga ostrożności: kod zakładający tablicę dostanie pod `/shop` wartość `undefined`, a wywołanie `slug.join("/")` zgłosi wyjątek. W `issuetracker` takiego segmentu nie ma, bo każdy adres zgłoszenia ma dokładnie jeden numer.

```jsx
// Przykład spoza demo: filtr zgłoszeń w app/browse/[[...filter]]/page.jsx
import { initialIssues } from "../../data/issues";

export default async function BrowsePage({ params }) {
  const { filter = [] } = await params;          // pod /browse filter to undefined, więc []
  const [priority, status] = filter;             // np. ["high", "open"]
  const issues = initialIssues.filter(
    (i) => (!priority || i.priority === priority) && (!status || i.status === status)
  );
  return <p>{filter.join("/") || "all"}: {issues.length}</p>;
}
// → /browse → „all: 4”; /browse/high → „high: 2”; /browse/low/open → „low/open: 0”
```

Wartość domyślna `= []` w destrukturyzacji usuwa jedyny przypadek bez tablicy, więc `join` działa także pod `/browse`.

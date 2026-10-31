# Rozszerzenia do slajdu 01: Szkielet aplikacji i to, co w `app/` staje się adresem

Powrót: [`slide_01_szkielet-i-katalog-app.md`](../slide_01_szkielet-i-katalog-app.md)

## Rozszerzenie: foldery prywatne `_nazwa`

Podkreślnik na początku nazwy katalogu wyłącza go z routingu razem z podkatalogami, na przykład `_components`.

> **„To sygnał, że katalog jest prywatnym szczegółem implementacji i system tras ma go pomijać. Wyłącza to z routingu ten katalog i wszystkie jego podkatalogi.”**
>
> *„This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby opting the folder and all its subfolders out of routing.”*
>
> — dokumentacja Next.js, *Project Structure*

Zwykłe pliki i tak nie tworzą adresów, więc dokumentacja podaje inne powody. Nazwy z podkreślnikiem sortują się w edytorze razem i chronią przed konfliktem z plikami specjalnymi przyszłych wersji Next.js.

```text
// Przykład spoza demo: katalog prywatny obok zwykłego, po next build
app/_components/page.jsx   → /_components → 404
app/components/page.jsx    → /components  → 200
app/%5Fnotes/page.jsx      → /_notes      → 200
```

Katalog `app/components/` z `issuetracker` trzyma tylko `SubmitButton.jsx`, ale pierwszy `page.jsx` dałby w nim adres. Ostatni wiersz to sposób na adres z podkreślnikiem: `%5F` jest zakodowanym znakiem `_`.

## Rozszerzenie: grupy tras `(nazwa)`

Katalog w nawiasie okrągłym nadal bierze udział w routingu, ale jego nazwa nie trafia do adresu. Router przy dopasowaniu po prostu go przeskakuje.

> **„Grupy tras to konwencja nazywania katalogów, która pozwala porządkować trasy według kategorii albo zespołu.”**
>
> *„Route Groups are a folder convention that let you organize routes by category or team.”*
>
> — dokumentacja Next.js, *Route Groups*

Minimalny przykład spoza projektu pokazuje oba skutki naraz:

```text
app/(shop)/layout.jsx       ← ramka sklepu, bez segmentu w adresie
app/(shop)/cart/page.jsx    → /cart, w ramce sklepu
app/(info)/about/page.jsx   → /about, bez ramki sklepu
```

Adresy `/cart` i `/about` nie zdradzają, że strony leżą w dwóch grupach. Grupa daje jednak jednej z nich własny layout, a drugiej nie. Dwie grupy nie mogą prowadzić do tego samego adresu. Dokumentacja podaje przykład: pliki `(marketing)/about/page.js` i `(shop)/about/page.js` dają oba `/about` i kończą się błędem (*„would both resolve to `/about` and cause an error”*).

## Rozszerzenie: katalog `src/` i ścieżki importów

Next.js dopuszcza katalog `src/`, który oddziela kod aplikacji od konfiguracji. Stary `app/` w korzeniu sprawia jednak, że `src/app/` zostanie pominięty (*„`src/app` or `src/pages` will be ignored if `app` or `pages` are present in the root directory”*).

```text
// Przykład spoza demo: src/app obok app w korzeniu projektu, po next build
app/page.jsx               → /      → 200
src/app/about/page.jsx     → /about → 404, bo cały src/app jest pominięty
```

Plik `jsconfig.json` definiuje alias `"@/*": ["./*"]`, czyli `@/` oznacza korzeń projektu niezależnie od miejsca pliku.

```jsx
// Przykład spoza demo: import danych aliasem w app/issue/[id]/page.jsx
import { initialIssues } from "@/app/data/issues";  // to samo co "../../data/issues"
```

Kod demo zostaje przy ścieżkach względnych, bo żaden plik nie leży głębiej niż dwa poziomy pod `app/`.

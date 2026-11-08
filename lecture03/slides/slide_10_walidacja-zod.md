# Reguły walidacji zapisane w jednym schemacie

## Ręczny `if` przepuszcza za krótki tytuł

Formularz `/new` sprawdza na razie jeden warunek, zapisany w akcji dwoma liniami:

```js
  const title = formData.get("title").trim();
  if (title === "") return { errors: { title: "Title must not be empty." } };
```

Pomiar na tej wersji: tytuł „ab” przechodzi, a na liście pojawia się wiersz „[medium] ab”. Warunek odrzuca tylko tytuł pusty. Każda kolejna reguła, na przykład minimalna długość albo dozwolone wartości priorytetu, dopisałaby następny `if` z własnym komunikatem. Schwarzmüller w *React Key Concepts* pokazuje taki ręczny warunek w akcji formularza i zwraca z niego obiekt z komunikatem. Opisuje to jako typowe zastosowanie `useActionState`: walidację wartości z formularza i wyświetlenie komunikatu, gdy dane są niepoprawne.

Ręczne warunki opisują, jak sprawdzać dane. **Walidacja schematem** (*schema validation*) odwraca kierunek: opisuje, jak wyglądają dane poprawne, a sprawdzanie zostawia bibliotece. **Schemat** to obiekt, który mówi na przykład „tytuł jest napisem o długości co najmniej 3 znaków”. Ten sam schemat można przyłożyć do danych z formularza, z żądania HTTP albo z pliku. Reguły są wtedy zapisane raz i nie rozjeżdżają się między miejscami, które ich używają.

Jedną z bibliotek tego typu w ekosystemie Reacta jest **Zod**. Jej strona zaczyna od typów TypeScriptu (*„TypeScript-first schema validation with static type inference”*), które w projekcie pisanym w JavaScripcie nie mają zastosowania. Zostaje druga połowa: schemat sprawdzany w czasie działania programu, w chwili, gdy przychodzą prawdziwe dane. Starszą biblioteką o tej samej roli jest Yup.

## Parsowanie: sprawdzenie, które oddaje nowe dane

Zwykła funkcja walidująca odpowiada „tak” albo „nie” i zostawia dane takie, jakie były. Zod robi coś więcej. Dla danych poprawnych zwraca nowy obiekt zbudowany według schematu, a dla niepoprawnych opis tego, co się nie zgadza. Taki sposób pracy nazywa się **parsowaniem** (*parsing*): na wejściu są dane niepewnego pochodzenia, na wyjściu dane o znanym kształcie albo błąd. Stąd nazwy obu metod sprawdzających, `parse` i `safeParse`.

Parsowanie zmienia to, gdzie w programie leży pewność. Kod przed wywołaniem schematu musi zakładać, że w tytule może być `null`, liczba albo trzy spacje. Kod po udanym wywołaniu dostaje napis o znanej długości i nie musi tego sprawdzać ponownie. Ta granica powinna leżeć jak najbliżej miejsca, w którym dane wchodzą do programu, czyli zaraz po odczycie `FormData`.

## Łańcuch reguł i jego kolejność

Schemat buduje się z wywołań łańcuchowych. Każda metoda zwraca nowy schemat z jedną regułą więcej, a Zod sprawdza je od lewej do prawej:

```js
import { z } from "zod";

const title = z.string().trim().min(3, "Title too short");

title.safeParse("  abc  "); // → { success: true, data: "abc" } (spacje obcięte)
title.safeParse("ab ");     // success: false, komunikat "Title too short"

// te same reguły w odwrotnej kolejności: min(3) liczy znaki przed obcięciem
z.string().min(3).trim().safeParse("ab "); // → { success: true, data: "ab" }
```

Ostatnia linia pokazuje, że kolejność w łańcuchu ma znaczenie. **`.trim()`** jest przekształceniem (dokumentacja Zod pokazuje je pod zdaniem *„To perform some simple string transforms”* z komentarzem *„trim whitespace”*) i zmienia napis dla wszystkich reguł stojących za nim. Postawione na końcu obcina spacje dopiero po sprawdzeniu długości, więc tytuł „ab ” przechodzi jako „ab”.

Ręczny warunek z poprzedniej wersji akcji odrzucał tytuł z samych spacji, bo wywoływał `trim()`. Schemat bez `.trim()` tego nie robi: `z.string().min(3)` przepuszcza trzy spacje, bo to trzy znaki. Przejście z `if` na schemat zgubiłoby więc regułę bez żadnego komunikatu. <u>Przekształcenie stoi w łańcuchu przed regułami, które mają widzieć jego wynik</u>.

## Instalacja w wersji 3

```bash
npm install -E zod@3.25.76
```

Samo `npm install zod` instaluje najnowsze wydanie, czyli Zod 4. Flaga **`-E`** (*save exact*) zapisuje w `package.json` dokładny numer bez znaku `^`. Znak `^` pozwala menedżerowi pakietów przejść na dowolne nowsze wydanie z tą samą pierwszą cyfrą, a dokładny numer blokuje także to. Projekt referencyjny ma ten wpis w `package.json` od początku.

Pierwsza cyfra numeru to **wersja główna** (*major*). Według konwencji numerowania semantycznego jej zmiana zapowiada zmiany niezgodne wstecz, czyli kod napisany dla starej wersji może przestać działać. Zod 4 zmienia trzy elementy API, których używa ten projekt albo jego warianty. Metoda `.flatten()` na błędzie jest przestarzała (dokumentacja Zod, *Migration guide*: *„The `.flatten()` method on `ZodError` has also been deprecated”*), a jej miejsce zajmuje funkcja `z.flattenError(result.error)`. Opcja `errorMap` w `z.enum` zmieniła nazwę na `error`. Sprawdzenie adresu e-mail `z.string().email()` zastępuje funkcja `z.email()`. Kod w tym slajdzie używa zapisu z Zod 3.

## Schemat zgłoszenia

Plik `app/lib/schema.js` zbiera reguły z formularza w jednym miejscu:

```js
// app/lib/schema.js
import { z } from "zod";

export const issueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."), // trim przed min
  priority: z.enum(["low", "medium", "high"]),
});
```

**`z.object({ … })`** opisuje kształt obiektu: jakie klucze ma mieć i jaki schemat obowiązuje każdy z nich. `z.string()` wymaga napisu, więc `null`, liczba ani `undefined` nie przejdą. `.trim()` obcina spacje z brzegów, zanim zadziała reguła długości, a drugi argument `.min()` to komunikat dla użytkownika. `z.enum` przepuszcza tylko jedną z trzech wartości. Plik leży w `app/lib/`, poza katalogami tras, więc schemat może zaimportować każdy formularz i każdy moduł serwera.

Schemat z demo jest najkrótszy z możliwych. Dwie typowe rozbudowy to górna granica długości i własny komunikat dla priorytetu:

```js
// Przykład spoza demo: wariant schematu z górną granicą i własnym komunikatem (Zod 3).
const strictSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title is too long (max 100 characters)."),
  priority: z.enum(["low", "medium", "high"], {
    // errorMap to zapis z Zod 3; funkcja strzałkowa zwraca obiekt, więc jego klamry stoją w nawiasach
    errorMap: () => ({ message: "Priority must be low, medium, or high." }),
  }),
});

strictSchema.safeParse({ title: "x".repeat(101), priority: "low" }).error.flatten().fieldErrors;
// → { title: ["Title is too long (max 100 characters)."] }
issueSchema.safeParse({ title: "x".repeat(101), priority: "low" }).success; // → true (schemat z demo nie ma .max())
```

## `parse` rzuca, `safeParse` zwraca

Schemat ma dwie metody sprawdzania danych. Różnią się tym, co robią z błędem:

```js
try {
  title.parse("ab"); // dane niepoprawne: parse() rzuca wyjątek ZodError
} catch (e) {
  console.log(e instanceof z.ZodError); // → true
}

const result = title.safeParse("ab"); // safeParse() nigdy nie rzuca
console.log(result.success); // → false; przy true wynik leży w result.data
```

Dokumentacja Zod opisuje pierwszą metodę tak, że dla danych poprawnych zwraca ich głęboką kopię, a dla niepoprawnych rzuca `ZodError` ze szczegółami problemów. Druga metoda działa bez wyjątków:

> **„Metoda `.safeParse()` zwraca zwykły obiekt wyniku, który zawiera albo poprawnie sparsowane dane, albo `ZodError`.”**
>
> *„you can use the `.safeParse()` method to get back a plain result object containing either the successfully parsed data or a `ZodError`.”*
>
> — dokumentacja Zod, *Basic usage*

Wybór ma bezpośredni skutek w akcji z `useActionState`. Wyjątek w akcji przejmuje najbliższa granica błędów, a za krótki tytuł to sytuacja spodziewana, którą użytkownik poprawi sam. W kopii projektu akcja z `parse` zamiast `safeParse` kończyła tytuł „ab” domyślnym ekranem „This page couldn’t load” z przyciskami „Reload” i „Back”, a w konsoli pojawiał się nieobsłużony `ZodError`. <u>W akcji formularza używa się `safeParse()`, a błędy zwraca jako stan</u>.

## Błędy pogrupowane według pól

`ZodError` zawiera listę problemów, a formularz potrzebuje komunikatów przypisanych do pól. Metoda `flatten()` przekłada jedno na drugie:

```js
const result = issueSchema.safeParse({ title: "ab", priority: "urgent" });

result.error.flatten().fieldErrors;
// → { title: ["Title must be at least 3 characters."],
//   priority: ["Invalid enum value. Expected 'low' | 'medium' | 'high', received 'urgent'"] }

issueSchema.safeParse({ title: "abc", priority: "x" }).error.flatten().fieldErrors;
// → { priority: [...] } (pole poprawne w ogóle nie występuje)

strictSchema.safeParse({ title: "ab", priority: "urgent" }).error.flatten().fieldErrors.priority;
// → ["Priority must be low, medium, or high."] (wariant z errorMap)
```

Kluczem jest nazwa pola, a wartością tablica, bo jedno pole może złamać kilka reguł naraz. Pole poprawne nie ma w wyniku klucza, więc JSX czyta je przez `?.`. Priorytet z listy nie może być zły, bo przeglądarka wysyła tylko jedną z trzech opcji, więc komunikat Zod dla `priority` pojawia się dopiero przy żądaniu spoza formularza. Dlatego demo zostaje przy komunikacie domyślnym.

## Akcja ze schematem

Plik `app/new/page.jsx` przechodzi z ręcznego warunku na schemat. Dochodzi import `issueSchema`, a trzy linie z `trim()` i `if` zastępuje `safeParse`:

```jsx
// app/new/page.jsx
"use client";
import { useActionState } from "react";
import { issueSchema } from "../lib/schema";
import { addIssue } from "../lib/store";

// akcja dostaje poprzedni stan i dane formularza, a zwraca nowy stan
async function submitIssue(prevState, formData) {
  await new Promise((r) => setTimeout(r, 600)); // udajemy zapis na serwerze: 0,6 s
  const result = issueSchema.safeParse({
    title: formData.get("title"),
    priority: formData.get("priority"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  const issue = addIssue(result.data); // zapis danych po walidacji
  return { issue };
}

export default function NewIssuePage() {
  const [state, formAction, isPending] = useActionState(submitIssue, null);

  return (
    <main>
      <h1>New issue</h1>
      {state?.issue && <p>Issue #{state.issue.id} added.</p>}
      <form action={formAction}>
        <p>Title: <input name="title" /> {state?.errors?.title}</p>
        <p>
          Priority:{" "}
          <select name="priority" defaultValue="medium">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </p>
        <button disabled={isPending}>Add issue</button>
      </form>
    </main>
  );
}
```

Pomiar: pusty tytuł daje po 0,2 s wyłączony przycisk, a potem komunikat „Title must be at least 3 characters.” obok pola. Tytuł „  ab  ” daje ten sam komunikat, choć w poprzedniej wersji „ab” przechodził. Tytuł „Search returns nothing” z priorytetem „high” kończy się komunikatem „Issue #4 added.” i pustym polem. Komunikat to tablica z jednym napisem, a JSX wypisuje ją wprost, bo tablica napisów renderuje się jako ich ciąg.

![Rysunek 3.20 — komunikat Zod obok pola tytułu po wysłaniu „  ab  ”](../figures/out/rys_03_20.png)

Na Rysunku 3.20 komunikat stoi tam, gdzie `state?.errors?.title`, obok pola tytułu. Pole jest puste, bo React po akcji czyści formularz, a ekran błędu się nie pojawia.

## Rysunek 3.21 — od `FormData` do komunikatu przy polu

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    F["FormData<br/>title, priority"] --> R["obiekt z dwoma polami"]
    R --> S{"issueSchema<br/>.safeParse(...)"}
    S -->|"success: true"| D["result.data<br/>→ addIssue"]
    S -->|"success: false"| E["flatten()<br/>.fieldErrors"]
    E --> U["state.errors.title<br/>obok pola Title"]
```

Na Rysunku 3.21 strzałki idą od danych formularza do tego, co widzi użytkownik. Romb to granica parsowania: przed nim dane są niepewne, za nim albo sprawdzone, albo zamienione na komunikaty. Górna gałąź zapisuje zgłoszenie i dostaje obiekt zbudowany przez schemat. Dolna kończy się zwykłym obiektem stanu, więc ekran błędu w ogóle się nie pojawia.

## Dlaczego zapisuje się `result.data`

`result.data` to nowy obiekt zbudowany według schematu. Dokumentacja Zod podaje regułę: domyślnie nierozpoznane klucze są usuwane z wyniku (*„By default, unrecognized keys are stripped from the parsed result”*). Widać to na skrócie `Object.fromEntries(formData)`. Funkcja `Object.fromEntries` buduje obiekt z listy par `[klucz, wartość]`. `FormData` jest taką listą, więc wynik ma po jednym kluczu na każde pole formularza:

```js
Object.fromEntries([["a", 1], ["b", 2]]); // → { a: 1, b: 2 }

const formData = new FormData();
formData.set("title", "Bug");
formData.set("priority", "high");
formData.set("extra", "1"); // pole, którego schemat nie zna

Object.fromEntries(formData); // → { title: "Bug", priority: "high", extra: "1" }
issueSchema.safeParse(Object.fromEntries(formData)).data; // → { title: "Bug", priority: "high" }
issueSchema.safeParse({ title: "  abc  ", priority: "low" }).data; // → { title: "abc", priority: "low" }
```

Akcja demo odczytuje dwa pola wprost, więc nadmiarowych kluczy tu nie ma. Zapis `result.data` chroni jednak przed obydwoma przypadkami naraz: do magazynu trafia tytuł już obcięty ze spacji i tylko klucze opisane w schemacie.

## Te same reguły bez biblioteki i w Yup

Dwie reguły zgłoszenia da się zapisać także bez biblioteki albo w starszej bibliotece schematów. Porównanie pokazuje, za co płaci każdy wariant. **Ręczna funkcja** nie wymaga żadnej paczki:

```js
// Przykład spoza demo: walidacja bez biblioteki zwraca błędy, a danych nie zmienia.
function checkIssue(raw) {
  const errors = {};
  if (typeof raw.title !== "string" || raw.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }
  if (!["low", "medium", "high"].includes(raw.priority)) {
    errors.priority = "Priority must be low, medium, or high.";
  }
  return errors;
}

const raw = { title: "  abc  ", priority: "low" };
console.log(checkIssue(raw));             // → {}
console.log(JSON.stringify(raw.title)); // → "  abc  "
```

Pusty obiekt oznacza brak błędów, ale tytuł dalej ma spacje na brzegach. Funkcja sprawdziła wynik `raw.title.trim()` i nigdzie go nie zapisała, więc kod zapisu musi wywołać `trim()` drugi raz. Tak działa walidacja w czystej postaci: daje odpowiedź o danych, a nie nowe dane. Każda reguła, która przekształca wartość, stoi wtedy w dwóch miejscach.

**Yup** zapisuje reguły schematem, podobnie jak Zod. Barklund w *React in Depth* wymienia go w grupie bibliotek do zarządzania formularzami, obok Formika i React Hook Form. Różnice wychodzą dopiero przy uruchomieniu (Yup 1.7.1):

```js
// Przykład spoza demo: schemat zgłoszenia w Yup.
import * as yup from "yup";

const schema = yup.object({
  title: yup.string().trim().min(3, "Title must be at least 3 characters."),
  priority: yup.string().oneOf(["low", "medium", "high"], "Priority must be low, medium, or high."),
});

console.log(schema.validate({ title: "  abc  ", priority: "low" }) instanceof Promise); // → true
console.log(await schema.validate({ title: "  abc  ", priority: "low", extra: "1" }));  // → { priority: 'low', title: 'abc', extra: '1' }
console.log(schema.cast({ title: 5, priority: "low" }));                                // → { priority: 'low', title: '5' }
```

Metoda `validate` zwraca Promise, więc synchroniczna akcja musiałaby użyć jej wariantu `validateSync`. Klucz `extra`, którego schemat nie zna, zostaje w wyniku. Liczbę 5 Yup zamienia na napis „5”, a Zod tę samą wartość odrzuca komunikatem „Expected string, received number”. Yup domyślnie przerywa też na pierwszym błędzie: dla tytułu „ab” i priorytetu „urgent” zwraca tylko komunikat o priorytecie, a oba dopiero z opcją `abortEarly: false`. Między Yup a Zod rozstrzygają domyślne zachowania: Yup zamienia typy i zostawia nieznane klucze, a Zod odrzuca zły typ i usuwa klucze spoza schematu.

## Granica zaufania: przeglądarka i serwer

Strona `/new` ma dyrektywę `"use client"`, a `submitIssue` jest zwykłą funkcją w tym samym pliku. Cała walidacja działa więc w przeglądarce. Ochroną danych taka walidacja nie jest. Kod w przeglądarce należy do użytkownika: można go zmienić, wyłączyć albo pominąć i wysłać żądanie z innego programu. **Granica zaufania** (*trust boundary*) leży tam, gdzie dane przechodzą od strony, nad którą aplikacja nie ma kontroli, do strony, nad którą ma. Dla aplikacji webowej jest nią serwer.

Schemat w przeglądarce ma inne zadanie: daje użytkownikowi odpowiedź natychmiast, bez czekania na sieć. Ten sam plik `schema.js` może zaimportować kod wykonywany na serwerze, na przykład funkcja zapisu wywoływana przez formularz, i dopiero tam schemat daje ochronę. <u>Reguły piszą się raz, a sprawdzają dwa razy: w przeglądarce dla wygody, na serwerze dla bezpieczeństwa</u>.

![xkcd 327](../figures/memes/xkcd_327_exploits_of_a_mom.png)

*Przerywnik: xkcd 327 „Exploits of a Mom”. Autor: Randall Munroe, licencja CC BY-NC 2.5, <https://xkcd.com/327/>.* Szkoła zapisała dane od użytkownika bez sprawdzenia po stronie serwera, a ochronę daje tylko ta strona granicy zaufania.

## Reguła, która porównuje dwa pola

Reguły przy polach widzą tylko własną wartość. Warunek, który łączy dwa pola, na przykład „data końcowa nie wcześniej niż początkowa”, dopisuje się do całego obiektu metodą **`.refine()`**. Dostaje ona sparsowany obiekt i zwraca `true`, gdy dane są poprawne. Opcja `path` wskazuje pole, pod którym ma się pojawić komunikat:

```js
// Przykład spoza demo: reguła łącząca dwa pola.
const range = z
  .object({ from: z.number(), to: z.number() })
  .refine((r) => r.from <= r.to, {
    message: "End date is before start date",
    path: ["to"], // komunikat trafi do fieldErrors.to
  });

range.safeParse({ from: 5, to: 2 }).error.flatten().fieldErrors;
// → { to: ["End date is before start date"] }

range.safeParse({ from: "x", to: 2 }).error.flatten().fieldErrors;
// → { from: ["Expected number, received string"] } (refine się nie wykonał)
```

Druga próba pokazuje kolejność. Funkcja z `.refine()` dostaje obiekt dopiero wtedy, gdy wszystkie pola przeszły własne reguły, bo porównywanie liczby z napisem nie ma sensu. Użytkownik, który popełnił dwa błędy naraz, zobaczy więc najpierw błąd pola, a komunikat o zależności dopiero po jego poprawieniu. Reguły przy jednym polu działają inaczej: `z.string().min(3, "krótki").regex(/^[A-Z]/, "wielka litera")` dla napisu „a” zwraca oba komunikaty jednocześnie.

## Komunikat dla brakującego pola

Pole, które nie dotarło w `FormData`, ma wartość `null`, a pole pominięte w obiekcie wartość `undefined`. Zod 3 traktuje oba przypadki jako zły typ i bez dodatkowych opcji zwraca techniczny opis po angielsku. Konstruktor `z.string()` przyjmuje dwa własne komunikaty:

```js
// Przykład spoza demo: własne komunikaty dla brakującej wartości.
const title = z.string({
  required_error: "Title is missing", // gdy wartość to undefined
  invalid_type_error: "Title must be text", // gdy wartość ma inny typ, także null
});

title.safeParse(undefined).error.issues[0].message; // → "Title is missing"
title.safeParse(null).error.issues[0].message;      // → "Title must be text"
z.string().safeParse(null).error.issues[0].message; // → "Expected string, received null"
```

Rozróżnienie ma znaczenie dla formularzy. `formData.get("title")` dla pola bez atrybutu `name` zwraca `null`, więc zadziała `invalid_type_error`, a nie `required_error`. Schemat zgłoszenia nie ustawia żadnego z nich, dlatego po utracie atrybutu `name` obok pola zamiast „Title must be at least 3 characters.” pojawi się „Expected string, received null”. Komunikat o typie przy polu tekstowym oznacza, że wartość w ogóle nie przyszła z formularza.

## Zalety i koszty walidacji schematem

Schemat zastępuje rozproszone warunki jednym opisem, a w zamian wymaga dodatkowej paczki i znajomości jej domyślnych zachowań. Dobrze działa tam, gdzie reguł jest kilka i mają się powtarzać w kilku miejscach.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Reguły w jednym opisie; „  ab  ” jest odrzucone, choć ręczny `if` przepuszczał „ab” (pomiar) | Dodatkowa paczka w `package.json` i wersja główna do pilnowania (Zod 3 albo 4) | Jedno pole i jeden warunek: zwykły `if` |
| `safeParse` zwraca błędy według pól, a `result.data` jest już przycięte (pomiar: „  abc  ” zapisane jako „abc”) | Kolejność łańcucha ma znaczenie: `.trim()` przed `.min()` | Dane, które mają tylko przejść dalej bez zmian: funkcja `checkIssue` zwracająca błędy |
| Ten sam plik schematu obsługuje akcję i każdą bibliotekę formularzy | Walidacja w przeglądarce nie chroni danych na serwerze: ten sam schemat trzeba przyłożyć tam jeszcze raz | Schemat w Yup, gdy projekt już go ma: inne domyślne zachowania (zamiana typów, nieznane klucze zostają) |

> 💡 **Zapamiętaj:** schemat Zod parsuje dane: zwraca nowy obiekt o znanym kształcie albo opis błędów, a reguły sprawdza w kolejności łańcucha, więc `.trim()` stoi przed `.min()`. W akcji formularza używa się `safeParse()` i zapisuje `result.data`. Walidacja chroni dane dopiero po stronie serwera.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r10_walidacja-zod.md`](rozszerzenia/r10_walidacja-zod.md)

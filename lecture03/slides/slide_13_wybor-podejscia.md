# Akcje czy biblioteka: jak wybrać sposób obsługi formularza

## Ten sam formularz w dwóch wersjach

Projekt `issuetracker` ma formularz zgłoszenia w dwóch wariantach. `/new` używa `<form action>` z `useActionState`, który oddaje też flagę `isPending` dla przycisku „Add issue”. `/new-rhf` używa React Hook Form z `zodResolver`. Różni je to, gdzie mieszka wartość pola, co dostaje funkcja wysyłki, kiedy użytkownik widzi błąd i co dzieje się, zanim JavaScript strony się załaduje.

Formik i TanStack Form dokładają do porównania dwa kolejne warianty. Tabela zestawia wszystkie cztery, a każdy wiersz porównuje jedną rolę w formularzu:

| | `<form action>` + `useActionState` | React Hook Form | Formik | TanStack Form |
|---|---|---|---|---|
| Wysłanie w JSX | `action={formAction}` | `onSubmit={handleSubmit(fn)}` | `onSubmit={formik.handleSubmit}` | `onSubmit`, w nim `form.handleSubmit()` |
| Co dostaje funkcja wysyłki? | `FormData` | obiekt wartości | obiekt wartości | obiekt `value` |
| Jak podłącza schemat Zod? | `safeParse()` w akcji | `zodResolver` | funkcja `validate` | `validators`, bez adaptera |
| Kiedy domyślnie działa walidacja? | po wysłaniu, w akcji | przy wysłaniu, potem przy zmianach | przy zmianie, opuszczeniu pola i wysłaniu | według walidatorów `onChange`/`onBlur`/`onSubmit` |
| Dodatkowe paczki | brak (wbudowane w React) | `react-hook-form` + `@hookform/resolvers` | `formik` | `@tanstack/react-form` |
| Reset po sukcesie | automatyczny (React 19) | `reset()` ręcznie | `resetForm()` | `form.reset()` |
| Czy zapisuje bez JavaScriptu? | tak, gdy akcja działa na serwerze | nie | nie | nie |

Ostatni wiersz wynika z mechaniki wysyłania. Formularz obsługiwany wyłącznie przez `onSubmit` nie ma w HTML celu wysłania. Bez JavaScriptu przeglądarka wysyła go więc metodą GET pod bieżący adres: `/new-rhf` przeładowuje się jako `/new-rhf?title=Test+issue&priority=low`, a dane nie trafiają do żadnej funkcji zapisu. W `issuetracker` także pierwsza kolumna ma w tym wierszu odpowiedź „nie”, bo akcja działa w przeglądarce. Wiersz o walidacji wyznacza z kolei chwilę, w której użytkownik widzi komunikat, więc wybór biblioteki jest także wyborem tej chwili.

Do decyzji potrzebny jest jeszcze koszt w kodzie. Oba pliki z demo dają się porównać liczbowo: `app/new/page.jsx` ma 41 linii, a `app/new-rhf/page.jsx` 38 (w obu liczą się komentarze). Różnica jest mała. W akcji dochodzi wywołanie `safeParse` z dwoma polami i przełożenie błędów `flatten()` na stan, które w drugim wariancie wykonuje resolver, a w React Hook Form dochodzą `useForm`, `register` i `handleSubmit`. `/new` nie potrzebuje za to żadnej paczki poza Reactem i daje komunikat o sukcesie na tej samej stronie, a `/new-rhf` po zapisie przenosi na listę.

Wariant z akcjami wygrywa przy prostych formularzach i tam, gdzie dane idą na serwer. W `/new` akcja działa jeszcze w przeglądarce, więc tę zaletę daje dopiero funkcja z dyrektywą `"use server"`, czyli **Server Action**, którą formularz wywołuje bez pośrednika. Biblioteka wygrywa przy formularzach rozbudowanych, które pracują w przeglądarce. React Hook Form łączy się z Server Action dopiero przez `FormData` zbudowany ręcznie w `onSubmit`.

## Nie ma jednej dobrej odpowiedzi

Wieruch w *The Road to React* stawia na atrybut `action`, a Schwarzmüller w *React Key Concepts* uzależnia wybór od wymagań aplikacji. Stanowiska da się pogodzić, bo oba prowadzą do tego samego pytania: czy formularz ma wymaganie, którego wbudowany mechanizm nie pokrywa. Dopóki takiego wymagania nie ma, każda dodatkowa paczka jest kosztem bez zysku.

Barklund dokłada argument ogólny, dotyczący całego ekosystemu:

> **„Nie wszystkie biblioteki w ekosystemie React są sobie równe i nie wszystkie są potrzebne w każdym projekcie.”**
>
> *„It’s worth noting that not all libraries in the React ecosystem are created equal, and not all of them are necessary for every project.”*
>
> — Morten Barklund, *React in Depth*

## Rysunek 3.25 — drzewo decyzji

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 360}}}%%
flowchart LR
    Q0{"Kod już używa<br/>Formika?"} -->|tak| A3["Formik zostaje,<br/>migracja przy okazji"]
    Q0 -->|nie| QS{"Dane idą na serwer,<br/>formularz ma działać bez JS?"}
    QS -->|tak| AS["form action +<br/>Server Action"]
    QS -->|nie| Q1{"Walidacja w trakcie<br/>pisania?"}
    Q1 -->|nie| A1["form action +<br/>useActionState"]
    Q1 -->|tak| Q2{"Wiele pól zależnych,<br/>walidacja asynchroniczna?"}
    Q2 -->|nie| A2["React Hook Form<br/>+ ten sam schemat"]
    Q2 -->|tak| A4["TanStack Form"]
```

Na Rysunku 3.25 formularz z demo idzie najkrótszą drogą przez gałąź przeglądarki. Projekt nie ma Formika, zapis trafia do modułu `store.js` w przeglądarce, a dwa pola nie potrzebują walidacji w trakcie pisania, więc wynikiem jest `<form action>` z `useActionState`, bez nowej zależności w `package.json`. Drugie pytanie kieruje formularz, którego dane mają trafić na serwer albo który ma działać przed załadowaniem JavaScriptu, do akcji z `"use server"`. Pierwsze pytanie dotyczy istniejącego kodu, bo działający Formik nie jest powodem do przepisania. Wymianę uzasadniają konkretne potrzeby: wysyłanie przez akcję na serwerze albo przejście zespołu na schematy Zod. Bibliotekę wybiera się dopiero wtedy, gdy formularz ma sprawdzać pola w trakcie pisania. Ostatnie pytanie oddziela formularze, w których pola zależą od siebie albo wymagają zapytania do serwera w trakcie pisania. Tam subskrypcja pojedynczych pól i walidator asynchroniczny TanStack Form zaczynają się opłacać.

## Co przechodzi przy zmianie podejścia

Wybór da się później zmienić. Koszt takiej zmiany zależy od tego, co da się przenieść bez przepisywania. Przenosi się schemat: ten sam plik `app/lib/schema.js` obsługuje wszystkie cztery warianty, od `safeParse` w akcji po `validators` w TanStack Form. Przenoszą się komunikaty, bo leżą w schemacie, i funkcja zapisu `addIssue`, bo każde podejście kończy się wywołaniem z obiektem `{ title, priority }`. Przepisuje się to, co łączy pole z narzędziem: atrybuty pól w JSX, wyrażenia, które wyświetlają błąd, i sposób, w jaki komponent dowiaduje się o trwającym wysyłaniu. Kod trzymający reguły poza komponentem formularza zmienia się więc najtaniej.

## Przy mieszaniu podejść

Mieszanie mechanizmów w jednym formularzu grozi tym, że **jedna wartość pola leży w dwóch miejscach**. Tak się dzieje, gdy pole kontrolowane przez Formika albo TanStack Form odczytuje jednocześnie `FormData` w akcji. Po wysłaniu React czyści pola niekontrolowane, a biblioteka trzyma w stanie starą wartość. Na ekranie pole wygląda wtedy na wyczyszczone albo na wypełnione, zależnie od tego, które źródło akurat wygrało ostatni render. <u>Jeden formularz ma jeden model przechowywania wartości</u>, wybrany dla całego formularza, a nie pole po polu.

## Test przyszłej zmiany

Dobrym testem wyboru jest pytanie o zmianę, która przyjdzie później. Gdy do formularza dojdzie nowe pole, na przykład opis zgłoszenia, liczba miejsc do zmiany zależy od podejścia. W wariancie z akcjami trzeba zmienić schemat, znacznik pola i obiekt przekazany do `safeParse` z odczytem `formData.get("description")`. W wariancie z React Hook Form wystarczy schemat i znacznik pola z `register`. W TanStack Form dochodzą schemat, wartości początkowe i znacznik pola. W Formiku do tych trzech miejsc dochodzi czwarte: nowy wiersz w funkcji `validate`, jak `title: fieldErrors.title?.[0]`. Bez tego wiersza nowe pole nie pokaże komunikatu, choć schemat go zgłosi. Liczba miejsc nie przesądza wyboru, ale pokazuje, gdzie przy danym podejściu najłatwiej o pomyłkę.

## Lista, która zna nowe zgłoszenie

Nowe zgłoszenie trafia na listę bez przeładowania, ale żyje tylko w module `store.js` w przeglądarce. Przeładowanie strony je kasuje, a strona szczegółów, renderowana na serwerze, w ogóle go nie zna. Trwały zapis wymaga akcji, która wykonuje się na serwerze, i miejsca na dane po tamtej stronie granicy zaufania.

## Zalety i koszty biblioteki formularzy

Schwarzmüller w *React Key Concepts* przyznaje, że cały potrzebny kod da się napisać samemu. Przy coraz bardziej złożonych aplikacjach „może jednak mieć sens oddanie niektórych problemów na zewnątrz” (*„it might make sense to outsource certain problems”*). Zysk z oddania problemu bibliotece opisuje tabela, a koszt składa się z trzech rzeczy. **Koszt** płaci się przez cały czas życia projektu: to paczka w `package.json`, jej własne zależności i API, którego uczy się każda osoba w zespole. Według rejestru npm `react-hook-form` 7.89.0 ma zero zależności, Formik 2.4.9 ma ich osiem, a `@tanstack/react-form` 1.33.5 dwie. Rozmiaru w kilobajtach bez oficjalnego źródła się tu nie podaje. **Ryzyko** to zmiany, na które projekt nie ma wpływu: nowa wersja główna ze zmienionym API albo biblioteka, która przestaje się rozwijać. Rośnie ono z liczbą miejsc, w których kod aplikacji woła API biblioteki. **Odwracalność** mówi, ile kosztuje wycofanie się z decyzji, i zależy od tego, czy zmianę da się wprowadzać po kawałku.

Barklund w *React in Depth* pokazuje skrajny przypadek na scenariuszu starego panelu firmowego. Pisze o nim, że „przepisanie go na nowy stos jest prawie niemożliwe, bo projekt jest ogromny” (*„Refactoring this to a new stack is nigh on impossible as the project is huge.”*). Stary stos uznaje mimo to za dobry wybór, bo zachowuje zgodność z istniejącym kodem i zostawia „otwarte drzwi do stopniowej modernizacji” (*„leaving an open door for gradual modernization”*). Formularze dobrze znoszą taką stopniową zmianę, bo każdy jest osobnym komponentem. `issuetracker` ma jednocześnie formularz na akcjach i formularz z biblioteką, a projekt może przenosić formularze po jednym. Na tej zasadzie opiera się pierwsza gałąź Rysunku 3.25, w której Formik zostaje, a migracja przychodzi przy okazji.

![xkcd 2347](../figures/memes/xkcd_2347_dependency.png)

*Przerywnik: xkcd 2347 „Dependency”. Autor: Randall Munroe, licencja CC BY-NC 2.5, <https://xkcd.com/2347/>.* Każda zależność w `package.json` jest takim klockiem: aplikacja działa, dopóki działają biblioteki pod nią.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Walidację przy pisaniu i fokus na błędnym polu, bez ręcznego kodu (pomiar na `/new-rhf`: „Dark mode” zdejmuje komunikat bez wysłania) | Zależność w `package.json` (0, 8 albo 2 własne zależności) i API do nauczenia; kod krótszy tylko o 3 linie (41 i 38 linii) | Formularz bez wymagania, którego akcja nie pokrywa: `<form action>` z `useActionState` |
| Schemat, komunikaty i `addIssue` przechodzą między podejściami bez zmian; formularze można przenosić po jednym | Ryzyko zmian wersji głównej (resolver 3.10.0 działa tylko z Zod 3) i przepisywanie wiązań pól przy zmianie podejścia | Istniejący, działający Formik: zostaje, migracja przy okazji |
| Pełną kontrolę nad stanem pola, gdy pola zależą od siebie albo wymagają zapytania w trakcie pisania | Brak zapisu bez JavaScriptu (pomiar: `/new-rhf?title=Test+issue&priority=low`); dwa modele wartości w jednym formularzu rozjeżdżają się | Dane mają trafić na serwer albo formularz ma działać przed załadowaniem skryptu: akcja z `"use server"` |

> 💡 **Zapamiętaj:** przy zmianie podejścia schemat, komunikaty i funkcja zapisu przechodzą bez zmian, a wiązania pól z narzędziem przepisuje się od nowa. Jeden formularz ma jeden model przechowywania wartości.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r13_wybor-podejscia.md`](rozszerzenia/r13_wybor-podejscia.md)

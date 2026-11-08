# Po zapisie lista musi się odświeżyć

## Artykuł dodany, lista stara

Formularz `/new` zapisuje już tylko poprawne dane. Zapis to jednak połowa drogi, bo lista na stronie głównej musi się o nim dowiedzieć. Pierwsza wersja akcji `createArticle` kończy się na `return { success: true }`. Po zapisie formularz pokazuje „Article saved.”, ale przejście na listę przez link „Articles” albo F5 nadal daje „Articles (2)”, choć magazyn ma już trzy artykuły. Artykuł jest dostępny pod `/articles/3`, tylko lista o nim nie wie.

Przyczyną jest pamięć `fetch`. Lista na stronie głównej trzyma odpowiedź `/api/articles` przez 60 sekund (`next: { revalidate: 60 }`), a wywołanie `await connection()` sprawia tylko, że sama strona renderuje się przy każdym żądaniu. Żeby pamięć była wypełniona, zanim pojawi się zapis, w demo `/` odświeża się F5, po około 3 sekundach drugi raz F5, i dopiero wtedy wysyła się formularz. Poprawka to jedna linia przed `return`:

```js
// lib/actions.js (dochodzi import i jedna linia)
import { revalidatePath } from "next/cache";
import { addArticle } from "./store";
// ...
  addArticle(result.data);
  revalidatePath("/"); // lista na / pokaże nowy artykuł od razu
  return { success: true };
```

Z linią `revalidatePath("/")` ten sam zapis kończy się napisem „Articles (3)” na liście, z nowym tytułem na końcu. Bez niej nowa liczba pojawia się dopiero po wygaśnięciu wpisu, według wzorca *stale-while-revalidate*. Pomiar po zapisie przez `POST /api/articles`, który też nie unieważnia pamięci: 62 sekundy po pierwszym pobraniu pierwsze wejście na `/` pokazało jeszcze „Articles (2)”. Drugie tuż po nim również, bo pobranie w tle trwa 1 s, tyle ile odpowiada API. Po kolejnych trzech sekundach lista miała „Articles (3)”.

Z punktu widzenia serwera wszystko działa. `addArticle` dopisała artykuł do magazynu, a strona główna uczciwie podaje odpowiedź zapamiętaną zgodnie z opcją `revalidate`. Z punktu widzenia osoby, która przed chwilą kliknęła „Add article”, aplikacja zgubiła jej dane.

## Odczyt własnego zapisu

Ten wymóg ma nazwę: **odczyt własnego zapisu** (*read-your-own-writes*). Kto zapisał dane, ten przy następnym odczycie widzi swój zapis. Dokumentacja Next.js używa tej nazwy przy funkcji `updateTag`. Chodzi o sytuację, gdy użytkownik tworzy wpis, „a interfejs od razu pokazuje zmianę zamiast nieaktualnych danych” (*„and the UI immediately shows the change, rather than stale data”*).

Wymóg nie dotyczy wszystkich czytelników jednakowo. Inna osoba, która ma otwartą listę, może zobaczyć nowy artykuł minutę później i nic złego się nie stanie. Autor oczekuje go jednak od razu, bo inaczej uzna, że zapis się nie udał, i wyśle formularz drugi raz. Rewalidacja po zapisie istnieje głównie dla autora.

Bugl w *Modern Full-Stack React Projects* formułuje ogólną regułę.

> **„Najlepszym sposobem radzenia sobie z nieaktualnymi danymi jest rewalidacja pamięci podręcznej, gdy pojawiają się nowe dane, na przykład przez Server Actions.”**
>
> *„The best way of dealing with stale data is to revalidate the cache when new data comes in, for example, via Server Actions.”*
>
> — Daniel Bugl, *Modern Full-Stack React Projects*

Barklund w *React in Depth* opisuje ten zabieg jako unieważnienie pamięci (*cache invalidation*): świeże dane pobiera się dopiero przy następnej potrzebie, bez przeliczania pamięci po każdej operacji. `revalidatePath` robi to po stronie serwera.

Dokumentacja mutacji danych opisuje ten wzorzec tak.

> **„Po wykonaniu mutacji można unieważnić pamięć Next.js i pokazać zaktualizowane dane, wywołując `revalidatePath` albo `revalidateTag` w funkcji serwerowej.”**
>
> *„After performing a mutation, you can revalidate the Next.js cache and show the updated data by calling `revalidatePath` or `revalidateTag` within the Server Function”*
>
> — dokumentacja Next.js, *Mutating Data*

## Jedna odpowiedź niesie wynik i nowy widok

Po wywołaniu `revalidatePath` akcja nie kończy się samym `{ success: true }`. Przewodnik *Server Actions and Mutations* opisuje, co wraca w odpowiedzi na żądanie `POST /new`. Next.js wykonuje akcję, a potem jeszcze w tym samym żądaniu renderuje na serwerze bieżącą trasę. Odpowiedź zawiera wartość zwróconą dla `useActionState` i nowy RSC Payload, czyli opis drzewa komponentów serwerowych. Zapis, unieważnienie pamięci i ponowny render kończą się więc w jednej wymianie z serwerem. Akcja, która nie unieważnia niczego, niesie w odpowiedzi tylko swoją wartość.

## Trzy zasięgi `revalidatePath`

Dokumentacja definiuje funkcję krótko: `revalidatePath` unieważnia na żądanie zapamiętane dane dla wskazanej ścieżki. Wywołać ją można w funkcjach serwerowych i w Route Handlerach (*„`revalidatePath` can be called in Server Functions and Route Handlers.”*). Nie wywołuje się jej w komponencie klienckim ani w trakcie renderowania komponentu serwerowego. O zasięgu decydują dwa argumenty:

```js
revalidatePath("/");                      // jedna strona o dosłownej ścieżce
revalidatePath("/articles/[id]", "page"); // każda strona pasująca do wzorca
revalidatePath("/", "layout");            // wszystko pod layoutem głównym
```

1. **Ścieżka dosłowna**, taka jak `"/"` czy `"/articles/4"`, unieważnia jedną stronę. Drugiego argumentu się wtedy nie podaje.
2. **Wzorzec z segmentem dynamicznym** wymaga drugiego argumentu, `'page'` albo `'layout'`. Wywołanie `revalidatePath("/articles/[id]", "page")` unieważnia wszystkie strony szczegółów naraz. Funkcja działa na strukturze plików tras, a nie na adresie widocznym dla użytkownika, więc wzorzec zapisuje się tak, jak nazywa się katalog `app/articles/[id]`.
3. **`revalidatePath("/", "layout")`** według dokumentacji czyści pamięć klienta i unieważnia wszystkie zapamiętane dane w aplikacji.

Skutek zależy też od miejsca wywołania. W funkcji serwerowej interfejs odświeża się od razu, jeśli użytkownik ogląda wskazaną ścieżkę. W Route Handlerze ścieżka zostaje tylko oznaczona, a odświeżenie następuje przy następnej wizycie.

## Pamięć `fetch` i pamięć klienta

Lista po zapisie może być nieaktualna w dwóch miejscach naraz: w pamięci `fetch` na serwerze i w pamięci klienta w przeglądarce, która zachowuje widoki odwiedzonych tras. Ścieżka dosłowna w akcji obejmuje obie. Na serwerze unieważnia wpis wskazanej strony, a w przeglądarce według dokumentacji odświeża przy kolejnej nawigacji wszystkie odwiedzone strony, co ma się w przyszłości zawęzić do podanej ścieżki.

Każda z tych pamięci ma własne wywołanie, które ją czyści. W zestawieniu są też funkcje działające na tagach i `refresh`. Ostatni wiersz to `mutate` z biblioteki SWR, której pamięć leży w przeglądarce.

| Wywołanie | Gdzie | Pamięć `fetch` na serwerze | Pamięć SWR |
|---|---|---|---|
| `revalidatePath("/")` | akcja, Route Handler | unieważnia wpisy strony `/` | bez zmian |
| `revalidatePath("/", "layout")` | akcja, Route Handler | unieważnia wszystkie wpisy | bez zmian |
| `updateTag("articles")` | tylko akcja | usuwa wpisy z tagiem, następny odczyt czeka na nowe dane | bez zmian |
| `revalidateTag("articles", "max")` | akcja, Route Handler | oznacza wpisy jako nieświeże, następny odczyt dostaje stare | bez zmian |
| `refresh()` | tylko akcja | bez zmian | bez zmian |
| `router.refresh()` | komponent kliencki | bez zmian | bez zmian |
| `mutate()` | komponent kliencki | bez zmian | pobiera wpis klucza od nowa |

Dwa wiersze z „bez zmian” w obu kolumnach nie są pomyłką: `refresh()` i `router.refresh()` dają tylko nowy render bieżącej trasy, który czyta tę samą pamięć `fetch`.

## Zalety i koszty unieważnienia po zapisie

Unieważnienie po zapisie zamienia krótką pamięć na długą, czyszczoną dokładnie wtedy, gdy dane się zmieniają. Alternatywą jest skrócenie czasu: `revalidate: 1` zamiast 60 daje listę nieaktualną najwyżej przez sekundę, ale serwer odświeżałby ją co sekundę także wtedy, gdy nikt nic nie dodaje. Autor nadal mógłby trafić na starą wersję, jeśli wróci na listę szybciej. Unieważnienie odwraca ten rachunek: pamięć może trwać długo, nawet bez limitu przy `force-cache`, bo każdy zapis ją czyści. Limit czasu zostaje jako zabezpieczenie dla zmian, o których aplikacja się nie dowie, na przykład wprowadzonych bezpośrednio w bazie.

| Zyskujemy | Płacimy | Kiedy nie warto / co zamiast |
|---|---|---|
| Autor widzi swój zapis od razu: „Articles (3)” z unieważnieniem, „Articles (2)” bez niego | Wywołanie musi stać w każdym wejściu, które zmienia dane: `POST /api/articles` go nie ma, więc nowy artykuł pojawia się po wygaśnięciu wpisu (wywołanie w `addArticle` objęłoby wszystkie wejścia) | Lista bez pamięci (`no-store`): nie ma czego unieważniać, wywołanie zostaje na przyszłość |
| Pamięć trwa długo, bo zapis ją czyści; zapis, unieważnienie i nowy widok kończą się w jednej odpowiedzi serwera | Pominięte wywołanie nie daje błędu i zostawia stare dane, czasem po wielu minutach; zasięg trzeba wybrać: ścieżka, wzorzec albo layout | `revalidate: 1` zamiast unieważnienia: odświeżanie co sekundę bez zmian i nadal możliwa stara wersja |
| Odświeżenie obejmuje pamięć `fetch` na serwerze i pamięć klienta w przeglądarce | Pamięć SWR w przeglądarce zostaje bez zmian (tabela wyżej), więc dane pobierane w komponencie klienckim odświeża się osobno | Zmiany spoza aplikacji, na przykład bezpośrednio w bazie: limit czasu `revalidate` zostaje zabezpieczeniem |

> 💡 **Zapamiętaj:** po zapisie akcja unieważnia pamięć danych, które się zmieniły, w tej aplikacji przez `revalidatePath("/")` przed `return`. Wywołanie należy do każdego wejścia, które zmienia dane, także do `POST /api/articles`. Pominięte wywołanie nie zgłasza błędu, a lista zostaje ze starą liczbą.


Materiał rozszerzony do tego slajdu: [`rozszerzenia/r09_rewalidacja.md`](rozszerzenia/r09_rewalidacja.md)

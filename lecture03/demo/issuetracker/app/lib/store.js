// Magazyn tylko na potrzeby demo: zmienna tablica na poziomie modułu.
// Przetrwa nawigację po stronie klienta (moduł zostaje w pamięci karty).
// Znika po przeładowaniu strony albo restarcie serwera.
// Prawdziwa trwałość: serwer + baza danych.
import { initialIssues } from "../data/issues.js";

let _issues = [...initialIssues];          // kopia: initialIssues zostaje nietknięte
let _nextId = initialIssues.length + 1;    // 5, bo zgłoszeń startowych jest cztery

// Podkreślnik = umowa „prywatne dla modułu”; zmienne nie są eksportowane.
export function getIssues() {
  return _issues;                          // bieżąca tablica
}

export function addIssue({ title, priority }) {
  const issue = { id: _nextId++, title, priority, status: "open" }; // ++ po użyciu
  _issues = [..._issues, issue];           // NOWA tablica zamiast push do starej
  return issue;                            // formularz pokaże numer zgłoszenia
}

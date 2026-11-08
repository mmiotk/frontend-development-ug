// app/lib/store.js
// Magazyn w module: jedna tablica na kartę przeglądarki, znika po przeładowaniu
import { initialIssues } from "../data/issues";

let issues = [...initialIssues]; // kopia: dane startowe zostają bez zmian
let nextId = issues.length + 1; // 4, bo zgłoszenia startowe są trzy

export function getIssues() {
  return issues;
}

export function addIssue({ title, priority }) {
  const issue = { id: nextId++, title, priority }; // numer i od razu zwiększenie licznika
  issues = [...issues, issue]; // nowa tablica zamiast push
  return issue;
}

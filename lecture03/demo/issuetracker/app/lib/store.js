// Demo-only client-side store: module-level mutable array.
// Persists across client-side navigation (module stays loaded in the browser bundle).
// Resets on full page reload or server restart.
// Real persistence: Server Actions + database (lecture 05).
import { initialIssues } from "../data/issues.js";

let _issues = [...initialIssues];
let _nextId = initialIssues.length + 1;

export function getIssues() {
  return _issues;
}

export function addIssue({ title, priority }) {
  const issue = { id: _nextId++, title, priority, status: "open" };
  _issues = [..._issues, issue];
  return issue;
}

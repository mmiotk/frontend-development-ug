// Issue list — converted to Client Component so it reads from the mutable store.
// getIssues() is called on every mount; after client-side navigation the
// component remounts and picks up newly added issues.
"use client";
import Link from "next/link";
import { getIssues } from "./lib/store";

export default function HomePage() {
  const issues = getIssues(); // reads module-level array on every mount

  return (
    <div>
      <h1>Issue Tracker</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link href={`/issue/${issue.id}`}>
              [{issue.priority}] {issue.title}
            </Link>
            {" — "}
            {issue.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// app/page.jsx
"use client"; // lista czyta magazyn, który żyje w przeglądarce
import Link from "next/link";
import { getIssues } from "./lib/store";

export default function HomePage() {
  const issues = getIssues();

  return (
    <main>
      <h1>Issues</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link href={`/issue/${issue.id}`}>[{issue.priority}] {issue.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

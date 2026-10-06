// Dynamic route: /issue/[id] — Server Component.
import { notFound } from "next/navigation";
import { initialIssues } from "../../data/issues";

// DEMO ONLY — simulate slow data fetch. Remove in production!
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function IssueDetailPage({ params }) {
  const { id } = await params;
  await sleep(800); // makes loading.jsx appear for ~0.8 s

  const issue = initialIssues.find((i) => i.id === Number(id));
  if (!issue) notFound();

  return (
    <article>
      <h1>#{issue.id} — {issue.title}</h1>
      <p>Priority: {issue.priority}</p>
      <p>Status: {issue.status}</p>
    </article>
  );
}

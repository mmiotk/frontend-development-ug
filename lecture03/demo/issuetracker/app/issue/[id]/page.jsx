// Trasa dynamiczna /issue/[id]: komponent serwerowy.
import { notFound } from "next/navigation";
import { initialIssues } from "../../data/issues";

// TYLKO DEMO: symulacja wolnego pobierania danych. Usunąć w produkcji!
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function IssueDetailPage({ params }) {
  const { id } = await params; // Next.js 16: params to obiekt Promise, zawsze z await
  await sleep(800); // dzięki temu loading.jsx jest widoczny przez ok. 0,8 s

  const issue = initialIssues.find((i) => i.id === Number(id)); // napis z adresu zamieniony na liczbę
  if (!issue) notFound(); // przerywa render i włącza granicę „nie znaleziono” z Next.js

  return (
    <article>
      <h1>#{issue.id} — {issue.title}</h1>
      <p>Priority: {issue.priority}</p>
      <p>Status: {issue.status}</p>
    </article>
  );
}

// app/issue/[id]/page.jsx
// Komponent serwerowy: id przychodzi z adresu
import { notFound } from "next/navigation";
import { initialIssues } from "../../data/issues";

export default async function IssuePage({ params }) {
  const { id } = await params; // params jest obiektem Promise
  await new Promise((r) => setTimeout(r, 800)); // udajemy wolną bazę: odpowiedź po 0,8 s
  const issue = initialIssues.find((i) => i.id === Number(id)); // napis z adresu → liczba
  if (!issue) notFound(); // widok „nie znaleziono”

  return (
    <article>
      <h1>#{issue.id} {issue.title}</h1>
      <p>Priority: {issue.priority}</p>
    </article>
  );
}

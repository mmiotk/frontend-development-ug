// app/issue/layout.jsx
// Layout zagnieżdżony: obejmuje każdą trasę /issue/..., wewnątrz layoutu głównego
import Link from "next/link";

export default function IssueLayout({ children }) {
  return (
    <section>
      <Link href="/">← Back to issues</Link>
      {children}
    </section>
  );
}

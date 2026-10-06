// Rendered when notFound() is called or the route does not exist.
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>404 — not found</h1>
      <p>
        This recipe does not exist. <Link href="/">← home</Link>
      </p>
    </div>
  );
}

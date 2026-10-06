// Static route: app/about/page.jsx => URL /about
// File-based routing: directory name = URL segment (no config needed).
export default function About() {
  return (
    <div>
      <h1>About</h1>
      <p>Simple cookbook demo — Lecture 01 (React 19 + Next.js 16).</p>
      <p>
        This page was created by adding <code>app/about/page.jsx</code>.
        The directory name becomes the URL segment automatically.
      </p>
    </div>
  );
}

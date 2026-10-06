// Shown when IssueDetailPage throws an unhandled error.
// MUST be "use client" — React error boundaries run in the browser.
// retry() (Next.js 16.3+) re-fetches and re-renders the segment;
// reset() would only clear the error state and re-render the same payload.
"use client";

export default function IssueError({ error, retry }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}

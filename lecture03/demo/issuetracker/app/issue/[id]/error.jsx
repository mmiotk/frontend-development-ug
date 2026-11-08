// app/issue/[id]/error.jsx
"use client"; // granica błędów działa w przeglądarce

export default function Error({ error, retry }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}

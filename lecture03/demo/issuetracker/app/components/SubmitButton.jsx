// SubmitButton: czyta stan oczekiwania formularza przez useFormStatus.
// MUSI być OSOBNYM komponentem renderowanym WEWNĄTRZ <form>.
// Nie może być tym samym komponentem, który renderuje <form>.
"use client"; // komponent wywołuje hook, więc działa w przeglądarce
import { useFormStatus } from "react-dom"; // uwaga: react-dom, nie react!

export default function SubmitButton() {
  const { pending } = useFormStatus(); // czy formularz nadrzędny właśnie się wysyła
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

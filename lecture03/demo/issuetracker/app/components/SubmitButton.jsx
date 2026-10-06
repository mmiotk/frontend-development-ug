// SubmitButton — reads form pending state via useFormStatus.
// MUST be a SEPARATE component rendered INSIDE <form>.
// Cannot live in the same component that renders <form>.
"use client";
import { useFormStatus } from "react-dom"; // Note: react-dom, not react!

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

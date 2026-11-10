'use client';

import { useState } from 'react';

export default function ClientBox({ children }) {
  const [open, setOpen] = useState(true); // state exists only in a Client Component
  return <section><button onClick={() => setOpen(o => !o)}>toggle</button>{open && children}</section>;
}

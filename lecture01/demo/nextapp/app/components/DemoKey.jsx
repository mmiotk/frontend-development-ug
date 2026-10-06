"use client";
// Segment 5: reconciliation demo — why key must be stable (not the array index).
// "use client" makes this a Client Component — required for useState (interactivity).
import { recipes as initialRecipes } from "../data/recipes";
import { useState } from "react";

export default function DemoKey() {
  const [list, setList] = useState(initialRecipes);
  const reverse = () => setList([...list].reverse());
  const prepend = () =>
    setList([
      { id: "new-" + list.length, name: "New recipe", emoji: "🆕" },
      ...list,
    ]);

  return (
    <div>
      <button onClick={reverse}>Reverse order</button>{" "}
      <button onClick={prepend}>Add at start</button>
      <div style={{ display: "flex", gap: "3rem", marginTop: "1rem" }}>
        <div>
          <h4>❌ key = index</h4>
          {list.map((r, index) => (
            // ANTI-PATTERN: index as key — after reordering React matches rows by position.
            // The <input> stays in place while the data moves → mismatch.
            <div key={index}>
              <input placeholder={r.name} /> {r.emoji} {r.name}
            </div>
          ))}
        </div>
        <div>
          <h4>✅ key = id</h4>
          {list.map((r) => (
            // CORRECT: stable id — identity travels with the data, input follows its row.
            <div key={r.id}>
              <input placeholder={r.name} /> {r.emoji} {r.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

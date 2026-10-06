// Pure functions (no state) — derived views of the same data (segment 4).
// Pure = same input → same output; no side effects; does not mutate the original list.
export const byTime    = (list) => [...list].sort((a, b) => a.time - b.time);
export const byCuisine = (list, cuisine) => list.filter((r) => r.cuisine === cuisine);
export const cuisines  = (list) => [...new Set(list.map((r) => r.cuisine))];

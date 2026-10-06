// Data via PROPS — same component renders different recipe sets (reusability!).
// key = r.id (stable identity), not the array index (see segment 5).
import RecipeCard from "./RecipeCard";

export default function RecipeList({ recipes }) {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          id={r.id}
          name={r.name}
          emoji={r.emoji}
          time={r.time}
          level={r.level}
          rating={r.rating}
        />
      ))}
    </div>
  );
}

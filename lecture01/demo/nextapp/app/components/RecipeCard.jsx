// Component with PROPS (read-only) + conditional rendering + composition (Level, StarRating).
// Segment 4: plain article with inline styles; segment 6: wrapped in <Link>; segment 7: CSS Modules.
import Link from "next/link";
import Level from "./Level";
import StarRating from "./StarRating";
import styles from "./RecipeCard.module.css";

export default function RecipeCard({ id, name, emoji, time, level, rating }) {
  const quick = time <= 15; // conditional: show ⚡ badge for recipes under 15 minutes

  return (
    <Link href={`/recipe/${id}`} className={styles.card}>
      <div className={styles.emoji}>{emoji}</div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.time}>{time} min {quick && "⚡"}</p>
      <Level level={level} />
      <StarRating rating={rating} />
    </Link>
  );
}

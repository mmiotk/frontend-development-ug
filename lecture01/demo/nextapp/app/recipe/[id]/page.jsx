// Dynamic route: folder [id] => dynamic URL segment (e.g. /recipe/pancakes).
// Server Component; params is async in Next.js 16 — always await it.
import { recipes } from "../../data/recipes";
import Level from "../../components/Level";
import StarRating from "../../components/StarRating";
import Link from "next/link";
import { notFound } from "next/navigation";

// Per-page dynamic metadata — browser tab shows the recipe name.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const recipe = recipes.find((r) => r.id === id);
  return { title: recipe ? `${recipe.name} — Cookbook` : "Not found" };
}

export default async function RecipeDetails({ params }) {
  const { id } = await params; // Next.js 16: params is a Promise — await is required
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) notFound();     // triggers app/not-found.jsx

  return (
    <article>
      <div style={{ fontSize: "4rem" }}>{recipe.emoji}</div>
      <h1>{recipe.name}</h1>
      <p>
        {recipe.time} min · <Level level={recipe.level} /> · {recipe.cuisine}
      </p>
      <StarRating rating={recipe.rating} />

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>

      <h3>Steps</h3>
      <ol>
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <Link href="/">← all recipes</Link>
    </article>
  );
}

// Pre-renders all recipe pages at build time (Static Site Generation).
// Next.js generates /recipe/pancakes, /recipe/pizza, … during `next build`.
export function generateStaticParams() {
  return recipes.map((r) => ({ id: r.id }));
}

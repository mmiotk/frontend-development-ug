// Category route: /cuisine/japanese => params.name === "japanese".
// Server Component; reads params asynchronously (Next.js 16).
import { recipes } from "../../data/recipes";
import { byCuisine } from "../../lib/recipes";
import RecipeList from "../../components/RecipeList";

export default async function Cuisine({ params }) {
  const { name } = await params;
  const list = byCuisine(recipes, name);

  return (
    <div>
      <h1>Cuisine: {name}</h1>
      {list.length ? (
        <RecipeList recipes={list} />
      ) : (
        <p>No recipes found for this cuisine.</p>
      )}
    </div>
  );
}

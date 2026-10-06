// Server Component (default in App Router). console.log goes to the SERVER terminal, not the browser.
import { recipes } from "./data/recipes";
import { byTime, byCuisine } from "./lib/recipes";
import Section from "./components/Section";
import RecipeList from "./components/RecipeList";
import DemoKey from "./components/DemoKey";

export default function Home() {
  console.log("[SERVER] render Home (Server Component)");

  return (
    <div>
      <h1>Cookbook 🍳</h1>

      {/* Derived data (pure functions) — same RecipeList component, different sets (segment 4) */}
      <Section title="Quickest 3">
        <RecipeList recipes={byTime(recipes).slice(0, 3)} />
      </Section>
      <Section title="Japanese cuisine">
        <RecipeList recipes={byCuisine(recipes, "japanese")} />
      </Section>
      <Section title="All recipes">
        <RecipeList recipes={recipes} />
      </Section>

      {/* Reconciliation demo: key = index vs id (segment 5) */}
      <Section title="Demo: key vs index">
        <DemoKey />
      </Section>
    </div>
  );
}

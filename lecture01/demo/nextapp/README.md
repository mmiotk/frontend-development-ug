# nextapp — Cookbook (Lecture 01 demo)

Final version of the application built live during Lecture 01.
**Next.js 16 + React 19** (App Router), **without `node_modules`**.

> Demo topic (recipes / "Cookbook") is **different from the lab** (Pokédex) — intentionally,
> so students transfer concepts to their own app rather than copying the demo.
> This is one **growing application** that expands throughout the entire session.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires Node **20.9+** (minimum for Next.js 16).

## File map

| File | Shows |
|------|-------|
| `app/data/recipes.js` | static data (English keys: id, name, emoji, time, level, cuisine, rating, ingredients, steps) |
| `app/lib/recipes.js` | derived data — **pure functions** (byTime, byCuisine, cuisines) |
| `app/components/Level.jsx` | small presentational component (props + value map) |
| `app/components/StarRating.jsx` | pure component (Array.from + ternary, aria-label) |
| `app/components/RecipeCard.jsx` | component with **props**, conditional, composition, `<Link>`, CSS Modules |
| `app/components/RecipeCard.module.css` | **CSS Modules** (scoped) |
| `app/components/RecipeList.jsx` | data via props + list with **`key`** |
| `app/components/Section.jsx` | composition via **`children`** |
| `app/components/DemoKey.jsx` | **Client Component**; reconciliation `key=index` vs `key=id` |
| `app/page.jsx` | Server Component; sections with derived data; `console.log` in terminal |
| `app/layout.jsx` | shared layout + `<nav>`/`<Link>` + global metadata |
| `app/about/page.jsx` | static route `/about` |
| `app/recipe/[id]/page.jsx` | **dynamic route** (details: ingredients + steps + dynamic metadata + SSG) |
| `app/cuisine/[name]/page.jsx` | **category route** (filter by cuisine) |
| `app/not-found.jsx` / `app/loading.jsx` | 404 page and route loading state |

## Tailwind variant

Project created with Tailwind (`create-next-app --tailwind`): instead of CSS Modules,
use utility classes in `className`, e.g. `block w-40 rounded-xl border p-3 text-center hover:bg-zinc-100`.

## Note

Versions `^16`/`^19` pull the latest compatible releases.
Pin if needed: `npm install next@<version>`.

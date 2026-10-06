// Controlled search input — no hooks, no memo needed (always re-renders with parent)
export default function SearchBar({ query, onChange }) {
  return (
    <div>
      <label htmlFor="search">Szukaj kontaktu:</label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="wpisz imie lub email..."
      />
    </div>
  );
}

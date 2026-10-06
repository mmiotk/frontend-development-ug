// Small presentational component — maps level string to icon and Polish display label.
const ICONS  = { easy: "🟢", medium: "🟡", hard: "🔴" };
const LABELS = { easy: "łatwy", medium: "średni", hard: "trudny" };

export default function Level({ level }) {
  return (
    <span>
      {ICONS[level] ?? "⚪"} {LABELS[level] ?? level}
    </span>
  );
}

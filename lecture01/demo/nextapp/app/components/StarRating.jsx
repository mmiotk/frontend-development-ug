// Pure presentational component — renders 0–5 stars from the `rating` prop.
// Array.from generates an array of length `max`; each element is a filled or empty star.
export default function StarRating({ rating, max = 5 }) {
  return (
    <span aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < rating ? "#f59e0b" : "#d4d4d8" }}>
          {i < rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

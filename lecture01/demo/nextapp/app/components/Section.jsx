// Container component — everything between <Section>…</Section> arrives as props.children.
// Composition via children allows building generic wrappers (layouts, cards, modals).
export default function Section({ title, children }) {
  return (
    <section style={{ margin: "1.5rem 0" }}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

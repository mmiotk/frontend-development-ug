import { memo } from 'react';

// Contact statistics — memo prevents re-render when only query changes
const ContactStats = memo(function ContactStats({ contacts }) {
  const total = contacts.length;
  const categories = contacts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  return (
    <section aria-label="Statystyki kontaktow">
      <p>Lacznie: <strong>{total}</strong></p>
      <ul>
        {Object.entries(categories).map(([cat, count]) => (
          <li key={cat}>{cat}: {count}</li>
        ))}
      </ul>
    </section>
  );
});

export default ContactStats;

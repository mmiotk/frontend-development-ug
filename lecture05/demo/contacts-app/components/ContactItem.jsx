import { memo } from 'react';

// Single contact row — wrapped with memo so it skips re-render
// when contact object reference and onDelete reference are both stable
const ContactItem = memo(function ContactItem({ contact, onDelete }) {
  return (
    <li>
      <strong>{contact.name}</strong>
      <span> — {contact.phone}</span>
      <span> — {contact.email}</span>
      <em> [{contact.category}]</em>
      <button
        type="button"
        onClick={() => onDelete(contact.id)}
        aria-label={`Usun kontakt ${contact.name}`}
      >
        Usun
      </button>
    </li>
  );
});

export default ContactItem;

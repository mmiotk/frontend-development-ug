import { memo } from 'react';
import ContactItem from './ContactItem';

// Contact list — wrapped with memo, but in this app memo never skips a render:
// HomePage re-renders only when contacts or query change, and each change
// produces a new `filtered` array. Kept to show the check in the Profiler.
const ContactList = memo(function ContactList({ contacts, onDelete }) {
  return (
    <ul aria-label="Lista kontaktow">
      {contacts.map((contact) => (
        <ContactItem key={contact.id} contact={contact} onDelete={onDelete} />
      ))}
    </ul>
  );
});

export default ContactList;

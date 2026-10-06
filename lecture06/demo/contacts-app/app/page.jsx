'use client';
import { useState, useCallback, useMemo } from 'react';
import { initialContacts, filterContacts } from '../lib/contacts';
import ContactList    from '../components/ContactList';
import SearchBar      from '../components/SearchBar';
import AddContactForm from '../components/AddContactForm';
import ContactStats   from '../components/ContactStats';

export default function HomePage() {
  const [contacts, setContacts] = useState(initialContacts);
  const [query, setQuery]       = useState('');

  // useMemo: recomputes only when contacts or query actually change
  const filtered = useMemo(
    () => filterContacts(contacts, query),
    [contacts, query]
  );

  // useCallback: stable reference — memoized children won't re-render unnecessarily
  const handleAdd = useCallback((newContact) => {
    setContacts((prev) => [...prev, { ...newContact, id: Date.now() }]);
  }, []);

  const handleDelete = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <main aria-label="Contacts application">
      <h1>{process.env.NEXT_PUBLIC_APP_NAME || 'Kontakty'}</h1>
      <ContactStats contacts={contacts} />
      <SearchBar query={query} onChange={setQuery} />
      <ContactList contacts={filtered} onDelete={handleDelete} />
      <AddContactForm onAdd={handleAdd} />
    </main>
  );
}

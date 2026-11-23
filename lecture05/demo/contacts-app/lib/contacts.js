export const initialContacts = [
  { id: 1, name: 'Anna Kowalska',    phone: '600 100 200', email: 'anna@example.com',  category: 'work'   },
  { id: 2, name: 'Piotr Nowak',      phone: '601 200 300', email: 'piotr@example.com', category: 'family' },
  { id: 3, name: 'Maria Wisniewska', phone: '602 300 400', email: 'maria@example.com', category: 'work'   },
  { id: 4, name: 'Jan Dabrowski',    phone: '603 400 500', email: 'jan@example.com',   category: 'friends'},
  { id: 5, name: 'Katarzyna Wojcik', phone: '604 500 600', email: 'kata@example.com',  category: 'work'   },
];

export function filterContacts(contacts, query) {
  if (!query) return contacts;
  const q = query.toLowerCase();
  return contacts.filter(
    (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );
}

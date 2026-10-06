import { render, screen } from '@testing-library/react';
import ContactList from '../components/ContactList';

const contacts = [
  { id: 1, name: 'Anna Kowalska', phone: '600 100 200', email: 'anna@example.com',  category: 'work'   },
  { id: 2, name: 'Piotr Nowak',   phone: '601 200 300', email: 'piotr@example.com', category: 'family' },
];

test('renders all contacts', () => {
  render(<ContactList contacts={contacts} onDelete={() => {}} />);
  expect(screen.getByText('Anna Kowalska')).toBeInTheDocument();
  expect(screen.getByText('Piotr Nowak')).toBeInTheDocument();
});

test('renders nothing when contacts list is empty', () => {
  render(<ContactList contacts={[]} onDelete={() => {}} />);
  expect(screen.queryByRole('listitem')).toBeNull();
});

test('list has accessible label', () => {
  render(<ContactList contacts={contacts} onDelete={() => {}} />);
  expect(screen.getByRole('list', { name: /lista kontaktow/i })).toBeInTheDocument();
});

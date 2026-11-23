import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddContactForm from '../components/AddContactForm';

test('shows error when name is empty on submit', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/imie jest wymagane/i);
});

test('shows error when email is invalid', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'not-an-email');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/prawidlowy adres email/i);
});

test('calls onAdd with correct data on valid submit', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  render(<AddContactForm onAdd={handleAdd} />);
  await user.type(screen.getByLabelText(/imie i nazwisko/i), 'Jan Kowalski');
  await user.type(screen.getByLabelText(/telefon/i), '600 111 222');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(handleAdd).toHaveBeenCalledWith({
    name: 'Jan Kowalski',
    phone: '600 111 222',
    email: 'jan@example.com',
    category: 'friends',
  });
});

test('clears the form after successful submit', async () => {
  const user = userEvent.setup();
  render(<AddContactForm onAdd={vi.fn()} />);
  const nameInput = screen.getByLabelText(/imie i nazwisko/i);
  await user.type(nameInput, 'Jan Kowalski');
  await user.type(screen.getByLabelText(/email/i), 'jan@example.com');
  await user.click(screen.getByRole('button', { name: /dodaj/i }));
  expect(nameInput).toHaveValue('');
});

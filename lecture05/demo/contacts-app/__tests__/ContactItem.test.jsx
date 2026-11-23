import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactItem from '../components/ContactItem';

const contact = {
  id: 1,
  name: 'Anna Kowalska',
  phone: '600 100 200',
  email: 'anna@example.com',
  category: 'work',
};

test('renders contact name and email', () => {
  render(<ContactItem contact={contact} onDelete={() => {}} />);
  expect(screen.getByText('Anna Kowalska')).toBeInTheDocument();
  expect(screen.getByText(/anna@example\.com/)).toBeInTheDocument();
});

test('renders delete button with accessible label', () => {
  render(<ContactItem contact={contact} onDelete={() => {}} />);
  expect(
    screen.getByRole('button', { name: /usun kontakt anna kowalska/i })
  ).toBeInTheDocument();
});

test('calls onDelete with contact id when delete button is clicked', async () => {
  const user = userEvent.setup();
  const handleDelete = vi.fn();
  render(<ContactItem contact={contact} onDelete={handleDelete} />);
  await user.click(
    screen.getByRole('button', { name: /usun kontakt anna kowalska/i })
  );
  expect(handleDelete).toHaveBeenCalledWith(1);
});

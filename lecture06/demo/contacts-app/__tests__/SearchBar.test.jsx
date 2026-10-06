import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

test('search input has accessible label', () => {
  render(<SearchBar query="" onChange={() => {}} />);
  expect(screen.getByLabelText(/szukaj kontaktu/i)).toBeInTheDocument();
});

test('renders current query value', () => {
  render(<SearchBar query="Anna" onChange={() => {}} />);
  expect(screen.getByRole('searchbox')).toHaveValue('Anna');
});

test('calls onChange when user types a character', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();
  render(<SearchBar query="" onChange={handleChange} />);
  await user.type(screen.getByRole('searchbox'), 'a');
  expect(handleChange).toHaveBeenCalledWith('a');
});

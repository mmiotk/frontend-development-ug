'use client';
import { useState } from 'react';

// Form to add a new contact — validates before calling onAdd
export default function AddContactForm({ onAdd }) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Imie jest wymagane.');
      return;
    }
    if (!email.includes('@')) {
      setError('Podaj prawidlowy adres email.');
      return;
    }
    setError('');
    onAdd({ name: name.trim(), phone, email, category: 'friends' });
    setName('');
    setPhone('');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Dodaj kontakt</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="name">Imie i nazwisko</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="phone">Telefon</label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit">Dodaj</button>
    </form>
  );
}

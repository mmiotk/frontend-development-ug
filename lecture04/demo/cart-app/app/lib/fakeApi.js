// Fake server: answers after a delay, no real backend.
export function fakeAddToCart(fail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Server refused')) : resolve()), 1500)
  );
}

export function fetchRecommended(fail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (fail) reject(new Error('No connection'));
      else resolve([
        { id: 10, name: 'Manual coffee grinder', price: 89.99 },
        { id: 11, name: 'Thermos 0.5L', price: 55.0 },
      ]);
    }, 2000)
  );
}

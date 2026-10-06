// Simulates network calls with a delay.
// No real backend — lecture 05 adds fetch / Server Actions.

// Simulate adding a product to the remote cart (1.5 s delay).
// Pass shouldFail = true to demonstrate useOptimistic rollback.
export function fakeAddToCart(product, shouldFail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        shouldFail
          ? reject(new Error('Błąd sieci — nie udało się dodać produktu'))
          : resolve({ success: true, product }),
      1500
    )
  );
}

// Simulate fetching recommended products (2 s delay).
// Pass shouldFail = true to demonstrate ErrorBoundary catching a rejected promise.
export function fetchRecommended(shouldFail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        shouldFail
          ? reject(new Error('Brak połączenia — nie udało się załadować rekomendacji'))
          : resolve([
              { id: 10, name: 'Młynek do kawy ręczny', price: 89.99 },
              { id: 11, name: 'Termos 0.5L',            price: 55.00 },
              { id: 12, name: 'Filtr do kawy x100',     price: 12.50 },
            ]),
      2000
    )
  );
}

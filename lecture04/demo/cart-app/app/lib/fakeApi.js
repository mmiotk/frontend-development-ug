// Simulates network calls with a delay.
// No real backend: the data is hard-coded and nothing is fetched.

// Simulate adding a product to the remote cart (1.5 s delay).
// Pass shouldFail = true to demonstrate useOptimistic rollback.
export function fakeAddToCart(product, shouldFail = false) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        shouldFail
          ? reject(new Error('Network error — could not add the product'))
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
          ? reject(new Error('No connection — could not load recommendations'))
          : resolve([
              { id: 10, name: 'Manual coffee grinder', price: 89.99 },
              { id: 11, name: 'Thermos 0.5L',            price: 55.00 },
              { id: 12, name: 'Coffee filters x100',     price: 12.50 },
            ]),
      2000
    )
  );
}

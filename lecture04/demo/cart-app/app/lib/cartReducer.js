// Pure reducer for cart state.
// State shape: { items: [{ id, name, price, qty }] }
// A reducer must always return a NEW object — never mutate state directly.

export const initialCartState = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        // Product already in cart — increase quantity.
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.product.id
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }
      // New product — append to list.
      return {
        ...state,
        items: [...state.items, { ...action.product, qty: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
      };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id
            ? { ...i, qty: Math.max(1, action.qty) }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      throw new Error(`Unknown cart action: ${action.type}`);
  }
}

// All cart changes in one pure function: (state, action) → new state.
export const initialCartState = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

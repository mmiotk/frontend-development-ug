import assert from 'node:assert';
import { cartReducer, initialCartState } from './app/lib/cartReducer.js';

const coffee = { id: 1, name: 'Coffee', price: 49.99 };
const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product: coffee });
const s2 = cartReducer(s1, { type: 'ADD_ITEM', product: coffee });
assert.equal(s2.items[0].qty, 2); // same product raises the quantity
assert.equal(s1.items[0].qty, 1); // previous state untouched
assert.equal(cartReducer(s2, { type: 'REMOVE_ITEM', id: 1 }).items.length, 0); // removing the item

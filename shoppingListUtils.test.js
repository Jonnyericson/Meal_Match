import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateShoppingList } from './shoppingListUtils.js';
import { calculateMealMatches } from './shoppingListUtils.js';

test('derives missing ingredients from planned meals against inventory', () => {
  const shoppingList = calculateShoppingList({
    inventory: [
      { id: 1, name: 'Tomatoes', quantity: '2 lbs', category: 'Produce' },
      { id: 2, name: 'Brown Rice', quantity: '1 bag', category: 'Pantry' },
    ],
    mealPlans: [
      { id: 1, recipeId: 10, recipeName: 'Veggie Pasta', dayOfWeek: 0, mealType: 'Dinner' },
      { id: 2, recipeId: 11, recipeName: 'Garlic Chicken Bowl', dayOfWeek: 1, mealType: 'Dinner' },
    ],
    recipes: [
      { id: 10, title: 'Veggie Pasta', ingredients: 'Pasta, tomatoes, spinach, olive oil, parmesan' },
      { id: 11, title: 'Garlic Chicken Bowl', ingredients: 'Chicken breast, brown rice, spinach, lemon, garlic' },
    ],
  });

  assert.deepEqual(shoppingList.items.map((item) => item.name).sort(), [
    'Chicken breast',
    'Pasta',
    'garlic',
    'lemon',
    'olive oil',
    'parmesan',
    'spinach',
  ]);

  assert.equal(shoppingList.summary.totalMissing, 7);
});

test('ranks recipes by inventory and shopping-list coverage', () => {
  const matches = calculateMealMatches({
    inventory: [{ name: 'Chicken Breast' }, { name: 'Brown Rice' }],
    shoppingListItems: [{ name: 'spinach' }],
    recipes: [
      { id: 1, title: 'Chicken Bowl', ingredients: 'Chicken, brown rice, spinach' },
      { id: 2, title: 'Pasta', ingredients: 'Pasta, tomato' },
    ],
  });

  assert.equal(matches[0].title, 'Chicken Bowl');
  assert.deepEqual(matches[0].ingredients.map((item) => item.status), ['inventory', 'inventory', 'shopping']);
  assert.equal(matches[0].coverage, 100);
  assert.equal(matches[1].missingCount, 2);
});

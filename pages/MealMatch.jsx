import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { calculateMealMatches } from '../shoppingListUtils';

const emptyShoppingList = { items: [], summary: { totalMissing: 0, totalMeals: 0 } };

const MealMatch = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [shoppingList, setShoppingList] = useState(emptyShoppingList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const [recipesResponse, inventoryResponse, shoppingResponse] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/ingredients'),
          fetch('/api/shopping-list', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!recipesResponse.ok || !inventoryResponse.ok || !shoppingResponse.ok) {
          throw new Error('Unable to load your kitchen data.');
        }

        const [recipes, inventory, list] = await Promise.all([
          recipesResponse.json(),
          inventoryResponse.json(),
          shoppingResponse.json(),
        ]);
        setShoppingList(list);
        setMatches(calculateMealMatches({ recipes, inventory, shoppingListItems: list.items }));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadMatches();
  }, [token]);

  return (
    <section className="meal-match-page">
      <div className="meal-match-header">
        <div>
          <p className="meal-match-eyebrow">Kitchen intelligence</p>
          <h1>Meal Match</h1>
          <p className="meal-match-intro">See what you can cook now, what your shopping list unlocks, and which meals need one more ingredient.</p>
        </div>
        <div className="meal-match-pill">{matches.length} recipes compared</div>
      </div>

      <div className="meal-match-summary" aria-label="Meal match summary">
        <div><strong>{matches.filter((meal) => meal.missingCount === 0).length}</strong><span>Ready to cook</span></div>
        <div><strong>{shoppingList.items.length}</strong><span>On shopping list</span></div>
        <div><strong>{shoppingList.summary.totalMeals}</strong><span>Planned meals</span></div>
      </div>

      {loading ? <p className="meal-match-message">Comparing your recipes with the pantry...</p> : null}
      {error ? <p className="meal-match-message meal-match-error">{error}</p> : null}
      {!loading && !error && !matches.length ? <p className="meal-match-message">Save a recipe to start matching meals.</p> : null}

      {!loading && !error && matches.length ? (
        <div className="meal-match-results">
          {matches.map((meal) => (
            <article className="meal-match-card" key={meal.id}>
              <div className="meal-match-card-header">
                <div>
                  <p className="meal-match-type">{meal.mealType || 'Meal'} · {meal.cuisine || 'General'}</p>
                  <h2>{meal.title}</h2>
                </div>
                <strong className={meal.coverage === 100 ? 'coverage-ready' : ''}>{meal.coverage}%</strong>
              </div>
              <p className="meal-match-meta">{meal.matchedCount} in inventory · {meal.shoppingCount} on shopping list · {meal.missingCount} still needed</p>
              <ul className="meal-match-ingredients">
                {meal.ingredients.map((ingredient) => (
                  <li key={ingredient.name} className={`ingredient-${ingredient.status}`}>
                    <span aria-hidden="true">{ingredient.status === 'inventory' ? '✓' : ingredient.status === 'shopping' ? '◷' : '!'}</span>
                    {ingredient.raw}
                    <small>{ingredient.status === 'inventory' ? 'In pantry' : ingredient.status === 'shopping' ? 'Buy' : 'Missing'}</small>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default MealMatch;
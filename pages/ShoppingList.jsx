import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';

const ShoppingList = () => {
  const { token } = useAuth();
  const [shoppingList, setShoppingList] = useState({ items: [], summary: { totalMissing: 0, totalMeals: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shopping-list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setShoppingList({ items: [], summary: { totalMissing: 0, totalMeals: 0 } });
          return;
        }

        const data = await response.json();
        setShoppingList(data);
      } catch {
        setShoppingList({ items: [], summary: { totalMissing: 0, totalMeals: 0 } });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShoppingList();
    } else {
      setLoading(false);
      setShoppingList({ items: [], summary: { totalMissing: 0, totalMeals: 0 } });
    }
  }, [token]);

  const statusText = useMemo(() => {
    if (loading) return 'Checking your pantry against this week\'s meals...';
    if (!shoppingList.items.length) return 'Everything in your meal plan looks covered by your current inventory.';
    return `${shoppingList.summary.totalMissing} items still need to be picked up for your planned meals.`;
  }, [loading, shoppingList]);

  return (
    <section className="shopping-list-page">
      <div className="shopping-list-header">
        <div>
          <p className="shopping-list-eyebrow">Smart list</p>
          <h1>Shopping List</h1>
          <p className="shopping-list-intro">Your pantry is compared against the recipes in your weekly plan so you only buy what you actually need.</p>
        </div>
        <div className="shopping-list-pill">{shoppingList.summary.totalMissing} items to buy</div>
      </div>

      <div className="shopping-list-status">{statusText}</div>

      <div className="shopping-list-grid">
        <div className="shopping-list-panel">
          <h2>Missing ingredients</h2>
          {loading ? (
            <p>Loading items...</p>
          ) : shoppingList.items.length > 0 ? (
            <ul className="shopping-list-items">
              {shoppingList.items.map((item) => (
                <li key={item.id} className="shopping-list-item">
                  <div>
                    <h3>{item.name}</h3>
                    <small>{item.category}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="shopping-list-empty">No missing ingredients right now.</p>
          )}
        </div>

        <div className="shopping-list-panel">
          <h2>Plan summary</h2>
          <div className="shopping-list-summary">
            <div>
              <span>Planned meals</span>
              <strong>{shoppingList.summary.totalMeals}</strong>
            </div>
            <div>
              <span>Need to buy</span>
              <strong>{shoppingList.summary.totalMissing}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingList;

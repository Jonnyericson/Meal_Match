import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const Favorites = () => {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading your favorites...');

  const loadFavorites = async () => {
    const response = await fetch('/api/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setStatusMessage('Unable to load your favorites right now.');
      return;
    }
    const savedFavorites = await response.json();
    setFavorites(savedFavorites);
    setStatusMessage(savedFavorites.length ? 'Your favorite recipes are ready when you are.' : 'Star recipes in your recipe box to collect them here.');
  };

  useEffect(() => {
    if (token) loadFavorites();
  }, [token]);

  const removeFavorite = async (recipe) => {
    const response = await fetch(`/api/favorites/${recipe.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setFavorites((previous) => previous.filter((favorite) => favorite.id !== recipe.id));
      setStatusMessage(`${recipe.title} was removed from favorites.`);
    }
  };

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <div>
          <p className="favorites-eyebrow">Your collection</p>
          <h1>Favorites</h1>
          <p className="favorites-intro">Keep the recipes you love close, so planning your next meal starts with something you already trust.</p>
        </div>
        <div className="favorites-pill">{favorites.length} saved</div>
      </div>

      <div className="favorites-status">{statusMessage}</div>

      {favorites.length ? (
        <ul className="favorites-list">
          {favorites.map((recipe) => (
            <li key={recipe.id} className="favorite-card">
              <div>
                <div className="recipe-item-top">
                  <h2>{recipe.title}</h2>
                  <span>{recipe.mealType || 'Meal'}</span>
                </div>
                <div className="recipe-meta">
                  <span>{recipe.cuisine || 'General'}</span>
                  <span>{recipe.prepTime || 'Prep time unknown'}</span>
                  <span>{recipe.cookTime || 'Cook time unknown'}</span>
                </div>
                <p><strong>Ingredients:</strong> {recipe.ingredients || 'No ingredients added yet.'}</p>
                {recipe.instructions ? <small>{recipe.instructions}</small> : null}
              </div>
              <button type="button" className="favorite-remove-button" onClick={() => removeFavorite(recipe)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="favorites-empty">
          <span aria-hidden="true">☆</span>
          <h2>No favorites yet</h2>
          <p>Your saved recipes will appear here.</p>
        </div>
      )}
    </section>
  );
};

export default Favorites;

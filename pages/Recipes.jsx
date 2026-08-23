import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const initialFormData = {
  title: '',
  mealType: 'Dinner',
  cuisine: 'Italian',
  prepTime: '',
  cookTime: '',
  ingredients: '',
  instructions: '',
};

const Recipes = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [recipes, setRecipes] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading recipes...');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecipes = async () => {
    const response = await fetch('/api/recipes');
    return response.ok ? response.json() : [];
  };

  const createRecipe = async (recipe) => {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Unable to save this recipe.');
    }
    return result;
  };

  const removeRecipe = async (id) => {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
  };

  useEffect(() => {
    const loadRecipes = async () => {
      const storedRecipes = await fetchRecipes();
      setRecipes(storedRecipes);
      setStatusMessage(
        storedRecipes.length
          ? 'Your recipe box was loaded successfully.'
          : 'Save a recipe to start building your kitchen library.'
      );
    };

    loadRecipes();

    const loadFavorites = async () => {
      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const favorites = await response.json();
        setFavoriteIds(new Set(favorites.map((recipe) => recipe.id)));
      }
    };

    if (token) loadFavorites();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setStatusMessage('Please enter a recipe title before saving it.');
      return;
    }

    const newRecipe = {
      title: formData.title.trim(),
      mealType: formData.mealType,
      cuisine: formData.cuisine,
      prepTime: formData.prepTime.trim() || '30 min',
      cookTime: formData.cookTime.trim() || '20 min',
      ingredients: formData.ingredients.trim(),
      instructions: formData.instructions.trim(),
    };

    try {
      setIsSaving(true);
      const savedRecipe = await createRecipe(newRecipe);
      setRecipes((prev) => [savedRecipe, ...prev]);
      setStatusMessage(`${savedRecipe.title} was added to your recipe box.`);
      setFormData(initialFormData);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id) => {
    const removedItem = recipes.find((recipe) => recipe.id === id);
    await removeRecipe(id);
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    if (removedItem) {
      setStatusMessage(`${removedItem.title} was removed from your recipe box.`);
    }
  };

  const handleFavoriteToggle = async (recipe) => {
    const isFavorite = favoriteIds.has(recipe.id);
    const response = await fetch(isFavorite ? `/api/favorites/${recipe.id}` : '/api/favorites', {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: isFavorite ? undefined : JSON.stringify({ recipeId: recipe.id }),
    });

    if (response.ok) {
      setFavoriteIds((previous) => {
        const next = new Set(previous);
        if (isFavorite) next.delete(recipe.id);
        else next.add(recipe.id);
        return next;
      });
      setStatusMessage(isFavorite ? `${recipe.title} was removed from favorites.` : `${recipe.title} was saved to favorites.`);
    }
  };

  return (
    <section className="recipe-page">
      <div className="recipe-header">
        <div>
          <p className="recipe-eyebrow">Kitchen library</p>
          <h1>Recipes</h1>
          <p className="recipe-intro">Save the meals you love and keep every ingredient detail close at hand.</p>
        </div>
        <div className="recipe-pill">{recipes.length} recipes saved</div>
      </div>

      <div className="recipe-grid">
        <form className="recipe-form" onSubmit={handleSubmit}>
          <h2>Add a recipe</h2>

          <label>
            Recipe title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Lemon Herb Pasta"
            />
          </label>

          <div className="recipe-form-row">
            <label>
              Meal type
              <select name="mealType" value={formData.mealType} onChange={handleChange}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Dessert">Dessert</option>
              </select>
            </label>

            <label>
              Cuisine
              <select name="cuisine" value={formData.cuisine} onChange={handleChange}>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="American">American</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </label>
          </div>

          <div className="recipe-form-row">
            <label>
              Prep time
              <input
                type="text"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                placeholder="e.g. 20 min"
              />
            </label>

            <label>
              Cook time
              <input
                type="text"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                placeholder="e.g. 30 min"
              />
            </label>
          </div>

          <label>
            Ingredients
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows="4"
              placeholder="List the main ingredients for this dish"
            />
          </label>

          <label>
            Instructions
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="4"
              placeholder="Add the cooking steps or notes"
            />
          </label>

          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save recipe'}
          </button>
        </form>

        <div className="recipe-panel">
          <div className="recipe-status">
            <div>
              <h2>Recipe box</h2>
              <p>{statusMessage}</p>
            </div>
          </div>

          <ul className="recipe-list">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="recipe-item">
                <div>
                  <div className="recipe-item-top">
                    <h3>{recipe.title}</h3>
                    <span>{recipe.mealType}</span>
                  </div>

                  <div className="recipe-meta">
                    <span>{recipe.cuisine}</span>
                    <span>{recipe.prepTime}</span>
                    <span>{recipe.cookTime}</span>
                  </div>

                  <p>
                    <strong>Ingredients:</strong> {recipe.ingredients || 'No ingredients added yet.'}
                  </p>
                  {recipe.instructions ? <small>{recipe.instructions}</small> : null}
                </div>

                <div className="recipe-actions">
                  <button
                    type="button"
                    className={`favorite-button ${favoriteIds.has(recipe.id) ? 'is-favorite' : ''}`}
                    onClick={() => handleFavoriteToggle(recipe)}
                    aria-label={favoriteIds.has(recipe.id) ? `Remove ${recipe.title} from favorites` : `Save ${recipe.title} to favorites`}
                    title={favoriteIds.has(recipe.id) ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    {favoriteIds.has(recipe.id) ? '★' : '☆'}
                  </button>
                  <button type="button" onClick={() => handleRemove(recipe.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Recipes;

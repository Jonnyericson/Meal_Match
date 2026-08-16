import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const MealPlans = () => {
  const { token } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading meal plans...');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  const fetchMealPlans = async () => {
    try {
      const response = await fetch('/api/meal-plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok ? response.json() : [];
    } catch {
      return [];
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      return response.ok ? response.json() : [];
    } catch {
      return [];
    }
  };

  const createMealPlan = async (mealPlan) => {
    try {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealPlan),
      });
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  };

  const removeMealPlan = async (id) => {
    try {
      await fetch(`/api/meal-plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Error handled by setStatusMessage
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const [plans, recipesData] = await Promise.all([fetchMealPlans(), fetchRecipes()]);
      setMealPlans(plans);
      setRecipes(recipesData);
      setStatusMessage(
        plans.length
          ? 'Your meal plan is ready! Click a day to view and manage meals.'
          : 'Click a day to start planning your meals.'
      );
    };

    loadData();
  }, [token]);

  const getMealForSlot = (day, mealType) => {
    return mealPlans.find((mp) => mp.dayOfWeek === day && mp.mealType === mealType);
  };

  const getMealsForDay = (day) => {
    return mealPlans.filter((mp) => mp.dayOfWeek === day);
  };

  const handleDayClick = (dayIndex) => {
    setSelectedDay(dayIndex);
    setShowDayModal(true);
  };

  const handleAddRecipe = async (recipe) => {
    if (selectedDay === null || !selectedMealType) return;

    const existingMeal = getMealForSlot(selectedDay, selectedMealType);
    
    if (existingMeal) {
      setStatusMessage(`A meal is already planned for ${DAYS_OF_WEEK[selectedDay]} ${selectedMealType}.`);
      return;
    }

    const newMealPlan = {
      dayOfWeek: selectedDay,
      mealType: selectedMealType,
      recipeId: recipe.id,
      recipeName: recipe.title,
      recipeDetails: `${recipe.mealType} | ${recipe.prepTime} prep + ${recipe.cookTime} cook`,
    };

    const saved = await createMealPlan(newMealPlan);
    if (saved) {
      setMealPlans((prev) => [...prev, saved]);
      setStatusMessage(`${recipe.title} added to ${DAYS_OF_WEEK[selectedDay]} ${selectedMealType}.`);
      setShowRecipeModal(false);
      setSelectedMealType(null);
    } else {
      setStatusMessage('Failed to add meal to plan.');
    }
  };

  const handleRemoveMeal = async (id, dayOfWeek, mealType) => {
    await removeMealPlan(id);
    setMealPlans((prev) => prev.filter((mp) => mp.id !== id));
    setStatusMessage(`${DAYS_OF_WEEK[dayOfWeek]} ${mealType} removed from your meal plan.`);
  };

  const handleOpenRecipeSelector = (mealType) => {
    setSelectedMealType(mealType);
    setShowRecipeModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDay(null);
    setSelectedMealType(null);
    setShowRecipeModal(false);
  };

  return (
    <section className="meal-plans-page">
      <div className="meal-plans-header">
        <div>
          <p className="meal-plans-eyebrow">Weekly planner</p>
          <h1>Meal Plans</h1>
          <p className="meal-plans-intro">Create and organize your weekly meals for effortless cooking.</p>
        </div>
        <div className="meal-plans-pill">{mealPlans.length} meals planned</div>
      </div>

      <div className="status-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        {statusMessage}
      </div>

      {/* Day Selector Grid */}
      <div className="day-selector-grid">
        {DAYS_OF_WEEK.map((day, dayIndex) => {
          const dayMeals = getMealsForDay(dayIndex);
          return (
            <button
              key={dayIndex}
              className="day-card"
              onClick={() => handleDayClick(dayIndex)}
            >
              <div className="day-card-header">
                <h2>{day}</h2>
                <span className="meal-count">{dayMeals.length} meals</span>
              </div>
              {dayMeals.length > 0 && (
                <div className="meal-preview">
                  {dayMeals.slice(0, 2).map((meal) => (
                    <div key={meal.id} className="preview-item">
                      {meal.recipeName}
                    </div>
                  ))}
                  {dayMeals.length > 2 && <div className="preview-more">+{dayMeals.length - 2} more</div>}
                </div>
              )}
              <div className="day-card-footer">
                {dayMeals.length === 0 ? 'Click to add meals' : 'Click to manage'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Detail Modal */}
      {showDayModal && selectedDay !== null && (
        <div className="modal-overlay" onClick={closeDayModal}>
          <div className="modal-content day-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{DAYS_OF_WEEK[selectedDay]}</h2>
              <button className="modal-close" onClick={closeDayModal}>
                ×
              </button>
            </div>

            <div className="day-meals-container">
              {MEAL_TYPES.map((mealType) => {
                const meal = getMealForSlot(selectedDay, mealType);
                return (
                  <div key={mealType} className="meal-row">
                    <div className="meal-type-section">
                      <h3>{mealType}</h3>
                      {meal ? (
                        <div className="meal-display">
                          <div className="meal-name">{meal.recipeName}</div>
                          <div className="meal-meta">{meal.recipeDetails}</div>
                          <button
                            className="remove-meal-btn"
                            onClick={() => handleRemoveMeal(meal.id, selectedDay, mealType)}
                          >
                            Remove meal
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-meal-btn"
                          onClick={() => handleOpenRecipeSelector(mealType)}
                        >
                          + Add Recipe
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recipe Selection Modal */}
            {showRecipeModal && selectedMealType && (
              <div className="recipe-modal-content">
                <div className="recipe-modal-header">
                  <h3>Select a recipe for {selectedMealType}</h3>
                  <button
                    className="back-btn"
                    onClick={() => {
                      setShowRecipeModal(false);
                      setSelectedMealType(null);
                    }}
                  >
                    ← Back
                  </button>
                </div>
                <div className="recipe-list">
                  {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                      <div key={recipe.id} className="recipe-option">
                        <div className="recipe-info">
                          <h4>{recipe.title}</h4>
                          <p>
                            {recipe.mealType} • {recipe.cuisine} • {recipe.prepTime} prep + {recipe.cookTime} cook
                          </p>
                        </div>
                        <button
                          className="select-recipe-btn"
                          onClick={() => handleAddRecipe(recipe)}
                        >
                          Select
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No recipes available. Create some recipes first!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MealPlans;

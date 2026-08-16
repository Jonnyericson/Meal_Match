const normalizeIngredientName = (value = '') => value.trim().toLowerCase();

const parseIngredientList = (source = '') => {
  if (!source) return [];
  return source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({
      raw: item,
      name: normalizeIngredientName(item),
    }));
};

export const calculateShoppingList = ({ inventory = [], mealPlans = [], recipes = [] }) => {
  const pantry = new Map(
    inventory.map((ingredient) => [normalizeIngredientName(ingredient.name), ingredient])
  );

  const plannedRecipeIngredients = mealPlans.flatMap((mealPlan) => {
    const recipe = recipes.find((candidate) => candidate.id === mealPlan.recipeId || candidate.title === mealPlan.recipeName);
    if (!recipe) return [];
    return parseIngredientList(recipe.ingredients);
  });

  const seen = new Set();
  const missingItems = [];

  for (const item of plannedRecipeIngredients) {
    if (seen.has(item.name)) continue;
    seen.add(item.name);

    const inventoryMatch = pantry.get(item.name);
    if (!inventoryMatch) {
      missingItems.push({
        id: item.name,
        name: item.raw,
        category: 'Needed',
      });
    }
  }

  const grouped = [...missingItems].sort((a, b) => a.name.localeCompare(b.name));

  return {
    items: grouped,
    summary: {
      totalMissing: grouped.length,
      totalMeals: mealPlans.length,
    },
  };
};

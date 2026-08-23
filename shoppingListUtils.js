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

  const namesMatch = (left, right) => left === right || left.includes(right) || right.includes(left);

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

export const calculateMealMatches = ({ recipes = [], inventory = [], shoppingListItems = [] }) => {
  const pantryNames = inventory.map((ingredient) => normalizeIngredientName(ingredient.name));
  const shoppingNames = shoppingListItems.map((item) => normalizeIngredientName(item.name));

  return recipes
    .map((recipe) => {
      const ingredients = parseIngredientList(recipe.ingredients);
      const matches = ingredients.map((ingredient) => {
        const inInventory = pantryNames.some((name) => namesMatch(name, ingredient.name));
        const onShoppingList = shoppingNames.some((name) => namesMatch(name, ingredient.name));
        return {
          ...ingredient,
          status: inInventory ? 'inventory' : onShoppingList ? 'shopping' : 'missing',
        };
      });
      const coveredCount = matches.filter((ingredient) => ingredient.status !== 'missing').length;

      return {
        ...recipe,
        ingredients: matches,
        matchedCount: matches.filter((ingredient) => ingredient.status === 'inventory').length,
        shoppingCount: matches.filter((ingredient) => ingredient.status === 'shopping').length,
        missingCount: matches.filter((ingredient) => ingredient.status === 'missing').length,
        coverage: matches.length ? Math.round((coveredCount / matches.length) * 100) : 0,
      };
    })
    .sort((left, right) => right.coverage - left.coverage || left.missingCount - right.missingCount);
};

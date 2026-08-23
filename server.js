import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';
import { calculateShoppingList } from './shoppingListUtils.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const dbPromise = open({
  filename: './meal_match.db',
  driver: sqlite3.Database,
});

const hashPassword = (password, salt) => {
  return crypto.scryptSync(password, salt, 64).toString('hex');
};

const generateToken = () => crypto.randomBytes(32).toString('hex');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { id, email, name, favoriteCuisine, dietaryRestrictions } = user;
  return { id, email, name, favoriteCuisine, dietaryRestrictions };
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing auth token.' });
  }

  try {
    // Support demo mode token for local testing
    if (token === 'demo-local-token') {
      req.user = {
        id: 0,
        email: 'demo@mealmatch.local',
        name: 'Demo User',
        favoriteCuisine: 'Italian',
        dietaryRestrictions: '',
        sessionToken: 'demo-local-token',
      };
      next();
      return;
    }

    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE sessionToken = ?', token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid auth token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Unable to authorize request.' });
  }
};

const ensureTables = async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT,
      category TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      mealType TEXT,
      cuisine TEXT,
      prepTime TEXT,
      cookTime TEXT,
      ingredients TEXT,
      instructions TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      favoriteCuisine TEXT,
      dietaryRestrictions TEXT,
      sessionToken TEXT
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      dayOfWeek INTEGER NOT NULL,
      mealType TEXT NOT NULL,
      recipeId INTEGER,
      recipeName TEXT,
      recipeDetails TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      userId INTEGER NOT NULL,
      recipeId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, recipeId)
    );
  `);

  const ingredientCount = await db.get('SELECT COUNT(*) AS count FROM ingredients');
  if (ingredientCount.count === 0) {
    await db.run(`INSERT INTO ingredients (name, quantity, category, notes) VALUES
      ('Tomatoes', '2 lbs', 'Produce', 'Best used this week'),
      ('Chicken Breast', '1 pack', 'Protein', 'Great for bowls and salads'),
      ('Brown Rice', '1 bag', 'Pantry', 'Keep for quick lunches'),
      ('Greek Yogurt', '1 tub', 'Dairy', 'Use for parfaits and sauces')`);
  }

  await db.run("DELETE FROM recipes WHERE title = 'Test Recipe'");

  const seedRecipes = [
    ['Garlic Chicken Bowl', 'Dinner', 'Mediterranean', '15 min', '25 min', 'Chicken breast, brown rice, spinach, lemon, garlic', 'Cook the chicken with garlic and lemon, serve over brown rice with spinach.'],
    ['Veggie Pasta', 'Dinner', 'Italian', '20 min', '20 min', 'Pasta, tomatoes, spinach, olive oil, parmesan', 'Sauté tomatoes and spinach, toss with pasta and parmesan.'],
    ['Berry Yogurt Parfait', 'Breakfast', 'American', '10 min', '0 min', 'Greek yogurt, berries, granola, honey', 'Layer yogurt, berries, and granola in a glass and drizzle with honey.'],
    ['Black Bean Tacos', 'Lunch', 'Mexican', '10 min', '15 min', 'Black beans, tortillas, avocado, tomatoes, lime, cilantro', 'Warm the beans and tortillas, then fill with avocado, tomatoes, lime, and cilantro.'],
    ['Salmon Sheet Pan Dinner', 'Dinner', 'American', '10 min', '25 min', 'Salmon, potatoes, broccoli, lemon, olive oil', 'Roast the potatoes first, then add salmon and broccoli and finish with lemon.'],
    ['Apple Cinnamon Oatmeal', 'Breakfast', 'American', '5 min', '10 min', 'Rolled oats, apple, cinnamon, milk, maple syrup', 'Simmer oats with milk, then top with diced apple, cinnamon, and maple syrup.'],
    ['Chickpea Greek Salad', 'Lunch', 'Mediterranean', '15 min', '0 min', 'Chickpeas, cucumber, tomatoes, feta, olives, lemon', 'Toss the chickpeas and vegetables with feta, olives, and lemon.'],
    ['Creamy Tomato Soup', 'Lunch', 'Vegetarian', '10 min', '25 min', 'Tomatoes, onion, garlic, vegetable broth, cream, basil', 'Simmer the vegetables in broth, blend until smooth, and finish with cream and basil.'],
  ];

  for (const recipe of seedRecipes) {
    const existingRecipe = await db.get('SELECT id FROM recipes WHERE title = ?', recipe[0]);
    if (!existingRecipe) {
      await db.run(
        'INSERT INTO recipes (title, mealType, cuisine, prepTime, cookTime, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ...recipe
      );
    }
  }
};

app.get('/api/ingredients', async (req, res) => {
  try {
    const db = await dbPromise;
    const ingredients = await db.all('SELECT * FROM ingredients ORDER BY id DESC');
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ingredients.' });
  }
});

app.post('/api/ingredients', async (req, res) => {
  try {
    const { name, quantity, category, notes } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Ingredient name is required.' });
    }

    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO ingredients (name, quantity, category, notes) VALUES (?, ?, ?, ?)',
      name.trim(),
      quantity || '',
      category || 'Produce',
      notes || ''
    );

    const savedIngredient = {
      id: result.lastID,
      name: name.trim(),
      quantity: quantity || '',
      category: category || 'Produce',
      notes: notes || '',
    };

    res.status(201).json(savedIngredient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save ingredient.' });
  }
});

app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM ingredients WHERE id = ?', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ingredient.' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const db = await dbPromise;
    const recipes = await db.all('SELECT * FROM recipes ORDER BY id DESC');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes.' });
  }
});

app.get('/api/shopping-list', authenticate, async (req, res) => {
  try {
    const db = await dbPromise;
    const [ingredients, mealPlans, recipes] = await Promise.all([
      db.all('SELECT * FROM ingredients ORDER BY id DESC'),
      db.all('SELECT * FROM meal_plans WHERE userId = ? ORDER BY dayOfWeek, mealType', req.user.id),
      db.all('SELECT * FROM recipes ORDER BY id DESC'),
    ]);

    const list = calculateShoppingList({ inventory: ingredients, mealPlans, recipes });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate shopping list.' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, mealType, cuisine, prepTime, cookTime, ingredients, instructions } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Recipe title is required.' });
    }

    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO recipes (title, mealType, cuisine, prepTime, cookTime, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      title.trim(),
      mealType || 'Dinner',
      cuisine || 'General',
      prepTime || '30 min',
      cookTime || '20 min',
      ingredients || '',
      instructions || ''
    );

    const savedRecipe = {
      id: result.lastID,
      title: title.trim(),
      mealType: mealType || 'Dinner',
      cuisine: cuisine || 'General',
      prepTime: prepTime || '30 min',
      cookTime: cookTime || '20 min',
      ingredients: ingredients || '',
      instructions: instructions || '',
    };

    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save recipe.' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM recipes WHERE id = ?', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe.' });
  }
});

app.get('/api/favorites', authenticate, async (req, res) => {
  try {
    const db = await dbPromise;
    const favorites = await db.all(
      `SELECT recipes.*, favorites.createdAt AS favoritedAt
       FROM favorites
       INNER JOIN recipes ON recipes.id = favorites.recipeId
       WHERE favorites.userId = ?
       ORDER BY favorites.createdAt DESC, recipes.title ASC`,
      req.user.id
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

app.post('/api/favorites', authenticate, async (req, res) => {
  const recipeId = Number(req.body.recipeId);
  if (!Number.isInteger(recipeId)) {
    return res.status(400).json({ error: 'A valid recipe is required.' });
  }

  try {
    const db = await dbPromise;
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    await db.run(
      'INSERT OR IGNORE INTO favorites (userId, recipeId) VALUES (?, ?)',
      req.user.id,
      recipeId
    );
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save favorite.' });
  }
});

app.delete('/api/favorites/:recipeId', authenticate, async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run(
      'DELETE FROM favorites WHERE userId = ? AND recipeId = ?',
      req.user.id,
      req.params.recipeId
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite.' });
  }
});

// Meal Plans endpoints
app.get('/api/meal-plans', authenticate, async (req, res) => {
  try {
    const db = await dbPromise;
    const mealPlans = await db.all(
      'SELECT * FROM meal_plans WHERE userId = ? ORDER BY dayOfWeek, mealType',
      req.user.id
    );
    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meal plans.' });
  }
});

app.post('/api/meal-plans', authenticate, async (req, res) => {
  try {
    const { dayOfWeek, mealType, recipeId, recipeName, recipeDetails } = req.body;

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Invalid day of week.' });
    }

    if (!mealType?.trim()) {
      return res.status(400).json({ error: 'Meal type is required.' });
    }

    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO meal_plans (userId, dayOfWeek, mealType, recipeId, recipeName, recipeDetails) VALUES (?, ?, ?, ?, ?, ?)',
      req.user.id,
      dayOfWeek,
      mealType.trim(),
      recipeId || null,
      recipeName?.trim() || '',
      recipeDetails?.trim() || ''
    );

    const savedMealPlan = {
      id: result.lastID,
      userId: req.user.id,
      dayOfWeek,
      mealType: mealType.trim(),
      recipeId: recipeId || null,
      recipeName: recipeName?.trim() || '',
      recipeDetails: recipeDetails?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(savedMealPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save meal plan.' });
  }
});

app.put('/api/meal-plans/:id', authenticate, async (req, res) => {
  try {
    const { dayOfWeek, mealType, recipeId, recipeName, recipeDetails } = req.body;

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Invalid day of week.' });
    }

    if (!mealType?.trim()) {
      return res.status(400).json({ error: 'Meal type is required.' });
    }

    const db = await dbPromise;
    
    // Verify ownership
    const mealPlan = await db.get('SELECT userId FROM meal_plans WHERE id = ?', req.params.id);
    if (!mealPlan || mealPlan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this meal plan.' });
    }

    await db.run(
      'UPDATE meal_plans SET dayOfWeek = ?, mealType = ?, recipeId = ?, recipeName = ?, recipeDetails = ? WHERE id = ?',
      dayOfWeek,
      mealType.trim(),
      recipeId || null,
      recipeName?.trim() || '',
      recipeDetails?.trim() || '',
      req.params.id
    );

    const updated = await db.get('SELECT * FROM meal_plans WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update meal plan.' });
  }
});

app.delete('/api/meal-plans/:id', authenticate, async (req, res) => {
  try {
    const db = await dbPromise;

    // Verify ownership
    const mealPlan = await db.get('SELECT userId FROM meal_plans WHERE id = ?', req.params.id);
    if (!mealPlan || mealPlan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this meal plan.' });
    }

    await db.run('DELETE FROM meal_plans WHERE id = ?', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete meal plan.' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, name, favoriteCuisine, dietaryRestrictions } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = await dbPromise;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, passwordSalt);
    const sessionToken = generateToken();

    const result = await db.run(
      'INSERT INTO users (email, name, passwordHash, passwordSalt, favoriteCuisine, dietaryRestrictions, sessionToken) VALUES (?, ?, ?, ?, ?, ?, ?)',
      normalizedEmail,
      name?.trim() || '',
      passwordHash,
      passwordSalt,
      favoriteCuisine?.trim() || '',
      dietaryRestrictions?.trim() || '',
      sessionToken
    );

    const user = sanitizeUser({
      id: result.lastID,
      email: normalizedEmail,
      name: name?.trim() || '',
      favoriteCuisine: favoriteCuisine?.trim() || '',
      dietaryRestrictions: dietaryRestrictions?.trim() || '',
    });

    res.status(201).json({ user, token: sessionToken });
  } catch (error) {
    res.status(500).json({ error: 'Unable to register user.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = await dbPromise;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordHash = hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const sessionToken = generateToken();
    await db.run('UPDATE users SET sessionToken = ? WHERE id = ?', sessionToken, user.id);

    const sanitized = sanitizeUser(user);
    res.json({ user: sanitized, token: sessionToken });
  } catch (error) {
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/profile', authenticate, async (req, res) => {
  res.json(sanitizeUser(req.user));
});

app.put('/api/profile', authenticate, async (req, res) => {
  const { name, favoriteCuisine, dietaryRestrictions } = req.body;

  try {
    const db = await dbPromise;
    await db.run(
      'UPDATE users SET name = ?, favoriteCuisine = ?, dietaryRestrictions = ? WHERE id = ?',
      name?.trim() || '',
      favoriteCuisine?.trim() || '',
      dietaryRestrictions?.trim() || '',
      req.user.id
    );

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    res.status(500).json({ error: 'Unable to update profile.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

ensureTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Unable to initialize database', error);
  process.exit(1);
});

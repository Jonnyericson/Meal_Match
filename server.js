import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

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
  `);
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

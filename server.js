import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const dbPromise = open({
  filename: './meal_match.db',
  driver: sqlite3.Database,
});

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

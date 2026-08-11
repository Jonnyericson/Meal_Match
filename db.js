import initSqlJs from 'sql.js';

const STORAGE_KEY = 'meal_match_sqlite_db';
let db = null;
let SQL = null;

const toBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return window.btoa(binary);
};

const fromBase64 = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const saveDb = () => {
  if (!db) return;
  const data = db.export();
  const serialized = toBase64(data);
  localStorage.setItem(STORAGE_KEY, serialized);
};

const loadDb = async () => {
  if (db) return db;
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`,
    });
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = fromBase64(saved);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      quantity TEXT,
      category TEXT,
      notes TEXT
    );`);
    saveDb();
  }

  return db;
};

export const fetchIngredientsFromDb = async () => {
  const database = await loadDb();
  const stmt = database.prepare('SELECT * FROM ingredients ORDER BY id DESC');
  const rows = [];

  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }

  stmt.free();
  return rows;
};

export const addIngredientToDb = async (ingredient) => {
  const database = await loadDb();
  const insert = database.prepare(
    'INSERT INTO ingredients (name, quantity, category, notes) VALUES (?, ?, ?, ?);'
  );

  insert.run([ingredient.name, ingredient.quantity, ingredient.category, ingredient.notes]);
  insert.free();
  saveDb();

  const result = database.exec('SELECT last_insert_rowid() as id;');
  const id = result?.[0]?.values?.[0]?.[0] ?? Date.now();
  return { id, ...ingredient };
};

export const deleteIngredientFromDb = async (id) => {
  const database = await loadDb();
  const remove = database.prepare('DELETE FROM ingredients WHERE id = ?;');
  remove.run([id]);
  remove.free();
  saveDb();
};

export const clearDatabase = async () => {
  localStorage.removeItem(STORAGE_KEY);
  if (db) {
    db.close();
    db = null;
  }
};

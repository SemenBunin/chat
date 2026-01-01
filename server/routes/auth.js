import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, displayName, publicKey } = req.body;

  if (!username || !displayName || !publicKey) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Проверка уникальности
  const { rows } = await pool.query(
    'SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );

  if (rows.length > 0) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  try {
    await pool.query(
      'INSERT INTO users (username, display_name, public_key) VALUES ($1, $2, $3)',
      [username, displayName, publicKey]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
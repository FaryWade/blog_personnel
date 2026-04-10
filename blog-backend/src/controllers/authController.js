const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
const register = async (req, res) => {
  const { full_name, username, password } = req.body;
  if (!full_name || !username || !password)
    return res.status(400).json({ message: 'Tous les champs sont requis.' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, username, password) VALUES ($1, $2, $3) RETURNING id, full_name, username',
      [full_name, username, hashed]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, full_name: user.full_name, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Identifiants incorrects.' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Identifiants incorrects.' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, full_name: user.full_name, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, username FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const u = result.rows[0];
    res.json({ id: u.id, full_name: u.full_name, username: u.username });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { register, login, me };

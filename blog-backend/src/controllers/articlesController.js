const pool = require('../config/db');

// GET /api/articles/mine
const getMine = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, u.full_name FROM articles a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    const articles = result.rows.map(formatArticle);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// GET /api/articles/feed — articles publics des amis
const getFeed = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, u.full_name FROM articles a
       JOIN users u ON a.user_id = u.id
       WHERE a.is_public = true
       AND a.user_id != $1
       AND a.user_id IN (
         SELECT CASE WHEN requester_id = $1 THEN receiver_id ELSE requester_id END
         FROM friendships
         WHERE (requester_id = $1 OR receiver_id = $1) AND status = 'accepted'
       )
       AND a.user_id NOT IN (
         SELECT blocked_id FROM blocked_users WHERE blocker_id = $1
         UNION
         SELECT blocker_id FROM blocked_users WHERE blocked_id = $1
       )
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows.map(formatArticle));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// GET /api/articles/:id
const getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, u.full_name FROM articles a
       JOIN users u ON a.user_id = u.id WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Article introuvable.' });

    const article = result.rows[0];
    if (!article.is_public && article.user_id !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé.' });

    res.json(formatArticle(article));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/articles
const create = async (req, res) => {
  const { title, content, isPublic = true, allowComments = true } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: 'Titre et contenu requis.' });

  try {
    const result = await pool.query(
      `INSERT INTO articles (title, content, is_public, allow_comments, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, isPublic, allowComments, req.user.id]
    );
    res.status(201).json(formatArticle(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// PUT /api/articles/:id
const update = async (req, res) => {
  const { title, content, isPublic, allowComments } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Article introuvable.' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Non autorisé.' });

    const result = await pool.query(
      `UPDATE articles SET title=$1, content=$2, is_public=$3, allow_comments=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, content, isPublic, allowComments, req.params.id]
    );
    res.json(formatArticle(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/articles/:id
const remove = async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Article introuvable.' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Non autorisé.' });

    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Article supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const formatArticle = (a) => ({
  id: a.id,
  title: a.title,
  content: a.content,
  isPublic: a.is_public,
  allowComments: a.allow_comments,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
  author: { id: a.user_id, username: a.username, fullName: a.full_name }
});

module.exports = { getMine, getFeed, getById, create, update, remove };

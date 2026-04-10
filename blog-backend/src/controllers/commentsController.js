const pool = require('../config/db');

// GET /api/articles/:id/comments
const getByArticle = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.username, u.full_name FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.article_id = $1 ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      author: { id: c.user_id, username: c.username, fullName: c.full_name }
    })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/articles/:id/comments
const create = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Contenu requis.' });

  try {
    const article = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
    if (article.rows.length === 0)
      return res.status(404).json({ message: 'Article introuvable.' });
    if (!article.rows[0].allow_comments)
      return res.status(403).json({ message: 'Les commentaires sont désactivés.' });

    const result = await pool.query(
      `INSERT INTO comments (content, user_id, article_id) VALUES ($1, $2, $3)
       RETURNING *, (SELECT username FROM users WHERE id = $2) as username,
                   (SELECT full_name FROM users WHERE id = $2) as full_name`,
      [content, req.user.id, req.params.id]
    );
    const c = result.rows[0];
    res.status(201).json({
      id: c.id, content: c.content, createdAt: c.created_at,
      author: { id: c.user_id, username: c.username, fullName: c.full_name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// DELETE /api/articles/:id/comments/:commentId
const remove = async (req, res) => {
  try {
    const comment = await pool.query('SELECT * FROM comments WHERE id = $1', [req.params.commentId]);
    if (comment.rows.length === 0)
      return res.status(404).json({ message: 'Commentaire introuvable.' });

    const article = await pool.query('SELECT user_id FROM articles WHERE id = $1', [req.params.id]);
    const isCommentOwner = comment.rows[0].user_id === req.user.id;
    const isArticleOwner = article.rows[0]?.user_id === req.user.id;

    if (!isCommentOwner && !isArticleOwner)
      return res.status(403).json({ message: 'Non autorisé.' });

    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.commentId]);
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getByArticle, create, remove };

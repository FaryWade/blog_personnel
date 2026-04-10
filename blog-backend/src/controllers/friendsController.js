const pool = require('../config/db');

// GET /api/friends — liste des amis acceptés
const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username FROM users u
       JOIN friendships f ON (
         (f.requester_id = $1 AND f.receiver_id = u.id) OR
         (f.receiver_id = $1 AND f.requester_id = u.id)
       )
       WHERE f.status = 'accepted'`,
      [req.user.id]
    );
    res.json(result.rows.map(u => ({ id: u.id, fullName: u.full_name, username: u.username })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/friends/requests — demandes reçues en attente
const getRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username FROM users u
       JOIN friendships f ON f.requester_id = u.id
       WHERE f.receiver_id = $1 AND f.status = 'pending'`,
      [req.user.id]
    );
    res.json(result.rows.map(u => ({ id: u.id, fullName: u.full_name, username: u.username })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/users/search?username=...
const searchUsers = async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Paramètre username requis.' });
  try {
    const result = await pool.query(
      `SELECT id, full_name, username FROM users
       WHERE username ILIKE $1 AND id != $2 LIMIT 10`,
      [`%${username}%`, req.user.id]
    );
    res.json(result.rows.map(u => ({ id: u.id, fullName: u.full_name, username: u.username })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/friends/request/:userId
const sendRequest = async (req, res) => {
  const receiverId = parseInt(req.params.userId);
  if (receiverId === req.user.id)
    return res.status(400).json({ message: 'Vous ne pouvez pas vous ajouter vous-même.' });

  try {
    const existing = await pool.query(
      `SELECT * FROM friendships WHERE
       (requester_id = $1 AND receiver_id = $2) OR
       (requester_id = $2 AND receiver_id = $1)`,
      [req.user.id, receiverId]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Une demande existe déjà.' });

    await pool.query(
      'INSERT INTO friendships (requester_id, receiver_id, status) VALUES ($1, $2, $3)',
      [req.user.id, receiverId, 'pending']
    );
    res.status(201).json({ message: 'Demande envoyée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// PUT /api/friends/accept/:userId
const acceptRequest = async (req, res) => {
  try {
    console.log('Accept request - userId:', req.params.userId, 'user:', req.user.id);
    const result = await pool.query(
      `UPDATE friendships SET status = 'accepted'
       WHERE requester_id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING *`,
      [parseInt(req.params.userId), req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Demande introuvable.' });
    res.json({ message: 'Demande acceptée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/friends/decline/:userId
const declineRequest = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM friendships WHERE requester_id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [req.params.userId, req.user.id]
    );
    res.json({ message: 'Demande refusée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/friends/:userId
const removeFriend = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM friendships WHERE
       (requester_id = $1 AND receiver_id = $2) OR
       (requester_id = $2 AND receiver_id = $1)`,
      [req.user.id, req.params.userId]
    );
    res.json({ message: 'Ami retiré.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/friends/block/:userId
const blockUser = async (req, res) => {
  try {
    // Supprimer l'amitié si elle existe
    await pool.query(
      `DELETE FROM friendships WHERE
       (requester_id = $1 AND receiver_id = $2) OR
       (requester_id = $2 AND receiver_id = $1)`,
      [req.user.id, req.params.userId]
    );
    // Ajouter le blocage
    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.userId]
    );
    res.json({ message: 'Utilisateur bloqué.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

module.exports = { getAll, getRequests, searchUsers, sendRequest, acceptRequest, declineRequest, removeFriend, blockUser };

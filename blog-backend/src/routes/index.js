const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { register, login, me } = require('../controllers/authController');
const { getMine, getFeed, getById, create, update, remove } = require('../controllers/articlesController');
const { getByArticle, create: createComment, remove: removeComment } = require('../controllers/commentsController');
const { getAll, getRequests, searchUsers, sendRequest, acceptRequest, declineRequest, removeFriend, blockUser } = require('../controllers/friendsController');

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', auth, me);

// Articles
router.get('/articles/mine', auth, getMine);
router.get('/articles/feed', auth, getFeed);
router.get('/articles/:id', auth, getById);
router.post('/articles', auth, create);
router.put('/articles/:id', auth, update);
router.delete('/articles/:id', auth, remove);

// Comments
router.get('/articles/:id/comments', auth, getByArticle);
router.post('/articles/:id/comments', auth, createComment);
router.delete('/articles/:id/comments/:commentId', auth, removeComment);

// Users search
router.get('/users/search', auth, searchUsers);

// Friends
router.get('/friends', auth, getAll);
router.get('/friends/requests', auth, getRequests);
router.post('/friends/request/:userId', auth, sendRequest);
router.put('/friends/accept/:userId', auth, acceptRequest);
router.delete('/friends/decline/:userId', auth, declineRequest);
router.delete('/friends/:userId', auth, removeFriend);
router.post('/friends/block/:userId', auth, blockUser);

module.exports = router;

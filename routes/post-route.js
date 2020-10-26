const express = require('express');
const router = express.Router();

const {
  addPost
} = require('../controllers/post-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
router.post('/add', authMiddleware, addPost);

module.exports = router;
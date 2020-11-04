const express = require('express');
const router = express.Router();
const pool = require('../configs/db-config');

const {
  getAllPublicPosts,
  addPost
} = require('../controllers/post-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         GET api/post/all
// @DESCRIPTION   Get all public posts
// @ACCESS        Public
router.get('/all', getAllPublicPosts);

// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
router.post('/add', authMiddleware, addPost);

module.exports = router;
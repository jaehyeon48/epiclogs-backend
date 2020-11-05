const express = require('express');
const router = express.Router();
const pool = require('../configs/db-config');

const {
  getAllPublicPosts,
  getPost,
  addPost
} = require('../controllers/post-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         GET api/post/all/:startRange
// @DESCRIPTION   Get all public posts
// @ACCESS        Public
router.get('/all/:startRange', getAllPublicPosts);


// @ROUTE         GET api/post/:postId
// @DESCRIPTION   get a post
// @ACCESS        Public
router.get('/:postId', getPost);

// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
router.post('/add', authMiddleware, addPost);

module.exports = router;
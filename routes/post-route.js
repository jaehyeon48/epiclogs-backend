const express = require('express');
const router = express.Router();
const pool = require('../configs/db-config');

const {
  getAllPublicPosts,
  getPost,
  getTags,
  addPost,
  editPost,
  deletePost
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


// @ROUTE         GET api/post/tags/:postId
// @DESCRIPTION   Get tags of a post
// @ACCESS        Public
router.get('/tags/:postId', getTags);


// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
router.post('/add', authMiddleware, addPost);


// @ROUTE         PUT api/post/:postId
// @DESCRIPTION   Edit a post
// @ACCESS        Private
router.put('/:postId', authMiddleware, editPost);


// @ROUTE         DELETE api/post/:postId
// @DESCRIPTION   Delete a post
// @ACCESS        Private
router.delete('/:postId', authMiddleware, deletePost);

module.exports = router;
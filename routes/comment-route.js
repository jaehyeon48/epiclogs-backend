const express = require('express');
const router = express.Router();
const pool = require('../configs/db-config');

const authMiddleware = require('../middlewares/auth-middleware');
const {
  addComment,
  getCommentsOfPost
} = require('../controllers/comment-controller');


// @ROUTE         GET api/comment/post/:postId
// @DESCRIPTION   Get all comments of a post
// @ACCESS        Public
router.get('/post/:postId', getCommentsOfPost);

// @ROUTE         POST api/comment/add
// @DESCRIPTION   Add a new comment
// @ACCESS        Private
router.post('/add', authMiddleware, addComment);

module.exports = router;
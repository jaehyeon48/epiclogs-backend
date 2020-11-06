const express = require('express');
const router = express.Router();
const pool = require('../configs/db-config');

const authMiddleware = require('../middlewares/auth-middleware');
const {
  addComment
} = require('../controllers/comment-controller');

// @ROUTE         POST api/comment/add
// @DESCRIPTION   Add a new comment
// @ACCESS        Private
router.post('/add', authMiddleware, addComment);

module.exports = router;
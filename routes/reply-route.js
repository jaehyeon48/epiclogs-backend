const express = require('express');
const router = express.Router();

const {
  getReplyOfComment,
  addReply
} = require('../controllers/reply-controller');

const authMiddleware = require('../middlewares/auth-middleware');


// @ROUTE         GET api/reply/:commentId
// @DESCRIPTION   Get a comment's reply
// @ACCESS        Public
router.get('/:commentId', getReplyOfComment);

// @ROUTE         POST api/reply/:commentId
// @DESCRIPTION   Add a reply
// @ACCESS        Private
router.post('/:commentId', authMiddleware, addReply);

module.exports = router;

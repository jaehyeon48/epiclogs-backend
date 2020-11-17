const express = require('express');
const router = express.Router();

const {
  getReplyOfComment,
  getAReply,
  getReplyUserInfo,
  addReply,
  editReply,
} = require('../controllers/reply-controller');

const authMiddleware = require('../middlewares/auth-middleware');


// @ROUTE         GET api/reply/user/:userId
// @DESCRIPTION   Get reply commenter's info
// @ACCESS        Public
router.get('/user/:userId', getReplyUserInfo);


// @ROUTE         GET api/reply/:commentId
// @DESCRIPTION   Get a comment's reply
// @ACCESS        Public
router.get('/:commentId', getReplyOfComment);


// @ROUTE         GET api/reply/one/:replyId
// @DESCRIPTION   Get a reply
// @ACCESS        Public
router.get('/one/:replyId', getAReply);

// @ROUTE         POST api/reply/:commentId
// @DESCRIPTION   Add a reply
// @ACCESS        Private
router.post('/:commentId', authMiddleware, addReply);


// @ROUTE         PUT api/reply/:replyId
// @DESCRIPTION   Edit a reply
// @ACCESS        Private
router.put('/:replyId', authMiddleware, editReply);

module.exports = router;

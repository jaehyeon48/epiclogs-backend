const express = require('express');
const router = express.Router();

const {
  getUserNickname,
  getAvatarByNickname,
  getAvatarByUserId,
  modifyUsername,
  modifyNickname,
  modifyPassword,
  uploadUserAvatar,
  deleteUserAvatar
} = require('../controllers/user-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         GET api/user/nickname/:userId
// @DESCRIPTION   Get user's nickname by userId
// @ACCESS        Public
router.get('/nickname/:userId', getUserNickname);

// @ROUTE         GET api/user/avatar/nname/:nickname
// @DESCRIPTION   Get a user's avatar by nickname
// @ACCESS        Public
router.get('/avatar/nname/:nickname', getAvatarByNickname);

// @ROUTE         GET api/user/avatar/id/:userId
// @DESCRIPTION   Get a user's avatar by userId
// @ACCESS        Public
router.get('/avatar/id/:userId', getAvatarByUserId);


// @ROUTE         PUT api/user/username
// @DESCRIPTION   Modify username
// @ACCESS        Private
router.put('/username', authMiddleware, modifyUsername);


// @ROUTE         PUT api/user/nickname
// @DESCRIPTION   Modify nickname
// @ACCESS        Private
router.put('/nickname', authMiddleware, modifyNickname);


// @ROUTE         PUT api/user/password
// @DESCRIPTION   Modify password
// @ACCESS        Private
router.put('/password', authMiddleware, modifyPassword);


// @ROUTE         POST api/user/avatar
// @DESCRIPTION   Upload user's avatar
// @ACCESS        Private
router.post('/avatar', authMiddleware, uploadUserAvatar);


// @ROUTE         DELETE api/user/avatar
// @DESCRIPTION   Delete user's avatar
// @ACCESS        Private
router.delete('/avatar', authMiddleware, deleteUserAvatar);

module.exports = router;
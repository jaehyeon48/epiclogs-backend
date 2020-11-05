const express = require('express');
const router = express.Router();

const {
  getAvatar,
  modifyUsername,
  modifyNickname,
  modifyPassword,
  uploadUserAvatar,
  deleteUserAvatar
} = require('../controllers/user-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         GET api/user/avatar/:nickname
// @DESCRIPTION   Get a user's avatar
// @ACCESS        Public
router.get('/avatar/:nickname', getAvatar);


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
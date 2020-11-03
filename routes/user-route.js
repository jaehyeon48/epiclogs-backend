const express = require('express');
const router = express.Router();

const {
  modifyUsername,
  modifyNickname,
  uploadUserAvatar,
  deleteUserAvatar
} = require('../controllers/user-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         PUT api/user/username
// @DESCRIPTION   Modify username
// @ACCESS        Private
router.put('/username', authMiddleware, modifyUsername);


// @ROUTE         PUT api/user/nickname
// @DESCRIPTION   Modify nickname
// @ACCESS        Private
router.put('/nickname', authMiddleware, modifyNickname);

// @ROUTE         POST api/user/avatar
// @DESCRIPTION   Upload user's avatar
// @ACCESS        Private
router.post('/avatar', authMiddleware, uploadUserAvatar);


// @ROUTE         DELETE api/user/avatar
// @DESCRIPTION   Delete user's avatar
// @ACCESS        Private
router.delete('/avatar', authMiddleware, deleteUserAvatar);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  modifyUsername
} = require('../controllers/user-controller');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         PUT api/user/username
// @DESCRIPTION   Modify username
// @ACCESS        Private
router.put('/username', authMiddleware, modifyUsername);

module.exports = router;
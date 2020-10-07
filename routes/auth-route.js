const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  checkAuthController,
  makeTokenForGoogleAuth
} = require('../controllers/auth-controllers');

const authMiddleware = require('../middlewares/auth-middleware');

// @ROUTE         GET api/auth/check
// @DESCRIPTION   check authentication
// @ACCESS        Private
router.get('/check', authMiddleware, checkAuthController);


// @ROUTE         GET api/auth/login/google
// @DESCRIPTION   Login user with Google
// @ACCESS        Public
router.get('/login/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @ROUTE         GET api/auth/login/google/credential
// @DESCRIPTION   Google auth redirection url
// @ACCESS        Public
router.get('/login/google/credential', passport.authenticate('google'), makeTokenForGoogleAuth);


module.exports = router;
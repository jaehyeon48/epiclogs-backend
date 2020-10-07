const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  checkAuthController,
  loginWithGithub,
  makeTokenForGoogleAuth,
  makeTokenForGithubAuth
} = require('../controllers/auth-controllers');

const authMiddleware = require('../middlewares/auth-middleware');
const githubAuthMiddleware = require('../middlewares/github-auth-middleware');

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

// @ROUTE         GET api/auth/login/github
// @DESCRIPTION   Login user with Github
// @ACCESS        Public
router.get('/login/github', loginWithGithub);

// @ROUTE         GET api/auth/login/google/credential
// @DESCRIPTION   Google auth redirection url
// @ACCESS        Public
router.get('/login/google/credential', passport.authenticate('google'), makeTokenForGoogleAuth);

// @ROUTE         GET api/auth/login/github/credential
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
router.get('/login/github/credential', githubAuthMiddleware, makeTokenForGithubAuth);


module.exports = router;
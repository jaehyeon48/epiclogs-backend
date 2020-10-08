const express = require('express');
const router = express.Router();

const {
  checkAuthController,
  loginLocal,
  loginWithGithub,
  makeTokenForGithubAuth,
  logout,
  signUp,
  loginWithGoogle,
  makeTokenForGoogleAuth
} = require('../controllers/auth-controllers');

const authMiddleware = require('../middlewares/auth-middleware');
const githubAuthMiddleware = require('../middlewares/github-auth-middleware');
const googleAuthMiddleware = require('../middlewares/google-auth-middleware');

// @ROUTE         GET api/auth/check
// @DESCRIPTION   check authentication
// @ACCESS        Private
router.get('/check', authMiddleware, checkAuthController);


// @ROUTE         GET api/auth/login/google
// @DESCRIPTION   Login user with Google
// @ACCESS        Public
router.get('/login/google', loginWithGoogle);


// @ROUTE         GET api/auth/login/google-callback
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
router.get('/login/google-callback', googleAuthMiddleware, makeTokenForGoogleAuth);

// @ROUTE         GET api/auth/login/github
// @DESCRIPTION   Login user with Github
// @ACCESS        Public
router.get('/login/github', loginWithGithub);


// @ROUTE         GET api/auth/login/github-callback
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
router.get('/login/github/credential', githubAuthMiddleware, makeTokenForGithubAuth);

// @ROUTE         GET api/auth/logout
// @DESCRIPTION   Logout the user
// @ACCESS        Private
router.get('/logout', authMiddleware, logout);


// @ROUTE         POST api/auth/signup
// @DESCRIPTION   Register user in local
// @ACCESS        Public
router.post('/signup', signUp);


// @ROUTE         POST api/auth/login/local
// @DESCRIPTION   Login user in local
// @ACCESS        Public
router.post('/login/local', loginLocal);


module.exports = router;
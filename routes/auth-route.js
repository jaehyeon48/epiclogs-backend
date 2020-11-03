const express = require('express');
const router = express.Router();

const {
  checkAuthController,
  loginLocal,
  loginWithGithub,
  makeTokenForGithubAuth,
  logout,
  signUp,
  checkNicknameDuplication,
  checkEmailDuplication,
  loginWithGoogle,
  makeTokenForGoogleAuth,
  registerNickname,
  checkOauthUser,
  uploadUserAvatar,
  deleteUserAvatar
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
// @DESCRIPTION   Google auth redirection url
// @ACCESS        Public
router.get('/login/google-callback', googleAuthMiddleware, makeTokenForGoogleAuth);


// @ROUTE         GET api/auth/login/github
// @DESCRIPTION   Login user with Github
// @ACCESS        Public
router.get('/login/github', loginWithGithub);


// @ROUTE         GET api/auth/login/github-callback
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
router.get('/login/github-callback', githubAuthMiddleware, makeTokenForGithubAuth);

// @ROUTE         GET api/auth/logout
// @DESCRIPTION   Logout the user
// @ACCESS        Private
router.get('/logout', authMiddleware, logout);


// @ROUTE         POST api/auth/signup
// @DESCRIPTION   Register user in local
// @ACCESS        Public
router.post('/signup', signUp);


// @ROUTE         POST api/auth/nickname-duplicate
// @DESCRIPTION   Check if the nickname is duplicated or not
// @ACCESS        Public
router.post('/nickname-duplicate', checkNicknameDuplication);


// @ROUTE         POST api/auth/email-duplicate
// @DESCRIPTION   Check if the email is duplicated or not
// @ACCESS        Public
router.post('/email-duplicate', checkEmailDuplication);


// @ROUTE         POST api/auth/check-google-user
// @DESCRIPTION   Checking google user's existence
// @ACCESS        Public
router.post('/check-oauth-user', checkOauthUser);


// @ROUTE         POST api/auth/login/local
// @DESCRIPTION   Login user in local
// @ACCESS        Public
router.post('/login/local', loginLocal);


// @ROUTE         POST api/auth/register-nickname
// @DESCRIPTION   Add nickname to oauth user
// @ACCESS        Public
router.post('/register-nickname', registerNickname);

module.exports = router;
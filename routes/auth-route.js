const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  loginWithGoogle,
  setGoogleCredentials
} = require('../controllers/auth-controllers');


// @ROUTE         POST api/auth/login/google
// @DESCRIPTION   Login user with Google
// @ACCESS        Public
router.get('/login/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/login/google/credential', passport.authenticate('google'), setGoogleCredentials);


module.exports = router;
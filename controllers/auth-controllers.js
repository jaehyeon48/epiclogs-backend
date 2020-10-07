const jwt = require('jsonwebtoken');
const pool = require('../configs/db-config');
require('dotenv').config();


// @ROUTE         GET api/auth/check
// @DESCRIPTION   check authentication
// @ACCESS        Private
async function checkAuthController(req, res) {
  const userId = req.user.id;
  try {
    const [userRow] = await pool.query(`SELECT userId, firstName, lastName, email, avatar FROM user WHERE userId = ${userId}`);

    return res.status(200).json(userRow[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         GET api/auth/login/github
// @DESCRIPTION   Login user with Github
// @ACCESS        Public
async function loginWithGithub(req, res) {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectURI = 'http://localhost:5000/api/auth/login/github/credential'
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectURI}&scope=user`);
}


// @ROUTE         GET api/auth/login/google/credential
// @DESCRIPTION   Google auth redirection url
// @ACCESS        Public
function makeTokenForGoogleAuth(req, res) {
  const jwtPayload = {
    user: { id: req.user }
  };

  jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
    if (err) throw err;
    res.cookie('token', token, { httpOnly: true });
    res.redirect('http://localhost:3000');
  });
}


// @ROUTE         GET api/auth/login/github/credential
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
async function makeTokenForGithubAuth(req, res) {
  const jwtPayload = {
    user: { id: req.githubUserId }
  };

  jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
    if (err) throw err;
    res.cookie('token', token, { httpOnly: true });
    res.redirect('http://localhost:3000');
  });
}

// @ROUTE         GET api/auth/logout
// @DESCRIPTION   Logout the user
// @ACCESS        Private
function logout(req, res) {
  res.status(200).cookie('token', '', { httpOnly: true, maxAge: '-1' }).json({ successMsg: 'Successfully logged out' });
}


module.exports = {
  checkAuthController,
  loginWithGithub,
  makeTokenForGoogleAuth,
  makeTokenForGithubAuth,
  logout
};
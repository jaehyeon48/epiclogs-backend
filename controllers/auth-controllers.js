const jwt = require('jsonwebtoken');
const pool = require('../configs/db-config');
const bcrypt = require('bcryptjs');
require('dotenv').config();


// @ROUTE         GET api/auth/check
// @DESCRIPTION   check authentication
// @ACCESS        Private
async function checkAuthController(req, res) {
  const userId = req.user.id;
  try {
    const [userRow] = await pool.query(`SELECT userId, firstName, lastName, email, avatar, authType FROM user WHERE userId = ${userId}`);

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

  try {
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true });
      // redirect to provided url after google auth successfully processed
      res.redirect('https://epiclogs.tk');
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         GET api/auth/login/github/credential
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
async function makeTokenForGithubAuth(req, res) {
  const jwtPayload = {
    user: { id: req.githubUserId }
  };

  try {
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true });
      res.redirect('http://localhost:3000');
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         GET api/auth/logout
// @DESCRIPTION   Logout the user
// @ACCESS        Private
function logout(req, res) {
  res.status(200).cookie('token', '', { httpOnly: true, maxAge: '-1' }).json({ successMsg: 'Successfully logged out' });
}


// @ROUTE         POST api/auth/signup
// @DESCRIPTION   Register user in local
// @ACCESS        Public
async function signUp(req, res) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const checkExistUser = await pool.query(`SELECT userId FROM user WHERE email = '${email}' AND authType = 'local'`);

    if (checkExistUser[0].length !== 0) {
      return res.status(400).json({ errorMsg: 'User already exists!' });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await pool.query(
      `INSERT INTO user (firstName, lastName, email, password, authType)
       VALUES ('${firstName}', '${lastName}' ,'${email}', '${encryptedPassword}', 'local')`);

    const jwtPayload = {
      user: { id: newUser.insertId }
    };

    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      // for deployment
      // res.status(201).cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ successMsg: 'User successfully created.' });

      // for development
      res.status(201).cookie('token', token, { httpOnly: true }).json({ successMsg: 'User successfully created.' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/auth/login/local
// @DESCRIPTION   Login user in local
// @ACCESS        Public
async function loginLocal(req, res) {
  const { email, password } = req.body;

  try {
    const [userRow] = await pool.query(`SELECT userId, password FROM user WHERE email = '${email}' AND authType = 'local'`);

    if (userRow[0] === undefined) {
      return res.status(400).json({ errorMsg: 'Email or password is invalid.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, userRow[0].password);

    if (!isPasswordMatch) {
      return res.status(400).json({ errorMsg: 'Email or password is invalid.' });
    }

    const jwtPayload = {
      user: { id: userRow[0].userId }
    };

    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      // for deployment
      // res.status(200).cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ successMsg: 'Login success.' });

      // for development
      res.status(200).cookie('token', token, { httpOnly: true }).json({ successMsg: 'Login success.' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  checkAuthController,
  loginLocal,
  loginWithGithub,
  makeTokenForGoogleAuth,
  makeTokenForGithubAuth,
  logout,
  signUp
};
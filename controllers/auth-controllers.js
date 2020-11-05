const jwt = require('jsonwebtoken');
const pool = require('../configs/db-config');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const { google } = require('googleapis');
const getCurrentISOTime = require('../utils/getCurrentTime');

const { deleteAvatarFromS3 } = require('../utils/aws-s3');
require('dotenv').config();

/*
  ***********************
  error code meaning
  -100: email error
  -101: nickname error
  ***********************
 */


// @ROUTE         GET api/auth/check
// @DESCRIPTION   check authentication
// @ACCESS        Private
async function checkAuthController(req, res) {
  const userId = req.user.id;
  try {
    const [userRow] = await pool.query(`SELECT userId, name, nickname, email, avatar, authType FROM user WHERE userId = ${userId}`);

    return res.status(200).json(userRow[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

async function loginWithGoogle(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  res.redirect(authUrl);
}


// @ROUTE         GET api/auth/login/google-callback
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
async function makeTokenForGoogleAuth(req, res) {
  const jwtPayload = {
    user: { id: req.googleUserId }
  };

  try {
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      res.cookie('UAID', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.redirect('https://epiclogs.tk');
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         GET api/auth/login/github
// @DESCRIPTION   Login user with Github
// @ACCESS        Public
async function loginWithGithub(req, res) {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectURI = process.env.GITHUB_CALLBACK_URI
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectURI}&scope=user`);
}


// @ROUTE         GET api/auth/login/github-callback
// @DESCRIPTION   Github auth redirection url
// @ACCESS        Public
async function makeTokenForGithubAuth(req, res) {
  const jwtPayload = {
    user: { id: req.githubUserId }
  };

  try {
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;
      res.cookie('UAID', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.redirect('https://epiclogs.tk');
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
  res.status(200).cookie('UAID', '', { httpOnly: true, sameSite: 'none', secure: true, maxAge: '-1' }).json({ successMsg: 'Successfully logged out' });
}


// @ROUTE         POST api/auth/signup
// @DESCRIPTION   Register user in local
// @ACCESS        Public
async function signUp(req, res) {
  const { name, nickname, email, password } = req.body;
  try {
    const [checkExistUser] = await pool.query(`SELECT userId FROM user WHERE email = ? AND authType = 'local'`, [email]);

    if (checkExistUser[0]) {
      return res.status(400).json({ errorCode: -100, errorMsg: 'User already exists!' });
    }

    const [checkExistNickname] = await pool.query(`SELECT userId FROM user WHERE nickname = ?`, [nickname]);

    if (checkExistNickname[0]) {
      return res.status(400).json({ errorCode: -101, errorMsg: 'Nickname is duplicated!' });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const creationTime = getCurrentISOTime();
    const [newUser] = await pool.query(
      `INSERT INTO user (name, nickname, email, password, authType, createdAt)
       VALUES (?, ?, ?, ?, 'local', ?)`, [name, nickname, email, encryptedPassword, creationTime]);

    const jwtPayload = {
      user: { id: newUser.insertId }
    };

    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;

      res.status(201).cookie('UAID', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ successMsg: 'User successfully created.' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/auth/nickname-duplicate
// @DESCRIPTION   Check if the nickname is duplicated or not
// @ACCESS        Public
async function checkNicknameDuplication(req, res) {
  const { nickname } = req.body;
  try {
    const [checkExistNickname] = await pool.query(`SELECT userId FROM user WHERE nickname = ?`, [nickname]);
    if (checkExistNickname[0]) {
      return res.status(200).json({ code: -101 });
    }

    return res.status(200).json({ code: 0 });

  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/auth/email-duplicate
// @DESCRIPTION   Check if the email is duplicated or not
// @ACCESS        Public
async function checkEmailDuplication(req, res) {
  const { email } = req.body;
  try {
    const [checkExistEmail] = await pool.query(`SELECT userId FROM user WHERE email = ?`, [email]);
    if (checkExistEmail[0]) {
      return res.status(200).json({ code: -100 });
    }

    return res.status(200).json({ code: 0 });

  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/auth/check-oauth-user
// @DESCRIPTION   Checking oauth user's existence
// @ACCESS        Public
async function checkOauthUser(req, res) {
  const { userId } = req.body;

  const decryptedUserId = CryptoJS.AES.decrypt(userId, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8);

  try {
    const [searchRes] = await pool.query(`SELECT userId FROM user WHERE userId = ?`, [decryptedUserId]);

    if (!searchRes[0]) {
      return res.json({ res: -1 });
    }
    return res.json({ res: 0 });
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
    const [userRow] = await pool.query(`SELECT userId, password FROM user WHERE email = ? AND authType = 'local'`, [email]);

    if (!userRow[0]) {
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

      res.cookie('UAID', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ successMsg: 'Login success.' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/auth/register-nickname
// @DESCRIPTION   Add nickname to oauth user
// @ACCESS        Public
async function registerNickname(req, res) {
  const { userId, nickname } = req.body;

  try {
    const [checkExistNickname] = await pool.query(`SELECT userId FROM user WHERE nickname = ?`, [nickname]);

    if (checkExistNickname[0]) {
      return res.status(400).json({ errorCode: -101, errorMsg: 'Nickname is duplicated!' });
    }

    await pool.query(`UPDATE user SET nickname = ? WHERE userId = ?`, [nickname, userId]);

    const jwtPayload = {
      user: { id: userId }
    };

    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => { // set expiresIn 12h for testing purpose.
      if (err) throw err;

      res.cookie('UAID', token, { httpOnly: true, sameSite: 'none', secure: true }).json({ successMsg: 'Login success.' });
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
  signUp,
  checkNicknameDuplication,
  checkEmailDuplication,
  checkOauthUser,
  loginWithGoogle,
  registerNickname
};
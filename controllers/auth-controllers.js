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

module.exports = {
  checkAuthController,
  makeTokenForGoogleAuth
};
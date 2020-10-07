const jwt = require('jsonwebtoken');
require('dotenv').config();

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
  makeTokenForGoogleAuth
};
const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/google/callback' // redirect URL
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

function loginWithGoogle(req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  res.json(url);
}

async function setGoogleCredentials(req, res) {
  console.log('me?');
}

module.exports = {
  loginWithGoogle,
  setGoogleCredentials
};
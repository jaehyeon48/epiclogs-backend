const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const pool = require('../configs/db-config');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/login/google/credential'
}, async (accessToken, refreshToken, profile, done) => {

}));
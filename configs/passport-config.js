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
  // retrieve user data from 'profile' response
  const firstName = profile['_json']['given_name'];
  const lastName = profile['_json']['family_name'];
  const email = profile['_json'].email;
  const avatar = profile['_json'].picture;

  // find user from the database
  const [isUserExist] = await pool.query(`SELECT userId FROM user WHERE email=${email} AND authType='google'`);


  if (isUserExist[0]) { // if the user exist, sign in the user

  }
  else { // if the user does not exist, sign up the new user
    if (avatar) {
      // if the avatar (image of the user) is exist, convert it into new file name
      // and save into the Amazon S3 bucket & DB
      const avatarExtension = avatar.match(/(.jpg|jpeg|.png)$/)[0];
      const avatarName = `${uuidv4()}.${avatarExtension}`;
    }
    await pool.query(`
    INSERT INTO user(firstName, lastName, email, password, avatar, authType)
    VALUES ('${firstName}', '${lastName}', '${email}', null, )
  `);
  }
}));
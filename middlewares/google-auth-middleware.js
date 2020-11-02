const axios = require('axios');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const pool = require('../configs/db-config');
const { v4: uuidv4 } = require('uuid');
const {
  uploadAvatarToS3
} = require('../utils/aws-s3');
require('dotenv').config();

async function googleAuthMiddleware(req, res, next) {
  const code = req.query.code;
  if (code) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const googleTokenRes = await axios.post(`https://oauth2.googleapis.com/token?code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URI)}&grant_type=authorization_code`, config);

      const googleUserInfo = jwt.decode(googleTokenRes.data['id_token']);

      const email = googleUserInfo.email;


      // check whether the google user is exists in the DB
      // and check if the user is exists but his/her nickname is null
      const [userInfo] = await pool.query(`SELECT userId, nickname FROM user WHERE email = '${email}' AND authType = 'google'`);

      if (userInfo[0] && userInfo[0].nickname) { // if the user exist, sign in the user
        req.googleUserId = userInfo[0].userId;
        next();
      }
      // google user is exists in DB, but nickname is null
      else if (userInfo[0] && !userInfo[0].nickname) {
        const encryptedNewUserId = CryptoJS.SHA3((userInfo[0].userId).toString(), { outputLength: 256 });
        return res.redirect(301, `https://epiclogs.tk/auth/n-name?u=${encryptedNewUserId}`);
      }
      // google user doesn't exist at all
      else {
        const firstName = googleUserInfo['given_name'];
        const lastName = googleUserInfo['family_name'];
        const name = `${firstName} ${lastName}`;
        const avatar = googleUserInfo.picture;
        let avatarFileName = null;
        if (avatar) {
          // if the avatar (image of the user) from google is exist, convert it into new file name
          // and save into the Amazon S3 bucket & DB
          const avatarImage = await axios.get(avatar, { responseType: 'arraybuffer' }); // download avatar
          const avatarExtension = avatar.match(/(.jpg|jpeg|.png)$/)[0];
          avatarFileName = `${uuidv4()}.${avatarExtension}`;
          uploadAvatarToS3(avatarFileName, Buffer.from(avatarImage.data, 'base64'));
        }
        const [newUserId] = await pool.query(`
            INSERT INTO user(name, email, avatar, authType)
            VALUES ('${name}', '${email}', '${avatarFileName}', 'google');`);

        const encryptedNewUserId = CryptoJS.SHA3((newUserId.insertId).toString(), { outputLength: 256 });
        return res.redirect(301, `https://epiclogs.tk/auth/n-name?u=${encryptedNewUserId}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = googleAuthMiddleware;
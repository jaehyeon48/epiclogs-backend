const axios = require('axios');
const jwt = require('jsonwebtoken');
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


      // check if the google user is exists in the DB
      const [isUserExist] = await pool.query(`SELECT userId FROM user WHERE email = '${email}' AND authType = 'google'`);

      if (isUserExist[0]) { // if the user exist, sign in the user
        req.googleUserId = isUserExist[0].userId;
        next();
      }
      else {
        const firstName = googleUserInfo['given_name'];
        const lastName = googleUserInfo['family_name'];
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
            INSERT INTO user(firstName, lastName, email, avatar, authType)
            VALUES ('${firstName}', '${lastName}', '${email}', '${avatarFileName}', 'google');`);

        req.googleUserId = newUserId.insertId;
        next();
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = googleAuthMiddleware;
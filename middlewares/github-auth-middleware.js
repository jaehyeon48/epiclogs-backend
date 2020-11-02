const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js');
const pool = require('../configs/db-config');

const {
  uploadAvatarToS3
} = require('../utils/aws-s3');


async function githubAuthMiddileware(req, res, next) {
  const code = req.query.code;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  try {
    const accessTokenResponse = await axios.post(`https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecret}&code=${code}`);

    const githubAccessToken = accessTokenResponse.data.slice(13).match(/.*(?=&scope)/)[0];

    const config = {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`
      }
    };

    const gitHubUserResponse = await axios.get('https://api.github.com/user', config);
    const gitHubUser = gitHubUserResponse.data;

    const username = gitHubUser.login;
    const avatar = gitHubUser['avatar_url'];

    const [userInfo] = await pool.query(`SELECT userId, nickname FROM user WHERE name = '${username}' AND authType = 'github'`);

    if (userInfo[0] && userInfo[0].nickname) { // if the user exist, sign in the user
      req.githubUserId = userInfo[0].userId;
      next();
    }
    // github user is exists in DB, but nickname is null
    else if (userInfo[0] && !userInfo[0].nickname) {
      const encryptedNewUserId = CryptoJS.AES.encrypt((userInfo[0].userId).toString(), process.env.AES_SECRET);
      return res.redirect(301, `https://epiclogs.tk/auth/n-name?u=${encryptedNewUserId}`);
    }
    else {
      let avatarFileName = null;
      if (avatar) {
        // if the avatar (image of the user) from github is exist, convert it into new file name
        // and save into the Amazon S3 bucket & DB
        const avatarImage = await axios.get(avatar, { responseType: 'arraybuffer' }); // download avatar
        // const avatarExtension = avatar.match(/(.jpg|jpeg|.png)$/)[0];
        avatarFileName = `${uuidv4()}.png`;
        uploadAvatarToS3(avatarFileName, Buffer.from(avatarImage.data, 'base64'));
      }
      const [newUserId] = await pool.query(`
        INSERT INTO user(name, avatar, authType) VALUES('${username}', '${avatarFileName}','github')`);

      const encryptedNewUserId = CryptoJS.AES.encrypt((newUserId.insertId).toString(), process.env.AES_SECRET);
      return res.redirect(301, `https://epiclogs.tk/auth/n-name?u=${encryptedNewUserId}`);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = githubAuthMiddileware;
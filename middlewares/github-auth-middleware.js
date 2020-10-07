const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
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

    /* !!!!!!!!!!!!!!! NOTE !!!!!!!!!!!!!!!
    * Just in case we don't get the email, we will not save user's email for github auth.
    * Instead of using email, we will save username into firstName of DB
    */
    const [isUserExist] = await pool.query(`SELECT userId FROM user WHERE firstName = '${username}' AND authType = 'github'`);

    if (isUserExist[0]) {
      req.githubUserId = isUserExist[0].userId;
      next();
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
        INSERT INTO user(firstName, avatar, authType) VALUES('${username}', '${avatarFileName}','github')`);

      req.githubUserId = newUserId.insertId;
      next();
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = githubAuthMiddileware;
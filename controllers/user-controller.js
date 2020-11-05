const pool = require('../configs/db-config');
const bcrypt = require('bcryptjs');

const {
  uploadAvatarToS3,
  deleteAvatarFromS3
} = require('../utils/aws-s3');


// @ROUTE         GET api/user/avatar/:nickname
// @DESCRIPTION   Get a user's avatar
// @ACCESS        Public
async function getAvatar(req, res) {
  const nickname = req.params.nickname;

  try {
    const [avatar] = await pool.query(`SELECT avatar FROM user WHERE nickname = ?`, [nickname]);
    return res.json({ avatar: avatar[0].avatar });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         PUT api/user/username
// @DESCRIPTION   Modify username
// @ACCESS        Private
async function modifyUsername(req, res) {
  const userId = req.user.id;
  const { newUsername } = req.body;

  try {
    await pool.query(`UPDATE user SET name = ? WHERE userId = ?`, [newUsername, userId]);

    return res.json({ successMsg: 'Modified username successfully' });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         PUT api/user/nickname
// @DESCRIPTION   Modify nickname
// @ACCESS        Private
async function modifyNickname(req, res) {
  const userId = req.user.id;
  const { newNickname } = req.body;

  try {
    await pool.query(`UPDATE user SET nickname = ? WHERE userId = ?`, [newNickname, userId]);

    return res.json({ successMsg: 'Successfully modified nickname' });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         PUT api/user/password
// @DESCRIPTION   Modify password
// @ACCESS        Private
async function modifyPassword(req, res) {
  const userId = req.user.id;
  const { newPassword } = req.body;

  try {
    const hashedPw = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE user SET password = ? WHERE userId = ?`, [hashedPw, userId]);

    return res.json({ successMsg: 'Successfully modified password' });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/user/avatar
// @DESCRIPTION   Upload user's avatar
// @ACCESS        Private
async function uploadUserAvatar(req, res) {
  const userId = req.user.id;
  const { imageName } = req.body;

  try {
    const [prevAvatar] = await pool.query(`SELECT avatar FROM user WHERE userId = ?`, [userId]);

    if (prevAvatar[0]) {
      deleteAvatarFromS3(prevAvatar[0].avatar);
    }

    await pool.query(`UPDATE user SET avatar = ? WHERE userId = ?`, [imageName, userId]);

    return res.json({ successMsg: 'Upload avatar successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         DELETE api/user/avatar
// @DESCRIPTION   Delete user's avatar
// @ACCESS        Private
async function deleteUserAvatar(req, res) {
  const userId = req.user.id;
  try {
    const [prevAvatar] = await pool.query(`SELECT avatar FROM user WHERE userId = ?`, [userId]);

    if (prevAvatar[0]) {
      deleteAvatarFromS3(prevAvatar[0].avatar);
      await pool.query(`UPDATE user SET avatar = '' WHERE userId = ?`, [userId]);
    }
    return res.json({ successMsg: 'Avatar deleted successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  getAvatar,
  modifyUsername,
  modifyNickname,
  modifyPassword,
  uploadUserAvatar,
  deleteUserAvatar
};
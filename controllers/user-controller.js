const pool = require('../configs/db-config');

const {
  uploadAvatarToS3,
  deleteAvatarFromS3
} = require('../utils/aws-s3');

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
  modifyUsername,
  uploadUserAvatar,
  deleteUserAvatar
};
const pool = require('../configs/db-config');

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

module.exports = {
  modifyUsername
};
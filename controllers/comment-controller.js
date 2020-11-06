const pool = require('../configs/db-config');
const getCurrentISOTime = require('../utils/getCurrentTime');

async function addComment(req, res) {
  try {
    const userId = req.user.id;
    const { postId, comment, tzOffset } = req.body;
    const commentTime = getCurrentISOTime(tzOffset);

    await pool.query(`INSERT INTO comment (userId, postId, commentText, createdAt)
    VALUES (?, ?, ?, ?)`, [userId, postId, comment, commentTime]);

    return res.json({ successMsg: 'Successfully added a comment.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  addComment
};
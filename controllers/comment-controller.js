const pool = require('../configs/db-config');
const getCurrentISOTime = require('../utils/getCurrentTime');

// @ROUTE         GET api/comment/post/:postId
// @DESCRIPTION   Get all comments of a post
// @ACCESS        Public
async function getCommentsOfPost(req, res) {
  const postId = req.params.postId
  try {
    const [postComments] = await pool.query(`SELECT commentId, userId, commentText, createdAt FROM comment WHERE postId = ? ORDER BY createdAt asc`, [postId]);
    return res.json({ comments: postComments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         POST api/comment/add
// @DESCRIPTION   Add a new comment
// @ACCESS        Private
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
  addComment,
  getCommentsOfPost
};
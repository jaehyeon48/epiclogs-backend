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


// @ROUTE         DELETE api/comment/:commentId
// @DESCRIPTION   Delete A comment
// @ACCESS        Private
async function deleteComment(req, res) {
  const userId = req.user.id;
  const commentId = req.params.commentId;

  try {
    const [checkCommentUserId] = await pool.query(`SELECT userId FROM comment WHERE commentId = ?`, [commentId]);

    if (checkCommentUserId[0].userId !== userId) {
      return res.status(401).json({ errorMsg: 'Invalid deletion request.' });
    }

    await pool.query(`DELETE FROM comment WHERE commentId = ?`, [commentId]);

    return res.json({ successMsg: 'Successfully deleted the comment.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  addComment,
  getCommentsOfPost,
  deleteComment
};
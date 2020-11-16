const pool = require('../configs/db-config');
const getCurrentISOTime = require('../utils/getCurrentTime');


// @ROUTE         GET api/reply/:commentId
// @DESCRIPTION   Get a comment's reply
// @ACCESS        Public
async function getReplyOfComment(req, res) {
  const commentId = req.params.commentId;

  try {
    const [reply] = await pool.query(`SELECT * FROM reply WHERE commentId = ?`, [commentId]);

    res.json(reply);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         GET api/reply/user/:userId
// @DESCRIPTION   Get reply commenter's info
// @ACCESS        Public
async function getReplyUserInfo(req, res) {
  const userId = req.params.userId

  try {
    const [replyUserInfo] = await pool.query(`SELECT nickname, avatar FROM user
      WHERE userId = ?`, [userId]);

    res.json({ replyUserInfo: replyUserInfo[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

// @ROUTE         POST api/reply/:commentId
// @DESCRIPTION   Add a reply
// @ACCESS        Private
async function addReply(req, res) {
  const userId = req.user.id;
  const commentId = req.params.commentId;
  const { reply } = req.body;

  try {
    const replyTime = getCurrentISOTime();
    await pool.query(`INSERT INTO reply (userId, commentId, replyText, createdAt)
      VALUES (?,?,?,?)`, [userId, commentId, reply, replyTime]);

    res.json({ successMsg: 'Successfully added a reply' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  getReplyOfComment,
  getReplyUserInfo,
  addReply
};
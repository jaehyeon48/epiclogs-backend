const pool = require('../configs/db-config');

// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
async function addPost(req, res) {
  const { title, tag, postBody, privacy } = req.body;
  const userId = req.user.id;

  try {
    const [newPost] = await pool.query(`INSERT INTO post (userId, title, body, privacy)
  VALUES (${userId}, ?, ?, ?)`, [title, postBody, privacy]);

    const newPostId = newPost.insertId;

    // add tag(s)
    if (tag.length > 0) {
      tag.forEach(async tagName => {
        const [tagId] = await pool.query(`SELECT tagId FROM tag WHERE tagName = ?`, [tagName]);

        if (!tagId[0]) {
          const [newTag] = await pool.query(`INSERT INTO tag (tagName) VALUES (?)`, [tagName]);

          await pool.query(`INSERT INTO postTag (postId, tagId)
        VALUES (${newPostId}, ${newTag.insertId})`);
        }
        else {
          await pool.query(`INSERT INTO postTag (postId, tagId)
        VALUES (${newPostId}, ${tagId[0].tagId})`);
        }
      });
    }

    const [userNickname] = await pool.query(`SELECT nickname FROM user WHERE userId = ${userId}`);
    res.status(200).json({
      url: `/${userNickname[0].nickname}/${newPostId}`,
      successMsg: 'successfully posted!'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}

module.exports = {
  addPost
};
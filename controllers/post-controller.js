const pool = require('../configs/db-config');
const getCurrentISOTime = require('../utils/getCurrentTime');

// @ROUTE         GET api/post/all/:startRange
// @DESCRIPTION   Get all public posts
// @ACCESS        Public
async function getAllPublicPosts(req, res) {
  const startRange = parseInt(req.params.startRange);
  const postResult = [];
  let didReachedLast = false;
  try {
    const [posts] = await pool.query(`SELECT postId, nickname, avatar, title, body, post.createdAt
    FROM post INNER JOIN user ON post.userId = user.userId WHERE post.privacy = 'public'
    ORDER BY post.createdAt desc LIMIT ${startRange}, 12`);

    if (!posts[0] && startRange > 0) { // if reached the last element of the table
      didReachedLast = true;
      return res.json({ post: [], didReachedLast });
    }
    if (!posts[0]) {
      return res.json({ post: [], didReachedLast });
    }

    for (const [i, post] of posts.entries()) {
      postResult.push(post);
      postResult[i].tags = [];
      const [postTags] = await pool.query(`SELECT tagName FROM tag INNER JOIN postTag
        ON postId = ? AND postTag.tagId = tag.tagId`, [post.postId]);

      postTags.forEach((tag) => {
        postResult[i].tags.push(tag.tagName);
      });
    }
    return res.json({ post: postResult, didReachedLast });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         GET api/post/:postId
// @DESCRIPTION   get a post
// @ACCESS        Public
async function getPost(req, res) {
  const postId = req.params.postId;

  try {
    const [post] = await pool.query(`SELECT title, body, createdAt FROM post
    WHERE postId = ?`, [postId]);
    return res.json(post[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         GET api/post/tags/:postId
// @DESCRIPTION   Get tags of a post
// @ACCESS        Public
async function getTags(req, res) {
  const postId = req.params.postId;

  try {
    const [tags] = await pool.query(`SELECT tagName FROM tag INNER JOIN postTag ON postId = ?
      AND postTag.tagId = tag.tagId`, [postId]);

    return res.json({ tags });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMsg: 'Internal Server Error' });
  }
}


// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
async function addPost(req, res) {
  const { title, tag, postBody, privacy, tzOffset } = req.body;
  const userId = req.user.id;

  const postTime = getCurrentISOTime(tzOffset);

  try {
    const [newPost] = await pool.query(`INSERT INTO post (userId, title, body, privacy, createdAt)
  VALUES (${userId}, ?, ?, ?, ?)`, [title, postBody, privacy, postTime]);

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
  getAllPublicPosts,
  getPost,
  getTags,
  addPost
};
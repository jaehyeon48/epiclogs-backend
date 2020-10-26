// @ROUTE         POST api/post/add
// @DESCRIPTION   add a new post
// @ACCESS        Private
async function addPost(req, res) {
  const { title, tag, postBody, privacy } = req.body;
  const authorId = req.user.id;

  console.log(title);
  console.log(tag);
  console.log(postBody);
  console.log(privacy);
  console.log(authorId);
}

module.exports = {
  addPost
};
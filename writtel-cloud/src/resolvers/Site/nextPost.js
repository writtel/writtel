import mongoose from 'mongoose';

const nextPost = async (site, { post: _id }) => {
  const Post = mongoose.model('Post');

  const post = await Post.findOne({ site: site.id, _id }).exec();
  const cursor = Post.find({
    site: site.id,
    publishedDate: { $gte: post.publishedDate },
  }).sort('publishedDate').cursor();

  let doc; let nextPost = false;
  while (doc = await cursor.next()) {
    if (nextPost) {
      return doc.toJSON();
    }

    if (doc._id.equals(post._id)) {
      nextPost = true;
    }
  }

  return null;
};

export default nextPost;

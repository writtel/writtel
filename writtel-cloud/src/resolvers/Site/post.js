import mongoose from 'mongoose';

const post = async (site, { path }) => {
  const Post = mongoose.model('Post');

  const post = await Post.findOne({ site: site.id, path }).exec();

  if (!post) {
    return null;
  }

  return post.toJSON();
};

export default post;

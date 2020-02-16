import mongoose from 'mongoose';
import requireRole from '../../utils/requireRole';

const deletePost = async (_, { site, post: _id }, context) => {
  const role = await requireRole(site, context.user, 'editor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to delete a post`);
  }

  const Post = mongoose.model('Post');
  const Block = mongoose.model('Block');

  const post = await Post.findOne({ site, _id }).exec();
  if (!post) {
    return {
      code: 'not-found',
      success: false,
      message: `Post ${_id} not found`,
    };
  }

  await Block.find({ site, post }).remove();
  await post.remove();

  return {
    code: 'success',
    success: true,
    message: `Post ${_id} deleted`,
  };
};

export default deletePost;

import mongoose from 'mongoose';
import requireRole from '../../utils/requireRole';

const deleteCategory = async (_, { site, category: _id }, context) => {
  const role = await requireRole(site, context.user, 'editor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to delete a category`);
  }

  const Category = mongoose.model('Category');
  const Post = mongoose.model('Post');

  const category = await Category.findOne({ site, _id }).exec();
  if (!category) {
    return {
      code: 'not-found',
      success: false,
      message: `Category ${_id} not found`,
    };
  }

  await category.remove();
  Category.updateMany({ site, parent: category._id }, {
    $set: { parent: category.parent },
  });
  Post.updateMany({ site, categories: category._id }, {
    $pull: { categories: category._id },
  });

  return {
    code: 'success',
    success: true,
    message: `Category ${category._id.toString()} deleted`,
  };
};

export default deleteCategory;

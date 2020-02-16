import mongoose from 'mongoose';

import requireRole from '../../utils/requireRole';

const updateCategory = async (_, {
  site,
  category: _id,
  slug,
  name,
  parent: parentId,
  content,
}, context) => {
  const role = await requireRole(site, context.user, 'editor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to update a category`);
  }

  const Category = mongoose.model('Category');

  const category = await Category.findOne({ site, _id }).exec();
  if (!category) {
    return {
      code: 'not-found',
      success: false,
      message: `Category ${_id} not found`,
    };
  }

  let parent;
  if (parentId) {
    parent = await Category.findOne({ site, _id: parentId }).exec();
    if (!parent) {
      return {
        code: 'not-found',
        success: false,
        message: `Parent category ${parentId} not found`,
      };
    }
  }

  if (slug) {
    category.slug = slug;
  }

  if (name) {
    category.name = name;
  }

  if (parentId || parentId === null) {
    category.parent = parentId;
  }

  if (content || content === '') {
    category.content = content;
  }

  await category.save();

  return {
    code: 'success',
    success: true,
    message: `Category ${category.id} updated`,
    category: category.toJSON(),
  };
};

export default updateCategory;

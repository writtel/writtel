import mongoose from 'mongoose';

import requireRole from '../../utils/requireRole';

const createCategory = async (_, {
  site,
  slug,
  name,
  parent = null,
  content = '',
}, context) => {
  const role = await requireRole(site, context.user, 'editor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to create a category`);
  }

  const Category = mongoose.model('Category');

  if (parent) {
    parent = await Category.findOne({ site, _id: parent }).exec();
    if (!parent) {
      return {
        code: 'not-found',
        success: false,
        message: `Parent category ${parent} not found`,
      };
    }
  }

  const category = new Category({
    site,
    slug,
    name,
    parent: parent && parent.id,
    content,
  });

  await category.save();

  return {
    code: 'success',
    success: true,
    message: `Category ${category.id} created`,
    category: category.toJSON(),
  };
};

export default createCategory;

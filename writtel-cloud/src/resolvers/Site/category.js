import mongoose from 'mongoose';

const category = async (site, { category: _id }) => {
  const Category = mongoose.model('Category');

  const category = await Category.findOne({ site: site.id, _id }).exec();

  if (!category) {
    return null;
  }

  return category.toJSON();
};

export default category;

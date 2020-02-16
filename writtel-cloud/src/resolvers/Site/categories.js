import mongoose from 'mongoose';

const categories = async (site) => {
  const Category = mongoose.model('Category');

  let categories = await Category.find({ site: site.id }).exec();
  categories = categories.map((category) => category.toJSON());
  return categories;
};

export default categories;

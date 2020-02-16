import mongoose from 'mongoose';

const categoryBySlug = async (site, { slug }) => {
  const Category = mongoose.model('Category');

  const category = await Category.findOne({ site: site.id, slug }).exec();

  if (!category) {
    return null;
  }

  return category.toJSON();
};

export default categoryBySlug;

import mongoose from 'mongoose';

const site = async (_, { domain }) => {
  const Site = mongoose.model('Site');

  const site = await Site.findOne({ domain });

  if (!site) {
    return null;
  }

  return site.toJSON();
};

export default site;

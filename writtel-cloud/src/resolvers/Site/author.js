import mongoose from 'mongoose';

const author = async (site, { author }) => {
  const Role = mongoose.model('Role');

  const role = await Role.findOne({ site: site.id, user: author }).exec();

  if (!role) {
    return null;
  }

  // don't leak subscriber and lower names to the world
  if (!['contributor', 'author', 'editor', 'admin'].includes(role.role)) {
    return null;
  }

  return {
    id: role._id.toString(),
    name: role.siteName,
  };
};

export default author;

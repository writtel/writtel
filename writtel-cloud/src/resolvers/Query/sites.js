import mongoose from 'mongoose';

const sites = async (_, params, { user }) => {
  const Role = mongoose.model('Role');
  const Site = mongoose.model('Site');

  const roles = await Role.find({
    user: user.id,
    role: {
      $in: [
        'contributor',
        'author',
        'editor',
        'admin',
      ],
    },
  }).exec();

  const sites = [];

  for (const role of roles) {
    const site = await Site.findOne({ _id: role.site }).exec();
    sites.push(site.toJSON());
  }

  return sites;
};

export default sites;

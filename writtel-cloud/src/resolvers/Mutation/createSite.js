import mongoose from 'mongoose';

const createSite = async (_, { domain, title }, { user }) => {
  const Site = mongoose.model('Site');
  const Role = mongoose.model('Role');

  if (!user) {
    return {
      code: 'auth-required',
      success: false,
      message: `Authenication required to create site ${domain}`,
    };
  }

  const site = new Site({
    domain,
    title,
  });

  await site.save();

  const role = new Role({
    site: site.id,
    user: user.id,
    role: 'admin',
    siteName: user.firstName,
  });

  await role.save();

  return {
    code: 'success',
    success: true,
    message: `Site ${domain} created`,
    site: site.toJSON(),
  };
};

export default createSite;

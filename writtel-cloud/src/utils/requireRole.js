import mongoose from 'mongoose';

const ROLES = [
  'none',
  'subscriber',
  'contributor',
  'author',
  'editor',
  'admin',
  'root',
];

const fillRoles = (roles) => {
  const out = [];
  for (const role of roles) {
    for (let i = ROLES.indexOf(role); i < ROLES.length; i++) {
      if (!out.includes(ROLES[i])) {
        out.push(ROLES[i]);
      }
    }
  }
  return out.sort((a, b) => {
    const ai = ROLES.indexOf(a);
    const bi = ROLES.indexOf(b);

    if (ai < bi) {
      return 1;
    }

    if (ai > bi) {
      return -1;
    }

    return 0;
  });
};

const requireRole = async (site, user, ...roles) => {
  roles = fillRoles(roles.map((x) => x.toLowerCase()));

  if (roles.includes('root') && user.root) {
    return 'root';
  }

  const Role = mongoose.model('Role');

  const role = await Role.findOne({
    site,
    user: user.id,
    role: { $in: roles },
  }).exec();

  if (!role) {
    return null;
  }

  return role.role;
};

export default requireRole;

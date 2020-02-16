import mongoose from 'mongoose';
import requireRole from '../../utils/requireRole';

const withRoles = (roles, query) => {
  if (roles) {
    return query.where({ role: { $in: roles } });
  }

  return query;
};

const users = async (site, { roles, cursor, limit = 20 }, context) => {
  const role = await requireRole(site.id, context.user, 'admin');
  if (!role) {
    throw new Error(`User ${context.user.email} not authorized to perform this query`);
  }

  const Role = mongoose.model('Role');
  const User = mongoose.model('User');

  if (cursor) {
    cursor = await withRoles(roles, Role.find({
      site: site.id,
      _id: { $lt: cursor },
    })).sort('-_id').cursor();
  } else {
    cursor = await withRoles(roles, Role.find({
      site: site.id,
    })).sort('-_id').cursor();
  }

  let doc; const users = [];
  while (users.length < limit && (doc = await cursor.next())) {
    const user = await User.findOne({ _id: doc.user }).exec();
    users.push({ ...doc.toJSON(), ...user.toJSON() });
  }

  cursor = doc ? doc._id.toString() : null;

  return {
    cursor,
    users,
  };
};

export default users;

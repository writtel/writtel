import mongoose from 'mongoose';

import Block from './Block';
import Category from './Category';
import Post from './Post';
import Role from './Role';
import Site from './Site';
import User from './User';

mongoose.Schema.Types.String.checkRequired((v) => v != null);

export default {
  Block,
  Category,
  Post,
  Role,
  Site,
  User,
};

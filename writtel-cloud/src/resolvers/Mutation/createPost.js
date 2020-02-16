import mongoose from 'mongoose';

import isValidDate from '../../utils/isValidDate';
import buildExcerpt from '../../utils/buildExcerpt';
import requireRole from '../../utils/requireRole';

const createPost = async (_, {
  site,
  path,
  type,
  template,
  title,
  author,
  publishedDate,
  categories = [],
  blocks,
}, context) => {
  const role = await requireRole(site, context.user, 'contributor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to create a post`);
  }

  const Role = mongoose.model('Role');
  const Category = mongoose.model('Category');
  const Post = mongoose.model('Post');
  const Block = mongoose.model('Block');

  if (!author) {
    author = context.user.id;
  }

  author = await Role.findOne({ site, user: author }).exec();
  if (!author) {
    return {
      code: 'not-found',
      success: false,
      message: `Author ${author} is not a site user`,
    };
  }
  if (!['contributor', 'author', 'editor', 'admin'].includes(author.role)) {
    return {
      code: 'not-found',
      success: false,
      message: `Author ${author} is not a contributor`,
    };
  }

  if (!isValidDate(publishedDate)) {
    return {
      code: 'invalid-data',
      success: false,
      message: `PublishedDate ${publishedDate} is not an ISO date string`,
    };
  }

  for (const category of categories) {
    const doc = await Category.findOne({ site, _id: category });
    if (!doc) {
      return {
        code: 'not-found',
        success: false,
        message: `Category ${category} not found`,
      };
    }
  }

  // normalize publishedDate and generate modified date
  publishedDate = new Date(publishedDate).toISOString();
  const modifiedDate = new Date().toISOString();

  const post = new Post({
    site,
    path,
    type,
    template,
    title,
    categories,
    author,
    publishedDate,
    modifiedDate,
  });

  await post.save();

  for (let block of blocks) {
    block = new Block(block);
    block.site = site;
    block.post = post._id;

    if (!block.excerpt) {
      block.excerpt = buildExcerpt(block.rendered);
    }

    await block.save();
  }

  return {
    code: 'success',
    success: true,
    message: `Post ${post._id} created at path ${post.path}`,
    post: post.toJSON(),
  };
};

export default createPost;

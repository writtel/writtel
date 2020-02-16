import mongoose from 'mongoose';

import isValidDate from '../../utils/isValidDate';
import buildExcerpt from '../../utils/buildExcerpt';
import requireRole from '../../utils/requireRole';

const updatePost = async (_, {
  site,
  post: _id,
  path,
  type,
  template,
  title,
  author: authorId,
  categories,
  publishedDate,
  blocks,
}, context) => {
  const role = await requireRole(site, context.user, 'contributor');
  if (!role) {
    throw new Error(`User ${context.user.email} is not authorized to update a post`);
  }

  const Post = mongoose.model('Post');
  const Role = mongoose.model('Role');
  const Block = mongoose.model('Block');
  const Category = mongoose.model('Category');

  if (publishedDate && !isValidDate(publishedDate)) {
    return {
      code: 'invalid-data',
      success: false,
      message: `PublishedDate ${publishedDate} is not an ISO date string`,
    };
  }

  const post = await Post.findOne({ site, _id }).exec();
  if (!post) {
    return {
      code: 'not-found',
      success: false,
      message: `Post ${_id} not found`,
    };
  }

  if (!post.author.equals(context.user.id) && ['contributor', 'author'].includes(role)) {
    throw new Error(`User ${context.user.email} is a ${role} and is not authorized to update other author's posts`);
  }

  if (authorId) {
    const author = await Role.findOne({
      site,
      user: authorId,
      role: { $in: ['contributor', 'author', 'editor', 'admin', 'root'] },
    }).exec();

    if (!author) {
      return {
        code: 'not-found',
        success: false,
        message: `Author ${author} is not a contributor`,
      };
    }

    post.author = authorId;
  }

  if (categories) {
    for (const categoryId of categories) {
      const category = await Category.findOne({ site, _id: categoryId }).exec();
      if (!category) {
        return {
          code: 'not-found',
          success: false,
          message: `Category ${categoryId} not found`,
        };
      }
    }

    post.categories = categories;
  }

  if (path) {
    post.path = path;
  }

  if (publishedDate) {
    post.publishedDate = new Date(publishedDate).toISOString();
  }

  if (type) {
    post.type = type;
  }

  if (template) {
    post.template = template;
  }

  if (title) {
    post.title = title;
  }

  await post.save();

  for (const { slug, ...block } of blocks) {
    if (block.rendered.trim() === '') {
      await Block.findOne({ site, post, slug }).remove();
    } else {
      if (!block.excerpt) {
        block.excerpt = buildExcerpt(block.rendered);
      }

      await Block.findOne({ site, post, slug }).update({ $set: block });
    }
  }

  return {
    code: 'success',
    success: true,
    message: `Post ${_id} updated at path ${post.path}`,
    post: post.toJSON(),
  };
};

export default updatePost;

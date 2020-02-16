import mongoose from 'mongoose';

const withTypesOrCategories = (types, categories, query) => {
  if (!types) {
    query = query.where({ type: { $in: ['post'] } });
  } else {
    query = query.where({ type: { $in: types } });
  }

  if (categories) {
    query = query.where({ categories: { $in: categories } });
  }

  return query;
};

const posts = async (site, {
  types,
  categories,
  cursor,
  order = 'desc',
  limit = 20,
}) => {
  const Post = mongoose.model('Post');

  if (!['desc', 'asc'].includes(order)) {
    throw new Error('Order must be asc or desc');
  }

  const cursorStart = cursor && await Post.findOne({ site: site.id, _id: cursor }).exec();
  cursor = withTypesOrCategories(types, categories, Post.find({
    site: site.id,
    ...(cursorStart && {
      publishedDate: (order === 'desc' ? { $lte: cursorStart.publishedDate }
        : { $gte: cursorStart.publishedDate }),
    }),
  })).sort(order === 'desc' ? '-publishedDate' : 'publishedDate').cursor();

  let doc; let found = !cursorStart; const posts = [];
  while ((posts.length < limit) && (doc = await cursor.next())) {
    if (found) {
      posts.push(doc.toJSON());
    }

    if (cursorStart && doc._id.equals(cursorStart._id)) {
      found = true;
    }
  }

  cursor = doc ? doc._id.toString() : null;

  return {
    cursor,
    posts,
  };
};

export default posts;

import mongoose from 'mongoose';

const blocks = async (post) => {
  const Block = mongoose.model('Block');

  let blocks = await Block.find({ post: post.id }).exec();
  blocks = blocks.map((block) => block.toJSON());

  return blocks;
};

module.exports = blocks;

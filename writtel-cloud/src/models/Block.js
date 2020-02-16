import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  slug: { type: String, required: true },
  rendered: { type: String, required: true },
  excerpt: { type: String, required: true },
  private: { type: Boolean, required: true, default: false },
  password: String,
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
});

schema.index({ post: 1, slug: 1 }, { unique: true });

export default mongoose.model('Block', schema);

import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  slug: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  content: { type: String, required: true, default: '' },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
});

schema.index({ site: 1, slug: 1 }, { unique: true });

export default mongoose.model('Category', schema);

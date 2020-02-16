import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  path: { type: String, required: true },
  type: { type: String, required: true },
  template: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  publishedDate: { type: Date, required: true },
  modifiedDate: { type: Date, required: true, default: Date.now },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      ret.publishedDate = doc.publishedDate.toISOString();
      ret.modifiedDate = doc.modifiedDate.toISOString();
    },
  },
});

schema.index({ site: 1, path: 1 }, { unique: true });

export default mongoose.model('Post', schema);

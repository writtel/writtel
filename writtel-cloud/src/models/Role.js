import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  siteName: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
});

schema.index({ site: 1, user: 1 }, { unique: true });

export default mongoose.model('Role', schema);

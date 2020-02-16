import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  domain: { type: String, required: true, unique: true },
  title: { type: String, required: true },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
});

export default mongoose.model('Site', schema);

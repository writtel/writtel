import mongoose from 'mongoose';
import crypto from 'crypto';

const secret = Buffer.from(
  process.env.SALT_SECRET || '52feeae3f2a479a705191ef4ecd940f6fb352bf0',
  'hex',
);

const getSaltFromEmail = async (email) => {
  email = email.toLowerCase();

  const User = mongoose.model('User');
  const user = await User.findOne({ email }).exec();

  if (user) {
    return user.salt;
  }

  email = Buffer.from(email, 'utf8');

  const hash = crypto.createHash('sha256');
  return new Promise((resolve, reject) => {
    hash.on('readable', () => {
      const data = hash.read();

      if (!data) {
        reject(new Error('Failed to create hash'));
        return;
      }

      resolve(data.toString('base64'));
    });

    hash.write(secret);
    hash.write(email);
    hash.end();
  });
};

export default getSaltFromEmail;

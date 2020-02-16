import mongoose from 'mongoose';
import { scrypt } from 'scrypt-js';
import getSaltFromEmail from '../../utils/getSaltFromEmail';

const createUser = async (_, {
  email,
  firstName,
  lastName,
  phone,
  password,
  hashed = false,
}) => {
  email = email.toLowerCase();
  const salt = await getSaltFromEmail(email);

  if (!hashed) {
    const saltBuf = Buffer.from(salt, 'base64');
    const pass = Buffer.from(password.normalize('NFKC'));
    const N = 1024; const r = 8; const p = 1;
    const dkLen = 32;

    password = Buffer.from(await scrypt(pass, saltBuf, N, r, p, dkLen)).toString('base64');
  }

  const User = mongoose.model('User');

  const user = new User({
    email,
    firstName,
    lastName,
    phone,
    password,
    salt,
  });

  await user.save();

  return {
    code: 'success',
    success: true,
    message: `User ${email} created`,
    user: user.toJSON(),
  };
};

export default createUser;

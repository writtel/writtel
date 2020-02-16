import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { scrypt } from 'scrypt-js';

import getSaltFromEmail from '../../utils/getSaltFromEmail';

const privateKey = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'jwt-private-key.pem'),
);

const login = async (_, { email, password, hashed = false }) => {
  email = email.toLowerCase();

  if (!hashed) {
    const salt = Buffer.from(await getSaltFromEmail(email), 'base64');
    const pass = Buffer.from(password.normalize('NFKC'));
    const N = 1024; const r = 8; const p = 1;
    const dkLen = 32;

    password = Buffer.from(
      await scrypt(pass, salt, N, r, p, dkLen),
    ).toString('base64');
  }

  const User = mongoose.model('User');

  const user = await User.findOne({ email, password }).exec();

  if (!user) {
    return {
      code: 'not-found',
      success: false,
      message: 'Invalid email or password combination',
    };
  }

  const token = await jwt.sign({
    id: user._id.toString(),
  }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '28 days',
    notBefore: 0,
    audience: '.com.writtel.cloud',
    issuer: '.com.writtel.cloud',
    subject: 'token',
  });

  return {
    code: 'success',
    success: true,
    message: 'Successfully logged in',
    token,
  };
};

export default login;

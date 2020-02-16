import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const publicKey = (() => {
  if (process.env.JWT_PUBLIC_KEY) {
    return Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64');
  }

  return fs.readFileSync(path.resolve(__dirname, '..', 'jwt-public-key.pem'));
})();

const verifyToken = async (authorization) => {
  if (!authorization) {
    return null;
  }

  const token = authorization.trim().split(/^[bB]earer\s+/)[1];
  const decoded = await jwt.verify(token, publicKey, {
    audience: '.com.writtel.cloud',
  });

  const User = mongoose.model('User');

  const user = await User.findOne({ _id: decoded.id }).exec();

  if (!user) {
    throw new Error(`User account ${decoded.id} does not exist`);
  }

  if (!user.enabled) {
    throw new Error(`User account ${decoded.id} is disabled`);
  }

  return user.toJSON();
};

const context = async ({ req, connection }) => {
  if (connection) {
    return connection.context;
  }

  const user = await verifyToken(req.get('Authorization'));

  return {
    user,
  };
};

export default context;

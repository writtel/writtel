import mongoose from 'mongoose';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import './models';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import context from './context';
import logger from './utils/logger';

mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31535000; includeSubDomains');
  }

  if (process.env.NODE_ENV === 'production' && req.get('X-Forwarded-Proto') !== 'https') {
    res.redirect(`https://${req.get('Host')}${req.originalUrl}`);
    return;
  }

  next();
});

const jsonParsers = [
  express.json({ limit: '16kb' }),
  express.json({ limit: '10mb' }),
];

app.use((req, res, next) => {
  const isAuthenticated = true;
  return jsonParsers[isAuthenticated ? 1 : 0](req, res, next);
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: true,
  playground: true,
  plugins: [
    logger,
  ],
});
server.applyMiddleware({ app, path: '/', cors: true });

const listener = app.listen(process.env.PORT || 5000, () => {
  process.stderr.write(`writtel-cloud listening on port ${listener.address().port}\n`);
});

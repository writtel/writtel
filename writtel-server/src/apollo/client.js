import uuid from 'uuid';
import {ApolloClient, createHttpLink, InMemoryCache, defaultDataIdFromObject} from '@apollo/client';

const withState = (cache) => {
  if (typeof window !== 'undefined' && typeof window.__WRITTEL_STATE__ !== 'undefined') {
    return cache.restore(window.__WRITTEL_STATE__);
  }
  return cache;
}

export const createClient = ({uri, fetch, token, ...options} = {}) => {
  const client = new ApolloClient({
    cache: withState(new InMemoryCache({
      dataIdFromObject: object => {
        switch (object.__typename) {
          default: return defaultDataIdFromObject(object);
        }
      }
    })),
    link: createHttpLink({
      uri,
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      fetch
    }),
    ...options
  });
  return client;
};

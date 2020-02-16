import React from 'react';
import {useQuery} from './apollo';
import {useSite} from './site';
import {usePost} from './post';

import * as queries from './queries';

export const useAuthor = () => {
  const site = useSite();
  const post = usePost();

  const {loading, error, data} = useQuery(queries.getAuthor, {
    variables: {
      domain: site.domain,
      author: post.author,
    },
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    throw error;
  }

  const author = Object.assign({}, data.site.author);
  delete author.__typename;

  return author;
};

export const Author = () => {
  const author = useAuthor();

  if (!author) {
    return null;
  }

  return (
    <>{author.name}</>
  );
}

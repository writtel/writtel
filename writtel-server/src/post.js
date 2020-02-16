import React, {createContext, useContext, useState, useEffect} from 'react';
import {useQuery} from './apollo';
import * as queries from './queries';
import {useSite} from './site';
const PostContext = createContext(null);

export const PostProvider = ({post, children}) => {
  return (
    <PostContext.Provider value={post}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);

export const useNextPost = () => {
  const site = useSite();
  const post = usePost();

  const {loading, error, data} = useQuery(queries.getNextPost, {
    variables: {
      domain: site.domain,
      post: post.id
    }
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    throw error;
  }

  if (!data.site.nextPost) {
    return null;
  }

  const nextPost = Object.assign({}, data.site.nextPost);
  delete nextPost.__typename;

  return nextPost;
};

export const usePrevPost = () => {
  const site = useSite();
  const post = usePost();

  const {loading, error, data} = useQuery(queries.getPrevPost, {
    variables: {
      domain: site.domain,
      post: post.id
    }
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    throw error;
  }

  if (!data.site.prevPost) {
    return null;
  }

  const prevPost = Object.assign({}, data.site.prevPost);
  delete prevPost.__typename;

  return prevPost;
};

export const usePosts = ({ types, category, categories, limit, withBlocks = false } = {}) => {
  const site = useSite();

  if (category) {
    categories = [category];
  }

  const {loading, error, data, fetchMore} = useQuery(withBlocks ? withBlocks === 'excerpts' ? queries.getPostsWithExcerpts : queries.getPostsWithBlocks : queries.getPosts, {
    variables: {
      domain: site.domain,
      types,
      categories,
      limit,
    }
  });

  if (loading && !data) {
    return [[], () => {}];
  }

  if (error) {
    throw error;
  }

  const { cursor, posts } = data.site.posts;

  if (!cursor) {
    return [posts];
  }

  const _fetchMore = async (_limit = limit) => {
    await fetchMore({
      variables: {
        domain: site.domain,
        types,
        categories,
        cursor,
        limit: _limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const newPosts = fetchMoreResult.site.posts.posts;
        const newCursor = fetchMoreResult.site.posts.cursor;

        return Object.assign({}, prev, {
          site: Object.assign({}, prev.site, {
            posts: Object.assign({}, prev.site.posts, {
              cursor: newCursor,
              posts: [...prev.site.posts.posts, ...newPosts],
            }),
          }),
        });
      }
    });
  };

  return [posts, _fetchMore];
};

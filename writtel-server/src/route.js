import React from 'react';
import {useQuery} from './apollo';
import {useLocation} from 'react-router-dom';

import {SiteProvider} from './site';
import {PostProvider} from './post';
import * as queries from './queries';

const matchDecorators = (decorators) => {
  const location = useLocation();
  const out = [];

  for (const path in decorators) {
    if (location.pathname.substring(0, path.length) === path) {
      out.push(...decorators[path]);
    }
  }
  return out;
}

export const DecorateRoute = ({decorators, children}) => {
  decorators = matchDecorators(decorators);
  const child = React.Children.only(children);

  let Child = () => children;
  Child.templateOptions = child.type.templateOptions;
  
  for (const Decorator of decorators.reverse()) {
    Child = ((Child) => <Decorator><Child /></Decorator>).bind(null, Child);
    Child.templateOptions = child.type.templateOptions;
  }

  return <Child />;
};

export const ComponentRoute = ({component: Component, decorators, onResolve, url}) => {
  const {loading, error, data} = useQuery(queries.getSite, {
    variables: {
      domain: url.host,
    },
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    return <div>{error.toString()}</div>
  }

  const site = Object.assign({}, data.site);
  delete site.__typename;

  if (onResolve) {
    onResolve(Component);
  }

  return (
    <SiteProvider site={site}>
      <DecorateRoute decorators={decorators}>
        <Component />
      </DecorateRoute>
    </SiteProvider>
  );
};

export const PostRoute = ({component: Component, decorators, url}) => {
  const {loading, error, data} = useQuery(queries.getPost, {
    variables: {
      domain: url.host,
      path: url.pathname
    },
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    throw error;
  }

  const site = Object.assign({}, data.site);
  delete site.post;
  delete site.__typename;

  const post = Object.assign({}, data.site.post);
  delete post.__typename;

  return (
    <SiteProvider site={site}>
      <PostProvider post={post}>
        <DecorateRoute decorators={decorators}>
          <Component />
        </DecorateRoute>
      </PostProvider>
    </SiteProvider>
  )
};

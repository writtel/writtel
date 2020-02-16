import React, {useState, useEffect} from 'react';
import {hydrate} from 'react-dom';
import {ApolloProvider, createClient, useQuery, useMutation} from './apollo';
import {BrowserRouter, Route, Switch, useLocation} from 'react-router-dom';
import queryString from 'query-string';


import * as queries from './queries';
import {PostProvider} from './post';
import {SiteProvider} from './site';
import {AppContext, useApp} from './app-context';
import Editor from './editor';
import {install as installAdmin} from './admin';
import {ComponentRoute, DecorateRoute} from './route';
import getCookie from './utils/getCookie';

const WrittelClientTable = new WeakMap();

class WrittelClient {
  constructor() {
    WrittelClientTable.set(this, {
      templates: {},
      routes: {},
      decorators: {},
      options: {
        cloud: window.__WRITTEL_CLOUD__,
      },
    });
  }

  start() {
    const _ = WrittelClientTable.get(this);

    installAdmin(this);

    const client = createClient({
      uri: _.options.cloud,
      ssrForceFetchDelay: 100,
      token: getCookie('token'),
    });

    const location = Object.assign({}, window.location);
    location.host = window.__WRITTEL_SITE__;

    const App = (
      <AppContext.Provider value={this}>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <Switch>
              {Object.keys(_.routes).map(path => (
                <Route key={path} path={path} exact={_.routes[path].exact}>
                  <ComponentRoute url={location} decorators={_.decorators} component={_.routes[path].component} />
                </Route>
              ))}
              <Route path="*">
                <Template templates={_.templates} decorators={_.decorators} url={location} editing={!!window.__WRITTEL_EDITING__} />
              </Route>
            </Switch>
          </BrowserRouter>
        </ApolloProvider>
      </AppContext.Provider>
    );

    const writtelRoot = document.getElementById('writtel-root');
    hydrate(App, writtelRoot);
  }

  stop() {

  }

  addTemplate(id, template) {
    const _ = WrittelClientTable.get(this);
    _.templates[id] = template;
  }

  addDecorator(path, decorator) {
    const _ = WrittelClientTable.get(this);
    _.decorators[path] = _.decorators[path] || [];
    _.decorators[path].push(decorator);
  }

  setDefaultTemplate(id) {
    const _ = WrittelClientTable.get(this);
    _.defaultTemplate = id;
  }

  getDefaultTemplate() {
    const _ = WrittelClientTable.get(this);
    if (_.defaultTemplate in _.templates) {
      return _.defaultTemplate;
    } else {
      return Object.keys(_.template)[0];
    }
  }

  route(path, component, exact = true) {
    const _ = WrittelClientTable.get(this);
    _.routes[path] = {
      component,
      exact
    };
  }

  getRoutes() {
    const _ = WrittelClientTable.get(this);
    return Object.assign({}, _.routes);
  }

  get isClient() {
    return true;
  }

  get isServer() {
    return false;
  }
}

export const Template = ({templates, decorators, url, onResolve}) => {
  const app = useApp();
  const location = useLocation();

  const query = queryString.parse(location.search);
  let _editing = 'edit' in query;

  const {loading, error, data} = useQuery(queries.getPost, {
    variables: {
      domain: url.host,
      path: location.pathname,
    },
  });

  // server will render in none-editing state,
  // defer editing to next tick to prevent hydrate error
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    setEditing(_editing);
  }, [_editing]);

  if (loading && !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  const site = Object.assign({}, data.site);
  delete site.__typename;
  delete site.post;

  const post = Object.assign({}, {
    path: url.pathname,
    type: 'post',
    template: app.getDefaultTemplate(),
    title: '',
    blocks: [],
  }, data.site.post);
  delete post.__typename;

  if (!post.id && !_editing) {
    return null;
  }

  const Template = templates[post.template];

  if (onResolve) {
    onResolve(Template);
  }

  return (
    <SiteProvider site={site}>
      <PostProvider post={post}>
        <DecorateRoute decorators={decorators}>
          <Template />
        </DecorateRoute>
      </PostProvider>
    </SiteProvider>
  )
};

export default WrittelClient;

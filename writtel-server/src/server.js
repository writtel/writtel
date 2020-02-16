import React from 'react';
import express from 'express';
import {renderToString, renderToStaticMarkup} from 'react-dom/server';
import {ApolloProvider, createClient} from './apollo';
import {getDataFromTree} from '@apollo/react-ssr';
import {StaticRouter, Switch, Route} from 'react-router';
import fetch from 'node-fetch';
import path from 'path';
import cookieParser from 'cookie-parser';

import {SiteContext} from './site';
import {PostContext} from './post';
import {AppContext} from './app-context';
import {Template} from './client';
import {install as installAdmin} from './admin';
import {ComponentRoute, PostRoute} from './route';

const WrittelServerTable = new WeakMap();

class WrittelServer {
  constructor(options = {}) {
    WrittelServerTable.set(this, {
      templates: {},
      routes: {},
      decorators: {},
      options: Object.assign({}, {
        cloud: 'http://localhost:5000/',
        //cloud: 'http://localhost:5000/writtel-cloud/us-central1/graphql',
        //cloud: 'https://us-central1-writtel-cloud.cloudfunctions.net/graphql',
      }, options),
    });
  }

  start() {
    const _ = WrittelServerTable.get(this);
    _.app = express();
    if (process.env.WRITTEL_ASSETS_PORT) {
      const proxy = require('http-proxy-middleware');
      _.app.use('/_w/assets', proxy({
        target: `http://localhost:${process.env.WRITTEL_ASSETS_PORT}`
      }));
      _.app.use('/sockjs-node', proxy({
        target: `http://localhost:${process.env.WRITTEL_ASSETS_PORT}`,
        ws: true,
      }));
    } else {
      _.app.use('/_w/assets', express.static(path.resolve(process.cwd(), 'dist')));
    }
    _.app.use(cookieParser());
    _.app.get('/*', (req, res, next) => {
      const editing = 'edit' in req.query;

      const client = createClient({
        ssrMode: true,
        uri: _.options.cloud,
        fetch,
        token: req.cookies.token,
      });

      let site, template;
      const context = {};

      const App = (
        <AppContext.Provider value={this}>
          <ApolloProvider client={client}>
            <StaticRouter location={req.originalUrl} context={context}>
              <Switch>
                {Object.keys(_.routes).map(path => {
                  return (
                    <Route exact={_.routes[path].exact} path={path} key={path}>
                      <ComponentRoute
                        component={_.routes[path].component}
                        decorators={_.decorators}
                        onResolve={(t) => {
                          template = t;
                        }}
                        url={{
                          host: process.env.WRITTEL_SITE || req.get('Host'),
                          pathname: req.path
                        }}
                      />
                    </Route>
                  )
                })}
                <Route path="*">
                  <Template
                    templates={_.templates}
                    decorators={_.decorators}
                    onResolve={(t) => {
                      template = t;
                    }}
                    url={{
                      host: process.env.WRITTEL_SITE || req.get('Host'),
                      pathname: req.path,
                    }}
                    editing={'edit' in req.query}
                  />
                </Route>
              </Switch>
            </StaticRouter>
          </ApolloProvider>
        </AppContext.Provider>
      );

      getDataFromTree(App).then(async () => {
        delete context.url;
        delete context.state;

        const html = renderToString(App);

        if (!template) {
          next();
          return;
        }

        if (context.url) {
          console.info(context);
          res.redirect(context.url);
          return;
        }

        if (!html) {
          next();
          return;
        }

        const initialState = client.extract();

        const templateOptions = template.templateOptions();

        const head = templateOptions.head;

        const Head = (
          <AppContext.Provider value={this}>
            <ApolloProvider client={client}>
              <StaticRouter location={req.originalUrl} context={context}>
                <Switch>
                  {Object.keys(_.routes).map(path => {
                    return (
                      <Route exact={_.routes[path].exact} path={path} key={path}>
                        <ComponentRoute
                          component={head}
                          url={{
                            host: process.env.WRITTEL_SITE || req.get('Host'),
                            pathname: req.path
                          }}
                        />
                      </Route>
                    )
                  })}
                  <Route path="*">
                    <PostRoute
                      component={head}
                      url={{
                        host: process.env.WRITTEL_SITE || req.get('Host'),
                        pathname: req.path
                      }}
                    />
                  </Route>
                </Switch>
              </StaticRouter>
            </ApolloProvider>
          </AppContext.Provider>
        );

        await getDataFromTree(Head);

        const headContent = renderToStaticMarkup(Head);

        res.send(`<!DOCTYPE html>
<html>
  <head>
    ${headContent}
    <link rel="stylesheet" href="/_w/assets/site.bundle.css" />
  </head>
  <body>
    <div id="writtel-root">${html}</div>
    <script>
      window.__WRITTEL_CLOUD__ = ${JSON.stringify(_.options.cloud).replace(/</g, '\\u003c')};
      window.__WRITTEL_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\u003c')};
      window.__WRITTEL_EDITING__ = ${JSON.stringify(!!editing)};
      window.__WRITTEL_SITE__ = ${JSON.stringify(process.env.WRITTEL_SITE || req.get('Host'))}
    </script>
    <script src="/_w/assets/site.bundle.js"></script>
  </body>
</html>
`);
      }).catch(err => next(err))
    });
    installAdmin(this);
    _.app.listen(process.env.PORT, () => {

    });
  }

  stop() {
    const _ = WrittelServerTable.get(this);
  }

  addTemplate(id, template) {
    const _ = WrittelServerTable.get(this);
    _.templates[id] = template;
  }

  addDecorator(path, decorator) {
    const _ = WrittelServerTable.get(this);
    _.decorators[path] = _.decorators[path] || [];
    _.decorators[path].push(decorator);
  }

  setDefaultTemplate(id) {
    const _ = WrittelServerTable.get(this);
    _.defaultTemplate = id;
  }

  getDefaultTemplate() {
    const _ = WrittelServerTable.get(this);
    if (_.defaultTemplate in _.templates) {
      return _.defaultTemplate;
    } else {
      return Object.keys(_.template)[0];
    }
  }

  route(path, component, exact = true) {
    const _ = WrittelServerTable.get(this);
    _.routes[path] = {
      component,
      exact
    };
  }

  get isClient() {
    return false;
  }

  get isServer() {
    return true;
  }
}

export default WrittelServer;

import React, {useRef, useState, useEffect} from 'react';
import {useQuery} from '@apollo/client';
import debounce from 'lodash.debounce';
import {Link} from 'react-router-dom';

import * as queries from '../queries';
import {useSite} from '../site';
import {Author} from '../author';
import {usePosts, PostProvider} from '../post';
import {CategoryList, useCategory, useCategories} from '../category';
import Dashboard from './dashboard';
import Editor from './editor';
import Login from './login';
import WordpressImport from './wp-import';
import getScrollParent from '../utils/getScrollParent';
import getOffsetParent from '../utils/getOffsetParent';

import moment from 'moment';

const LoadMore = ({onLoadMore}) => {
  const div = useRef(null);
  const [loading, setLoading] = useState(false);

  const parent = div.current && getScrollParent(div.current);

  const handlerDebounced = debounce(async () => {
    await onLoadMore();
    setLoading(false);
  }, 100);

  const handler = () => {
    if (loading) {
      return;
    }

    if (parent) {
      const offset = getOffsetParent(div.current, parent);
      if (parent.offsetHeight + parent.scrollTop >= offset.top) {
        setLoading(true);
        handlerDebounced();
      }
    }
  };

  useEffect(() => {
    if (parent && onLoadMore) {
      parent.addEventListener('scroll', handler, false);
      return () => parent.removeEventListener('scroll', handler, false);
    }
  });

  useEffect(() => {
    if (parent && onLoadMore) {
      handler();
    }
  });

  return (
    <div ref={div}>
      {loading && (
        <p>Loading...</p>
      )}
    </div>
  );
};

const indent = (indent) => {
  let out = '';
  for (let i = 0; i < indent; i++) {
    out += '--';
  }
  return out + ' ';
};

const Posts = () => {
  const [category, setCategory] = useState();
  const categories = useCategories();
  const [posts, fetchMore] = usePosts({ category });

  return (
    <>
      <div>Posts</div>
      <div>
        <button>All</button> |
        <button>Published</button> |
        <button>Bin</button>
        <span>Category:</span>
        <select onChange={(event) => setCategory(event.target.value)}>
          <option value={null}></option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{indent(category.indent)}{category.name}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            <th>Title</th>
            <th>Author</th>
            <th>Categories</th>
            <th>Tags</th>
            <th>Statistics</th>
            <th>Comments</th>
            <th>Likes</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <PostProvider post={post} key={post.id}>
              <tr>
                <td><input type="checkbox" /></td>
                <td><Link to={`${post.path}?edit`}>{post.title}</Link></td>
                <td><Author /></td>
                <td><CategoryList /></td>
                <td />
                <td />
                <td />
                <td />
                <td>{moment(post.publishedDate).local().format('Do MMM YYYY HH:mm')}</td>
              </tr>
            </PostProvider>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={9}><LoadMore onLoadMore={fetchMore} /></td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};

Posts.templateOptions = () => ({
  title: 'Posts',
  head: () => {
    const site = useSite();

    return (
      <>
        <title>Posts | {site.title}</title>
      </>
    );
  },
});

export const install = (app) => {
  app.addDecorator('/', Dashboard);
  app.addDecorator('/', Editor);
  app.route('/_w/login', Login);
  app.route('/_w/posts', Posts);
  app.route('/_w/wp-import', WordpressImport);
};

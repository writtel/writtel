import WrittelServer from './server';

import {useApp} from './app-context';
import {useSite} from './site';
import {Author, useAuthor} from './author';
import {PostProvider, usePost, useNextPost, usePrevPost, usePosts} from './post';
import {CategoryList, useBlock, Block} from './block';
import {useCategory, useCategories, CategoryBlock, CategoryList} from './category';
import {useParams, useLocation, useHistory, useRouteMatch, Link} from 'react-router-dom';

Object.assign(WrittelServer, {
  useApp,
  useSite,
  usePost,
  useNextPost,
  usePrevPost,
  usePosts,
  useAuthor,
  useBlock,
  useCategory,
  useCategories,
  useParams,
  useLocation,
  useHistory,
  useRouteMatch,
  Author,
  PostProvider,
  CategoryList,
  Block,
  CategoryBlock,
  Link
});

export default WrittelServer;
export {
  useApp,
  useSite,
  usePost,
  useNextPost,
  usePrevPost,
  usePosts,
  useAuthor,
  useBlock,
  useCategory,
  useCategories,
  useParams,
  useLocation,
  useHistory,
  useRouteMatch,
  Author,
  PostProvider,
  CategoryList,
  Block,
  CategoryBlock,
  Link
};

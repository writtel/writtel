import React from 'react';
import {useQuery} from './apollo';

import * as queries from './queries';
import {useSite} from './site';
import {usePost} from './post';
import commaSeparatedList from './utils/commaSeparatedList';

export const useCategory = (slug) => {
  const site = useSite();

  if (!slug) {
    return null;
  }

  let category;
  if (typeof slug === 'object') {
    category = slug.id;
  }

  const {loading, error, data} = useQuery(category ? queries.getCategory : queries.getCategoryBySlug, {
    variables: {
      domain: site.domain,
      category,
      slug: category ? undefined : slug,
    },
  });

  if (loading && !data) {
    return null;
  }

  if (error) {
    throw error;
  }

  const c = Object.assign({}, data.site.categoryBySlug || data.site.category);
  delete c.__typename;

  return c;
};

export const CategoryBlock = ({slug}) => {
  const c = useCategory(slug);

  if (!c) {
    return null;
  }

  return (
    <div dangerouslySetInnerHTML={{__html: c.content}} />
  );
};

const categoriesWithParent = (categories, parent, indent) => {
  return categories.filter(c => c.parent === parent).sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  }).map(c => Object.assign({}, c, {indent}));
};

export const sortCategories = (categories) => {
  const out = [];

  const pushCategories = (parent, indent = 0) => {
    for (const category of categoriesWithParent(categories, parent, indent)) {
      out.push(category);
      pushCategories(category.id, indent + 1);
    }
  }
  pushCategories(null);

  return out;
};

export const useCategories = ({ withContent = false } = {}) => {
  const site = useSite();
  const {loading, error, data} = useQuery(withContent ? queries.getCategoriesWithContent : queries.getCategories, {
    variables: {
      domain: site.domain,
    },
  });

  if (loading && !data) {
    return [];
  }

  if (error) {
    throw error;
  }

  const categories = data.site.categories.map(c => {
    const category = Object.assign({}, c);
    delete category.__typename;
    return category;
  });

  return sortCategories(categories);
};

export const CategoryName = ({category: id}) => {
  const category = useCategory({ id });

  if (!category) {
    return <>{id}</>;
  }

  return <>{category.name}</>;
};

export const CategoryList = () => {
  const post = usePost();
  const categories = post.categories;

  return (
    <>
      {commaSeparatedList(categories, (category) => <CategoryName key={category} category={category} />)}
    </>
  );
};

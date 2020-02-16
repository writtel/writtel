import React, {Fragment} from 'react';
import {CategoryBlock, Block, useCategory, usePosts, useParams, useSite} from '@writtel/server';
import moment from 'moment';

export const CategoryPage = () => {
  const {slug} = useParams();
  const category = useCategory(slug);
  
  if (!category) {
    return null;
  }

  const [posts, fetchMore] = usePosts({category: category.id, withBlocks: 'excerpts'});

  return (
    <>
      <h1>{category.name}</h1>
      <CategoryBlock slug={category.slug} />

      {posts.map(post => (
        <Fragment key={post.id}>
          <h3>{post.title}</h3>
          <Block post={post} />
          <a href={post.path}>Continue reading...</a>
          <p>{moment(post.publishedDate).local().format('Do MMM YYYY')}</p>
        </Fragment>
      ))}
    </>
  )
};

CategoryPage.templateOptions = () => ({
  title: 'Category Page',
  head: () => {
    const site = useSite();
    const {slug} = useParams();
    const category = useCategory(slug);

    if (!category) {
      return null;
    }

    return (
      <>
        <title>{`${category.name} | ${site.title}`}</title>
      </>
    );
  }
})

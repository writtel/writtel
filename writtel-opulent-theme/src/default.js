import React from 'react';
import {Block, Link, useSite, usePost, useNextPost, usePrevPost} from '@writtel/server';
import moment from 'moment';
import styles from './default.module.scss';

const DefaultTemplate = () => {
  const post = usePost();
  const nextPost = useNextPost();
  const prevPost = usePrevPost();

  return (
    <div>
      <h3 className={styles.blockTitle}>Content Block</h3>
      <main>
        <h1>{post.title}</h1>
        <p>{moment(post.publishedDate).local().format('Do MMM YYYY')}</p>
        <article>
          <Block slug="content" title="Content" />
        </article>
        {prevPost && (
          <Link to={prevPost.path}>{prevPost.title}</Link>
        )}
        {nextPost && (
          <Link to={nextPost.path}>{nextPost.title}</Link>
        )}
      </main>
      <h3 className={styles.blockTitle}>Footer Block</h3>
      <Block slug="footer" title="Footer" />
    </div>
  )
};

DefaultTemplate.templateOptions = () => ({
  title: 'Default',
  head: () => {
    const site = useSite();
    const post = usePost();

    return (
      <>
        <title>{`${post.title} | ${site.title}`}</title>
      </>
    )
  }
});

export default DefaultTemplate;

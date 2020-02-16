import React, {useEffect} from 'react';
import {Link, Redirect, useLocation} from 'react-router-dom';
import queryString from 'query-string';
import {useUser} from '../user';
import styles from './dashboard.module.scss';

const Dashboard = ({children}) => {
  const child = React.Children.only(children);
  const {loading: loadingUser, user} = useUser();
  const location = useLocation();
  const query = queryString.parse(location.search);
  const isDashboardPage = /^\/_w\//.test(location.pathname) || ('edit' in query);
  
  useEffect(() => {
    if (!child || !isDashboardPage) {
      return;
    }

    document.body.classList.add(styles.body);

    return () => document.body.classList.remove(styles.body);
  });

  if (!child) {
    return null;
  }

  if (!isDashboardPage) {
    return child;
  }

  if (loadingUser) {
    return null;
  }

  if (!user) {
    return (
      <Redirect
        to={{
          pathname: "/_w/login",
          state: { from: location }
        }}
      />
    );
  }

  return (
    <>
      <div className={styles.content}>
        {child}
      </div>
      <div className={styles.contentBox} />
      <div className={styles.adminBar}>Writtel</div>
      <div className={styles.navBar}>
        <Link to="/_w/posts">All Posts</Link>
        <Link to="/_w/wp-import">Wordpress Importer</Link>
      </div>
    </>
  );
};

export default Dashboard;

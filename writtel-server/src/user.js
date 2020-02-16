import {useQuery} from './apollo';
import {useSite} from './site';
import * as queries from './queries';

export const useUser = () => {
  const {loading, error, data} = useQuery(queries.getUser);

  if (loading && !data) {
    return {loading: true, user: null};
  }

  if (error) {
    throw error;
  }

  return {loading: false, user: data.user};
};

export const useSiteUsers = ({roles, limit}) => {
  const site = useSite();
  const {loading, error, data, fetchMore} = useQuery(queries.getSiteUsers, {
    variables: {
      domain: site.domain,
      roles,
      limit
    }
  });

  if (loading && !data) {
    return [[], () => {}];
  }

  if (error) {
    throw error;
  }

  const { cursor, users } = data.site.users;

  if (!cursor) {
    return [users];
  }

  const _fetchMore = async (_limit = limit) => {
    await fetchMore({
      variables: {
        domain: site.domain,
        roles,
        cursor,
        limit: _limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const newUsers = fetchMoreResult.site.posts.users;
        const newCursor = fetchMoreResult.site.posts.cursor;

        return Object.assign({}, prev, {
          site: Object.assign({}, prev.site, {
            users: Object.assign({}, prev.site.users, {
              cursor: newCursor,
              users: [...prev.site.users.users, ...newUsers],
            }),
          }),
        });
      }
    });
  };

  return [users, _fetchMore];
}

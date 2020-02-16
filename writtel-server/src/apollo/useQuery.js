import {useApolloClient} from './context';
import {useQuery as _useQuery} from '@apollo/client';

export const useQuery = (query, options) => {
  const client = useApolloClient();
  return _useQuery(query, {
    ...options,
    client
  });
}

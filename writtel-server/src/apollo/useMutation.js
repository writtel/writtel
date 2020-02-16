import {useApolloClient} from './context';
import {useMutation as _useMutation} from '@apollo/client';

export const useMutation = (mutation, options) => {
  const client = useApolloClient();
  return _useMutation(mutation, {
    ...options,
    client
  });
}

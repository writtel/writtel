import React, {createContext, useContext} from 'react';

const ApolloContext = createContext();

export const useApolloClient = () => {
  return useContext(ApolloContext);
};

export const ApolloProvider = ({client, children}) => {
  return (
    <ApolloContext.Provider value={client}>
      {children}
    </ApolloContext.Provider>
  );
};

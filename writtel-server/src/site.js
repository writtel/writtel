import React, {useContext, createContext} from 'react';

const SiteContext = createContext();

export const useSite = () => {
  const site = useContext(SiteContext);
  return site;
};

export const SiteProvider = ({site, children}) => {
  return (
    <SiteContext.Provider value={site}>
      {children}
    </SiteContext.Provider>
  );
};

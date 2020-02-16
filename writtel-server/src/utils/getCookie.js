const getCookie = (cookie) => {
  const re = new RegExp(`(?:(?:^|.*;\s*)${cookie}\s*\=\s*([^;]*).*$)|^.*$`);
  return document.cookie.replace(re, "$1");
};

export default getCookie;

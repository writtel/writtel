const {JSDOM} = require('jsdom');

const injectSpaces = (wnd) => {
  const { document: doc, Node } = wnd;

  for (const childNode of Array.from(doc.body.childNodes)) {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      childNode.after(' ');
    }
  }

  for (const childNode of Array.from(doc.body.querySelectorAll('br'))) {
    childNode.after(' ');
  }
};

const buildExcerpt = (content) => {
  const wnd = new JSDOM(`<!DOCTYPE html><html><body>${content}</body></html>`).window;
  injectSpaces(wnd);
  const words = wnd.document.body.textContent.split(/\s+/g);

  if (words.length <= 55) {
    const excerpt = `<p>${words.join(' ')}</p>`;
    return excerpt;
  }

  const excerpt = `<p>${words.slice(0, 55).join(' ')} &hellip;</p>`;
  return excerpt;
};

module.exports = buildExcerpt;

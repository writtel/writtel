import React, {useRef, useState} from 'react';
import {useApolloClient} from '../apollo';
import {useSite} from '../site';
import {useSiteUsers} from '../user';
import useProcess from '../utils/useProcess';
import * as queries from '../queries';

const getText = (node, element) => {
  const text = node.getElementsByTagName(element)[0];
  if (text) {
    return text.textContent;
  }
}

const getMeta = (doc) => {
  const node = doc.querySelector('rss > channel');

  const title = getText(node, 'title');
  const link = getText(node, 'link');
  const description = getText(node, 'description');
  const pubDate = new Date(getText(node, 'pubDate'));
  const language = getText(node, 'language');
  const version = getText(node, 'wp:wxr_version');
  const baseSiteUrl = getText(node, 'wp:base_site_url');
  const baseBlogUrl = getText(node, 'wp:base_blog_url');

  return {
    title,
    link,
    description,
    pubDate,
    language,
    version,
    baseSiteUrl,
    baseBlogUrl
  };
}

const getAuthors = (doc, posts) => {
  const out = [];

  for (const author of Array.from(doc.querySelectorAll('rss > channel > author'))) {
    const id = getText(author, 'wp:author_id');
    const login = getText(author, 'wp:author_login');
    const email = getText(author, 'wp:author_email');
    const displayName = getText(author, 'wp:author_display_name');
    const firstName = getText(author, 'wp:author_first_name');
    const lastName = getText(author, 'wp:author_last_name');

    const count = {
      attachments: posts.filter(p => p.type === 'attachment' && p.creator === login).length,
      posts: posts.filter(p => p.type === 'post' && p.creator === login).length,
      pages: posts.filter(p => p.type === 'page' && p.creator === login).length,
    };

    out.push({
      id,
      login,
      email,
      displayName,
      firstName,
      lastName,
      count
    });
  }

  return out;
};

const getCategories = (doc) => {
  const out = [];

  for (const category of Array.from(doc.querySelectorAll('rss > channel > category'))) {
    const id = parseInt(getText(category, 'wp:term_id'), 10);
    const slug = getText(category, 'wp:category_nicename');
    const parent = getText(category, 'wp:category_parent') || null;
    const name = getText(category, 'wp:cat_name');
    const description = getText(category, 'wp:category_description') || '';

    out.push({
      id,
      slug,
      parent,
      name,
      description
    });
  }

  return out;
};

const categoriesWithParent = (categories, parent) => {
  return categories.filter(c => c.parent === parent).sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });
};

const sortCategories = (categories) => {
  const out = [];

  const pushCategories = (parent) => {
    for (const category of categoriesWithParent(categories, parent)) {
      out.push(category);
      pushCategories(category.slug);
    }
  }
  pushCategories(null);

  return out;
};

const getPosts = (doc) => {
  const out = [];

  for (const post of Array.from(doc.querySelectorAll('rss > channel > item'))) {
    const title = getText(post, 'title');
    const link = getText(post, 'link');
    const pubDate = getText(post, 'pubDate');
    const publishedDate = pubDate && new Date(pubDate).toISOString();
    const creator = getText(post, 'dc:creator');
    const guid = getText(post, 'guid');
    const description = getText(post, 'description');
    const content = getText(post, 'content:encoded');
    const excerpt = getText(post, 'excerpt:encoded');
    const id = getText(post, 'wp:post_id');
    const dateGMT = getText(post, 'wp:post_date_gmt').replace(/^(\d{4}-\d\d-\d\d) (\d{2}:\d{2}:\d{2})$/, '$1T$2Z').replace('0000-00-00T00:00:00Z', '');
    const date = dateGMT && new Date(dateGMT).toISOString();
    const commentStatus = getText(post, 'wp:comment_status');
    const pingStatus = getText(post, 'wp:ping_status');
    const name = getText(post, 'wp:post_name');
    const status = getText(post, 'wp:status');
    const parent = getText(post, 'wp:post_parent');
    const menuOrder = getText(post, 'wp:menu_order');
    const type = getText(post, 'wp:post_type');
    const password = getText(post, 'wp:post_password');
    const isSticky = getText(post, 'wp:is_sticky');
    const attachmentUrl = getText(post, 'wp:attachment_url');
    const metadata = {};
    for (const postmeta of Array.from(post.getElementsByTagName('wp:postmeta'))) {
      metadata[getText(postmeta, 'wp:meta_key')] = getText(postmeta, 'wp:meta_value');
    }
    const categories = [];
    for (const category of Array.from(post.getElementsByTagName('category'))) {
      categories.push(category.getAttribute('nicename'));
    }

    out.push({
      title,
      link,
      publishedDate,
      creator,
      guid,
      description,
      content,
      excerpt,
      id,
      date,
      commentStatus,
      pingStatus,
      name,
      status,
      parent,
      menuOrder,
      type,
      password,
      isSticky,
      attachmentUrl,
      metadata,
      categories,
      post
    });
  }

  return out;
}

const convertParagraph = (content) => {
  content = content.split(/(\r\n|\r|\n)/g).filter(x => !!x.trim()).join('<br/>\n');
  content = `<p>${content}</p>`;
  return content;
};

const convertTextBlock = (content) => {
  content = content.split(/(\r\n|\r|\n){2}/g).filter(x => !!x.trim()).map(x => convertParagraph(x)).join('\n');
  return content;
}

const isBlockElement = (node) => {
  const div = document.createElement('div');
  div.setAttribute('style','position:absolute; left:-9999px;');

  const el = document.createElement(node.nodeName);
  div.appendChild(el);
  document.body.appendChild(div);

  const result = getComputedStyle(el, null).getPropertyValue('display');
  document.body.removeChild(div);

  return result === 'block';
}

const contentToHTML = (content) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  fragment.appendChild(div);
  div.innerHTML = content;

  let blockNode = null;
  let blockEndRegex = null;

  let inlineWrapper = null;

  for (const node of Array.from(div.childNodes)) {
    if (inlineWrapper && node.nodeType === Node.TEXT_NODE && /^(\r|\r\n|\n)$/.test(node.textContent)) {
      inlineWrapper.appendChild(document.createElement('br'));
      node.remove();
    } else if (inlineWrapper && node.nodeType === Node.TEXT_NODE && /^(\r|\r\n|\n){2,}$/.test(node.textContent)) {
      inlineWrapper = null;
      node.remove();
    } else if (blockNode && node.nodeType === Node.COMMENT_NODE && blockEndRegex.test(node.textContent.trim())) {
      blockNode.remove();
      node.remove();
    } else if (node.nodeType === Node.TEXT_NODE) {
      const replacement = document.createElement('div');
      replacement.innerHTML = convertTextBlock(node.textContent.trim());
      for (const n of Array.from(replacement.childNodes)) {
        node.parentNode.insertBefore(n, node);
      }
      node.remove();
    } else if (node.nodeType === Node.COMMENT_NODE) {
      const textContent = node.textContent.trim();
      if (/^wp:/.test(textContent)) {
        blockNode = node;
        blockEndRegex = new RegExp(`^/${textContent}`);
      }
    } else if (!isBlockElement(node)) {
      if (inlineWrapper) {
        inlineWrapper.appendChild(node);
      } else {
        inlineWrapper = document.createElement('p');
        node.parentNode.insertBefore(inlineWrapper, node);
        inlineWrapper.appendChild(node);
      }
    } else if (isBlockElement(node) && inlineWrapper) {
      inlineWrapper = null;
    }
  }

  return div.innerHTML;
};

const WordpressImport = () => {
  const file = useRef();
  const client = useApolloClient();
  const site = useSite();
  const [siteUsers, fetchMoreSiteUsers] =
    useSiteUsers({limit: 100, roles: ['contributor', 'editor', 'admin']});
  const [doc, setDoc] = useState(null);
  const [meta, setMeta] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [categories, setCategories] = useState(null);
  const [posts, setPosts] = useState(null);
  const [userMappings, setUserMappings] = useState({});
  const log = useProcess();

  const onUploadBackup = () => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(reader.result, 'text/xml');

      const meta = getMeta(doc);
      const categories = sortCategories(getCategories(doc));
      const posts = getPosts(doc);
      const authors = getAuthors(doc, posts);
      console.info(doc.querySelectorAll('comment'));
      setDoc(doc);
      setMeta(meta);
      setCategories(categories);
      setPosts(posts);
      setAuthors(authors);

      const userMappings = {};
      for (const author of authors) {
        const user = siteUsers.find(user => author.email === user.email);
        if (user) {
          userMappings[author.id] = user.id;
        }
      }
      setUserMappings(userMappings);
    }, false);
    reader.readAsText(file.current.files[0]);
  };

  const setUserMappingsForAuthor = (author, id) => {
    if (id) {
      userMappings[author.id] = id;
    } else {
      delete userMappings[author.id];
    }
    setUserMappings(Object.assign({}, userMappings));
    console.info(userMappings);
  };

  const importCategory = async (category) => {
    log.info(`Checking category ${category.name}...`);

    var {data} = await client.query({
      query: queries.getCategoryBySlug,
      variables: {
        domain: site.domain,
        slug: category.slug,
      },
    });

    if (category.parent) {
      var {data: parentData} = await client.query({
        query: queries.getCategoryBySlug,
        variables: {
          domain: site.domain,
          slug: category.parent,
        },
      });
    }
    console.info(data, parentData);

    const content = contentToHTML(category.description);

    if (data.site.categoryBySlug) {
      log.info(`Updating category ${data.site.categoryBySlug.name}...`);
      var {data} = await client.mutate({
        mutation: queries.updateCategory,
        variables: {
          site: site.id,
          category: data.site.categoryBySlug.id,
          slug: category.slug,
          name: category.name,
          parent: parentData && parentData.site.categoryBySlug.id,
          content,
        },
      });
      if (!data.updateCategory.success) {
        throw new Error(data.updateCategory.message);
      }
    } else {
      log.info(`Creating category ${category.name}...`);
      var {data} = await client.mutate({
        mutation: queries.createCategory,
        variables: {
          site: site.id,
          slug: category.slug,
          name: category.name,
          parent: parentData && parentData.site.categoryBySlug.id,
          content,
        },
      });
      if (!data.createCategory.success) {
        throw new Error(data.createCategory.message);
      }
    }

    log.incr();
  };

  const loadCategories = async (categories) => {
    const out = [];
    for (const category of categories) {
      const {data} = await client.query({
        query: queries.getCategoryBySlug,
        variables: {
          domain: site.domain,
          slug: category
        },
      });

      out.push(data.site.categoryBySlug.id);
    }

    return out;
  };

  const importPost = async (post) => {
    if (!['post'].includes(post.type)) {
      log.info(`Skipping ${post.type} ${post.title}.`);
      log.incr();
      return;
    }

    const content = contentToHTML(post.content);

    if (post.type === 'post') {
      log.info(`Checking post ${post.title}...`);
      const link = post.link.substring(meta.baseSiteUrl.length);
      var {data} = await client.query({
        query: queries.getPost,
        variables: {
          domain: site.domain,
          path: link,
        },
      });

      const blocks = [
        {
          slug: 'content',
          rendered: content,
          private: !!post.password
        },
        {
          slug: 'footer',
          rendered: '',
          private: false
        }
      ];

      const author = userMappings[authors.find(x => x.login === post.creator).id];

      if (data.site.post) {
        log.info(`Updating post ${data.site.post.title}...`);
        var {data} = await client.mutate({
          mutation: queries.updatePost,
          variables: {
            site: site.id,
            post: data.site.post.id,
            publishedDate: post.publishedDate,
            template: 'default',
            title: post.title,
            author,
            type: 'post',
            categories: await loadCategories(post.categories),
            blocks,
          }
        });
        if (!data.updatePost.success) {
          throw new Error(data.updatePost.message)
        }
      } else {
        log.info(`Creating post ${post.title}...`);
        var {data} = await client.mutate({
          mutation: queries.createPost,
          variables: {
            site: site.id,
            path: link,
            publishedDate: post.publishedDate,
            template: 'default',
            title: post.title,
            author,
            type: 'post',
            categories: await loadCategories(post.categories),
            blocks,
          }
        });
        if (!data.createPost.success) {
          throw new Error(data.createPost.message);
        }
      }

      log.incr();
    }
  }

  const onClickImport = async () => {
    log.clear();
    log.setCounterMax(categories.length + posts.length);

    for (const category of categories) {
      await importCategory(category);
    }

    const promises = [];
    for (const post of posts) {
      promises.push(importPost(post));
      if (promises.length >= 20) {
        await Promise.all(promises.splice(0, promises.length));
      }
    }
    await Promise.all(promises);

    log.info('Finished');
  };

  return (
    <div>
      {!doc && <div><input type="file" ref={file} onChange={onUploadBackup} /></div>}
      {authors && authors.filter(a => !!a.count.pages || !!a.count.posts).map(author => (
        <div key={author.id}>
          <div>{author.login} - {author.email}</div>
          <div>{author.count.attachments} attachments</div>
          <div>{author.count.posts} posts</div>
          <div>{author.count.pages} pages</div>
          <div>
            <select value={userMappings[author.id]} onChange={event => setUserMappingsForAuthor(author, event.target.value)}>
              <option value="">(do not import)</option>
              {siteUsers.map(user => (
                <option key={user.id} value={user.id}>{user.siteName} - {user.email}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      {!!doc && <button onClick={onClickImport}>Import</button>}
      {log.render()}
    </div>
  );
};

WordpressImport.templateOptions = () => ({
  title: 'Wordpress Import Page',
  head: () => {
    const site = useSite();

    return (
      <>
        <title>Wordpress Import | {site.title}</title>
      </>
    );
  },
});

export default WordpressImport;

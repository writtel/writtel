import React, {useState, useEffect, createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import {renderToStaticMarkup} from 'react-dom/server';
import {Link, useLocation} from 'react-router-dom';
import queryString from 'query-string';

import {ApolloProvider, useApolloClient, useMutation} from '../apollo';
import {PostProvider, usePost, useSavePost} from '../post';
import {SiteProvider, useSite} from '../site';

import * as queries from '../queries';

import styles from './editor.module.scss';

const EditorContext = createContext();

export const useEditor = () => useContext(EditorContext);
export const useEditorRenderer = (handler) => {
  const editor = useEditor();
  useEffect(() => {
    editor.on('render', handler);
    return () => editor.removeListener('render', handler);
  });
}

const EditorTable = new WeakMap();

class EditorRenderer {
  constructor() {
    EditorTable.set(this, { blocks: [] });
  }

  render(slug, rendered) {
    const _ = EditorTable.get(this);
    if (_.blocks.find(block => block.slug === slug)) {
      throw new Error(`Block ${slug} already rendered`);
    }

    _.blocks.push({
      slug,
      rendered,
      private: false
    });
  }
}

class EditorImpl extends EventEmitter {

}

const Editor = ({children}) => {
  const template = React.Children.only(children);

  const client = useApolloClient();
  const site = useSite();
  const post = usePost();
  const location = useLocation();
  const query = queryString.parse(location.search);

  if (!post || !('edit' in query)) {
    return template;
  }

  const [editor] = useState(new EditorImpl());

  const [createPost] = useMutation(queries.createPost);
  const [updatePost] = useMutation(queries.updatePost);

  const [title, setTitle] = useState(post.title);
  const [path, setPath] = useState(post.path);

  useEffect(() => {
    if (!post) {
      return;
    }

    const templateOptions = template.type.templateOptions();
    const p = Object.assign({}, post, {title})

    const Head = () => (
      <ApolloProvider client={client}>
        <SiteProvider site={site}>
          <PostProvider post={p}>
            <templateOptions.head />
          </PostProvider>
        </SiteProvider>
      </ApolloProvider>
    );
    const html = renderToStaticMarkup(<Head />);

    const doc = document.createDocumentFragment();
    const head = document.createElement('head');
    doc.appendChild(head);
    head.innerHTML = html;
    document.title = doc.querySelector('head > title').textContent;
  }, [title]);

  const savePost = async (_post) => {
    var response;
    console.info('savePost', _post);
    if (post.id) {
      var {data: {updatePost: response}} = await updatePost({
        variables: {
          site: site.id,
          post: post.id,
          ..._post
        }
      });
    } else {
      var {data: {createPost: response}} = await createPost({
        variables: {
          site: site.id,
          ..._post
        }
      });
    }

    return response;
  };

  const onClickSave = async () => {
    const renderer = new EditorRenderer();
    editor.emit('render', renderer);
    const {blocks} = EditorTable.get(renderer);

    const _post = {
      path,
      type: post.type,
      template: post.template,
      title,
      blocks
    };

    const response = await savePost(_post);
    console.info(response);
    if (response.success && path !== location.pathname) {
      location.pathname = path;
    }
  };

  return (
    <div id="writtel-editor">
      <div id="writtel-editor-title">
        <Link to="/_w/posts">{'< Back'}</Link>
        <input type="text" value={title} onChange={event => setTitle(event.target.value)} />
        <input type="text" value={path} onChange={event => setPath(event.target.value)} />
        <button onClick={onClickSave}>Save</button>
      </div>
      <EditorContext.Provider value={editor}>
        {template}
      </EditorContext.Provider>
    </div>
  )
};

export default Editor;

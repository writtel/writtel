import React, {useState, useEffect} from 'react';
import {Editor, EditorState, ContentState, CompositeDecorator} from 'draft-js'
import {convertToHTML} from 'draft-convert';

import convertFromHTML from './draft/convertFromHTML';
import {usePost} from './post';
import {useEditor, useEditorRenderer} from './admin/editor';

export const useBlock = (slug, post = null) => {
  if (!post) {
    post = usePost();
  }
  const editor = useEditor();

  const block = post.blocks.find(b => b.slug === slug);

  if (!block) {
    return { slug, editing: !!editor, rendered: '', private: false };
  }

  return { editing: !!editor, ...block };
};

const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();

      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

const Link = ({contentState, entityKey, children}) => {
  const {url} = contentState.getEntity(entityKey).getData();
  return (
    <a href={url}>
      {children}
    </a>
  );
};

const EditBlock = ({block}) => {

  const {contentBlocks, entityMap} = convertFromHTML(block.rendered);
  const state = ContentState.createFromBlockArray(contentBlocks, entityMap);

  const decorators = [
    {
      strategy: findLinkEntities,
      component: Link,
    },
  ];

  const [editorState, setEditorState] = useState(EditorState.createWithContent(state, new CompositeDecorator(decorators)));

  useEditorRenderer(renderer => {
    const content = editorState.getCurrentContent();

    const html = convertToHTML({
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return <a href={entity.data.url}>{originalText}</a>;
        }
        return originalText;
      }
    })(content);

    if (html !== block.rendered) {
      renderer.render(block.slug, html);
    }
  });

  return (
    <Editor decorators={decorators} editorState={editorState} onChange={setEditorState} />
  );
};

export const Block = ({post = null, slug = 'content', title}) => {
  const block = useBlock(slug, post);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(block.editing);
  }, [block.editing]);

  if (editing) {
    return <EditBlock slug={slug} title={title} block={block} />
  }

  return (
    <div dangerouslySetInnerHTML={{__html: block.rendered || block.excerpt}} />
  );
};

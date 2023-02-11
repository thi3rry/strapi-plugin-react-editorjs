import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createReactEditorJS } from 'react-editor-js'
import requiredTools from './requiredTools';
import customTools from '../../config/customTools';

import MediaLibAdapter from '../medialib/adapter'
import MediaLibComponent from '../medialib/component';
import {changeFunc, getToggleFunc} from '../medialib/utils';
import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';


const Editor = ({ onChange, name, value }) => {
  const EditorJs = createReactEditorJS();
  const editorCore = React.useRef(null)

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance
  }, [])

  const handleSave = React.useCallback(async () => {
    const savedData = await editorCore.current.save();
    onChange({ target: { name, value: JSON.stringify(savedData) } });
  }, [])

  const [mediaLibBlockIndex, setMediaLibBlockIndex] = useState(-1);
  const [isMediaLibOpen, setIsMediaLibOpen] = useState(false);

  const mediaLibToggleFunc = useCallback(getToggleFunc({
    openStateSetter: setIsMediaLibOpen,
    indexStateSetter: setMediaLibBlockIndex
  }), []);

  const handleMediaLibChange = useCallback((data) => {
    changeFunc({
      indexStateSetter: setMediaLibBlockIndex,
      data,
      index: mediaLibBlockIndex,
      editor: editorCore.current?.dangerouslyLowLevelInstance || editorCore.current
    });
    mediaLibToggleFunc();
  }, [mediaLibBlockIndex, editorCore.current, editorCore]);

  const customImageTool = {
    mediaLib: {
      class: MediaLibAdapter,
      config: {
        mediaLibToggleFunc
      }
    }
  }

  const handleReady = (editor) => {
    new Undo({ editor });
    new DragDrop(editor);
    if(value && JSON.parse(value).blocks.length) {
      editor.blocks.render(JSON.parse(value))
    }
    if (document.querySelector('[data-tool="image"]')) {
      document.querySelector('[data-tool="image"]').remove()
    }
  };

  let blocks = {};
  if(value && JSON.parse(value)) {
    blocks = JSON.parse(value);
  }

  return (
    <>
      <div style={{ border: `1px solid rgb(227, 233, 243)`, borderRadius: `2px`, marginTop: `4px` }}>
        <EditorJs
          onInitialize={handleInitialize}
          defaultValue={blocks}
          onChange={handleSave}
          tools={{...requiredTools, ...customTools, ...customImageTool}}
        />
      </div>
      <MediaLibComponent
        isOpen={isMediaLibOpen}
        onChange={handleMediaLibChange}
        onToggle={mediaLibToggleFunc}
      />
    </>
  );
};

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default Editor;

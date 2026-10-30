'use client';

import { useEffect, useRef } from 'react';
import pageStyles from '../page.module.css';

export default function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);

  const run = (command: string, commandValue?: string) => {
    editor.current?.focus();
    document.execCommand(command, false, commandValue);
    if (editor.current) onChange(editor.current.innerHTML);
  };

  return <div className={pageStyles.richTextEditor}>
    <div className={pageStyles.richTextToolbar} aria-label="Text formatting">
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => run('bold')} title="Bold"><strong>B</strong></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => run('italic')} title="Italic"><em>I</em></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => run('underline')} title="Underline"><u>U</u></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => run('insertUnorderedList')}>• Bulleted list</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => run('insertOrderedList')}>1. Numbered list</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => {
        const url = window.prompt('Enter the link URL');
        if (url) run('createLink', url);
      }}>Add link</button>
    </div>
    <div
      ref={editor}
      className={pageStyles.richTextArea}
      contentEditable
      suppressContentEditableWarning
      onInput={() => { if (editor.current) onChange(editor.current.innerHTML); }}
      role="textbox"
      aria-multiline="true"
    />
  </div>;
}

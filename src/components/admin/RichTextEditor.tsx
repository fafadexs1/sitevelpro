
"use client";

import React, { useCallback, useMemo } from 'react';
import { createEditor, Descendant, Editor, Transforms, Text, Element } from 'slate';
import { Slate, Editable, withReact, ReactEditor, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, Pilcrow, Heading1, Heading2, Heading3, List, ListOrdered, Quote } from 'lucide-react';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'list-item' | 'bulleted-list' | 'numbered-list' | 'quote';
  children: CustomText[];
};
type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor & typeof editor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface RichTextEditorProps {
  initialContent: any;
  onChange: (value: any) => void;
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const content = useMemo(() => {
    try {
        if (initialContent && Array.isArray(initialContent) && initialContent.length > 0) {
            return initialContent
        }
    } catch(e) { /* ignore parse error */ }
    return initialValue;
  }, [initialContent])

  return (
    <div className="relative border rounded-lg">
      <Slate editor={editor} initialValue={content} onChange={onChange}>
        <Toolbar />
        <div className="p-4 prose prose-sm dark:prose-invert max-w-none min-h-64 focus-within:outline-none">
          <Editable
            renderElement={props => <ElementComponent {...props} />}
            renderLeaf={props => <Leaf {...props} />}
            placeholder="Comece a escrever seu artigo incrível..."
            spellCheck
            autoFocus
          />
        </div>
      </Slate>
    </div>
  );
};

const Toolbar = () => {
    return (
        <div className="flex items-center gap-1 border-b p-2 bg-secondary rounded-t-lg">
            <MarkButton format="bold" icon={Bold} />
            <MarkButton format="italic" icon={Italic} />
            <MarkButton format="underline" icon={Underline} />
            <div className="w-px h-5 bg-border mx-1" />
            <BlockButton format="heading-one" icon={Heading1} />
            <BlockButton format="heading-two" icon={Heading2} />
            <BlockButton format="heading-three" icon={Heading3} />
             <BlockButton format="paragraph" icon={Pilcrow} />
            <div className="w-px h-5 bg-border mx-1" />
            <BlockButton format="quote" icon={Quote} />
            <BlockButton format="numbered-list" icon={ListOrdered} />
            <BlockButton format="bulleted-list" icon={List} />
        </div>
    )
}

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties: Partial<Element>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // @ts-ignore
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : (format as CustomElement['type']),
    };
  }
  Transforms.setNodes<Element>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format as 'numbered-list' | 'bulleted-list', children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any)[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? (marks as any)[format] === true : false;
};

const ElementComponent = ({ attributes, children, element }: { attributes: any, children: any, element: CustomElement }) => {
  switch (element.type) {
    case 'heading-one': return <h1 {...attributes}>{children}</h1>;
    case 'heading-two': return <h2 {...attributes}>{children}</h2>;
    case 'heading-three': return <h3 {...attributes}>{children}</h3>;
    case 'quote': return <blockquote {...attributes}>{children}</blockquote>;
    case 'list-item': return <li {...attributes}>{children}</li>;
    case 'numbered-list': return <ol {...attributes}>{children}</ol>;
    case 'bulleted-list': return <ul {...attributes}>{children}</ul>;
    default: return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: { attributes: any, children: any, leaf: CustomText }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon: Icon }: { format: string, icon: React.ElementType }) => {
  const editor = useSlate();
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isActive && 'bg-accent text-accent-foreground')}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

const MarkButton = ({ format, icon: Icon }: { format: string, icon: React.ElementType }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", isActive && 'bg-accent text-accent-foreground')}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};


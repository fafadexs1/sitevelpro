
"use client";

import React, { useCallback, useMemo } from 'react';
import { createEditor, Descendant, Editor, Transforms, Text, Element, Range, Path } from 'slate';
import { Slate, Editable, withReact, ReactEditor, useSlate, useSelected, useFocused } from 'slate-react';
import { withHistory } from 'slate-history';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, Pilcrow, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Image as ImageIcon, Video } from 'lucide-react';
import Image from "next/image";

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

type ImageElement = {
  type: 'image';
  url: string;
  alt: string;
  children: EmptyText[];
};

type VideoElement = {
  type: 'video';
  url: string;
  children: EmptyText[];
};

type EmptyText = {
  text: string;
};

type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'list-item' | 'bulleted-list' | 'numbered-list' | 'quote' | 'image' | 'video';
  children: CustomText[] | EmptyText[];
  url?: string;
  alt?: string;
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

// Helper function to insert image with a local blob URL
const insertImage = (editor: Editor, url: string) => {
    const text = { text: '' };
    const image: ImageElement = { type: 'image', url, alt: 'Imagem do artigo', children: [text] };
    const paragraph: CustomElement = { type: 'paragraph', children: [{ text: '' }]};
    Transforms.insertNodes(editor, image);
    // Move to the next block and insert an empty paragraph
    if(editor.selection) {
      const imagePath = Path.parent(editor.selection.anchor.path);
      const nextPath = Path.next(imagePath);
      Transforms.insertNodes(editor, paragraph, { at: nextPath, select: true });
    }
};

const insertVideo = (editor: Editor, url: string) => {
  const text = { text: '' };
  const video: VideoElement = { type: 'video', url, children: [text] };
  const paragraph: CustomElement = { type: 'paragraph', children: [{ text: '' }]};
  Transforms.insertNodes(editor, video);
    if(editor.selection) {
      const videoPath = Path.parent(editor.selection.anchor.path);
      const nextPath = Path.next(videoPath);
      Transforms.insertNodes(editor, paragraph, { at: nextPath, select: true });
    }
};


const withMedia = (editor: Editor) => {
    const { insertData, isVoid, insertText } = editor;

    editor.isVoid = element => {
        return ['image', 'video'].includes(element.type) ? true : isVoid(element);
    };
    
    editor.insertText = text => {
        if (text && isYoutubeUrl(text)) {
            const youtubeId = getYoutubeId(text);
            if(youtubeId) {
                const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
                insertVideo(editor, embedUrl);
                return;
            }
        }
        insertText(text);
    }

    editor.insertData = data => {
        const text = data.getData('text/plain');
        const { files } = data;

        if (files && files.length > 0) {
            for (const file of files) {
                const reader = new FileReader();
                const [mime] = file.type.split('/');
                if (mime === 'image') {
                    // Generate a local URL for instant preview
                    const localUrl = URL.createObjectURL(file);
                    insertImage(editor, localUrl);
                }
            }
        } else if (isImageUrl(text)) {
            insertImage(editor, text);
        } else if(isYoutubeUrl(text)) {
             const youtubeId = getYoutubeId(text);
            if(youtubeId) {
                const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
                insertVideo(editor, embedUrl);
            }
        } else {
            insertData(data);
        }
    };

    return editor;
};

const isImageUrl = (url: string) => {
    if (!url) return false;
    // Simple check for image extensions, can be improved.
    return /\.(jpeg|jpg|png|gif|webp)$/.test(url);
};


const isYoutubeUrl = (url: string) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

const getYoutubeId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}


export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withMedia(withHistory(withReact(createEditor()))), []);
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

const ImageButton = () => {
    const editor = useSlate();

    // This button just triggers the file input.
    // The actual handling is now in editor.insertData
    const handleTriggerUpload = () => {
        const input = document.getElementById('image-upload');
        input?.click();
    };
    
    // We need an input element in the DOM to trigger the file dialog
    const FileInput = () => (
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={event => {
            const file = event.target.files?.[0];
            if (file) {
                 const localUrl = URL.createObjectURL(file);
                 insertImage(editor, localUrl);
            }
        }}
      />
    );

    return (
        <>
            <FileInput />
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onMouseDown={event => {
                    event.preventDefault();
                    handleTriggerUpload();
                }}
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
        </>
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
            <div className="w-px h-5 bg-border mx-1" />
            <ImageButton />
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
      type: isActive ? 'paragraph' : isList ? 'list-item' : (format as any),
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

const ElementComponent = (props: { attributes: any, children: any, element: CustomElement }) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'heading-one': return <h1 {...attributes}>{children}</h1>;
    case 'heading-two': return <h2 {...attributes}>{children}</h2>;
    case 'heading-three': return <h3 {...attributes}>{children}</h3>;
    case 'quote': return <blockquote {...attributes}>{children}</blockquote>;
    case 'list-item': return <li {...attributes}>{children}</li>;
    case 'numbered-list': return <ol {...attributes}>{children}</ol>;
    case 'bulleted-list': return <ul {...attributes}>{children}</ul>;
    case 'image': return <ImageElementComponent {...props} />;
    case 'video': return <VideoElementComponent {...props} />;
    default: return <p {...attributes}>{children}</p>;
  }
};

const ImageElementComponent = ({ attributes, children, element }: { attributes: any, children: any, element: CustomElement }) => {
  const isSelected = useSelected();
  const isFocused = useFocused();

  return (
    <div {...attributes}>
      <div contentEditable={false} className={cn("relative my-4", isSelected && isFocused && "shadow-2xl ring-2 ring-primary")}>
        <Image 
          src={element.url!} 
          alt={element.alt || ''} 
          width={500} 
          height={300}
          className="block max-w-full h-auto rounded-md"
        />
      </div>
      {children}
    </div>
  )
};

const VideoElementComponent = ({ attributes, children, element }: { attributes: any, children: any, element: CustomElement }) => {
    return (
        <div {...attributes}>
            <div contentEditable={false} className="relative aspect-video my-4">
                 <iframe
                    src={element.url}
                    title="Embedded YouTube video"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            {children}
        </div>
    );
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

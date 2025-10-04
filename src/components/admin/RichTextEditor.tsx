
"use client";

import React, { useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { createClient } from '@/utils/supabase/client';

interface RichTextEditorProps {
  initialContent: any;
  onChange: (value: any) => void;
}

export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const supabase = createClient();

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Comece a escrever seu artigo...',
    height: '400px',
    uploader: {
      insertImageAsBase64URI: false, // We will handle the upload
      async "insertImage"(editor: any, files: FileList) {
        if (!files || files.length === 0) {
          return;
        }

        try {
          // This allows multiple file uploads
          for (const file of Array.from(files)) {
            const filePath = `post-content/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('post-images')
              .upload(filePath, file);

            if (uploadError) {
              throw new Error(`Upload failed: ${uploadError.message}`);
            }

            const { data: urlData } = supabase.storage
              .from('post-images')
              .getPublicUrl(filePath);

            if (urlData.publicUrl) {
              editor.s.insertImage(urlData.publicUrl, null, '100%');
            }
          }
        } catch (error: any) {
          console.error("Image upload error:", error);
          editor.s.insertHTML(`<p style="color: red;">Erro no upload da imagem: ${error.message}</p>`);
        }
      },
    },
    filebrowser: {
      ajax: {
        url: '' // We don't use the default file browser
      },
      // We will handle image insertion through the uploader
      insertImage: false, 
    },
    // Customize toolbar buttons
    buttons: 'bold,italic,underline,strikethrough,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,image,video,table,link,|,align,undo,redo,\n,hr,eraser,copyformat,|,symbol,fullsize,print,about'
  }), [supabase]);

  return (
    <JoditEditor
      value={initialContent || ''}
      config={config}
      onBlur={onChange} // preferred to prevent excessive re-renders
      onChange={() => {}} // Pass an empty function to onChange if you only want to update onBlur
    />
  );
};

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  Bold,
  List,
  ListOrdered,
  ImageIcon,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  icon: Icon,
  title,
  iconClassName,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  title: string;
  iconClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-colors',
        isActive
          ? 'bg-emerald-100 text-emerald-800'
          : 'text-slate-600 hover:bg-slate-100',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className={cn('w-4 h-4', iconClassName)} />
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Tulis jawaban di sini...',
  className,
  minHeight = 'min-h-[200px]',
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-4 py-3 text-slate-900',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const setBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const setBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const setOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

  const handleInsertImage = useCallback(() => {
    if (uploading) return;
    fileInputRef.current?.click();
  }, [uploading]);

  const handleUploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan.');
        e.target.value = '';
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('uploads').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      } catch (err) {
        console.error(err);
        alert('Gagal mengunggah. Pastikan bucket "uploads" ada dan policy diaktifkan.');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div
      className={cn(
        'border border-slate-200 rounded-xl overflow-hidden bg-white',
        className
      )}
    >
      <div className="flex gap-0.5 p-1 border-b border-slate-200 bg-slate-50">
        <ToolbarButton onClick={setBold} isActive={editor.isActive('bold')} icon={Bold} title="Tebal" />
        <ToolbarButton onClick={setBulletList} isActive={editor.isActive('bulletList')} icon={List} title="Daftar bullet" />
        <ToolbarButton onClick={setOrderedList} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Daftar nomor" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadImage}
          className="hidden"
          aria-hidden
        />
        <ToolbarButton
          onClick={handleInsertImage}
          disabled={uploading}
          icon={uploading ? Loader2 : ImageIcon}
          title={uploading ? 'Mengunggah...' : 'Unggah gambar'}
          iconClassName={uploading ? 'animate-spin' : undefined}
        />
      </div>
      <div className={cn(minHeight)}>
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}

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
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  title: string;
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
      <Icon className="w-4 h-4" />
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
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

  const handleInsertImage = useCallback(() => setShowImageModal(true), []);

  const handleUploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan.');
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('images').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
        setShowImageModal(false);
      } catch (err) {
        console.error(err);
        alert('Gagal mengunggah. Pastikan bucket "images" ada dan policy diaktifkan.');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [editor]
  );

  const handleConfirmImageUrl = useCallback(() => {
    const url = imageUrl.trim();
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  }, [editor, imageUrl]);

  const handleCancelImage = useCallback(() => {
    setImageUrl('');
    setShowImageModal(false);
  }, []);

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
        <ToolbarButton onClick={handleInsertImage} icon={ImageIcon} title="Insert Image" />
      </div>
      <div className={cn(minHeight)}>
        <EditorContent editor={editor} />
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Insert Image</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unggah dari komputer</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
                />
                {uploading && <p className="mt-1 text-xs text-slate-500">Mengunggah...</p>}
              </div>
              <div className="relative">
                <span className="block text-sm text-slate-400 text-center">atau</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tempel URL gambar</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmImageUrl();
                    if (e.key === 'Escape') handleCancelImage();
                  }}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleConfirmImageUrl}
                disabled={!imageUrl.trim()}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sisipkan URL
              </button>
              <button
                type="button"
                onClick={handleCancelImage}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

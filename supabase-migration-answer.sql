-- Tambahkan kolom answer untuk menyimpan Jawaban (rich text)
-- Jalankan di Supabase SQL Editor jika belum ada

ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer TEXT DEFAULT '';

-- RLS & Storage policies — jalankan di Supabase SQL Editor atau via CLI migrate.
-- Prasyarat: tabel public.categories, public.questions, public.inquiries sudah ada.
-- Sesuaikan nama bucket storage jika berbeda (default: "Images").

-- =============================================================================
-- TABLES: RLS
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika migrasi diulang (ganti nama jika Anda pakai nama lain)
DROP POLICY IF EXISTS "categories_select_anon" ON public.categories;
DROP POLICY IF EXISTS "categories_all_authenticated" ON public.categories;
DROP POLICY IF EXISTS "questions_select_anon" ON public.questions;
DROP POLICY IF EXISTS "questions_all_authenticated" ON public.questions;
DROP POLICY IF EXISTS "inquiries_insert_anon" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_authenticated" ON public.inquiries;

-- categories: anon hanya SELECT; authenticated CRUD penuh
CREATE POLICY "categories_select_anon"
  ON public.categories
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "categories_all_authenticated"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- questions: anon hanya SELECT; authenticated CRUD penuh
CREATE POLICY "questions_select_anon"
  ON public.questions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "questions_all_authenticated"
  ON public.questions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- inquiries: anon hanya INSERT; authenticated hanya SELECT (baca di admin)
CREATE POLICY "inquiries_insert_anon"
  ON public.inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "inquiries_select_authenticated"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- STORAGE: bucket "Images" — publik baca; tulis hanya authenticated
-- Buat bucket di Dashboard jika belum ada (public = true untuk URL publik).
-- =============================================================================

-- Pastikan bucket ada (abaikan error jika sudah dibuat manual di UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('Images', 'Images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "storage_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_delete_authenticated" ON storage.objects;

CREATE POLICY "storage_images_select_public"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'Images');

CREATE POLICY "storage_images_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'Images');

CREATE POLICY "storage_images_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'Images')
  WITH CHECK (bucket_id = 'Images');

CREATE POLICY "storage_images_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'Images');

-- Migration: Add slug column untuk SEO-friendly URL
-- Jalankan di Supabase SQL Editor

-- 1. Add slug column
ALTER TABLE questions ADD COLUMN IF NOT EXISTS slug VARCHAR(500);

-- 2. Generate slugs untuk data existing (jika ada)
UPDATE questions q
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(question_text), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
|| '-' || LEFT(id::text, 8)
WHERE slug IS NULL OR slug = '';

-- 3. Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug);

-- 4. Buat bucket 'images' di Supabase Dashboard: Storage > New bucket > public
-- Lalu buat policy: Public read, Insert untuk anon/service role

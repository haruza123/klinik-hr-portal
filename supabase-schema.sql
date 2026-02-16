-- SQL Schema untuk Klinik HR Portal
-- Jalankan query ini di Supabase Dashboard (SQL Editor)

-- Tabel categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Jika tabel categories sudah ada tanpa kolom slug, jalankan:
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Tabel questions (relasi ke categories)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer TEXT DEFAULT '',
  question_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(question_order);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Tabel inquiries (pertanyaan dari pengunjung)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- Policy: izinkan siapa saja insert (pengunjung), hanya authenticated yang bisa baca (admin)
-- ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anonymous insert" ON inquiries FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow authenticated read" ON inquiries FOR SELECT TO authenticated USING (true);

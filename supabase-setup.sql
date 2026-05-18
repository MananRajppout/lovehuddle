-- =============================================
-- LoveHuddle Supabase Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run: uses IF NOT EXISTS guards.
-- =============================================

-- 1. Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt VARCHAR(1000),
    content TEXT NOT NULL,
    date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1b. Blog upgrade migration (slug, cover image, SEO, video, published flag)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS subtitle VARCHAR(500);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description VARCHAR(300);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_embed_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill slugs for existing rows (lowercase, hyphenated, alphanumeric)
UPDATE blog_posts
SET slug = TRIM(BOTH '-' FROM REGEXP_REPLACE(
    LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g')),
    '\s+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Enforce unique slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_slug_key'
  ) THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
END$$;

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION set_blog_posts_updated_at();

-- 1c. Storage bucket for blog images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: public read, anonymous write/delete (admin route is
-- protected client-side; for stricter security, swap to authenticated-only
-- and wire real Supabase Auth into the admin login).
DROP POLICY IF EXISTS "Public read for blog images" ON storage.objects;
CREATE POLICY "Public read for blog images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Anyone can upload to blog-images" ON storage.objects;
CREATE POLICY "Anyone can upload to blog-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Anyone can update blog-images" ON storage.objects;
CREATE POLICY "Anyone can update blog-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Anyone can delete blog-images" ON storage.objects;
CREATE POLICY "Anyone can delete blog-images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');

-- 2. Create waitlist_entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS (Row Level Security) for simple public access
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries DISABLE ROW LEVEL SECURITY;

-- 4. Blog content is managed via /admin (no seed rows — the founder authors posts in the UI).

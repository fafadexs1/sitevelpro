-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'residencial' or 'empresarial'
  speed TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  features TEXT[],
  highlight BOOLEAN DEFAULT FALSE,
  has_tv BOOLEAN DEFAULT FALSE,
  featured_channel_ids UUID[]
);

-- Create tv_channels table
CREATE TABLE IF NOT EXISTS tv_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tv_packages table
CREATE TABLE IF NOT EXISTS tv_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a join table for packages and channels
CREATE TABLE IF NOT EXISTS tv_package_channels (
  package_id UUID REFERENCES tv_packages(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES tv_channels(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, channel_id)
);

-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id INT PRIMARY KEY,
    site_title TEXT,
    site_description TEXT,
    og_image_url TEXT,
    allow_indexing BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Create Storage buckets
-- Bucket for channel logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('canais', 'canais', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Bucket for general site assets like OG images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', TRUE)
ON CONFLICT (id) DO NOTHING;


-- Create policies for 'canais' bucket
-- Allow public read access
CREATE POLICY "Public read access for logos" ON storage.objects
FOR SELECT USING ( bucket_id = 'canais' );

-- Allow authenticated users to upload, update, delete
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'canais');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'canais');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'canais');

-- Create policies for 'site-assets' bucket
-- Allow public read access
CREATE POLICY "Public read for site assets" ON storage.objects
FOR SELECT USING ( bucket_id = 'site-assets' );

-- Allow authenticated users to upload, update, delete
CREATE POLICY "Allow authenticated uploads for site assets" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Allow authenticated updates for site assets" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');

CREATE POLICY "Allow authenticated deletes for site assets" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'site-assets');

-- Enable RLS for all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_package_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Policies for 'plans'
CREATE POLICY "Allow public read access to plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to plans" ON plans FOR ALL USING (auth.role() = 'authenticated');

-- Policies for 'tv_channels'
CREATE POLICY "Allow public read access to channels" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to channels" ON tv_channels FOR ALL USING (auth.role() = 'authenticated');

-- Policies for 'tv_packages'
CREATE POLICY "Allow public read access to packages" ON tv_packages FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to packages" ON tv_packages FOR ALL USING (auth.role() = 'authenticated');

-- Policies for 'tv_package_channels'
CREATE POLICY "Allow public read access to package channels" ON tv_package_channels FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to package channels" ON tv_package_channels FOR ALL USING (auth.role() = 'authenticated');

-- Policies for 'seo_settings'
CREATE POLICY "Allow public read access to seo settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to seo settings" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');

-- Criar a tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    speed TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    features TEXT[],
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable public read access" ON plans;
CREATE POLICY "Enable public read access" ON plans FOR SELECT USING (true);


-- Criar a tabela de canais de TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable public read access" ON tv_channels;
CREATE POLICY "Enable public read access" ON tv_channels FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tv_channels;
CREATE POLICY "Enable insert for authenticated users" ON tv_channels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tv_channels;
CREATE POLICY "Enable update for authenticated users" ON tv_channels FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tv_channels;
CREATE POLICY "Enable delete for authenticated users" ON tv_channels FOR DELETE TO authenticated USING (true);


-- Criar a tabela de pacotes de TV
CREATE TABLE IF NOT EXISTS tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tv_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable public read access" ON tv_packages;
CREATE POLICY "Enable public read access" ON tv_packages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tv_packages;
CREATE POLICY "Enable insert for authenticated users" ON tv_packages FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tv_packages;
CREATE POLICY "Enable delete for authenticated users" ON tv_packages FOR DELETE TO authenticated USING (true);


-- Criar a tabela de junção entre pacotes e canais
CREATE TABLE IF NOT EXISTS tv_package_channels (
    package_id UUID REFERENCES tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);
ALTER TABLE tv_package_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable public read access" ON tv_package_channels;
CREATE POLICY "Enable public read access" ON tv_package_channels FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tv_package_channels;
CREATE POLICY "Enable insert for authenticated users" ON tv_package_channels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tv_package_channels;
CREATE POLICY "Enable delete for authenticated users" ON tv_package_channels FOR DELETE TO authenticated USING (true);

-- Configuração do Storage para o bucket 'canais'
-- (O bucket já foi criado manualmente, então apenas garantimos as políticas)
DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
CREATE POLICY "Public read access for logos" ON storage.objects FOR SELECT USING (bucket_id = 'canais');

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'canais');

DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'canais');

DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'canais');

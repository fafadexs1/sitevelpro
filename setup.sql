-- Tabela de Planos de Internet
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'residencial' ou 'empresarial'
    speed TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow admin access to plans" ON plans FOR ALL USING (auth.role() = 'service_role');


-- Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tv_channels" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "Allow admin access to tv_channels" ON tv_channels FOR ALL USING (auth.role() = 'service_role');


-- Tabela de Pacotes de TV
CREATE TABLE IF NOT EXISTS tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tv_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tv_packages" ON tv_packages FOR SELECT USING (true);
CREATE POLICY "Allow admin access to tv_packages" ON tv_packages FOR ALL USING (auth.role() = 'service_role');


-- Tabela de Junção (Muitos-para-Muitos) entre Pacotes e Canais
CREATE TABLE IF NOT EXISTS tv_package_channels (
    package_id UUID REFERENCES tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);
ALTER TABLE tv_package_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tv_package_channels" ON tv_package_channels FOR SELECT USING (true);
CREATE POLICY "Allow admin access to tv_package_channels" ON tv_package_channels FOR ALL USING (auth.role() = 'service_role');


-- Políticas de Acesso para o Bucket 'canais'
CREATE POLICY "Allow public read access to channel logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'canais' );

CREATE POLICY "Allow authenticated users to upload channel logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'canais' );


-- Inserir dados de exemplo (canais)
INSERT INTO tv_channels (name, logo_url) VALUES
('Globo', 'https://picsum.photos/seed/globo/80/80'),
('Warner', 'https://picsum.photos/seed/warner/80/80'),
('ESPN', 'https://picsum.photos/seed/espn/80/80'),
('TNT', 'https://picsum.photos/seed/tnt/80/80'),
('Discovery', 'https://picsum.photos/seed/discovery/80/80')
ON CONFLICT (name) DO NOTHING;

    
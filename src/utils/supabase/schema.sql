
-- Tabela de Planos de Internet
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'residencial' ou 'empresarial'
    speed TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    features TEXT[],
    highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    has_tv BOOLEAN DEFAULT FALSE,
    featured_channel_ids UUID[]
);

-- Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pacotes de TV
CREATE TABLE IF NOT EXISTS tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Junção (Muitos para Muitos) entre Pacotes e Canais
CREATE TABLE IF NOT EXISTS tv_package_channels (
    package_id UUID REFERENCES tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);

-- Tabela de Configurações de SEO
CREATE TABLE IF NOT EXISTS seo_settings (
    id INT PRIMARY KEY,
    site_title TEXT,
    site_description TEXT,
    og_image_url TEXT,
    allow_indexing BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para Regras de SEO Dinâmicas
CREATE TABLE IF NOT EXISTS dynamic_seo_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_pattern TEXT NOT NULL, -- Ex: '/planos/:velocidade' ou '/cobertura/:cidade'
    meta_title_template TEXT, -- Ex: 'Planos de {velocidade} Mega em {cidade}'
    meta_description_template TEXT,
    canonical_url_template TEXT,
    allow_indexing BOOLEAN DEFAULT TRUE,
    schema_type TEXT, -- 'LocalBusiness', 'Product', 'FAQPage', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Habilita Row Level Security para todas as tabelas, se ainda não estiver habilitado.
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_package_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_seo_rules ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para garantir que as novas sejam aplicadas corretamente.
DROP POLICY IF EXISTS "Allow public read access" ON plans;
DROP POLICY IF EXISTS "Allow public read access" ON tv_channels;
DROP POLICY IF EXISTS "Allow public read access" ON tv_packages;
DROP POLICY IF EXISTS "Allow public read access" ON tv_package_channels;
DROP POLICY IF EXISTS "Allow public read access" ON seo_settings;
DROP POLICY IF EXISTS "Allow public read access" ON dynamic_seo_rules;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON tv_channels;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON tv_packages;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON tv_package_channels;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON seo_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON dynamic_seo_rules;

-- Políticas de Leitura Pública
-- Permite que qualquer pessoa (mesmo não autenticada) leia os dados.
CREATE POLICY "Allow public read access" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tv_packages FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tv_package_channels FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dynamic_seo_rules FOR SELECT USING (true);


-- Políticas de Gerenciamento para Usuários Autenticados
-- Permite que usuários logados (admins) possam criar, atualizar e deletar.
CREATE POLICY "Allow authenticated users to manage content" ON plans FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content" ON tv_channels FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content" ON tv_packages FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content" ON tv_package_channels FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content" ON seo_settings FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content" ON dynamic_seo_rules FOR ALL
USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- Configuração do Storage para assets do site e canais.
-- Cria os buckets se eles não existirem.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('canais', 'canais', true)
ON CONFLICT (id) DO NOTHING;

-- Remove políticas antigas de storage para garantir consistência.
DROP POLICY IF EXISTS "Allow public read access on site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on canais" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage canais" ON storage.objects;

-- Políticas do Storage
-- Permite leitura pública dos assets do site (ex: imagem OG)
CREATE POLICY "Allow public read access on site-assets" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-assets');

-- Permite que admins logados gerenciem (upload, delete) os assets do site
CREATE POLICY "Allow authenticated users to manage site-assets" ON storage.objects
FOR INSERT, UPDATE, DELETE TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Permite leitura pública dos logos dos canais
CREATE POLICY "Allow public read access on canais" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'canais');

-- Permite que admins logados gerenciem os logos dos canais
CREATE POLICY "Allow authenticated users to manage canais" ON storage.objects
FOR INSERT, UPDATE, DELETE TO authenticated
WITH CHECK (bucket_id = 'canais' AND auth.role() = 'authenticated');

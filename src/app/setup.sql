-- Tabela de Planos de Internet
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'residencial' ou 'empresarial'
    speed TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    features TEXT[], -- Array de strings para os benefícios
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    featured_channel_ids UUID[], -- Array de IDs de canais em destaque
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT NOT NULL,
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
    id INT PRIMARY KEY, -- Apenas uma linha, id=1
    site_title TEXT,
    site_description TEXT,
    og_image_url TEXT,
    allow_indexing BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Regras de SEO Dinâmicas
CREATE TABLE IF NOT EXISTS dynamic_seo_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Nome da regra para identificação no admin
    slug_pattern TEXT NOT NULL, -- Ex: /internet-em-{cidade}
    meta_title TEXT NOT NULL, -- Ex: Internet Fibra em {cidade} | Velpro
    meta_description TEXT NOT NULL, -- Ex: Contrate o melhor plano...
    canonical_url TEXT,
    allow_indexing BOOLEAN DEFAULT TRUE,
    schema_type TEXT DEFAULT 'None', -- 'LocalBusiness', 'Product', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Habilita Row Level Security (RLS) se ainda não estiver habilitado
-- ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tv_channels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tv_packages ENABLE ROW LEVEL SECURITY;
-- ALTER_TABLE public.tv_package_channels ENABLE ROW LEVEL SECURITY;
-- etc. para todas as tabelas

-- Policies de Leitura Pública
DROP POLICY IF EXISTS "Allow public read access to plans" ON public.plans;
CREATE POLICY "Allow public read access to plans" ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to tv_channels" ON public.tv_channels;
CREATE POLICY "Allow public read access to tv_channels" ON public.tv_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to tv_packages" ON public.tv_packages;
CREATE POLICY "Allow public read access to tv_packages" ON public.tv_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to tv_package_channels" ON public.tv_package_channels;
CREATE POLICY "Allow public read access to tv_package_channels" ON public.tv_package_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to seo_settings" ON public.seo_settings;
CREATE POLICY "Allow public read access to seo_settings" ON public.seo_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to dynamic_seo_rules" ON public.dynamic_seo_rules;
CREATE POLICY "Allow public read access to dynamic_seo_rules" ON public.dynamic_seo_rules FOR SELECT USING (true);

-- Policies para escrita (apenas para usuários autenticados, se necessário)
-- Exemplo:
-- DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.plans;
-- CREATE POLICY "Allow authenticated users to insert" ON public.plans FOR INSERT TO authenticated WITH CHECK (true);
-- Repetir para UPDATE, DELETE e para outras tabelas conforme a necessidade de segurança.

-- Storage Buckets
-- Bucket para logos de canais (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('canais', 'canais', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to channel logos" ON storage.objects
FOR SELECT
USING ( bucket_id = 'canais' );

CREATE POLICY "Allow authenticated users to upload channel logos" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'canais' );

CREATE POLICY "Allow authenticated users to update channel logos" ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'canais' );

CREATE POLICY "Allow authenticated users to delete channel logos" ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'canais' );


-- Bucket para assets do site como a imagem OG (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to site assets" ON storage.objects
FOR SELECT
USING ( bucket_id = 'site-assets' );

CREATE POLICY "Allow authenticated users to upload site assets" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'site-assets' );

CREATE POLICY "Allow authenticated users to update site assets" ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'site-assets' );

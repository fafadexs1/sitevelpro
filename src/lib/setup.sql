-- Tabela de Planos
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    speed TEXT NOT NULL,
    price REAL NOT NULL,
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;

-- Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS public.tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;

-- Tabela de Pacotes de TV
CREATE TABLE IF NOT EXISTS public.tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;

-- Tabela de Junção (Pacotes <-> Canais)
CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.tv_channels(id) ON DELETE CASCADE
);
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;

-- Políticas para o Storage (Bucket "canais")
-- Assegura que o bucket 'canais' permita acesso público de leitura.
INSERT INTO storage.buckets (id, name, public)
VALUES ('canais', 'canais', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para Leitura Pública (SELECT)
-- Qualquer pessoa pode ver os logos dos canais.
DROP POLICY IF EXISTS "Public View" ON storage.objects;
CREATE POLICY "Public View" ON storage.objects
FOR SELECT USING (bucket_id = 'canais');

-- Política para Upload (INSERT)
-- Apenas usuários autenticados (como o admin logado) podem adicionar novos logos.
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'canais' AND auth.role() = 'authenticated');

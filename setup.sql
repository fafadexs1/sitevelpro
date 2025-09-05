-- Criar a tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    type text,
    speed text,
    price numeric,
    highlight boolean,
    has_tv boolean,
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;

-- Criar a tabela de canais de TV
CREATE TABLE IF NOT EXISTS public.tv_channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    logo_url text,
    CONSTRAINT tv_channels_pkey PRIMARY KEY (id),
    CONSTRAINT tv_channels_name_key UNIQUE (name)
);
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;

-- Criar a tabela de pacotes de TV
CREATE TABLE IF NOT EXISTS public.tv_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    CONSTRAINT tv_packages_pkey PRIMARY KEY (id)
);
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;

-- Criar a tabela de junção para pacotes e canais
CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    package_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    CONSTRAINT tv_package_channels_pkey PRIMARY KEY (package_id, channel_id),
    CONSTRAINT tv_package_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.tv_channels(id) ON DELETE CASCADE,
    CONSTRAINT tv_package_channels_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.tv_packages(id) ON DELETE CASCADE
);
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;

-- Inserir o bucket de armazenamento para os logos dos canais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('canais', 'canais', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Definir políticas de acesso para o bucket "canais"
-- Permitir acesso público de leitura
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'canais' );

-- Permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'canais' AND auth.role() = 'authenticated' );

-- Permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner_id AND bucket_id = 'canais' );

-- Permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner_id AND bucket_id = 'canais' );

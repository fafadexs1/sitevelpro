-- Tabela de Planos de Internet
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    type text,
    speed text,
    price numeric,
    highlight boolean,
    has_tv boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS public.tv_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de Pacotes de TV
CREATE TABLE IF NOT EXISTS public.tv_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de Junção (Muitos-para-Muitos) entre Pacotes e Canais
CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    package_id uuid NOT NULL REFERENCES public.tv_packages(id) ON DELETE CASCADE,
    channel_id uuid NOT NULL REFERENCES public.tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);

-- Inserir alguns canais de exemplo
INSERT INTO public.tv_channels (name, logo_url) VALUES 
('Globo', 'https://logopng.com.br/logos/globo-7.svg'),
('Warner', 'https://logopng.com.br/logos/warner-bros-10.svg'),
('ESPN', 'https://logopng.com.br/logos/espn-2.svg'),
('TNT', 'https://logopng.com.br/logos/tnt-3.svg'),
('Discovery', 'https://logopng.com.br/logos/discovery-channel-4.svg')
ON CONFLICT (name) DO NOTHING;


-- Desativar Row Level Security para permitir acesso via API (anon key)
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;

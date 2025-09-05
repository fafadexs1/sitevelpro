-- 1. Tabela de Planos
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('residencial', 'empresarial')),
    speed TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Canais de TV
CREATE TABLE IF NOT EXISTS public.tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Pacotes de TV
CREATE TABLE IF NOT EXISTS public.tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Junção (Muitos-para-Muitos) entre Pacotes e Canais
CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    package_id UUID REFERENCES public.tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);


-- Inserir canais de exemplo (com verificação de existência)
INSERT INTO public.tv_channels (name, logo_url) VALUES
('Globo', 'https://picsum.photos/40/40?random=1'),
('Warner', 'https://picsum.photos/40/40?random=2'),
('ESPN', 'https://picsum.photos/40/40?random=3'),
('TNT', 'https://picsum.photos/40/40?random=4'),
('Discovery', 'https://picsum.photos/40/40?random=5')
ON CONFLICT (name) DO NOTHING;


-- Desabilitar Row Level Security para permitir leitura pública
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;

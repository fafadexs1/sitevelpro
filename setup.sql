-- Cria a tabela de planos de internet
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    speed TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    highlight BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria a tabela de canais de TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria a tabela de pacotes de TV
CREATE TABLE IF NOT EXISTS tv_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria a tabela de junção para pacotes e canais (muitos-para-muitos)
CREATE TABLE IF NOT EXISTS tv_package_channels (
    package_id UUID REFERENCES tv_packages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES tv_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, channel_id)
);

-- Insere canais de exemplo se eles não existirem
INSERT INTO tv_channels (name, logo_url) VALUES
('Globo', 'https://picsum.photos/40/40?random=1'),
('Warner', 'https://picsum.photos/40/40?random=2'),
('ESPN', 'https://picsum.photos/40/40?random=3'),
('TNT', 'https://picsum.photos/40/40?random=4'),
('Discovery', 'https://picsum.photos/40/40?random=5')
ON CONFLICT (name) DO NOTHING;

-- Desativa a Row Level Security (RLS) para permitir o acesso público de leitura
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_package_channels DISABLE ROW LEVEL SECURITY;

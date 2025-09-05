-- Esta função cria as tabelas iniciais e popula os dados necessários.
-- É seguro executá-la múltiplas vezes.

CREATE OR REPLACE FUNCTION setup_initial_schema_and_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Tabela de Planos
  CREATE TABLE IF NOT EXISTS public.plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    type text NOT NULL,
    speed text NOT NULL,
    price real NOT NULL,
    features text[] NULL,
    highlight boolean NOT NULL DEFAULT false,
    has_tv boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT plans_pkey PRIMARY KEY (id)
  );

  -- Tabela de Pacotes de TV
  CREATE TABLE IF NOT EXISTS public.tv_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT tv_packages_pkey PRIMARY KEY (id)
  );

  -- Tabela de Canais de TV
  CREATE TABLE IF NOT EXISTS public.tv_channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT tv_channels_pkey PRIMARY KEY (id)
  );
  
  -- Tabela de Junção: Pacotes e Canais
  CREATE TABLE IF NOT EXISTS public.tv_package_channels (
    package_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    CONSTRAINT tv_package_channels_pkey PRIMARY KEY (package_id, channel_id),
    CONSTRAINT tv_package_channels_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.tv_packages(id) ON DELETE CASCADE,
    CONSTRAINT tv_package_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.tv_channels(id) ON DELETE CASCADE
  );

  -- Inserir canais padrão se a tabela estiver vazia
  IF NOT EXISTS (SELECT 1 FROM public.tv_channels) THEN
    INSERT INTO public.tv_channels (name, logo_url) VALUES
      ('Globo', 'https://picsum.photos/40/40?random=1'),
      ('Warner', 'https://picsum.photos/40/40?random=2'),
      ('ESPN', 'https://picsum.photos/40/40?random=3'),
      ('TNT', 'https://picsum.photos/40/40?random=4'),
      ('Discovery', 'https://picsum.photos/40/40?random=5');
  END IF;

END;
$$;

-- Chamar a função para garantir que tudo seja criado.
-- SELECT setup_initial_schema_and_data();

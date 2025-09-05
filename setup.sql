
-- Execute este comando no seu Editor SQL do Supabase uma única vez.
-- Isso cria a função que a aplicação chama para configurar as tabelas e dados iniciais.
-- A opção 'SECURITY DEFINER' é crucial para dar à função as permissões necessárias.

CREATE OR REPLACE FUNCTION setup_initial_schema_and_data()
RETURNS void AS $$
BEGIN
  -- Tabela de Planos
  CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    speed TEXT NOT NULL,
    price REAL NOT NULL,
    highlight BOOLEAN DEFAULT false NOT NULL,
    has_tv BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMETZ DEFAULT now() NOT NULL
  );

  -- Tabela de Pacotes de TV
  CREATE TABLE IF NOT EXISTS public.tv_packages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMETZ DEFAULT now() NOT NULL
  );

  -- Tabela de Canais de TV
  CREATE TABLE IF NOT EXISTS public.tv_channels (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMETZ DEFAULT now() NOT NULL
  );

  -- Populando dados iniciais de canais se a tabela estiver vazia
  IF NOT EXISTS (SELECT 1 FROM public.tv_channels) THEN
      INSERT INTO public.tv_channels (name, image_url) VALUES
      ('Canal Exemplo 1', 'https://picsum.photos/40/40?random=1'),
      ('Canal Exemplo 2', 'https://picsum.photos/40/40?random=2'),
      ('Canal Exemplo 3', 'https://picsum.photos/40/40?random=3'),
      ('Canal Exemplo 4', 'https://picsum.photos/40/40?random=4'),
      ('Canal Exemplo 5', 'https://picsum.photos/40/40?random=5');
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

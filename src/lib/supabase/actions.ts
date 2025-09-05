
'use server';

import { createAdminClient } from './admin';

export async function setupDatabase() {
  const supabase = createAdminClient();

  // A função `execute_sql` é criada e usada apenas dentro desta transação,
  // garantindo que não dependemos de uma função pré-existente.
  const createFunctionQuery = `
    CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    AS $function$
    BEGIN
      EXECUTE sql;
    END;
    $function$;
  `;

  const { error: fnError } = await supabase.rpc('execute_sql', { sql: createFunctionQuery });

  // Ignoramos o erro "already exists" se a função foi criada em uma execução anterior.
  if (fnError && !fnError.message.includes('already exists')) {
     console.error('Error creating helper function:', fnError);
     throw new Error(`Falha ao criar a função helper de configuração: ${fnError.message}.`);
  }

  const queries = [
    // Tabela de Planos
    `CREATE TABLE IF NOT EXISTS public.plans (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      type text NOT NULL,
      speed text NOT NULL,
      price real NOT NULL,
      highlight boolean NOT NULL DEFAULT false,
      has_tv boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT plans_pkey PRIMARY KEY (id)
    )`,
    // Tabela de Pacotes de TV
    `CREATE TABLE IF NOT EXISTS public.tv_packages (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT tv_packages_pkey PRIMARY KEY (id)
    )`,
    // Tabela de Canais de TV
    `CREATE TABLE IF NOT EXISTS public.tv_channels (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      logo_url text NULL,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT tv_channels_pkey PRIMARY KEY (id)
    )`,
    // Tabela de Junção: Pacotes e Canais
    `CREATE TABLE IF NOT EXISTS public.tv_package_channels (
      package_id uuid NOT NULL,
      channel_id uuid NOT NULL,
      CONSTRAINT tv_package_channels_pkey PRIMARY KEY (package_id, channel_id),
      CONSTRAINT tv_package_channels_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.tv_packages(id) ON DELETE CASCADE,
      CONSTRAINT tv_package_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.tv_channels(id) ON DELETE CASCADE
    )`,
    // Populando Canais (se a tabela estiver vazia)
    `INSERT INTO public.tv_channels (name, logo_url)
    SELECT * FROM (VALUES
      ('Globo', 'https://picsum.photos/40/40?random=1'),
      ('Warner', 'https://picsum.photos/40/40?random=2'),
      ('ESPN', 'https://picsum.photos/40/40?random=3'),
      ('TNT', 'https://picsum.photos/40/40?random=4'),
      ('Discovery', 'https://picsum.photos/40/40?random=5')
    ) AS data(name, logo_url)
    WHERE NOT EXISTS (SELECT 1 FROM public.tv_channels);`
  ];

  for (const query of queries) {
    const { error } = await supabase.rpc('execute_sql', { sql: query });
    if (error) {
      console.error('Supabase setup error for query:', query, 'Error:', error);
      throw new Error(`Falha ao executar a configuração do schema: ${error.message}.`);
    }
  }
}

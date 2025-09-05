
'use server';

import { createAdminClient } from './admin';

export async function setupDatabase() {
  const supabase = createAdminClient();

  // Este é um único bloco de código SQL que será executado.
  // É mais robusto do que múltiplas chamadas rpc.
  const schemaSetupQuery = `
    -- Criação da Tabela de Planos
    CREATE TABLE IF NOT EXISTS public.plans (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      type text NOT NULL,
      speed text NOT NULL,
      price real NOT NULL,
      highlight boolean NOT NULL DEFAULT false,
      has_tv boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT plans_pkey PRIMARY KEY (id)
    );

    -- Criação da Tabela de Pacotes de TV
    CREATE TABLE IF NOT EXISTS public.tv_packages (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT tv_packages_pkey PRIMARY KEY (id)
    );

    -- Criação da Tabela de Canais de TV
    CREATE TABLE IF NOT EXISTS public.tv_channels (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      logo_url text NULL,
      created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT tv_channels_pkey PRIMARY KEY (id)
    );

    -- Criação da Tabela de Junção: Pacotes e Canais
    CREATE TABLE IF NOT EXISTS public.tv_package_channels (
      package_id uuid NOT NULL,
      channel_id uuid NOT NULL,
      CONSTRAINT tv_package_channels_pkey PRIMARY KEY (package_id, channel_id),
      CONSTRAINT tv_package_channels_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.tv_packages(id) ON DELETE CASCADE,
      CONSTRAINT tv_package_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.tv_channels(id) ON DELETE CASCADE
    );

    -- Populando Canais (apenas se a tabela estiver vazia para evitar duplicatas)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.tv_channels) THEN
        INSERT INTO public.tv_channels (name, logo_url) VALUES
          ('Globo', 'https://picsum.photos/40/40?random=1'),
          ('Warner', 'https://picsum.photos/40/40?random=2'),
          ('ESPN', 'https://picsum.photos/40/40?random=3'),
          ('TNT', 'https://picsum.photos/40/40?random=4'),
          ('Discovery', 'https://picsum.photos/40/40?random=5');
      END IF;
    END $$;
  `;

  // A abordagem correta é criar uma função plpgsql que executa o script.
  // Esta função é anônima e executada em uma única transação.
  const { error } = await supabase.rpc('execute_sql_block', { sql: schemaSetupQuery });

  if (error) {
    console.error('Supabase setup error:', error);
    // Se a função 'execute_sql_block' não existir, nós a criamos.
    if (error.message.includes('function public.execute_sql_block(sql) does not exist')) {
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION public.execute_sql_block(sql text)
          RETURNS void
          LANGUAGE plpgsql
          AS $function$
          BEGIN
            EXECUTE sql;
          END;
          $function$;
        `;
         // Usar um RPC para criar a função primeiro.
         const { error: fnError } = await supabase.rpc('execute_sql_block', { sql: createFunctionSQL });
         if (fnError && !fnError.message.includes('function public.execute_sql_block(sql) does not exist')) {
             throw new Error(`Falha ao criar a função helper de configuração: ${fnError.message}. Por favor, execute o SQL para criar a função 'execute_sql_block' no seu painel Supabase.`);
         }
         
         // Tenta novamente após criar a função
         const { error: retryError } = await supabase.rpc('execute_sql_block', { sql: schemaSetupQuery });
          if(retryError){
             throw new Error(`Falha ao executar a configuração do schema na segunda tentativa: ${retryError.message}.`);
          }
    } else {
      throw new Error(`Falha ao executar a configuração do schema: ${error.message}.`);
    }
  }
}


'use server';

import { createAdminClient } from './admin';

export async function setupDatabase() {
  const supabase = createAdminClient();

  // The function is created in the Supabase SQL Editor.
  // We call it from the server-side action.
  const { error } = await supabase.rpc('setup_plans_table');

  if (error) {
    console.error('Supabase setup error:', error);
    throw new Error(
      `Falha ao executar a configuração da tabela: ${error.message}. Verifique os logs do servidor para mais detalhes.`
    );
  }

  // To enable the function to be called from the client, we need to create a SQL function.
  // This is a one-time setup. Go to your Supabase SQL Editor and run:
  /*
    -- Recommended: Drop the old function if it exists, to avoid conflicts.
    -- DROP FUNCTION IF EXISTS setup_plans_table();

    create or replace function setup_plans_table()
    returns void as $$
    begin
      create table if not exists public.plans (
        id uuid default gen_random_uuid() primary key,
        type text not null,
        speed text not null,
        price real not null,
        features_with_icons jsonb, -- Use jsonb for flexible feature storage
        highlight boolean default false not null,
        has_tv boolean default false not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    end;
    $$ language plpgsql security definer;
  */
}

    
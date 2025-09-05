'use server';

import { createAdminClient } from './admin';

export async function setupDatabase() {
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('setup_plans_table');

  if (error) {
    console.error('Supabase setup error:', error);
    throw new Error(
      `Falha ao executar a configuração da tabela: ${error.message}. Verifique os logs do servidor para mais detalhes e se a função RPC foi criada corretamente.`
    );
  }
}

/*
  -- Execute este comando no seu Editor SQL do Supabase uma única vez.
  -- Isso cria a função que a aplicação chama para configurar a tabela.
  -- A opção 'SECURITY DEFINER' é crucial para dar à função as permissões necessárias.

  create or replace function setup_plans_table()
  returns void as $$
  begin
    create table if not exists public.plans (
      id uuid default gen_random_uuid() primary key,
      type text not null,
      speed text not null,
      price real not null,
      highlight boolean default false not null,
      has_tv boolean default false not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
  end;
  $$ language plpgsql security definer;

*/

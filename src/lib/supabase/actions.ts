
'use server';

import { createClient } from './server';

export async function setupDatabase() {
  const supabase = createClient();

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
    create or replace function setup_plans_table()
    returns void as $$
    begin
      create table if not exists public.plans (
        id uuid default gen_random_uuid() primary key,
        type text not null,
        speed text not null,
        price real not null,
        features text[] not null,
        highlight boolean default false not null,
        has_tv boolean default false not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    end;
    $$ language plpgsql;
  */

  // After running the above SQL, the `setupDatabase` function will work.
  // The SQL creates a PostgreSQL function that the `supabase.rpc` call can execute.
  // This is the standard way to perform administrative tasks securely from server-side code.
}

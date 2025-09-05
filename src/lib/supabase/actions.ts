
'use server';

import { createAdminClient } from './admin';

export async function setupDatabase() {
  const supabase = createAdminClient();

  const { error } = await supabase.rpc('setup_initial_schema_and_data');

  if (error) {
    console.error('Supabase setup error:', error);
    throw new Error(
      `Falha ao executar a configuração do schema: ${error.message}. Verifique os logs do servidor para mais detalhes e se a função RPC foi criada corretamente.`
    );
  }
}

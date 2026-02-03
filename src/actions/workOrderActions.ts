
'use server'

// import { createClient } from '@/utils/supabase/server';

// Ajustado para o formato da resposta da API de O.S.
type ApiResponse = {
    paginacao: object;
    ordens_servicos: any[];
};

export async function getWorkOrders(contractId: number, year: number): Promise<{ success: boolean; data: any[] | null; error: string | null; }> {
    return { success: false, data: null, error: "Serviço temporariamente indisponível." };
}

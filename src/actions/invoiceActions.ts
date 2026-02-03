
'use server'

// import { createClient } from '@/utils/supabase/server';

type ApiResponse = {
    paginacao: object;
    titulos: any[];
};

export async function getInvoices(contractId: number, year: number): Promise<{ success: boolean; data: any[] | null; error: string | null; }> {
    return { success: false, data: null, error: "Serviço temporariamente indisponível." };
}


'use server'

// import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipagem para a resposta da API externa
type ApiResponse = {
    auth: boolean;
    contratos: any[];
    message?: string;
};

export async function loginWithApi(cpfcnpj: string, senha: string): Promise<{ success: boolean; error: string | null; }> {
    // Auth disabled during migration
    return { success: false, error: 'Sistema de login temporariamente indisponível para manutenção.' };
}

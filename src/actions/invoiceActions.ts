
'use server'

import { createClient } from '@/utils/supabase/server';

type ApiResponse = {
    paginacao: object;
    titulos: any[];
};

export async function getInvoices(contractId: number, year: number): Promise<{ success: boolean; data: any[] | null; error: string | null; }> {
    const supabase = createClient();
    try {
        const { data: settingsData, error: settingsError } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['external_api_url', 'external_api_app', 'external_api_token']);

        if (settingsError) {
            throw new Error(`Erro ao buscar configurações da API: ${settingsError.message}`);
        }

        const settingsMap = new Map(settingsData.map(item => [item.key, item.value]));
        const baseUrl = settingsMap.get('external_api_url');
        const apiApp = settingsMap.get('external_api_app');
        const apiToken = settingsMap.get('external_api_token');

        if (!baseUrl || !apiApp || !apiToken) {
            throw new Error('As configurações da API externa (URL, App, Token) não estão completas no painel de administração.');
        }

        const externalApiUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/api/ura/titulos/`;

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                app: apiApp,
                token: apiToken,
                contrato: String(contractId),
                data_cadastro_inicio: startDate,
                data_cadastro_fim: endDate,
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API externa de faturas: ${response.status} ${response.statusText}. Resposta: ${errorText}`);
        }

        const data: ApiResponse = await response.json();
        const invoices = data.titulos;

        if (invoices) {
            // Em vez de fazer um upsert completo, seria melhor mesclar os dados anuais
            // Por simplicidade, vamos substituir os dados do contrato por ano
            const { data: existingData, error: fetchError } = await supabase
                .from('invoices')
                .select('invoices_data')
                .eq('contract_id', String(contractId))
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                 console.error("Erro ao buscar faturas existentes:", fetchError.message);
            }

            const existingInvoices = (existingData?.invoices_data as any[]) || [];
            // Remove faturas do ano que estamos atualizando e adiciona as novas
            const otherYearsInvoices = existingInvoices.filter(inv => new Date(inv.dataVencimento).getFullYear() !== year);
            const updatedInvoices = [...otherYearsInvoices, ...invoices];


            const { error: upsertError } = await supabase
                .from('invoices')
                .upsert({ 
                    contract_id: String(contractId), 
                    invoices_data: updatedInvoices,
                    fetched_at: new Date().toISOString()
                }, { onConflict: 'contract_id' });

            if (upsertError) {
                console.error("Erro ao salvar faturas no banco de dados:", upsertError.message);
            }
        }

        return { success: true, data: invoices, error: null };

    } catch (e: any) {
        console.error("Erro na Server Action getInvoices:", e);
        // Em caso de erro, tenta devolver o cache do ano correspondente
        const { data: cachedData } = await supabase
            .from('invoices')
            .select('invoices_data')
            .eq('contract_id', String(contractId))
            .single();

        const cachedYearData = (cachedData?.invoices_data as any[] | null)?.filter(inv => new Date(inv.dataVencimento).getFullYear() === year);

        return { success: false, data: cachedYearData || null, error: e.message || "Ocorreu um erro inesperado ao buscar as faturas." };
    }
}

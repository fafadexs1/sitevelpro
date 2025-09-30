
'use server'

import { createClient } from '@/utils/supabase/server';

// Ajustado para o formato da resposta da API de O.S.
type ApiResponse = {
    paginacao: object;
    ordens_servicos: any[];
};

export async function getWorkOrders(contractId: number, year: number): Promise<{ success: boolean; data: any[] | null; error: string | null; }> {
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

        const externalApiUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/api/ura/ordemservico/list/`;

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
                contrato: contractId,
                data_cadastro_inicio: startDate,
                data_cadastro_fim: endDate,
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API externa de O.S.: ${response.status} ${response.statusText}. Resposta: ${errorText}`);
        }

        const data: ApiResponse = await response.json();
        const workOrders = data.ordens_servicos;

        if (workOrders) {
            const { data: existingData, error: fetchError } = await supabase
                .from('work_orders')
                .select('orders')
                .eq('contract_id', String(contractId))
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                 console.error("Erro ao buscar O.S. existentes:", fetchError.message);
            }
            
            const existingOrders = (existingData?.orders as any[]) || [];

            // Remove ordens do ano que estamos atualizando e também remove duplicatas baseadas no ID
            const newOrderIds = new Set(workOrders.map(wo => wo.id));
            const otherYearsOrders = existingOrders.filter(wo => {
                 const orderYear = new Date(wo.data_cadastro).getFullYear();
                 return orderYear !== year && !newOrderIds.has(wo.id);
            });
            
            const updatedOrders = [...otherYearsOrders, ...workOrders];

            const { error: upsertError } = await supabase
                .from('work_orders')
                .upsert({ 
                    contract_id: String(contractId), 
                    orders: updatedOrders,
                    fetched_at: new Date().toISOString()
                }, { onConflict: 'contract_id' });

            if (upsertError) {
                console.error("Erro ao salvar O.S. no banco de dados:", upsertError.message);
            }
        }

        return { success: true, data: workOrders, error: null };

    } catch (e: any) {
        console.error("Erro na Server Action getWorkOrders:", e);
        // Em caso de erro, tenta devolver o cache do ano
        const { data: cachedData } = await supabase
            .from('work_orders')
            .select('orders')
            .eq('contract_id', String(contractId))
            .single();

        const cachedYearData = (cachedData?.orders as any[] | null)?.filter(wo => new Date(wo.data_cadastro).getFullYear() === year);
            
        return { success: false, data: cachedYearData || null, error: e.message || "Ocorreu um erro inesperado ao buscar as ordens de serviço." };
    }
}


'use server'

import { createClient } from '@/utils/supabase/server';

type ApiResponse = {
    results: any[];
    count: number;
    next: string | null;
    previous: string | null;
};

export async function getWorkOrders(contractId: number): Promise<{ success: boolean; data: any[] | null; error: string | null; }> {
    try {
        const supabase = createClient();
        
        // 1. Busca as configurações da API do banco de dados
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
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API externa de O.S.: ${response.status} ${response.statusText}. Resposta: ${errorText}`);
        }

        const data: ApiResponse = await response.json();

        return { success: true, data: data.results, error: null };

    } catch (e: any) {
        console.error("Erro na Server Action getWorkOrders:", e);
        return { success: false, data: null, error: e.message || "Ocorreu um erro inesperado ao buscar as ordens de serviço." };
    }
}


'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipagem para a resposta da API externa
type ApiResponse = {
    auth: boolean;
    contratos: any[];
    message?: string;
};

export async function loginWithApi(cpfcnpj: string, senha: string):Promise<{ success: boolean; error: string | null; }> {
    try {
        const supabase = createClient();
        
        // 1. Busca a URL da API do banco de dados
        const { data: apiUrlData, error: apiUrlError } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'external_api_url')
            .single();

        if (apiUrlError || !apiUrlData?.value) {
            throw new Error('A URL da API externa não está configurada no painel de administração.');
        }

        const externalApiUrl = apiUrlData.value;
        const formData = new FormData();
        formData.append('cpfcnpj', cpfcnpj);
        formData.append('senha', senha);
        
        // Chamada à API externa
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Erro na API externa: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.auth) {
            return { success: false, error: data.message || 'CPF/CNPJ ou senha inválidos.' };
        }

        // Limpa o CPF/CNPJ para usar como e-mail/identificador
        const cleanCpfCnpj = cpfcnpj.replace(/\D/g, '');
        const email = `${cleanCpfCnpj}@velpro.com.br`;

        // 2. Verifica se já existe um cliente com este CPF/CNPJ
        const { data: existingClient, error: clientError } = await supabase
            .from('clientes')
            .select('id, user_id')
            .eq('cpf_cnpj', cleanCpfCnpj)
            .single();

        if (clientError && clientError.code !== 'PGRST116') { // PGRST116 = no rows found
            throw new Error(`Erro ao buscar cliente: ${clientError.message}`);
        }

        if (existingClient) {
            // Cliente já existe, atualiza os contratos e faz o login
            const { error: updateError } = await supabase
                .from('clientes')
                .update({ contratos: data.contratos })
                .eq('id', existingClient.id);
            
            if (updateError) {
                throw new Error(`Erro ao atualizar contratos: ${updateError.message}`);
            }

            // O login é feito no lado do cliente com signInWithPassword
            // Aqui, nós apenas confirmamos que os dados estão corretos e atualizados.
            // Para fazer o login efetivo, o lado do cliente usará o Supabase JS.
            // Vamos simular o sign-in aqui para garantir que o usuário existe no Auth.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (signInError) {
                // Se o login falhar, pode ser que a senha mudou no sistema externo.
                // Atualiza a senha no Supabase Auth.
                const { error: updateUserError } = await supabase.auth.admin.updateUserById(
                    existingClient.user_id,
                    { password: senha }
                );
                if (updateUserError) {
                     throw new Error(`Falha ao atualizar senha do usuário: ${updateUserError.message}`);
                }
                // Tenta logar novamente com a nova senha
                 const { error: retrySignInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: senha,
                });
                if(retrySignInError) {
                     throw new Error(`Falha ao fazer login após atualizar senha: ${retrySignInError.message}`);
                }
            }
        } else {
            // Cliente não existe, cria novo usuário no Auth e registro na tabela clientes
            const { data: newUser, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: senha,
                options: {
                    email_confirm: true, // Auto-confirma o email
                }
            });

            if (signUpError || !newUser.user) {
                throw new Error(`Erro ao criar novo usuário: ${signUpError?.message}`);
            }

            const { error: insertError } = await supabase
                .from('clientes')
                .insert({
                    user_id: newUser.user.id,
                    cpf_cnpj: cleanCpfCnpj,
                    contratos: data.contratos,
                    selected_contract_id: String(data.contratos[0]?.contrato)
                });
            
            if (insertError) {
                // Se falhar, deleta o usuário criado no Auth para evitar inconsistência
                await supabase.auth.admin.deleteUser(newUser.user.id);
                throw new Error(`Erro ao inserir novo cliente: ${insertError.message}`);
            }
        }

        revalidatePath('/cliente', 'layout');
        return { success: true, error: null };

    } catch (e: any) {
        console.error("Erro na Server Action loginWithApi:", e);
        return { success: false, error: e.message || "Ocorreu um erro inesperado." };
    }
}

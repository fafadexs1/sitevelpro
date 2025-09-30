
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

// =====================================================
// Data Types
// =====================================================
type ContratoAPI = {
    contrato: number;
    razaosocial: string;
    cpfcnpj: string;
    status: string;
    vencimento: number;
    planointernet: string;
    planointernet_valor: number;
    planotv: string;
    planotv_valor: number;
    endereco_instalacao: {
        logradouro: string;
        bairro: string;
        cidade: string;
    };
};

export interface Invoice { id: string; due: string; amount: number; status: "paid" | "unpaid" | "cancelled" | string; paidAt?: string | null; pix?: string; link: string, doc: number }
export interface TicketItem { id: string; subject: string; createdAt: string; status: string }
export interface Referral { id: string; name: string; phone: string | null; email: string | null; date: string; status: 'pendente' | 'verificando' | 'aprovado' | 'rejeitado' }

export interface Contract {
  id: string; // O número do contrato
  alias: string; // Nome amigável (ex: "Residencial Centro")
  address: string; // Endereço formatado
  currentPlan: { name: string; price: number; benefits: string[]; tvPack: { name: string; channels: number } };
  usage: { month: string; downloaded: number; uploaded: number; cap: number };
  invoices: Invoice[];
  openTickets: TicketItem[];
  referrals: Referral[];
}

// =====================================================
// Context
// =====================================================
interface ContractContextType {
    contracts: Omit<Contract, 'invoices' | 'openTickets' | 'referrals'>[];
    selectedContractId: string | null;
    setSelectedContractId: (id: string) => void;
    contract: Omit<Contract, 'invoices' | 'openTickets' | 'referrals'> | undefined;
    loading: boolean;
    error: string | null;
    pixModal: { open: boolean, code: string | null };
    setPixModal: React.Dispatch<React.SetStateAction<{ open: boolean, code: string | null }>>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children, user }: { children: React.ReactNode, user: User | null }) {
    const [contracts, setContracts] = useState<Omit<Contract, 'invoices' | 'openTickets' | 'referrals'>[]>([]);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });
    
    // Função para buscar os contratos base
    useEffect(() => {
        const fetchContracts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const supabase = createClient();

            const { data, error: dbError } = await supabase
                .from('clientes')
                .select('contratos, selected_contract_id')
                .eq('user_id', user.id)
                .single();
            
            if (dbError || !data || !data.contratos) {
                setError(dbError ? "Não foi possível carregar os dados do cliente." : "Nenhum contrato encontrado para este usuário.");
                if(dbError) console.error("Error fetching client data:", dbError);
                setContracts([]);
                setLoading(false);
                return;
            }

            const contratosAPI = data.contratos as ContratoAPI[];
            const transformedContracts = contratosAPI.map((c: ContratoAPI) => ({
                id: String(c.contrato),
                alias: `Contrato ${c.contrato} (${c.status.trim()})`,
                address: `${c.endereco_instalacao.logradouro}, ${c.endereco_instalacao.bairro}, ${c.endereco_instalacao.cidade}`,
                currentPlan: { name: c.planointernet, price: c.planointernet_valor, benefits: ["Wi‑Fi 6 incluso", "Streaming 4K"], tvPack: { name: c.planotv || "N/A", channels: 80 } },
                usage: { month: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric'}), downloaded: Math.floor(Math.random() * 1000), uploaded: Math.floor(Math.random() * 200), cap: 2048 },
            }));
            
            setContracts(transformedContracts);
            setSelectedContractId(data.selected_contract_id || String(contratosAPI[0]?.contrato) || null);
            setLoading(false);
        };

        fetchContracts();
    }, [user]);

    const handleSetSelectedId = useCallback(async (id: string) => {
        setSelectedContractId(id);
        const supabase = createClient();
        if (user) {
            await supabase.from('clientes').update({ selected_contract_id: id }).eq('user_id', user.id);
        }
    }, [user]);

    const contract = useMemo(() => {
        return contracts.find(c => c.id === selectedContractId);
    }, [contracts, selectedContractId]);
    
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ContractContext.Provider value={{ contracts, selectedContractId, setSelectedContractId: handleSetSelectedId, contract, loading, error, pixModal, setPixModal }}>
            {children}
        </ContractContext.Provider>
    );
}

export function useContract() {
    const context = useContext(ContractContext);
    if (context === undefined) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
}

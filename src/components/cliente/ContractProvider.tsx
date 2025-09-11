
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

// =====================================================
// Data Types
// =====================================================
// Tipos espelhando a API externa
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

// Tipos para uso interno no front-end (mais limpos)
export interface Invoice { id: string; due: string; amount: number; status: "paid" | "unpaid"; paidAt?: string; pix?: string }
export interface FutureInvoice { id: string; due: string; amount: number }
export interface TicketItem { id: string; subject: string; createdAt: string; status: string }
export interface Referral { id: string; name: string; date: string; status: 'Pendente' | 'Aprovado' | 'Rejeitado'; email: string; phone: string; }

export interface Contract {
  id: string; // O número do contrato
  alias: string; // Nome amigável (ex: "Residencial Centro")
  address: string; // Endereço formatado
  // Mock data por enquanto, será substituído por chamadas de API reais
  currentPlan: { name: string; price: number; benefits: string[]; tvPack: { name: string; channels: number } };
  usage: { month: string; downloaded: number; uploaded: number; cap: number };
  invoices: Invoice[];
  futureInvoices: FutureInvoice[];
  openTickets: TicketItem[];
  referrals: Referral[];
}

// =====================================================
// Context
// =====================================================
interface ContractContextType {
    contracts: Contract[];
    selectedContractId: string | null;
    setSelectedContractId: (id: string) => void;
    contract: Contract | undefined;
    loading: boolean;
    error: string | null;
    pixModal: { open: boolean, code: string | null };
    setPixModal: React.Dispatch<React.SetStateAction<{ open: boolean, code: string | null }>>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children, user }: { children: React.ReactNode, user: User | null }) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });

    const transformApiToContract = (c: ContratoAPI): Contract => {
        // Lógica de transformação aqui. Por enquanto, usa dados mockados para o que não vem da API.
        const address = `${c.endereco_instalacao.logradouro}, ${c.endereco_instalacao.bairro}, ${c.endereco_instalacao.cidade}`;
        
        // Dados mockados para as partes que não vêm da API ainda
        const mockData = {
            currentPlan: { name: c.planointernet, price: c.planointernet_valor, benefits: ["Wi‑Fi 6 incluso", "Streaming 4K"], tvPack: { name: c.planotv || "N/A", channels: 80 } },
            usage: { month: "Setembro/2025", downloaded: Math.floor(Math.random() * 1000), uploaded: Math.floor(Math.random() * 200), cap: 2048 },
            invoices: [
                 { id: `2025-08-${c.contrato}`, due: "2025-09-10", amount: c.planointernet_valor, status: "unpaid", pix: "00020126...ABCD" + c.contrato },
                 { id: `2025-07-${c.contrato}`, due: "2025-08-10", amount: c.planointernet_valor, status: "paid", paidAt: "2025-08-05" },
            ],
            futureInvoices: [ { id: `2025-09-${c.contrato}`, due: "2025-10-10", amount: c.planointernet_valor } ],
            openTickets: [],
            referrals: [],
        };
        
        return {
            id: String(c.contrato),
            alias: `Contrato ${c.contrato} (${c.status.trim()})`,
            address: address,
            ...mockData,
        };
    };

    const handleSetSelectedId = useCallback(async (id: string) => {
        setSelectedContractId(id);
        const supabase = createClient();
        if (user) {
            const { error } = await supabase
                .from('clientes')
                .update({ selected_contract_id: id })
                .eq('user_id', user.id);
            if (error) {
                console.error("Failed to save selected contract", error);
            }
        }
    }, [user]);

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
            
            if (dbError) {
                if (dbError.code === 'PGRST116') { // No rows found
                     setError("Nenhum contrato encontrado para este usuário.");
                } else {
                    setError("Não foi possível carregar os dados do cliente.");
                    console.error("Error fetching client data:", dbError);
                }
                setLoading(false);
                setContracts([]);
                return;
            }
            
            if (!data || !data.contratos) {
                setContracts([]);
                setSelectedContractId(null);
                setLoading(false);
                return;
            }

            const contratosAPI = data.contratos as ContratoAPI[];
            const transformedContracts = contratosAPI.map(transformApiToContract);
            
            setContracts(transformedContracts);
            setSelectedContractId(data.selected_contract_id || String(contratosAPI[0]?.contrato) || null);
            setLoading(false);
        };

        fetchContracts();
    }, [user]);

    const contract = useMemo(() => contracts.find(c => c.id === selectedContractId), [contracts, selectedContractId]);
    
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

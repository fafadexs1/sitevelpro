
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { getInvoices } from "@/actions/invoiceActions";
import { getWorkOrders } from "@/actions/workOrderActions";
import { useToast } from "@/hooks/use-toast";

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

type ApiInvoice = { id: number; dataVencimento: string; valor: number; status: string; dataPagamento: string | null; codigoPix: string; link: string; numeroDocumento: number };
type ApiWorkOrder = { id: number; ocorrencia: string; motivo: string; data_cadastro: string; hora_cadastro: string; status: string; };

export interface Invoice { id: string; due: string; amount: number; status: "paid" | "unpaid" | "cancelled" | string; paidAt?: string | null; pix?: string; link: string, doc: number }
export interface TicketItem { id: string; subject: string; createdAt: string; status: string }

export interface Contract {
  id: string; // O número do contrato
  alias: string; // Nome amigável (ex: "Residencial Centro")
  address: string; // Endereço formatado
  currentPlan: { name: string; price: number; benefits: string[]; tvPack: { name: string; channels: number } };
  usage: { month: string; downloaded: number; uploaded: number; cap: number };
  invoices: Invoice[];
  openTickets: TicketItem[];
}

// =====================================================
// Context
// =====================================================
interface ContractContextType {
    contracts: Omit<Contract, 'invoices' | 'openTickets'>[];
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
    const { toast } = useToast();
    const [contracts, setContracts] = useState<Omit<Contract, 'invoices' | 'openTickets'>[]>([]);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [openTickets, setOpenTickets] = useState<TicketItem[]>([]);
    
    const [loadingContracts, setLoadingContracts] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });
    
    const loading = loadingContracts || loadingDetails;

    // Função para buscar os contratos base
    useEffect(() => {
        const fetchContracts = async () => {
            if (!user) {
                setLoadingContracts(false);
                return;
            }
            setLoadingContracts(true);
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
                setLoadingContracts(false);
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
            setLoadingContracts(false);
        };

        fetchContracts();
    }, [user]);
    
    // Função para buscar detalhes (faturas, chamados) do contrato selecionado
    useEffect(() => {
        const fetchContractDetails = async () => {
            if (!selectedContractId) return;
            setLoadingDetails(true);
            const supabase = createClient();
            const currentYear = new Date().getFullYear();

            // Stale-while-revalidate for invoices of the current year
            const { data: cachedInvoices } = await supabase.from('invoices').select('invoices_data').eq('contract_id', selectedContractId).single();
            if (cachedInvoices?.invoices_data) {
                const apiInvoices = (cachedInvoices.invoices_data as ApiInvoice[]).filter(inv => new Date(inv.dataVencimento).getFullYear() === currentYear);
                setInvoices(apiInvoices.map(f => ({ id: String(f.id), doc: f.numeroDocumento, due: f.dataVencimento, amount: f.valor, status: f.status, paidAt: f.dataPagamento, pix: f.codigoPix, link: f.link })));
            }
             getInvoices(parseInt(selectedContractId, 10), currentYear).then(result => {
                if (result.success && result.data) {
                    setInvoices(result.data.map(f => ({ id: String(f.id), doc: f.numeroDocumento, due: f.dataVencimento, amount: f.valor, status: f.status, paidAt: f.dataPagamento, pix: f.codigoPix, link: f.link })));
                } else if(!cachedInvoices) {
                     toast({ variant: 'destructive', title: 'Erro ao buscar faturas', description: result.error });
                }
             });

            // Stale-while-revalidate for work orders of the current year
            const { data: cachedOrders } = await supabase.from('work_orders').select('orders').eq('contract_id', selectedContractId).single();
            if (cachedOrders?.orders) {
                const apiOrders = (cachedOrders.orders as ApiWorkOrder[]).filter(o => new Date(o.data_cadastro).getFullYear() === currentYear);
                setOpenTickets(apiOrders.filter(o => o.status.toLowerCase() !== 'encerrada' && o.status.toLowerCase() !== 'encerrado').map(o => ({ id: String(o.ocorrencia), subject: o.motivo, createdAt: `${new Date(o.data_cadastro).toLocaleDateString()} ${o.hora_cadastro}`, status: o.status })));
            }
             getWorkOrders(parseInt(selectedContractId, 10), currentYear).then(result => {
                if (result.success && result.data) {
                    setOpenTickets(result.data.filter(o => o.status.toLowerCase() !== 'encerrada' && o.status.toLowerCase() !== 'encerrado').map(o => ({ id: String(o.ocorrencia), subject: o.motivo, createdAt: `${new Date(o.data_cadastro).toLocaleDateString()} ${o.hora_cadastro}`, status: o.status })));
                } else if(!cachedOrders) {
                    toast({ variant: 'destructive', title: 'Erro ao buscar chamados', description: result.error });
                }
             });

            setLoadingDetails(false);
        };
        fetchContractDetails();
    }, [selectedContractId, toast]);

    const handleSetSelectedId = useCallback(async (id: string) => {
        setSelectedContractId(id);
        const supabase = createClient();
        if (user) {
            await supabase.from('clientes').update({ selected_contract_id: id }).eq('user_id', user.id);
        }
    }, [user]);

    const contract = useMemo(() => {
        const baseContract = contracts.find(c => c.id === selectedContractId);
        if (!baseContract) return undefined;
        
        const sortedInvoices = invoices.sort((a,b) => new Date(b.due).getTime() - new Date(a.due).getTime());

        return {
            ...baseContract,
            invoices: sortedInvoices,
            openTickets: openTickets,
        }
    }, [contracts, selectedContractId, invoices, openTickets]);
    
    if (loadingContracts) {
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

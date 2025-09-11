
"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

// =====================================================
// Data Types
// =====================================================
interface Invoice { id: string; due: string; amount: number; status: "paid" | "unpaid"; paidAt?: string; pix?: string }
interface FutureInvoice { id: string; due: string; amount: number }
interface TicketItem { id: string; subject: string; createdAt: string; status: string }
interface Referral { id: string; name: string; date: string; status: 'Pendente' | 'Aprovado' | 'Rejeitado'; email: string; phone: string; }
interface Plan { name: string; price: number; benefits: string[]; tvPack: { name: string; channels: number } }
interface Usage { month: string; downloaded: number; uploaded: number; cap: number }
interface Contract {
  id: string;
  alias: string;
  address: string;
  currentPlan: Plan;
  usage: Usage;
  invoices: Invoice[];
  futureInvoices: FutureInvoice[];
  openTickets: TicketItem[];
  referrals: Referral[];
}

// =====================================================
// Mock API / Fixtures
// =====================================================
function useMockApi() {
  const contracts: Contract[] = [
    {
      id: "C-001",
      alias: "Residencial • Centro",
      address: "Rua da Fibra, 1000 — Centro",
      currentPlan: { name: "300 Mega + TV Max", price: 99.9, benefits: ["Wi‑Fi 6 incluso", "Streaming 4K", "Suporte qualificado"], tvPack: { name: "TV Max", channels: 120 } },
      usage: { month: "Setembro/2025", downloaded: 820, uploaded: 140, cap: 2048 },
      invoices: [
        { id: "2025-08", due: "2025-09-10", amount: 99.9, status: "unpaid", pix: "00020126...ABCD" },
        { id: "2025-07", due: "2025-08-10", amount: 99.9, status: "paid", paidAt: "2025-08-05" },
        { id: "2025-06", due: "2025-07-10", amount: 99.9, status: "paid", paidAt: "2025-07-08" },
      ],
      futureInvoices: [ { id: "2025-09", due: "2025-10-10", amount: 99.9 } ],
      openTickets: [
        { id: "#3412", subject: "Oscilação de sinal", createdAt: "2025-09-01 09:22", status: "em análise" },
      ],
      referrals: [
          { id: "ref-1", name: "João da Silva", date: "2025-08-15", status: "Aprovado", email: 'joao@example.com', phone: '(11) 98765-4321' },
          { id: "ref-2", name: "Maria Oliveira", date: "2025-09-02", status: "Pendente", email: 'maria@example.com', phone: '(21) 99999-8888' },
      ],
    },
    {
      id: "C-002",
      alias: "Empresarial • Loja",
      address: "Av. Backbone, 200 — Centro",
      currentPlan: { name: "500 Mega + TV Max", price: 129.9, benefits: ["IP fixo opcional", "QoS avançada", "Atendimento prioritário"], tvPack: { name: "TV Max", channels: 120 } },
      usage: { month: "Setembro/2025", downloaded: 1260, uploaded: 260, cap: 4096 },
      invoices: [
        { id: "2025-08", due: "2025-09-12", amount: 129.9, status: "paid", paidAt: "2025-09-08" },
        { id: "2025-07", due: "2025-08-12", amount: 129.9, status: "paid", paidAt: "2025-08-09" },
      ],
      futureInvoices: [ { id: "2025-09", due: "2025-10-12", amount: 129.9 } ],
      openTickets: [
        { id: "#3390", subject: "Upgrade para 1 Giga", createdAt: "2025-08-29 14:03", status: "aguardando cliente" },
      ],
      referrals: [],
    }
  ];

  return { contracts };
}

// =====================================================
// Context
// =====================================================

interface ContractContextType {
    contracts: Contract[];
    selectedContractId: string | null;
    setSelectedContractId: (id: string) => void;
    contract: Contract | undefined;
    pixModal: { open: boolean, code: string | null };
    setPixModal: React.Dispatch<React.SetStateAction<{ open: boolean, code: string | null }>>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: React.ReactNode }) {
    const { contracts } = useMockApi();
    const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id ?? null);
    const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });

    const contract = useMemo(() => contracts.find(c => c.id === selectedContractId), [contracts, selectedContractId]);

    return (
        <ContractContext.Provider value={{ contracts, selectedContractId, setSelectedContractId, contract, pixModal, setPixModal }}>
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


"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Wifi, CreditCard, Receipt,
  FileText, ArrowRight, Loader2, ChevronRight, CheckCircle2,
  XCircle, QrCode, Copy, ShieldCheck, Settings, Headphones, Share2,
  Ticket, Bell, Wallet, Tv, X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePathname, useRouter } from "next/navigation";
import {
    ContractProvider,
    useContract
} from "@/components/cliente/ContractProvider";
import { Pill, ProgressBar, StatusBadge } from "./ui-helpers";


// =====================================================
// Shared UI
// =====================================================
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{children}</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

// =====================================================
// Dashboard with Multi-Contracts + Top Menu Tabs
// =====================================================
const TABS = [
  { key: "overview", label: "Visão Geral" },
  { key: "tickets", label: "Chamados Técnicos" },
  { key: "invoices", label: "Faturas" },
  { key: "traffic", label: "Tráfego" },
  { key: "plans", label: "Planos" },
  { key: "friends", label: "Indicar Amigo", icon: Share2 },
  { key: "contract", label: "Contrato" },
] as const;

export function Dashboard({onLogout}: {onLogout: () => void}) {
  const { contracts } = useContract();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("overview");
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id);
  const contract = useMemo(() => contracts.find(c => c.id === selectedContractId)!, [contracts, selectedContractId]);
  const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });
    
  if (!contract) {
      return <div>Carregando...</div>;
  }

  const unpaid = contract.invoices.find(i => i.status === "unpaid");


  return (
    <div className="min-h-screen bg-secondary text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-foreground shadow-lg shadow-primary/20">
              <Wifi className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">Velpro • Área do Cliente</p>
              <p className="text-[11px] text-muted-foreground">Internet + TV</p>
            </div>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-3 text-sm">
            {/* Contract selector */}
            <select id="contract-selector" value={selectedContractId} onChange={(e) => setSelectedContractId(e.target.value)} className="max-w-[150px] truncate rounded-lg border border-border bg-card px-2 py-1.5 outline-none sm:max-w-xs">
              {contracts.map(c => (
                <option key={c.id} value={c.id}>{c.alias}</option>
              ))}
            </select>
            <div className="hidden items-center gap-2 sm:flex">
              <button id="notifications-button"><Bell className="h-4 w-4 text-muted-foreground" /></button>
              <button id="settings-button"><Settings className="h-4 w-4 text-muted-foreground" /></button>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary/20 text-[11px] font-bold">VO</div>
                <span className="text-card-foreground">Olá, Você</span>
              </div>
            </div>
             <button id="dashboard-logout" onClick={onLogout} className="text-muted-foreground hover:text-foreground">Sair</button>
          </div>
        </div>
        {/* Top horizontal menu */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <nav className="flex gap-2 border-t border-border py-2">
            {TABS.map(t => (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                {t.icon && <t.icon className="h-4 w-4" />}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        
      </div>

      {/* PIX Modal */}
      <AnimatePresence>
        {pixModal.open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold"><QrCode className="h-5 w-5 text-primary" /> Código PIX</div>
                <button id="pix-modal-close" onClick={() => setPixModal({ open: false, code: null })} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="rounded-xl border border-border bg-secondary p-3 text-xs text-secondary-foreground select-all break-all">
                {pixModal.code}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button id="pix-modal-copy" onClick={() => {
                  if(pixModal.code) navigator.clipboard?.writeText(pixModal.code)
                  toast({title: "Copiado!", description: "O código PIX foi copiado para a área de transferência."});
                }} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">
                  <Copy className="h-4 w-4" /> Copiar
                </button>
                <a id="pix-modal-download-pdf" href="#" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-sm text-background"><Receipt className="h-4 w-4" /> Baixar boleto</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

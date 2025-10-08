
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Share2,
  Ticket, Bell, Wallet, Tv, X, Copy, QrCode, Receipt, LogOut
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { useContract } from "@/components/cliente/ContractProvider";
import { Wifi } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";


// =====================================================
// Componente de Logo Dinâmico
// =====================================================
function DynamicLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'company_logo_url')
        .single();
      
      if (data?.value) {
        setLogoUrl(data.value);
      }
      setLoading(false);
    };
    fetchLogo();
  }, []);

  if (loading) {
    return <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary" />;
  }

  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20 overflow-hidden">
      {logoUrl ? (
        <Image src={logoUrl} alt="Logo da Empresa" width={36} height={36} className="object-contain" />
      ) : (
        <Wifi className="h-5 w-5" />
      )}
    </div>
  );
}

// =====================================================
// Dashboard with Multi-Contracts + Top Menu Tabs
// =====================================================
const TABS = [
  { key: "overview", label: "Visão Geral", href: "/cliente"},
  { key: "tickets", label: "Chamados", href: "/cliente/chamados" },
  { key: "invoices", label: "Faturas", href: "/cliente/faturas" },
  { key: "traffic", label: "Tráfego", href: "/cliente/trafego" },
  { key: "plans", label: "Planos", href: "/cliente/planos" },
  { key: "friends", label: "Indicar Amigo", icon: Share2, href: "/cliente/indicar-amigo" },
  { key: "contract", label: "Contrato", href: "/cliente/contrato" },
] as const;

export function Dashboard({ children }: { children: React.ReactNode }) {
  const { contracts, selectedContractId, setSelectedContractId, contract, pixModal, setPixModal } = useContract();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // Força o layout a reavaliar o estado de login
  };
    
  if (!contract || !contracts || contracts.length === 0) {
      return <div className="flex min-h-screen items-center justify-center text-center p-4">
          <div>
            <p className="font-semibold">Nenhum contrato encontrado.</p>
            <p className="text-sm text-muted-foreground">Não foi possível carregar os dados dos seus contratos. Por favor, tente novamente mais tarde.</p>
            <Button onClick={handleLogout} variant="outline" className="mt-4">Sair</Button>
          </div>
      </div>;
  }
  
  const activeTab = TABS.find(t => t.href === pathname)?.key || 'overview';

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <DynamicLogo />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">Velpro • Área do Cliente</p>
              <p className="text-[11px] text-muted-foreground">Internet + TV</p>
            </div>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-3 text-sm">
            {/* Contract selector */}
            <select id="contract-selector" value={selectedContractId || ''} onChange={(e) => setSelectedContractId(e.target.value)} className="max-w-[150px] truncate rounded-lg border border-border bg-card px-2 py-1.5 outline-none sm:max-w-xs">
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
             <Button id="dashboard-logout" onClick={handleLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-1"/>
                Sair
            </Button>
          </div>
        </div>
        {/* Top horizontal menu */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <nav className="flex gap-2 border-t border-border py-2">
            {TABS.map(t => (
              <Link
                key={t.key}
                id={`tab-${t.key}`}
                href={t.href}
                className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                {t.icon && <t.icon className="h-4 w-4" />}
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>

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


"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, User, Lock, Eye, EyeOff, Zap, Wifi, Gauge, CreditCard, Receipt,
  FileText, TrendingUp, ArrowRight, Loader2, ChevronRight, CheckCircle2,
  XCircle, QrCode, Copy, ShieldCheck, Settings, Headphones, Share2,
  Ticket, Bell, Wallet, Tv, X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

// =====================================================
// Data Types
// =====================================================
interface Invoice { id: string; due: string; amount: number; status: "paid" | "unpaid"; paidAt?: string; pix?: string }
interface FutureInvoice { id: string; due: string; amount: number }
interface TicketItem { id: string; subject: string; createdAt: string; status: string }
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
}

const referralSchema = z.object({
  referred_name: z.string().min(3, "Nome do amigo é obrigatório."),
  referred_phone: z.string().min(10, "Telefone inválido."),
  referred_email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
});
type ReferralFormData = z.infer<typeof referralSchema>;

// =====================================================
// Mock API / Fixtures (2+ contracts)
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
    }
  ];

  return { contracts };
}

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

function LightningBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-2xl" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-40 origin-left bg-primary/70"
          initial={{ opacity: 0, rotate: -10, x: -50, y: 40 * i }}
          animate={{ opacity: [0, 1, 0], x: [0, 20, 100] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 + i * 0.2, ease: "easeOut" }}
          style={{ top: `${10 + i * 12}%`, left: `${5 + (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}

// =====================================================
// Login Screen (same identity)
// =====================================================
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LightningBG />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-foreground shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">Velpro Telecom</p>
            <p className="text-xs text-muted-foreground">Área do Cliente</p>
          </div>
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" /> Internet + TV com suporte qualificado
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Bem-vindo à sua <span className="bg-gradient-to-r from-green-300 to-primary bg-clip-text text-transparent">central</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Emita 2ª via, copie PIX, acompanhe faturas e suporte em tempo real. Tudo em um lugar só.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Entrar</h2>
            <p className="text-sm text-muted-foreground">Acesse com seu CPF/CNPJ e senha</p>
          </div>

          <label className="mb-3 block text-sm text-card-foreground">CPF ou CNPJ</label>
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <input required id="login-document" placeholder="000.000.000-00" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>

          <label className="mb-3 mt-4 block text-sm text-card-foreground">Senha</label>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input required id="login-password" type={show ? "text" : "password"} placeholder="••••••••" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
            <button id="login-toggle-password" type="button" aria-label="toggle" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
            <label className="inline-flex items-center gap-2"><input id="login-remember" type="checkbox" className="h-3.5 w-3.5 rounded border-border bg-transparent" /> Lembrar</label>
            <a id="login-forgot-password" className="hover:text-foreground" href="#">Esqueci a senha</a>
          </div>

          <button id="login-submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Acessar minha conta
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">Ao continuar, você concorda com os Termos e a Política de Privacidade.</p>
        </motion.form>
      </div>
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

function Dashboard({onLogout}: {onLogout: () => void}) {
  const { contracts } = useMockApi();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("overview");
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id);
  const contract = useMemo(() => contracts.find(c => c.id === selectedContractId)!, [contracts, selectedContractId]);
  const [pixModal, setPixModal] = useState<{ open: boolean; code: string | null }>({ open: false, code: null });
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
    
  const referralForm = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referred_name: '', referred_phone: '', referred_email: '' },
  });

  async function handleReferralSubmit(data: ReferralFormData) {
    setIsSubmittingReferral(true);
    const supabase = createClient();
    const { error } = await supabase.from('referrals').insert({
        ...data,
        referrer_customer_id: contract.id, // Ou o ID real do cliente logado
    });

    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível enviar a indicação: ${error.message}`});
    } else {
        toast({ title: 'Sucesso!', description: 'Sua indicação foi enviada! Agradecemos a confiança.' });
        referralForm.reset();
    }
    setIsSubmittingReferral(false);
  }


  const unpaid = contract.invoices.find(i => i.status === "unpaid");
  const usagePct = Math.round(((contract.usage.downloaded + contract.usage.uploaded) / contract.usage.cap) * 100);


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
        {/* Global unpaid alert per contract */}
        {unpaid && (
          <div className="mb-6 rounded-2xl border border-primary/50 bg-primary/10 p-4 text-primary">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Fatura em aberto ({unpaid.id}) — {contract.alias}</p>
                  <p className="text-sm opacity-80">Vencimento em {new Date(unpaid.due).toLocaleDateString("pt-BR")}. Valor R$ {unpaid.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                {unpaid.pix && (
                  <button id={`unpaid-alert-pix-${unpaid.id}`} onClick={() => setPixModal({ open: true, code: unpaid.pix! })} className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm">
                    <QrCode className="h-4 w-4" /> Copiar PIX
                  </button>
                )}
                <a id={`unpaid-alert-pdf-${unpaid.id}`} href="#" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-sm text-background">
                  <Receipt className="h-4 w-4" /> 2ª via (PDF)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Quick stats */}
                <div className="lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><Gauge className="h-4 w-4 text-primary"/> Tráfego do mês</div>
                    <div className="text-2xl font-bold">{contract.usage.downloaded + contract.usage.uploaded} GB</div>
                    <div className="mt-2"><ProgressBar value={usagePct} /></div>
                    <div className="mt-1 text-xs text-muted-foreground">{usagePct}% de {contract.usage.cap} GB</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Plano atual</div>
                    <div className="text-lg font-semibold">{contract.currentPlan.name}</div>
                    <div className="text-muted-foreground">R$ {contract.currentPlan.price.toFixed(2)} / mês</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Tv className="h-4 w-4 text-primary"/> {contract.currentPlan.tvPack.name} • {contract.currentPlan.tvPack.channels}+ canais</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Faturas pagas (3 últimos meses)</div>
                    <div className="text-2xl font-bold">{contract.invoices.filter(i=>i.status==='paid').length}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Chamados abertos</div>
                    <div className="text-2xl font-bold">{contract.openTickets.length}</div>
                  </div>
                </div>

                {/* Plan card */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-3 text-sm text-muted-foreground">{contract.alias} • {contract.address}</div>
                  <div className="text-xl font-bold">{contract.currentPlan.name}</div>
                  <div className="text-muted-foreground">R$ {contract.currentPlan.price.toFixed(2)} / mês</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">{contract.currentPlan.benefits.map(b=> <Pill key={b}>{b}</Pill>)}</div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Tv className="h-4 w-4 text-primary"/> {contract.currentPlan.tvPack.name} • {contract.currentPlan.tvPack.channels}+ canais</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button id="overview-view-contract" onClick={() => setActiveTab('contract')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><FileText className="h-4 w-4"/> Ver contrato</button>
                    <button id="overview-refer-friend" onClick={() => setActiveTab('friends')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><Share2 className="h-4 w-4"/> Indicar amigo</button>
                    <button id="overview-support" onClick={() => setActiveTab('tickets')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><Headphones className="h-4 w-4"/> Suporte</button>
                  </div>
                </div>

                {/* Invoices summary */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Faturas recentes</h3>
                    <button id="overview-view-all-invoices" onClick={() => setActiveTab('invoices')} className="text-sm text-muted-foreground hover:text-foreground">Ver todas</button>
                  </div>
                  <div className="space-y-3">
                    {contract.invoices.slice(0,3).map((f) => (
                      <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">{f.id}</div>
                          <div className="text-xs text-muted-foreground">Venc. {new Date(f.due).toLocaleDateString("pt-BR")} • R$ {f.amount.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Paga</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-600"><XCircle className="h-3.5 w-3.5" /> Em aberto</span>
                          )}
                          <a id={`overview-invoice-pdf-${f.id}`} href="#" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                          {f.status !== "paid" && f.pix && (
                            <button id={`overview-invoice-pix-${f.id}`} onClick={() => setPixModal({ open: true, code: f.pix! })} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><QrCode className="h-3.5 w-3.5" /> PIX</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tickets summary */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Chamados abertos</h3>
                    <button id="overview-view-all-tickets" onClick={() => setActiveTab('tickets')} className="text-sm text-muted-foreground hover:text-foreground">Ver todos</button>
                  </div>
                  <div className="space-y-3">
                    {contract.openTickets.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-secondary p-3">
                        <div className="flex items-start justify-between text-sm gap-2">
                          <div className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary flex-shrink-0" /> <span><b>{t.id}</b> — {t.subject}</span></div>
                          <Pill>{t.status}</Pill>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Aberto em {t.createdAt}</div>
                      </div>
                    ))}
                     {contract.openTickets.length === 0 && <div className="text-sm text-muted-foreground">Nenhum chamado aberto.</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Chamados técnicos — {contract.alias}</h3>
                    <a id="new-ticket-button" href="#" className="text-sm text-muted-foreground hover:text-foreground">Novo chamado</a>
                  </div>
                  <div className="space-y-3">
                    {contract.openTickets.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-secondary p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> <b>{t.id}</b> — {t.subject}</div>
                          <Pill>{t.status}</Pill>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Aberto em {t.createdAt}</div>
                      </div>
                    ))}
                    {contract.openTickets.length === 0 && <div className="text-sm text-muted-foreground">Nenhum chamado aberto.</div>}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="text-sm text-muted-foreground">Dicas rápidas</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Reinicie o roteador (30s) antes de abrir chamado.</li>
                    <li>Teste por cabo para medir velocidade real.</li>
                    <li>Tenha o horário das quedas e leds do modem.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Em aberto + Futuras */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-3 text-lg font-semibold">Faturas em aberto</h3>
                  {contract.invoices.filter(f=>f.status==='unpaid').length === 0 ? (
                    <div className="rounded-xl border border-border bg-secondary p-3 text-sm text-muted-foreground">Nenhuma fatura em aberto.</div>
                  ) : (
                    <div className="space-y-3">
                      {contract.invoices.filter(f=>f.status==='unpaid').map(f => (
                        <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                          <div>
                            <div className="text-sm font-medium">{f.id}</div>
                            <div className="text-xs text-muted-foreground">Venc. {new Date(f.due).toLocaleDateString("pt-BR")} • R$ {f.amount.toFixed(2)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a id={`invoice-pdf-${f.id}`} href="#" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                            {f.pix && (<button id={`invoice-pix-${f.id}`} onClick={() => setPixModal({ open: true, code: f.pix! })} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><QrCode className="h-3.5 w-3.5" /> PIX</button>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6">
                    <h4 className="mb-2 font-semibold">Futuras faturas</h4>
                    {contract.futureInvoices.length === 0 ? (
                      <div className="rounded-xl border border-border bg-secondary p-3 text-sm text-muted-foreground">Sem futuras faturas.</div>
                    ) : (
                      <div className="space-y-2 text-sm text-card-foreground">
                        {contract.futureInvoices.map(fi => (
                          <div key={fi.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2">
                            <span><b>{fi.id}</b> • vence em {new Date(fi.due).toLocaleDateString("pt-BR")}</span>
                            <span>R$ {fi.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Histórico */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                  <div className="mb-3 text-lg font-semibold">Histórico de faturas</div>
                  <div className="space-y-3">
                    {contract.invoices.map((f) => (
                      <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">{f.id}</div>
                          <div className="text-xs text-muted-foreground">Venc. {new Date(f.due).toLocaleDateString("pt-BR")} • R$ {f.amount.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Paga</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-600"><XCircle className="h-3.5 w-3.5" /> Em aberto</span>
                          )}
                          <a id={`invoice-history-pdf-${f.id}`} href="#" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                          {f.status !== "paid" && f.pix && (
                            <button id={`invoice-history-pix-${f.id}`} onClick={() => setPixModal({ open: true, code: f.pix! })} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><QrCode className="h-3.5 w-3.5" /> PIX</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "traffic" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 text-lg font-semibold">Tráfego — {contract.alias} ({contract.usage.month})</div>
                <div className="max-w-xl">
                  <div className="mb-2 text-sm text-muted-foreground">Consumo total</div>
                  <ProgressBar value={usagePct} />
                  <div className="mt-1 text-xs text-muted-foreground">{contract.usage.downloaded + contract.usage.uploaded} GB de {contract.usage.cap} GB</div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {["Download", "Upload"].map((label, idx) => (
                    <div key={label} className="rounded-xl border border-border bg-secondary p-4">
                      <div className="mb-1 text-sm text-muted-foreground">{label}</div>
                      <div className="text-2xl font-bold">{idx === 0 ? contract.usage.downloaded : contract.usage.uploaded} GB</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "plans" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-1 text-sm text-muted-foreground">{contract.alias}</div>
                <div className="text-lg font-semibold">Plano atual</div>
                <div className="text-muted-foreground">{contract.currentPlan.name} — R$ {contract.currentPlan.price.toFixed(2)}/mês</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Tv className="h-4 w-4 text-primary"/> {contract.currentPlan.tvPack.name} • {contract.currentPlan.tvPack.channels}+ canais</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">{contract.currentPlan.benefits.map(b=> <Pill key={b}>{b}</Pill>)}</div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[{ name: "100 Mega + TV Start", price: 79.9, tag: "Econômico" }, { name: "500 Mega + TV Max", price: 129.9, tag: "Performance" }, { name: "1 Giga + TV Ultra", price: 199.9, tag: "Premium" }].map((p) => (
                    <div key={p.name} className="rounded-xl border border-border bg-secondary p-4">
                      <div className="mb-1 text-xs text-muted-foreground">{p.tag}</div>
                      <div className="text-lg font-semibold">{p.name}</div>
                      <div className="text-muted-foreground">R$ {p.price.toFixed(2)} / mês</div>
                      <button id={`upgrade-plan-${p.name.replace(/\s/g, '-')}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                        Solicitar upgrade <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "friends" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="grid gap-8 md:grid-cols-2">
                    <div>
                        <h3 className="text-2xl font-bold">Indique um Amigo e Ganhe!</h3>
                        <p className="mt-2 text-muted-foreground">Para cada amigo que contratar nosso serviço através da sua indicação, você ganha <span className="font-bold text-primary">R$ 50,00 de desconto</span> na sua próxima fatura. É simples, rápido e todo mundo sai ganhando!</p>
                        <div className="mt-6">
                            <label className="text-sm font-medium">Seu link exclusivo de indicação:</label>
                             <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
                                <input readOnly value={`https://velpro.com.br/indicacao/${contract.id}`} className="flex-1 bg-transparent px-2 text-sm outline-none"/>
                                <button onClick={() => { navigator.clipboard.writeText(`https://velpro.com.br/indicacao/${contract.id}`); toast({title: "Link copiado!"}); }} className="rounded-md bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
                                    <Copy className="h-4 w-4"/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold">Ou preencha os dados do seu amigo:</h4>
                        <p className="text-sm text-muted-foreground mb-4">Nós entramos em contato com ele.</p>
                        <Form {...referralForm}>
                            <form onSubmit={referralForm.handleSubmit(handleReferralSubmit)} className="space-y-4">
                                <FormField control={referralForm.control} name="referred_name" render={({ field }) => (<FormItem><FormLabel>Nome do amigo</FormLabel><FormControl><Input placeholder="Nome completo" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                <FormField control={referralForm.control} name="referred_phone" render={({ field }) => (<FormItem><FormLabel>Telefone do amigo</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                <FormField control={referralForm.control} name="referred_email" render={({ field }) => (<FormItem><FormLabel>E-mail (opcional)</FormLabel><FormControl><Input placeholder="amigo@email.com" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                <button type="submit" disabled={isSubmittingReferral} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                                    {isSubmittingReferral ? <Loader2 className="h-4 w-4 animate-spin"/> : "Enviar Indicação"}
                                </button>
                            </form>
                        </Form>
                    </div>
                </div>
              </div>
            )}

            {activeTab === "contract" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-1 text-sm text-muted-foreground">{contract.alias} • {contract.address}</div>
                <div className="text-lg font-semibold">Contrato de prestação de serviço</div>
                <p className="mt-2 text-muted-foreground">Visualize o contrato do seu plano, incluindo condições de uso, política de privacidade e dados de faturamento.</p>
                <div className="mt-4 grid gap-2 text-sm text-card-foreground">
                  <div><b>Plano:</b> {contract.currentPlan.name}</div>
                  <div><b>Valor mensal:</b> R$ {contract.currentPlan.price.toFixed(2)}</div>
                  <div><b>Endereço:</b> {contract.address}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <a id="download-contract-pdf" href="#" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-sm text-background"><FileText className="h-4 w-4"/> Baixar PDF</a>
                  <a id="contact-support-contract" href="#" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><Headphones className="h-4 w-4"/> Falar com suporte</a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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

// =====================================================
// App (switch login/dashboard)
// =====================================================
export default function ClientAreaApp() {
  const [logged, setLogged] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {logged ? <Dashboard onLogout={() => setLogged(false)} /> : <LoginScreen onLogin={() => setLogged(true)} />}
    </div>
  );
}

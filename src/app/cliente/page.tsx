
"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { Pill, ProgressBar } from "@/components/cliente/ui-helpers";
import {
  Gauge,
  Tv,
  FileText,
  Share2,
  Headphones,
  Wallet,
  QrCode,
  Receipt,
  CheckCircle2,
  XCircle,
  Ticket
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OverviewPage() {
  const { contract, setPixModal, loading } = useContract();
  const router = useRouter();

  if (loading && !contract) {
    return null; // Don't show anything if there is no cached contract to display while loading
  }

  if (!contract) return null;

  const unpaid = contract.invoices.find(i => i.status.toLowerCase() === "aberto");
  const usagePct = contract.usage.cap > 0 ? Math.round(((contract.usage.downloaded + contract.usage.uploaded) / contract.usage.cap) * 100) : 0;
  
  const getRecentInvoices = () => {
    const allInvoices = [...contract.invoices]
        .filter(f => f.status.toLowerCase() !== 'cancelado')
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    const paidInvoices = allInvoices.filter(f => f.status.toLowerCase() === 'pago');
    const unpaidInvoices = allInvoices.filter(f => f.status.toLowerCase() === 'aberto');

    // 1. Get the last paid invoice
    const lastPaid = paidInvoices.length > 0 ? paidInvoices[paidInvoices.length - 1] : null;

    // 2. Get the next upcoming unpaid invoice
    const nextUnpaid = unpaidInvoices.length > 0 ? unpaidInvoices[0] : null;
    
    // 3. Get the invoice after the next one
    const afterNextUnpaid = unpaidInvoices.length > 1 ? unpaidInvoices[1] : null;

    const recent = [lastPaid, nextUnpaid, afterNextUnpaid].filter(Boolean);
    
    // Remove duplicates if any (e.g., if logic somehow picks the same one)
    const uniqueRecent = Array.from(new Set(recent.map(f => f!.id))).map(id => recent.find(f => f!.id === id));
    
    return uniqueRecent.slice(0, 3) as typeof contract.invoices;
  };
  
  const recentInvoices = getRecentInvoices();


  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {unpaid && (
            <div className="mb-6 rounded-2xl border border-primary/50 bg-primary/10 p-4 text-primary">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 flex-shrink-0" />
                    <div>
                    <p className="font-semibold">Fatura em aberto (Doc: {unpaid.doc}) — {contract.alias}</p>
                    <p className="text-sm opacity-80">Vencimento em {format(new Date(unpaid.due), "dd/MM/yyyy", { locale: ptBR })}. Valor R$ {unpaid.amount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {unpaid.pix && (
                    <Button id={`unpaid-alert-pix-${unpaid.id}`} onClick={() => setPixModal({ open: true, code: unpaid.pix! })} variant="outline" size="sm" className="border-primary/40 bg-primary/10 hover:bg-primary/20 gap-2">
                        <QrCode className="h-4 w-4" /> Copiar PIX
                    </Button>
                    )}
                    <Button asChild size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/80">
                      <a id={`unpaid-alert-pdf-${unpaid.id}`} href={unpaid.link} target="_blank" rel="noopener noreferrer">
                        <Receipt className="h-4 w-4" /> 2ª via (PDF)
                      </a>
                    </Button>
                </div>
                </div>
            </div>
        )}

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
                <div className="mb-1 text-sm text-muted-foreground">Faturas pagas (últimos 12m)</div>
                <div className="text-2xl font-bold">{contract.invoices.filter(i=>i.status.toLowerCase() ==='pago').length}</div>
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
                <button id="overview-view-contract" onClick={() => router.push('/cliente/contrato')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><FileText className="h-4 w-4"/> Ver contrato</button>
                <button id="overview-refer-friend" onClick={() => router.push('/cliente/indicar-amigo')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><Share2 className="h-4 w-4"/> Indicar amigo</button>
                <button id="overview-support" onClick={() => router.push('/cliente/chamados')} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"><Headphones className="h-4 w-4"/> Suporte</button>
                </div>
            </div>

            {/* Invoices summary */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Faturas recentes</h3>
                <button id="overview-view-all-invoices" onClick={() => router.push('/cliente/faturas')} className="text-sm text-muted-foreground hover:text-foreground">Ver todas</button>
                </div>
                <div className="space-y-3">
                {recentInvoices.map((f) => {
                    const isPaid = f.status.toLowerCase() === "pago";
                    return (
                        <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                        <div>
                            <div className="text-sm font-medium">Doc: {f.doc}</div>
                            <div className="text-xs text-muted-foreground">Venc. {format(new Date(f.due), "dd/MM/yyyy", { locale: ptBR })} • R$ {f.amount.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isPaid ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Paga</span>
                            ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-600"><XCircle className="h-3.5 w-3.5" /> Em aberto</span>
                            )}
                            <Button asChild variant="outline" size="sm" className={cn("gap-1 text-xs h-7 px-2", isPaid && "cursor-not-allowed opacity-60")}>
                              <a id={`overview-invoice-pdf-${f.id}`} href={isPaid ? undefined : f.link} target="_blank" rel="noopener noreferrer"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                            </Button>
                            {!isPaid && f.pix && (
                              <Button id={`overview-invoice-pix-${f.id}`} onClick={() => setPixModal({ open: true, code: f.pix! })} variant="outline" size="sm" className="gap-1 text-xs h-7 px-2">
                                <QrCode className="h-3.5 w-3.5" /> PIX
                              </Button>
                            )}
                        </div>
                        </div>
                    );
                })}
                </div>
            </div>

            {/* Tickets summary */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chamados abertos</h3>
                <button id="overview-view-all-tickets" onClick={() => router.push('/cliente/chamados')} className="text-sm text-muted-foreground hover:text-foreground">Ver todos</button>
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
      </motion.div>
    </AnimatePresence>
  );
}
    

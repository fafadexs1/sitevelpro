
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
  Ticket,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OverviewPage() {
  const { contract, setPixModal, loading } = useContract();
  const router = useRouter();

  const getRecentInvoices = () => {
    if (!contract) return [];
    
    const allInvoices = [...contract.invoices]
        .filter(f => f.status.toLowerCase() !== 'cancelado')
        .sort((a, b) => new Date(b.due).getTime() - new Date(a.due).getTime());

    const paidInvoices = allInvoices.filter(f => f.status.toLowerCase() === 'pago');
    const unpaidInvoices = allInvoices.filter(f => f.status.toLowerCase() === 'aberto').sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    const lastPaid = paidInvoices.length > 0 ? paidInvoices[0] : null;
    const nextUnpaid = unpaidInvoices.length > 0 ? unpaidInvoices[0] : null;
    const afterNextUnpaid = unpaidInvoices.length > 1 ? unpaidInvoices[1] : null;

    const recent = [lastPaid, nextUnpaid, afterNextUnpaid].filter(Boolean);
    
    const uniqueRecent = Array.from(new Set(recent.map(f => f!.id))).map(id => recent.find(f => f!.id === id));
    
    return uniqueRecent.slice(0, 3) as typeof contract.invoices;
  };

  const getBannerInfo = () => {
    if (!contract) return { status: 'loading' };

    const unpaid = contract.invoices
        .filter(f => f.status.toLowerCase() === 'aberto')
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    if (unpaid.length === 0) {
        return { status: 'paid' };
    }

    const pastDueInvoices = unpaid.filter(f => isPast(new Date(f.due)));

    if (pastDueInvoices.length > 0) {
        return { 
            status: 'past_due',
            count: pastDueInvoices.length,
            invoice: pastDueInvoices[0] // Mostra a mais antiga vencida
        };
    }

    return { 
        status: 'open',
        invoice: unpaid[0] // Mostra a próxima a vencer
    };
  }

  const bannerInfo = getBannerInfo();
  const recentInvoices = getRecentInvoices();

  if (loading && !contract) {
    return null; // Don't show anything if there is no cached contract to display while loading
  }

  if (!contract) return null;

  const usagePct = contract.usage.cap > 0 ? Math.round(((contract.usage.downloaded + contract.usage.uploaded) / contract.usage.cap) * 100) : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {bannerInfo.status === 'past_due' && bannerInfo.invoice && (
            <div className="mb-6 rounded-2xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-600">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                    <p className="font-semibold">Você possui {bannerInfo.count} fatura(s) vencida(s)</p>
                    <p className="text-sm opacity-80">A mais antiga venceu em {format(new Date(bannerInfo.invoice.due), "dd/MM/yyyy", { locale: ptBR })}. Valor R$ {bannerInfo.invoice.amount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {bannerInfo.invoice.pix && (
                    <Button id={`unpaid-alert-pix-${bannerInfo.invoice.id}`} onClick={() => setPixModal({ open: true, code: bannerInfo.invoice.pix! })} variant="outline" size="sm" className="border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 gap-2">
                        <QrCode className="h-4 w-4" /> Copiar PIX
                    </Button>
                    )}
                    <Button asChild size="sm" className="gap-2 bg-yellow-600 text-white hover:bg-yellow-700">
                      <a id={`unpaid-alert-pdf-${bannerInfo.invoice.id}`} href={bannerInfo.invoice.link} target="_blank" rel="noopener noreferrer">
                        <Receipt className="h-4 w-4" /> 2ª via (PDF)
                      </a>
                    </Button>
                </div>
                </div>
            </div>
        )}

        {bannerInfo.status === 'open' && bannerInfo.invoice && (
            <div className="mb-6 rounded-2xl border border-primary/50 bg-primary/10 p-4 text-primary">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 flex-shrink-0" />
                    <div>
                    <p className="font-semibold">Próxima fatura (Doc: {bannerInfo.invoice.doc})</p>
                    <p className="text-sm opacity-80">Vencimento em {format(new Date(bannerInfo.invoice.due), "dd/MM/yyyy", { locale: ptBR })}. Valor R$ {bannerInfo.invoice.amount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {bannerInfo.invoice.pix && (
                    <Button id={`unpaid-alert-pix-${bannerInfo.invoice.id}`} onClick={() => setPixModal({ open: true, code: bannerInfo.invoice.pix! })} variant="outline" size="sm" className="border-primary/40 bg-primary/10 hover:bg-primary/20 gap-2">
                        <QrCode className="h-4 w-4" /> Copiar PIX
                    </Button>
                    )}
                    <Button asChild size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/80">
                      <a id={`unpaid-alert-pdf-${bannerInfo.invoice.id}`} href={bannerInfo.invoice.link} target="_blank" rel="noopener noreferrer">
                        <Receipt className="h-4 w-4" /> 2ª via (PDF)
                      </a>
                    </Button>
                </div>
                </div>
            </div>
        )}
        
        {bannerInfo.status === 'paid' && (
             <div className="mb-6 rounded-2xl border border-green-500/50 bg-green-500/10 p-4 text-green-600">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Tudo em dia!</p>
                        <p className="text-sm opacity-80">Não há faturas pendentes para este contrato. Obrigado!</p>
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
                            <Button asChild variant="outline" size="sm" className="gap-1 text-xs h-7 px-2" disabled={!isPaid}>
                               <a id={`overview-invoice-pdf-${f.id}`} href={f.link} target="_blank" rel="noopener noreferrer"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
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
    
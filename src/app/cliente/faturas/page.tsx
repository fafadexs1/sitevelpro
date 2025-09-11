
"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import {
  CheckCircle2,
  XCircle,
  QrCode,
  Receipt
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

export default function FaturasPage() {
  const { contract, setPixModal } = useContract();

  if (!contract) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="invoices"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}

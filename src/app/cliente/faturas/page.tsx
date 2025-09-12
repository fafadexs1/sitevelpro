
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import {
  CheckCircle2,
  XCircle,
  QrCode,
  Receipt,
  Loader2
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { getInvoices } from '@/actions/invoiceActions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Invoice = {
  id: number;
  numeroDocumento: number;
  link: string;
  status: 'aberto' | 'pago' | 'cancelado' | string;
  valor: number;
  codigoPix: string;
  dataVencimento: string;
  dataPagamento: string | null;
};

export default function FaturasPage() {
  const { contract, setPixModal } = useContract();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchInvoices = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);
    const result = await getInvoices(parseInt(contract.id, 10));

    if (result.success && result.data) {
      setInvoices(result.data as Invoice[]);
    } else {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar Faturas',
        description: result.error,
      });
    }
    setLoading(false);
  }, [contract, toast]);

  useEffect(() => {
    if (contract) {
      fetchInvoices();
    }
  }, [fetchInvoices, contract]);
  
  const unpaidInvoices = invoices.filter(f => f.status.toLowerCase() === 'aberto');
  const paidInvoices = invoices.filter(f => f.status.toLowerCase() !== 'aberto');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Buscando faturas...</p>
      </div>
    );
  }

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
            {/* Em aberto */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold">Faturas em aberto</h3>
                {error ? (
                   <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                ) : unpaidInvoices.length === 0 ? (
                <div className="rounded-xl border border-border bg-secondary p-3 text-sm text-muted-foreground">Nenhuma fatura em aberto.</div>
                ) : (
                <div className="space-y-3">
                    {unpaidInvoices.map(f => (
                    <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                        <div>
                        <div className="text-sm font-medium">Doc: {f.numeroDocumento}</div>
                        <div className="text-xs text-muted-foreground">Venc. {format(new Date(f.dataVencimento), "dd/MM/yyyy", { locale: ptBR })} • R$ {f.valor.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a id={`invoice-pdf-${f.id}`} href={f.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                          {f.codigoPix && (<button id={`invoice-pix-${f.id}`} onClick={() => setPixModal({ open: true, code: f.codigoPix })} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><QrCode className="h-3.5 w-3.5" /> PIX</button>)}
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Histórico */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 text-lg font-semibold">Histórico de faturas</div>
                 {error && !invoices.length ? (
                   <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Não foi possível carregar o histórico de faturas.
                  </div>
                ) : (
                <div className="space-y-3">
                {paidInvoices.map((f) => (
                    <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                    <div>
                        <div className="text-sm font-medium">Doc: {f.numeroDocumento}</div>
                        <div className="text-xs text-muted-foreground">Venc. {format(new Date(f.dataVencimento), "dd/MM/yyyy", { locale: ptBR })} • R$ {f.valor.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {f.status.toLowerCase() === "pago" || f.dataPagamento ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Paga</span>
                        ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-600"><XCircle className="h-3.5 w-3.5" /> {f.status}</span>
                        )}
                        <a id={`invoice-history-pdf-${f.id}`} href={f.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                    </div>
                    </div>
                ))}
                 {invoices.length === 0 && !error && (
                    <div className="text-sm text-muted-foreground text-center py-8">Nenhum histórico de faturas encontrado.</div>
                 )}
                </div>
                )}
            </div>
            </div>
      </motion.div>
    </AnimatePresence>
  );
}

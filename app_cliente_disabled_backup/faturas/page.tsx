
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

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
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const fetchAndRevalidateInvoices = useCallback(async (year: string) => {
    if (!contract) return;
    
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // Stale-while-revalidate: Fase 1 - Buscar do cache (stale)
    const { data: cachedData } = await supabase
        .from('invoices')
        .select('invoices_data')
        .eq('contract_id', String(contract.id))
        .single();
    
    if (cachedData?.invoices_data) {
        const allInvoices = cachedData.invoices_data as Invoice[];
        const yearInvoices = allInvoices.filter(inv => new Date(inv.dataVencimento).getFullYear().toString() === year);
        setInvoices(yearInvoices);
        setLoading(false); // Mostra dados cacheados rapidamente
    }

    // Stale-while-revalidate: Fase 2 - Revalidar com a API
    const result = await getInvoices(parseInt(contract.id, 10), parseInt(year, 10));
    
    if (result.success && result.data) {
      setInvoices(result.data as Invoice[]);
      setError(null);
    } else {
      // Se a API falhar mas tivermos dados do cache, mostramos um erro mas mantemos os dados antigos
      if (!cachedData?.invoices_data) {
          setError(result.error);
      }
      toast({
        variant: 'destructive',
        title: 'Erro ao sincronizar faturas',
        description: 'Não foi possível buscar os dados mais recentes. As informações exibidas podem estar desatualizadas.',
      });
    }

    // Garante que o loading seja falso no final, mesmo que a busca no cache tenha falhado
    setLoading(false);

  }, [contract, toast]);

  useEffect(() => {
    if (contract) {
      fetchAndRevalidateInvoices(selectedYear);
    }
  }, [fetchAndRevalidateInvoices, contract, selectedYear]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([currentYear.toString()]);
    if (invoices.length > 0) {
        invoices.forEach(f => years.add(new Date(f.dataVencimento).getFullYear().toString()));
    }
    // Lógica para pegar anos do contrato, se necessário.
    // Por enquanto, vamos adicionar os últimos 5 anos.
    for(let i=1; i <= 5; i++) {
        years.add((currentYear - i).toString());
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [invoices]);
  
  const unpaidInvoices = invoices.filter(f => f.status.toLowerCase() === 'aberto' && new Date(f.dataVencimento).getFullYear().toString() === selectedYear);
  const paidInvoices = invoices.filter(f => f.status.toLowerCase() !== 'aberto' && f.status.toLowerCase() !== 'cancelado' && new Date(f.dataVencimento).getFullYear().toString() === selectedYear);
  
  if (loading && invoices.length === 0) { // Só mostra o loading grande se não tiver nada pra mostrar
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
                {error && unpaidInvoices.length === 0 ? (
                   <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                ) : unpaidInvoices.length === 0 ? (
                <div className="rounded-xl border border-border bg-secondary p-3 text-sm text-muted-foreground">Nenhuma fatura em aberto para {selectedYear}.</div>
                ) : (
                <div className="space-y-3">
                    {unpaidInvoices.map(f => (
                    <div key={f.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 gap-2">
                        <div>
                        <div className="text-sm font-medium">Doc: {f.numeroDocumento}</div>
                        <div className="text-xs text-muted-foreground">Venc. {format(new Date(f.dataVencimento), "dd/MM/yyyy", { locale: ptBR })} • R$ {f.valor.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm" className="gap-1 text-xs h-7 px-2">
                            <a id={`invoice-pdf-${f.id}`} href={f.link} target="_blank" rel="noopener noreferrer"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                          </Button>
                          {f.codigoPix && (
                            <Button onClick={() => setPixModal({ open: true, code: f.codigoPix })} variant="outline" size="sm" className="gap-1 text-xs h-7 px-2">
                                <QrCode className="h-3.5 w-3.5" /> PIX
                            </Button>
                          )}
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Histórico */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-lg font-semibold">Histórico de faturas</h3>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full sm:w-[120px] mt-2 sm:mt-0" id="year-filter">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 {error && paidInvoices.length === 0 ? (
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
                        <Button asChild variant="outline" size="sm" className="gap-1 text-xs h-7 px-2" disabled={f.status.toLowerCase() !== 'pago'}>
                          <a id={`invoice-history-pdf-${f.id}`} href={f.link} target="_blank" rel="noopener noreferrer"><Receipt className="h-3.5 w-3.5" /> 2ª via</a>
                        </Button>
                    </div>
                    </div>
                ))}
                 {paidInvoices.length === 0 && !error && !loading && (
                    <div className="text-sm text-muted-foreground text-center py-8">Nenhum histórico de faturas encontrado para {selectedYear}.</div>
                 )}
                </div>
                )}
            </div>
            </div>
      </motion.div>
    </AnimatePresence>
  );
}



"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { Pill } from "@/components/cliente/ui-helpers";
import { Ticket, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { getWorkOrders } from '@/actions/workOrderActions';
import { useToast } from '@/hooks/use-toast';

type WorkOrder = {
  id: number;
  assunto: string;
  status: string;
  data_abertura: string;
};

export default function ChamadosPage() {
  const { contract } = useContract();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);
    const result = await getWorkOrders(parseInt(contract.id, 10));

    if (result.success && result.data) {
      setWorkOrders(result.data);
    } else {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar Ordens de Serviço',
        description: result.error,
      });
    }
    setLoading(false);
  }, [contract, toast]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  if (!contract) return null;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="tickets"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ordens de Serviço — {contract.alias}</h3>
              <a id="new-ticket-button" href="#" className="text-sm text-muted-foreground hover:text-foreground">Novo chamado</a>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                 <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                   Não foi possível carregar as ordens de serviço. Tente novamente mais tarde.
                </div>
              ) : workOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">Nenhuma ordem de serviço encontrada.</div>
              ) : (
                workOrders.map((os) => (
                  <div key={os.id} className="rounded-xl border border-border bg-secondary p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> <b>{os.id}</b> — {os.assunto}</div>
                      <Pill>{os.status}</Pill>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Aberto em {new Date(os.data_abertura).toLocaleDateString('pt-BR')}</div>
                  </div>
                ))
              )}
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
      </motion.div>
    </AnimatePresence>
  );
}

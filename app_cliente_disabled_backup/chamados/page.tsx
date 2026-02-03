
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { Pill } from "@/components/cliente/ui-helpers";
import { Ticket, Loader2, X, Calendar, User, Wrench, MapPin, Building } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { getWorkOrders } from '@/actions/workOrderActions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@/utils/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';


type WorkOrder = {
  id: number;
  ocorrencia: string;
  motivo: string;
  status: string;
  data_cadastro: string;
  hora_cadastro: string;
  data_agendamento?: string;
  hora_agendamento?: string;
  data_finalizacao?: string;
  hora_finalizacao?: string;
  tipo: string;
  conteudo?: string;
  pop?: string;
  responsavel?: string;
  usuario_finalizacao?: string;
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
};

export default function ChamadosPage() {
  const { contract } = useContract();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const fetchAndRevalidateWorkOrders = useCallback(async (year: string) => {
    if (!contract) return;

    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    // Stale-while-revalidate: Fase 1 - Buscar do cache (stale)
    const { data: cachedData } = await supabase
        .from('work_orders')
        .select('orders')
        .eq('contract_id', String(contract.id))
        .single();
    
    if (cachedData?.orders) {
        const allOrders = cachedData.orders as WorkOrder[];
        const yearOrders = allOrders.filter(wo => new Date(wo.data_cadastro).getFullYear().toString() === year);
        setWorkOrders(yearOrders);
        setLoading(false); // Mostra dados cacheados rapidamente
    }

    // Stale-while-revalidate: Fase 2 - Revalidar com a API
    const result = await getWorkOrders(parseInt(contract.id, 10), parseInt(year, 10));

    if (result.success && result.data) {
      setWorkOrders(result.data as WorkOrder[]);
      setError(null);
    } else {
       // Se a API falhar mas tivermos dados do cache, mostramos um erro mas mantemos os dados antigos
      if (!cachedData?.orders) {
          setError(result.error);
      }
      toast({
        variant: 'destructive',
        title: 'Erro ao sincronizar chamados',
        description: 'Não foi possível buscar os dados mais recentes. As informações exibidas podem estar desatualizadas.',
      });
    }
     // Garante que o loading seja falso no final, mesmo que a busca no cache tenha falhado
    setLoading(false);
  }, [contract, toast]);

  useEffect(() => {
    if (contract) {
      fetchAndRevalidateWorkOrders(selectedYear);
    }
  }, [fetchAndRevalidateWorkOrders, contract, selectedYear]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([currentYear.toString()]);
    if (workOrders.length > 0) {
        workOrders.forEach(wo => years.add(new Date(wo.data_cadastro).getFullYear().toString()));
    }
    // Lógica para pegar anos do contrato, se necessário.
    // Por enquanto, vamos adicionar os últimos 5 anos.
    for(let i=1; i <= 5; i++) {
        years.add((currentYear - i).toString());
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [workOrders]);

  if (loading && workOrders.length === 0) {
     return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Buscando chamados...</p>
      </div>
    );
  }
  
  return (
    <>
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
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">Ordens de Serviço — {contract?.alias}</h3>
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
              <div className="space-y-3">
                {error && workOrders.length === 0 ? (
                  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Não foi possível carregar as ordens de serviço. Tente novamente mais tarde.
                  </div>
                ) : workOrders.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">Nenhuma ordem de serviço encontrada para {selectedYear}.</div>
                ) : (
                   <div className="space-y-3">
                    {workOrders.map((os) => (
                       <button
                        key={os.id}
                        onClick={() => setSelectedOrder(os)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-secondary p-3 text-left transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-2 text-sm"><Ticket className="h-4 w-4 text-primary flex-shrink-0" /> <b>{os.ocorrencia}</b> — {os.motivo}</div>
                        <Pill>{os.status}</Pill>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 self-start">
              <div className="text-sm text-muted-foreground">Dicas rápidas</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Reinicie o roteador (30s) antes de abrir chamado.</li>
                <li>Teste por cabo para medir velocidade real.</li>
                <li>Tenha o horário das quedas e leds do modem.</li>
              </ul>
               <Button variant="outline" className="w-full mt-4" asChild>
                    <a id="new-ticket-button" href="#" className="w-full">Abrir Novo Chamado</a>
               </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card">
            {selectedOrder && (
            <>
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-primary"/>
                        Detalhes do Chamado: {selectedOrder.ocorrencia}
                    </DialogTitle>
                     <DialogDescription>{selectedOrder.motivo} ({selectedOrder.status})</DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="rounded-lg border bg-secondary p-4">
                        <h4 className="font-semibold text-foreground mb-3">Conteúdo do Chamado</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedOrder.conteudo || 'Sem detalhes adicionais.'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <DetailItem icon={Calendar} label="Abertura" value={selectedOrder.data_cadastro ? `${format(new Date(selectedOrder.data_cadastro), "dd/MM/yyyy", { locale: ptBR })} às ${selectedOrder.hora_cadastro}` : 'N/A'} />
                        <DetailItem icon={Calendar} label="Agendamento" value={selectedOrder.data_agendamento ? `${format(new Date(selectedOrder.data_agendamento), "dd/MM/yyyy", { locale: ptBR })} às ${selectedOrder.hora_agendamento}` : 'Não agendado'} />
                        <DetailItem icon={Calendar} label="Finalização" value={selectedOrder.data_finalizacao ? `${format(new Date(selectedOrder.data_finalizacao), "dd/MM/yyyy", { locale: ptBR })} às ${selectedOrder.hora_finalizacao}` : 'Em aberto'} />
                        
                        <DetailItem icon={User} label="Técnico Responsável" value={selectedOrder.responsavel} />
                        <DetailItem icon={Wrench} label="Finalizado por" value={selectedOrder.usuario_finalizacao} />
                        <DetailItem icon={Building} label="POP" value={selectedOrder.pop} />
                    </div>
                </div>

                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fechar</span>
                </DialogClose>
            </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}

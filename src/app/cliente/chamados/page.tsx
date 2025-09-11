
"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { Pill } from "@/components/cliente/ui-helpers";
import { Ticket } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

export default function ChamadosPage() {
  const { contract } = useContract();

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
      </motion.div>
    </AnimatePresence>
  );
}


"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { FileText, Headphones } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

export default function ContratoPage() {
  const { contract } = useContract();

  if (!contract) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="contract"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}

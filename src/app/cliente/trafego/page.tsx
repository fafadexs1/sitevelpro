
"use client";

import React from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { ProgressBar } from "@/components/cliente/ui-helpers";
import { AnimatePresence, motion } from 'framer-motion';

export default function TrafegoPage() {
  const { contract } = useContract();

  if (!contract) return null;

  const usagePct = Math.round(((contract.usage.downloaded + contract.usage.uploaded) / contract.usage.cap) * 100);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="traffic"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}


"use client";

import React from "react";

export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{children}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

const statusColors: { [key: string]: string } = {
  pendente: 'bg-yellow-100 text-yellow-800',
  verificando: 'bg-blue-100 text-blue-800',
  aprovado: 'bg-green-100 text-green-800',
  rejeitado: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

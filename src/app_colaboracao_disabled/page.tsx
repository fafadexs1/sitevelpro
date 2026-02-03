
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ColaboracaoPage() {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel de Leads</h1>
          <p className="text-muted-foreground">Gerencie os novos leads capturados pelo site.</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
          <CardDescription>
            Aqui será exibida a lista de leads. A funcionalidade de exibição será implementada em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            A tabela de leads aparecerá aqui.
          </div>
        </CardContent>
      </Card>
    </>
  );
}

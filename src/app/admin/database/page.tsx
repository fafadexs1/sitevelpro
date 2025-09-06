
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DatabasePage() {
    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Banco de Dados</h1>
                    <p className="text-white/60">Gerencie a estrutura do seu banco de dados.</p>
                </div>
            </header>

            <Card className="bg-neutral-950 border-white/10">
                <CardHeader>
                    <CardTitle>Ações de Schema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-white/70">
                        A configuração do banco de dados agora é gerenciada por um script SQL.
                        Para criar ou atualizar as tabelas, execute o conteúdo do arquivo <code>setup.sql</code> no editor de SQL do seu painel Supabase.
                    </p>
                    <Button asChild variant="outline">
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                            Abrir Painel Supabase
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

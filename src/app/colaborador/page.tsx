
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Handshake, Mail, Phone, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tipagem dos dados
type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  created_at: string;
};

type Referral = {
  id: string;
  referrer_customer_id: string | null;
  referred_name: string;
  referred_email: string | null;
  referred_phone: string;
  status: 'pendente' | 'verificando' | 'aprovado' | 'rejeitado';
  created_at: string;
};

const statusColors: { [key: string]: string } = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verificando: 'bg-blue-100 text-blue-800 border-blue-200',
  aprovado: 'bg-green-100 text-green-800 border-green-200',
  rejeitado: 'bg-red-100 text-red-800 border-red-200',
};

// Componente para a Tabela de Indicações
function ReferralsTable() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('referrals').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as indicações.' });
    } else {
      setReferrals(data);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);
  
  const handleStatusChange = async (referralId: string, newStatus: string) => {
    const { error } = await supabase.from('referrals').update({ status: newStatus }).eq('id', referralId);
    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status.' });
    } else {
        toast({ title: 'Sucesso!', description: 'Status da indicação atualizado.'});
        fetchReferrals(); // Recarrega os dados
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Indicado Por</TableHead>
          <TableHead>Amigo Indicado</TableHead>
          <TableHead>Contato do Amigo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhuma indicação encontrada.</TableCell>
          </TableRow>
        ) : (
          referrals.map((ref) => (
            <TableRow key={ref.id}>
              <TableCell className="font-medium">{ref.referrer_customer_id || 'N/A'}</TableCell>
              <TableCell>{ref.referred_name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                    {ref.referred_phone && <span className="flex items-center gap-1.5"><Phone size={12}/> {ref.referred_phone}</span>}
                    {ref.referred_email && <span className="flex items-center gap-1.5"><Mail size={12}/> {ref.referred_email}</span>}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-center">
                 <Select defaultValue={ref.status} onValueChange={(value) => handleStatusChange(ref.id, value)}>
                    <SelectTrigger className={`w-[140px] text-xs h-8 ${statusColors[ref.status]}`}>
                        <SelectValue placeholder="Mudar status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="verificando">Verificando</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// Componente para a Tabela de Leads
function LeadsTable() {
    return (
        <div className="text-center py-16 text-muted-foreground">
            A tabela de leads aparecerá aqui.
        </div>
    )
}

export default function ColaboradorPage() {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel de CRM</h1>
          <p className="text-muted-foreground">Gerencie leads e indicações capturados pelo site.</p>
        </div>
      </header>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leads" id="tab-leads"><Users className="mr-2"/> Leads</TabsTrigger>
          <TabsTrigger value="referrals" id="tab-referrals"><Handshake className="mr-2"/> Indicações</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
            <TabsContent value="leads" className="m-0">
                <CardHeader>
                    <CardTitle>Leads Recentes</CardTitle>
                    <CardDescription>
                        Contatos que preencheram o formulário de assinatura no site.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeadsTable />
                </CardContent>
            </TabsContent>
            <TabsContent value="referrals" className="m-0">
                 <CardHeader>
                    <CardTitle>Indicações Recebidas</CardTitle>
                    <CardDescription>
                       Gerencie as indicações feitas pelos clientes e atualize o status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReferralsTable />
                </CardContent>
            </TabsContent>
        </Card>
      </Tabs>
    </>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Crosshair, Eye, Handshake, Loader2, Mail, MapPin, Phone, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  source: string | null;
  created_at: string;
};

type Referral = {
  id: string;
  referrer_customer_id: string | null;
  referred_name: string;
  referred_email: string | null;
  referred_phone: string;
  status: "pendente" | "verificando" | "aprovado" | "rejeitado";
  created_at: string;
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  verificando: "bg-blue-100 text-blue-800 border-blue-200",
  aprovado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejeitado: "bg-red-100 text-red-800 border-red-200",
};

const formatDateTime = (value: string) => new Date(value).toLocaleString("pt-BR");

function ReferralsTable() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("referrals").select("*").order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as indicações." });
    } else {
      setReferrals(data);
    }

    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    const { error } = await supabase.from("referrals").update({ status: newStatus }).eq("id", referralId);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status." });
      return;
    }

    toast({ title: "Sucesso!", description: "Status da indicação atualizado." });
    fetchReferrals();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Indicado por</TableHead>
          <TableHead>Amigo indicado</TableHead>
          <TableHead>Contato do amigo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhuma indicação encontrada.</TableCell>
          </TableRow>
        ) : (
          referrals.map((ref) => (
            <TableRow key={ref.id}>
              <TableCell className="font-medium">{ref.referrer_customer_id || "N/A"}</TableCell>
              <TableCell>{ref.referred_name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                  {ref.referred_phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {ref.referred_phone}</span>}
                  {ref.referred_email && <span className="flex items-center gap-1.5"><Mail size={12} /> {ref.referred_email}</span>}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="text-center">
                <Select defaultValue={ref.status} onValueChange={(value) => handleStatusChange(ref.id, value)}>
                  <SelectTrigger className={`h-8 w-[140px] text-xs ${statusColors[ref.status]}`}>
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

function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

      if (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os leads." });
      } else {
        setLeads(data);
      }

      setLoading(false);
    };

    fetchLeads();
  }, [toast]);

  const getAddressLines = (lead: Lead) => {
    const streetLine = [lead.street, lead.number].filter(Boolean).join(", ");
    const cityAndState = [lead.city, lead.state].filter(Boolean).join(" - ");
    const cityLine = [lead.neighborhood, cityAndState].filter(Boolean).join(" - ");
    const cepLine = lead.cep ? `CEP: ${lead.cep}` : "CEP: Não informado";

    return { streetLine, complementLine: lead.complement || "", cityLine, cepLine };
  };

  const buildDiscordText = (lead: Lead) => {
    const address = getAddressLines(lead);

    return [
      "Novo lead Velpro",
      `Nome: ${lead.full_name}`,
      `Email: ${lead.email}`,
      `Telefone: ${lead.phone}`,
      `Endereço: ${address.streetLine || "Não informado"}`,
      address.complementLine ? `Complemento: ${address.complementLine}` : null,
      `Local: ${address.cityLine || "Não informado"}`,
      address.cepLine,
      `Lat: ${lead.latitude ?? "Não informado"}`,
      `Lon: ${lead.longitude ?? "Não informado"}`,
      `Status: ${lead.status || "new"}`,
      `Origem: ${lead.source || "signup_form"}`,
      `Registrado em: ${formatDateTime(lead.created_at)}`,
      `ID: ${lead.id}`,
    ].filter(Boolean).join("\n");
  };

  const copyDiscord = async (lead: Lead) => {
    try {
      await navigator.clipboard.writeText(buildDiscordText(lead));
      toast({ title: "Copiado!", description: "Lead pronto para colar no Discord." });
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível copiar o lead." });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (leads.length === 0) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Nenhum lead encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1120px]">
        <div className="grid grid-cols-[1.15fr_1fr_1.55fr_0.9fr_0.9fr] gap-8 border-b px-4 pb-4 text-sm font-semibold text-muted-foreground">
          <div>Lead</div>
          <div>Contato</div>
          <div>Endereço e localização</div>
          <div>Meta</div>
          <div className="text-right">Ações</div>
        </div>

        <div className="divide-y">
          {leads.map((lead) => {
            const address = getAddressLines(lead);

            return (
              <div key={lead.id} className="grid grid-cols-[1.15fr_1fr_1.55fr_0.9fr_0.9fr] gap-8 px-4 py-5 text-sm">
                <div>
                  <div className="font-semibold text-foreground">{lead.full_name}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {lead.status || "new"}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {(lead.source || "signup_form").replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-3 break-all text-xs leading-5 text-muted-foreground">ID: {lead.id}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="break-all">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-5 text-muted-foreground">
                  <div className="flex items-start gap-2 text-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <div>{address.streetLine || "Endereço não informado"}</div>
                      {address.complementLine && <div className="text-muted-foreground">{address.complementLine}</div>}
                      {address.cityLine && <div className="text-muted-foreground">{address.cityLine}</div>}
                      <div>{address.cepLine}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Crosshair className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div>
                      <div>Lat: {lead.latitude ?? "Não informado"}</div>
                      <div>Lon: {lead.longitude ?? "Não informado"}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <div className="text-muted-foreground">Registrado em</div>
                  <div className="mt-1 text-foreground">{formatDateTime(lead.created_at)}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button
                    type="button"
                    onClick={() => copyDiscord(lead)}
                    className="h-9 bg-[#03BF03] px-4 text-sm font-semibold text-white hover:bg-[#029E02]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Discord
                  </Button>
                  <Button type="button" variant="outline" className="h-9 px-4 text-sm font-semibold">
                    <Eye className="mr-2 h-4 w-4" />
                    Detalhes
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CrmPage() {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads e Indicações</h1>
          <p className="text-muted-foreground">Gerencie os contatos capturados pelo site.</p>
        </div>
      </header>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="leads" id="tab-leads"><Users className="mr-2 h-4 w-4" /> Leads</TabsTrigger>
          <TabsTrigger value="referrals" id="tab-referrals"><Handshake className="mr-2 h-4 w-4" /> Indicações</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <TabsContent value="leads" className="m-0">
            <CardHeader>
              <CardTitle>Leads Recentes</CardTitle>
              <CardDescription>Contatos que preencheram o formulário de assinatura no site.</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </TabsContent>
          <TabsContent value="referrals" className="m-0">
            <CardHeader>
              <CardTitle>Indicações Recebidas</CardTitle>
              <CardDescription>Gerencie as indicações feitas pelos clientes e atualize o status.</CardDescription>
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

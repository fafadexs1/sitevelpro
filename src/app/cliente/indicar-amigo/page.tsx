
"use client";

import React, { useState, useEffect } from 'react';
import { useContract } from "@/components/cliente/ContractProvider";
import { StatusBadge } from "@/components/cliente/ui-helpers";
import { Copy, Loader2, Phone, Mail } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const referralSchema = z.object({
  referred_name: z.string().min(3, "Nome do amigo é obrigatório."),
  referred_phone: z.string().min(10, "Telefone inválido."),
  referred_email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
});
type ReferralFormData = z.infer<typeof referralSchema>;

export default function IndicarAmigoPage() {
  const { contract } = useContract();
  const { toast } = useToast();
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    // Acessa a variável de ambiente apenas no lado do cliente
    setSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || '');
  }, []);
  
  const referralForm = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referred_name: '', referred_phone: '', referred_email: '' },
  });

  if (!contract) return null;

  const referralLink = siteUrl ? `${siteUrl}/indicacao/${contract.id}` : `Carregando...`;
  
  async function handleReferralSubmit(data: ReferralFormData) {
    setIsSubmittingReferral(true);
    const supabase = createClient();
    const { error } = await supabase.from('referrals').insert({
        ...data,
        referrer_customer_id: contract.id,
    });

    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: `Não foi possível enviar a indicação: ${error.message}`});
    } else {
        toast({ title: 'Sucesso!', description: 'Sua indicação foi enviada! Agradecemos a confiança.' });
        referralForm.reset();
        // Here you would ideally refetch the referrals list
    }
    setIsSubmittingReferral(false);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="referral"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <h3 className="text-2xl font-bold">Indique um Amigo e Ganhe!</h3>
                    <p className="mt-2 text-muted-foreground">Para cada amigo que contratar nosso serviço através da sua indicação, você ganha <span className="font-bold text-primary">R$ 50,00 de desconto</span> na sua próxima fatura. É simples, rápido e todo mundo sai ganhando!</p>
                    <div className="mt-6">
                        <label className="text-sm font-medium">Seu link exclusivo de indicação:</label>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
                        <input readOnly value={referralLink} className="flex-1 bg-transparent px-2 text-sm outline-none"/>
                        <button onClick={() => { if(siteUrl) { navigator.clipboard.writeText(referralLink); toast({title: "Link copiado!"}); } }} className="rounded-md bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent" disabled={!siteUrl}>
                            <Copy className="h-4 w-4"/>
                        </button>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-semibold">Ou preencha os dados do seu amigo:</h4>
                    <p className="text-sm text-muted-foreground mb-4">Nós entramos em contato com ele.</p>
                    <Form {...referralForm}>
                        <form onSubmit={referralForm.handleSubmit(handleReferralSubmit)} className="space-y-4">
                            <FormField control={referralForm.control} name="referred_name" render={({ field }) => (<FormItem><FormLabel>Nome do amigo</FormLabel><FormControl><Input placeholder="Nome completo" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={referralForm.control} name="referred_phone" render={({ field }) => (<FormItem><FormLabel>Telefone do amigo</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={referralForm.control} name="referred_email" render={({ field }) => (<FormItem><FormLabel>E-mail (opcional)</FormLabel><FormControl><Input placeholder="amigo@email.com" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <button type="submit" disabled={isSubmittingReferral} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                                {isSubmittingReferral ? <Loader2 className="h-4 w-4 animate-spin"/> : "Enviar Indicação"}
                            </button>
                        </form>
                    </Form>
                </div>
            </div>
             <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-lg font-semibold mb-4">Minhas Indicações</h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amigo Indicado</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Você ainda não fez nenhuma indicação.</TableCell>
                        </TableRow>
                      ) : (
                        contract.referrals.map((ref) => (
                          <TableRow key={ref.id}>
                            <TableCell className="font-medium">{ref.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 text-xs">
                                  {ref.phone && <span className="flex items-center gap-1.5"><Phone size={12}/> {ref.phone}</span>}
                                  {ref.email && <span className="flex items-center gap-1.5"><Mail size={12}/> {ref.email}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(ref.date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right"><StatusBadge status={ref.status} /></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
             </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

    


"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Trash2, Edit, Loader2, MessageSquare, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// ==================================
// Tipagem e Schema
// ==================================
type Popup = {
  id: string;
  name: string;
  plan_id: string | null;
  title: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  display_on: 'sales_page' | 'main_site';
  trigger_type: 'delay' | 'exit_intent';
  trigger_value: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  is_active: boolean;
};

type Plan = {
    id: string;
    speed: string;
    type: string;
}

const popupSchema = z.object({
  name: z.string().min(1, "O nome do pop-up é obrigatório."),
  plan_id: z.string().nullable().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().optional(),
  display_on: z.enum(['sales_page', 'main_site']),
  trigger_type: z.enum(['delay', 'exit_intent']),
  trigger_value: z.coerce.number().min(0, "O valor do gatilho deve ser positivo."),
  frequency: z.enum(['once_per_session', 'once_per_day', 'always']),
  is_active: z.boolean().default(true),
  image_file: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 2 * 1024 * 1024), `Tamanho máximo de 2MB.`)
    .refine((file) => !file || (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)), "Apenas .jpg, .png e .webp."),
});

type PopupFormData = z.infer<typeof popupSchema>;

// ==================================
// Componente de Formulário
// ==================================
function PopupForm({
  mode,
  popup,
  plans,
  onSave,
  onOpenChange,
}: {
  mode: "add" | "edit";
  popup?: Popup | null;
  plans: Plan[];
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<PopupFormData>({
    resolver: zodResolver(popupSchema),
    defaultValues: popup ? { ...popup, plan_id: popup.plan_id || null } : {
      name: "",
      is_active: true,
      display_on: "sales_page",
      trigger_type: "delay",
      trigger_value: 5,
      frequency: "once_per_session",
      plan_id: null,
    },
  });

  const selectedPlanId = form.watch('plan_id');
  const isPlanPopup = !!selectedPlanId;

  const onSubmit = async (data: PopupFormData) => {
    setIsSubmitting(true);
    let imageUrl = popup?.image_url;

    if (data.image_file) {
        const file = data.image_file;
        const filePath = `popup-${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('popup-images').upload(filePath, file, { upsert: true });
        if (uploadError) {
            toast({ variant: "destructive", title: "Erro de Upload", description: uploadError.message });
            setIsSubmitting(false);
            return;
        }
        const { data: urlData } = supabase.storage.from('popup-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
    }

    const popupData = { 
        ...data, 
        image_url: imageUrl,
        plan_id: data.plan_id || null,
        title: isPlanPopup ? null : data.title,
        content: isPlanPopup ? null : data.content,
        image_file: isPlanPopup ? null : data.image_file,
        button_text: isPlanPopup ? null : data.button_text,
        button_link: isPlanPopup ? null : data.button_link,
    };
    delete (popupData as any).image_file;
    
    let error;
    if (mode === "add") {
      ({ error } = await supabase.from("popups").insert(popupData));
    } else if (mode === "edit" && popup) {
      ({ error } = await supabase.from("popups").update({ ...popupData, updated_at: new Date().toISOString() }).eq("id", popup.id));
    }

    if (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: `Não foi possível salvar o pop-up: ${error.message}`});
    } else {
      toast({ title: "Sucesso!", description: "Pop-up salvo com sucesso." });
      onSave();
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Novo Pop-up" : "Editar Pop-up"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-4 p-1 pr-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome (Identificação)</FormLabel><FormControl><Input placeholder="Ex: Promoção de Natal" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField control={form.control} name="plan_id" render={({ field }) => (
                <FormItem>
                <FormLabel>Plano em Destaque (Opcional)</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um plano para o pop-up" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="none">Nenhum (conteúdo customizado)</SelectItem>
                        {plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.speed} ({plan.type})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Se um plano for selecionado, ele será exibido no pop-up, ignorando os campos de conteúdo abaixo.</p>
                <FormMessage />
                </FormItem>
            )} />

            <div className={`space-y-4 border-t pt-4 mt-4 ${isPlanPopup ? 'opacity-40 pointer-events-none' : ''}`}>
                <h3 className="text-sm font-medium text-muted-foreground">Conteúdo Customizado</h3>
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Título que aparece no pop-up" {...field} disabled={isPlanPopup} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Conteúdo</FormLabel><FormControl><Textarea placeholder="Descreva a oferta ou mensagem." {...field} disabled={isPlanPopup} /></FormControl><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="image_file" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Imagem (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} disabled={isPlanPopup}/>
                        </FormControl>
                        {popup?.image_url && !field.value?.name && <div className="mt-2"><p className="text-sm">Atual:</p><Image src={popup.image_url} alt="Preview" width={120} height={67} className="rounded-md border border-border"/></div>}
                        <FormMessage />
                    </FormItem>
                )}/>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="button_text" render={({ field }) => (<FormItem><FormLabel>Texto do Botão</FormLabel><FormControl><Input placeholder="Ex: Aproveitar" {...field} disabled={isPlanPopup}/></FormControl></FormItem>)} />
                    <FormField control={form.control} name="button_link" render={({ field }) => (<FormItem><FormLabel>Link do Botão</FormLabel><FormControl><Input placeholder="/#planos" {...field} disabled={isPlanPopup}/></FormControl></FormItem>)} />
                </div>
            </div>

             <div className="space-y-4 border-t pt-4 mt-4">
                 <h3 className="text-sm font-medium text-muted-foreground">Regras de Exibição</h3>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="display_on" render={({ field }) => (<FormItem><FormLabel>Exibir em</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="sales_page">Página de Vendas</SelectItem><SelectItem value="main_site">Site Principal</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>Frequência</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="once_per_session">Uma vez por sessão</SelectItem><SelectItem value="once_per_day">Uma vez por dia</SelectItem><SelectItem value="always">Sempre</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="trigger_type" render={({ field }) => (<FormItem><FormLabel>Gatilho</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="delay">Atraso</SelectItem><SelectItem value="exit_intent">Intenção de Saída</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="trigger_value" render={({ field }) => (<FormItem><FormLabel>Valor do Gatilho</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><p className="text-xs text-muted-foreground">Segundos (para Atraso)</p><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="is_active" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4"><FormLabel>Ativo</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
            </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// ==================================
// Página Principal
// ==================================
export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: popupsData, error: popupsError } = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    if (popupsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pop-ups', description: popupsError.message });
    } else {
      setPopups(popupsData);
    }
    
    const { data: plansData, error: plansError } = await supabase.from("plans").select("id, speed, type");
     if (plansError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar planos', description: plansError.message });
    } else {
      setPlans(plansData as Plan[]);
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingPopup(null);
    fetchData();
  };
  
  const handleDelete = async (popupId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('popups').delete().eq('id', popupId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Pop-up deletado.' });
      fetchData();
    }
  };
  
  const handleToggleActive = async (popup: Popup) => {
    const supabase = createClient();
    const { error } = await supabase.from('popups').update({ is_active: !popup.is_active }).eq('id', popup.id);
    if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status.' });
    } else {
        toast({ title: 'Sucesso!', description: `Pop-up ${!popup.is_active ? 'ativado' : 'desativado'}.` });
        fetchData();
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Pop-ups</h1>
          <p className="text-muted-foreground">Crie e configure pop-ups para suas páginas de marketing.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPopup(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Pop-up
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-foreground sm:max-w-2xl">
            <PopupForm mode={editingPopup ? "edit" : "add"} popup={editingPopup} plans={plans} onSave={handleSave} onOpenChange={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pop-ups Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : popups.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400"/>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pop-up criado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro pop-up.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popups.map((popup) => (
                    <Card key={popup.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">{popup.name} <Switch checked={popup.is_active} onCheckedChange={() => handleToggleActive(popup)}/></CardTitle>
                            <CardDescription>
                                {popup.plan_id ? <Badge variant="default"><Package className="w-3 h-3 mr-1.5"/> Plano em Destaque</Badge> : <Badge variant="secondary">Conteúdo Customizado</Badge>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                           <p><strong>Gatilho:</strong> {popup.trigger_type === 'delay' ? `${popup.trigger_value}s de atraso` : 'Intenção de Saída'}</p>
                           <p><strong>Exibição:</strong> {popup.display_on === 'sales_page' ? 'Página de Vendas' : 'Site Principal'}</p>
                           <div className="flex justify-end gap-2 pt-4 border-t">
                             <Button variant="ghost" size="sm" onClick={() => { setEditingPopup(popup); setIsModalOpen(true);}}><Edit className="h-4 w-4 mr-2"/>Editar</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent className="bg-background text-foreground">
                                <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(popup.id)}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           </div>
                        </CardContent>
                    </Card>
                ))}
             </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
